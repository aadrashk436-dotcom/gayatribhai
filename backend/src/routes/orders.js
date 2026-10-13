import { Router } from "express";
import supabase from "../config/supabase.js";
import { authenticateCustomer } from "../middleware/auth.js";

const router = Router();

// Customer's orders
router.get("/", authenticateCustomer, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", req.customer.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Order detail
router.get("/:id", authenticateCustomer, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", req.params.id)
      .eq("customer_id", req.customer.id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Order not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Cancel order (only if AWB not assigned)
router.post("/:id/cancel", authenticateCustomer, async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", req.params.id)
      .eq("customer_id", req.customer.id)
      .single();

    if (error || !order) return res.status(404).json({ error: "Order not found" });

    // Can only cancel if AWB not assigned (before shipment)
    if (order.awb_code) {
      return res.status(400).json({ error: "Cannot cancel order after shipment" });
    }

    if (order.order_status === "cancelled") {
      return res.status(400).json({ error: "Order already cancelled" });
    }

    const { data: updated, error: uErr } = await supabase
      .from("orders")
      .update({
        order_status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancel_reason: req.body.reason || "Customer requested cancellation",
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select()
      .single();

    if (uErr) throw uErr;
    res.json({ message: "Order cancelled", order: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

export default router;
