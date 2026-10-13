import { Router } from "express";
import supabase from "../config/supabase.js";

const router = Router();

router.post("/validate", async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ error: "Coupon code is required" });

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return res.status(404).json({ error: "Invalid coupon code" });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ error: "This coupon has expired" });
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ error: "This coupon has reached its maximum limit" });
    }

    if (coupon.min_order_amount && (subtotal || 0) < coupon.min_order_amount) {
      return res.status(400).json({
        error: `Minimum order value of ₹${coupon.min_order_amount / 100} required for this coupon`
      });
    }

    let discount = 0;
    if (coupon.type === "percentage") {
      discount = Math.floor(((subtotal || 0) * coupon.value) / 100);
      if (coupon.max_discount_amount) {
        discount = Math.min(discount, coupon.max_discount_amount);
      }
    } else {
      discount = coupon.value;
    }

    res.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      description: coupon.description
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to validate coupon" });
  }
});

export default router;
