import { Router } from "express";
import supabase from "../../config/supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: "Failed to fetch coupons" }); }
});

router.post("/", async (req, res) => {
  try {
    const { code, description, type, value, min_order_amount, max_discount_amount, usage_limit, expires_at } = req.body;
    if (!code || !type || !value) return res.status(400).json({ error: "Code, type, and value required" });

    const { data, error } = await supabase.from("coupons").insert({
      code: code.toUpperCase(), description, type, value,
      min_order_amount: min_order_amount || 0, max_discount_amount: max_discount_amount || null,
      usage_limit: usage_limit || null, expires_at: expires_at || null, is_active: true, used_count: 0,
    }).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: "Failed to create coupon" }); }
});

router.put("/:id", async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.id;
    const { data, error } = await supabase.from("coupons").update(updates).eq("id", req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: "Failed to update coupon" }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await supabase.from("coupons").delete().eq("id", req.params.id);
    res.json({ message: "Coupon deleted" });
  } catch (err) { res.status(500).json({ error: "Failed to delete coupon" }); }
});

export default router;
