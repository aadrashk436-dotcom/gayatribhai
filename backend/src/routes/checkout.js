import { Router } from "express";
import crypto from "crypto";
import supabase from "../config/supabase.js";
import razorpay from "../config/razorpay.js";
import { authenticateCustomer } from "../middleware/auth.js";
import { generateOrderNumber, calculatePackageDimensions } from "../utils/helpers.js";
import { sendOrderConfirmation } from "../services/email.js";

const router = Router();

// Create Razorpay order + save order to DB
router.post("/create-order", authenticateCustomer, async (req, res) => {
  try {
    const { items, address, couponCode } = req.body;
    if (!items || !items.length || !address) {
      return res.status(400).json({ error: "Items and address are required" });
    }

    // Fetch product details from DB
    const productIds = items.map((i) => i.productId || i.id);
    const { data: products, error: pErr } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (pErr || !products?.length) {
      return res.status(400).json({ error: "Invalid products" });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === (item.productId || item.id));
      if (!product) return null;

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      return {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        slug: product.slug,
        size: item.size || "M",
        quantity: item.quantity,
        price: product.price,
        image: product.images?.[product.cover_image_index || 0] || product.images?.[0] || "",
      };
    }).filter(Boolean);

    // Coupon validation
    let discountAmount = 0;
    if (couponCode) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (coupon && (!coupon.expires_at || new Date(coupon.expires_at) > new Date())) {
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
          return res.status(400).json({ error: "Coupon usage limit reached" });
        }
        if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
          return res.status(400).json({ error: `Minimum order amount is Rs. ${coupon.min_order_amount / 100}` });
        }

        if (coupon.type === "percentage") {
          discountAmount = Math.floor(subtotal * (coupon.value / 100));
          if (coupon.max_discount_amount) {
            discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
          }
        } else {
          discountAmount = coupon.value;
        }
      }
    }

    // Calculate package dimensions for shipping
    const dims = calculatePackageDimensions(orderItems, products);

    // Calculate shipping — default free for now, can use Shiprocket API
    const shippingCost = 0;
    const total = subtotal - discountAmount + shippingCost;
    const orderNumber = generateOrderNumber();

    // Create Razorpay order (amount in paise)
    const rzpOrder = await razorpay.orders.create({
      amount: total,
      currency: "INR",
      receipt: orderNumber,
      notes: { order_number: orderNumber },
    });

    // Save order to DB
    const { data: order, error: oErr } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: req.customer.id,
        shipping_address: address,
        items: orderItems,
        subtotal,
        discount_amount: discountAmount,
        shipping_cost: shippingCost,
        total,
        coupon_code: couponCode || null,
        payment_method: "razorpay",
        payment_status: "pending",
        order_status: "new",
        razorpay_order_id: rzpOrder.id,
        package_weight: dims.weight,
        package_length: dims.length,
        package_breadth: dims.breadth,
        package_height: dims.height,
      })
      .select()
      .single();

    if (oErr) throw oErr;

    res.json({
      orderId: order.id,
      orderNumber: order.order_number,
      razorpayOrderId: rzpOrder.id,
      amount: total,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Verify Razorpay payment
router.post("/verify-payment", authenticateCustomer, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Payment details required" });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Mark payment failed
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("razorpay_order_id", razorpay_order_id);

      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Update order as paid
    const { data: order, error } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        order_status: "confirmed",
        razorpay_payment_id,
        razorpay_signature,
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .select()
      .single();

    if (error) throw error;

    // Update coupon usage
    if (order.coupon_code) {
      await supabase.rpc("increment_coupon_usage", { coupon_code: order.coupon_code });
    }

    // Update customer stats
    await supabase.rpc("update_customer_stats", {
      cust_id: req.customer.id,
      order_total: order.total,
    });

    // Update stock
    for (const item of order.items) {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.productId)
        .single();

      if (product) {
        const newStock = { ...product.stock };
        if (newStock[item.size] !== undefined) {
          newStock[item.size] = Math.max(0, newStock[item.size] - item.quantity);
        }
        await supabase.from("products").update({ stock: newStock }).eq("id", item.productId);
      }
    }

    // Send confirmation email
    try {
      const { data: customer } = await supabase
        .from("customers")
        .select("email")
        .eq("id", req.customer.id)
        .single();

      if (customer?.email) {
        await sendOrderConfirmation(order, customer.email);
      }
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.order_status,
        total: order.total,
      },
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

export default router;
