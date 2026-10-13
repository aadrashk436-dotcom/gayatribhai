import { Router } from "express";
import supabase from "../../config/supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let query = supabase.from("customers").select("id, name, email, phone, total_spent, total_orders, is_active, created_at", { count: "exact" });
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    query = query.order("created_at", { ascending: false });
    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ customers: data, total: count });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { data: customer } = await supabase.from("customers").select("id, name, email, phone, total_spent, total_orders, created_at").eq("id", req.params.id).single();
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const { data: orders } = await supabase.from("orders").select("id, order_number, total, order_status, payment_status, created_at").eq("customer_id", req.params.id).order("created_at", { ascending: false });

    res.json({ ...customer, orders: orders || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

export default router;
