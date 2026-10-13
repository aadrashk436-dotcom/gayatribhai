import { Router } from "express";
import supabase from "../config/supabase.js";

const router = Router();

// List visible products
router.get("/", async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 50 } = req.query;
    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("is_visible", true);

    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("name", `%${search}%`);

    if (sort === "price_asc") query = query.order("price", { ascending: true });
    else if (sort === "price_desc") query = query.order("price", { ascending: false });
    else if (sort === "newest") query = query.order("created_at", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ products: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error("Products list error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get product by slug
router.get("/:slug", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", req.params.slug)
      .eq("is_visible", true)
      .single();

    if (error || !data) return res.status(404).json({ error: "Product not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

export default router;
