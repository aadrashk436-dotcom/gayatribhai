import { Router } from "express";
import supabase from "../../config/supabase.js";
import razorpay from "../../config/razorpay.js";
import * as shiprocket from "../../services/shiprocket.js";
import { sendStatusUpdate, sendRefundNotification, sendShippingLabel } from "../../services/email.js";

const router = Router();

// Helper to get customer email
async function getCustomerEmail(customerId) {
  const { data } = await supabase.from("customers").select("email").eq("id", customerId).single();
  return data?.email;
}

// List orders with filters
router.get("/", async (req, res) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;
    let query = supabase.from("orders").select("*", { count: "exact" });

    if (status) query = query.eq("order_status", status);
    if (paymentStatus) query = query.eq("payment_status", paymentStatus);
    if (search) query = query.or(`order_number.ilike.%${search}%,awb_code.ilike.%${search}%`);

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.order("created_at", { ascending: false }).range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ orders: data, total: count, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Order detail
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Order not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Create Shiprocket order
router.post("/:id/shiprocket/create", async (req, res) => {
  try {
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.shiprocket_order_id) {
      return res.status(400).json({ error: "Shiprocket order already created" });
    }

    const customerEmail = await getCustomerEmail(order.customer_id);
    const result = await shiprocket.createShiprocketOrder({
      ...order,
      customer_email: customerEmail,
    });

    if (result.order_id) {
      const { data: updated } = await supabase
        .from("orders")
        .update({
          shiprocket_order_id: result.order_id.toString(),
          shiprocket_shipment_id: result.shipment_id?.toString() || null,
          order_status: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", req.params.id)
        .select()
        .single();

      // Send status email
      if (customerEmail) {
        try { await sendStatusUpdate(updated, customerEmail, "processing"); } catch (e) { console.error(e); }
      }

      res.json({ message: "Shiprocket order created", shiprocket: result, order: updated });
    } else {
      res.status(400).json({ error: "Failed to create Shiprocket order", details: result });
    }
  } catch (err) {
    console.error("Shiprocket create error:", err);
    res.status(500).json({ error: "Failed to create Shiprocket order" });
  }
});

// Assign AWB
router.post("/:id/shiprocket/awb", async (req, res) => {
  try {
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (!order) return res.status(404).json({ error: "Order not found" });
    if (!order.shiprocket_shipment_id) {
      return res.status(400).json({ error: "Create Shiprocket order first" });
    }
    if (order.awb_code) {
      return res.status(400).json({ error: "AWB already assigned" });
    }

    const result = await shiprocket.assignAWB(
      parseInt(order.shiprocket_shipment_id),
      req.body.courier_id || null
    );

    if (result?.response?.data?.awb_code) {
      const awbData = result.response.data;
      const { data: updated } = await supabase
        .from("orders")
        .update({
          awb_code: awbData.awb_code,
          courier_name: awbData.courier_name || "",
          tracking_url: `https://shiprocket.co/tracking/${awbData.awb_code}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", req.params.id)
        .select()
        .single();

      // Send email with tracking
      const customerEmail = await getCustomerEmail(order.customer_id);
      if (customerEmail) {
        try { await sendShippingLabel(updated, customerEmail); } catch (e) { console.error(e); }
      }

      res.json({ message: "AWB assigned", awb: awbData, order: updated });
    } else {
      res.status(400).json({ error: "Failed to assign AWB", details: result });
    }
  } catch (err) {
    console.error("AWB assign error:", err);
    res.status(500).json({ error: "Failed to assign AWB" });
  }
});

// Schedule pickup
router.post("/:id/shiprocket/pickup", async (req, res) => {
  try {
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (!order) return res.status(404).json({ error: "Order not found" });
    if (!order.shiprocket_shipment_id) {
      return res.status(400).json({ error: "Create Shiprocket order first" });
    }

    const result = await shiprocket.schedulePickup(parseInt(order.shiprocket_shipment_id));

    if (result?.pickup_status === 1 || result?.response) {
      const pickupDate = result?.response?.pickup_scheduled_date || new Date().toISOString().split("T")[0];
      await supabase
        .from("orders")
        .update({
          pickup_scheduled_date: pickupDate,
          order_status: "shipped",
          shipped_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", req.params.id);

      const customerEmail = await getCustomerEmail(order.customer_id);
      if (customerEmail) {
        try { await sendStatusUpdate({ ...order, pickup_scheduled_date: pickupDate }, customerEmail, "shipped"); } catch (e) { console.error(e); }
      }

      res.json({ message: "Pickup scheduled", pickup: result });
    } else {
      res.status(400).json({ error: "Failed to schedule pickup", details: result });
    }
  } catch (err) {
    console.error("Pickup error:", err);
    res.status(500).json({ error: "Failed to schedule pickup" });
  }
});

// Track shipment
router.get("/:id/shiprocket/track", async (req, res) => {
  try {
    const { data: order } = await supabase
      .from("orders")
      .select("awb_code, shiprocket_shipment_id")
      .eq("id", req.params.id)
      .single();

    if (!order) return res.status(404).json({ error: "Order not found" });

    let result;
    if (order.awb_code) {
      result = await shiprocket.trackShipment(order.awb_code);
    } else if (order.shiprocket_shipment_id) {
      result = await shiprocket.trackByShipmentId(parseInt(order.shiprocket_shipment_id));
    } else {
      return res.status(400).json({ error: "No tracking info available" });
    }

    // Sync status to DB
    if (result?.tracking_data?.shipment_track?.[0]?.current_status) {
      const currentStatus = result.tracking_data.shipment_track[0].current_status.toLowerCase();
      const statusMap = {
        "picked up": "shipped",
        "in transit": "shipped",
        "out for delivery": "shipped",
        "delivered": "delivered",
        "rto initiated": "rto",
        "rto delivered": "rto",
      };

      const mappedStatus = statusMap[currentStatus] || null;
      if (mappedStatus) {
        const updates = { order_status: mappedStatus, updated_at: new Date().toISOString() };
        if (mappedStatus === "delivered") updates.delivered_at = new Date().toISOString();

        await supabase.from("orders").update(updates).eq("id", req.params.id);
      }
    }

    res.json(result);
  } catch (err) {
    console.error("Track error:", err);
    res.status(500).json({ error: "Failed to track shipment" });
  }
});

// Cancel shipment
router.post("/:id/shiprocket/cancel", async (req, res) => {
  try {
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.shiprocket_order_id) {
      await shiprocket.cancelShiprocketOrder(parseInt(order.shiprocket_order_id));
    }

    const { data: updated } = await supabase
      .from("orders")
      .update({
        order_status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancel_reason: req.body.reason || "Cancelled by admin",
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select()
      .single();

    const customerEmail = await getCustomerEmail(order.customer_id);
    if (customerEmail) {
      try { await sendStatusUpdate(updated, customerEmail, "cancelled"); } catch (e) { console.error(e); }
    }

    res.json({ message: "Order cancelled", order: updated });
  } catch (err) {
    console.error("Cancel error:", err);
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

// Generate/Download label
router.get("/:id/label", async (req, res) => {
  try {
    const { data: order } = await supabase
      .from("orders")
      .select("shiprocket_shipment_id, awb_code")
      .eq("id", req.params.id)
      .single();

    if (!order?.shiprocket_shipment_id) {
      return res.status(400).json({ error: "Shipment not created yet" });
    }

    const result = await shiprocket.generateLabel(parseInt(order.shiprocket_shipment_id));

    if (result?.label_url) {
      await supabase.from("orders").update({ label_url: result.label_url }).eq("id", req.params.id);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate label" });
  }
});

// Generate/Download invoice
router.get("/:id/invoice", async (req, res) => {
  try {
    const { data: order } = await supabase
      .from("orders")
      .select("shiprocket_order_id")
      .eq("id", req.params.id)
      .single();

    if (!order?.shiprocket_order_id) {
      return res.status(400).json({ error: "Shiprocket order not created yet" });
    }

    const result = await shiprocket.generateInvoice(parseInt(order.shiprocket_order_id));

    if (result?.invoice_url) {
      await supabase.from("orders").update({ invoice_url: result.invoice_url }).eq("id", req.params.id);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate invoice" });
  }
});

// Initiate refund
router.post("/:id/refund", async (req, res) => {
  try {
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (!order) return res.status(404).json({ error: "Order not found" });
    if (!order.razorpay_payment_id) {
      return res.status(400).json({ error: "No payment to refund" });
    }
    if (order.refund_status === "processed") {
      return res.status(400).json({ error: "Refund already processed" });
    }

    const refundAmount = req.body.amount || order.total;

    const refund = await razorpay.payments.refund(order.razorpay_payment_id, {
      amount: refundAmount,
      speed: "normal",
      notes: { order_number: order.order_number, reason: req.body.reason || "Admin initiated refund" },
    });

    const { data: updated } = await supabase
      .from("orders")
      .update({
        refund_id: refund.id,
        refund_amount: refundAmount,
        refund_status: "initiated",
        payment_status: "refunded",
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select()
      .single();

    const customerEmail = await getCustomerEmail(order.customer_id);
    if (customerEmail) {
      try { await sendRefundNotification(updated, customerEmail, refundAmount); } catch (e) { console.error(e); }
    }

    res.json({ message: "Refund initiated", refund, order: updated });
  } catch (err) {
    console.error("Refund error:", err);
    res.status(500).json({ error: "Failed to initiate refund" });
  }
});

// Update status manually
router.patch("/:id/status", async (req, res) => {
  try {
    const { order_status } = req.body;
    const updates = { order_status, updated_at: new Date().toISOString() };
    if (order_status === "delivered") updates.delivered_at = new Date().toISOString();
    if (order_status === "cancelled") updates.cancelled_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    const customerEmail = await getCustomerEmail(data.customer_id);
    if (customerEmail) {
      try { await sendStatusUpdate(data, customerEmail, order_status); } catch (e) { console.error(e); }
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

export default router;
