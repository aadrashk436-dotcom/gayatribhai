import { Router } from "express";
import supabase from "../../config/supabase.js";

const router = Router();

// List all products
router.get("/", async (req, res) => {
  try {
    const { search, category, visible, inStock } = req.query;
    let query = supabase.from("products").select("*", { count: "exact" });

    if (search) query = query.ilike("name", `%${search}%`);
    if (category) query = query.eq("category", category);
    if (visible === "true") query = query.eq("is_visible", true);
    if (visible === "false") query = query.eq("is_visible", false);
    if (inStock === "true") query = query.eq("is_in_stock", true);
    if (inStock === "false") query = query.eq("is_in_stock", false);

    query = query.order("created_at", { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ products: data, total: count });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Product not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Create product
router.post("/", async (req, res) => {
  try {
    const {
      name, slug, description, price, mrp, discount, category, sub_category,
      sku, color, fabric, occasion, sizes, stock, images, cover_image_index,
      weight, length, breadth, height, badge,
      seo_title, seo_description, seo_keywords,
    } = req.body;

    if (!name || !price || !sku) {
      return res.status(400).json({ error: "Name, price, and SKU are required" });
    }

    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const { data, error } = await supabase
      .from("products")
      .insert({
        name, slug: productSlug, description, price, mrp: mrp || price,
        discount: discount || 0, category: category || "Contemporary",
        sub_category: sub_category || "", sku, color, fabric, occasion,
        sizes: sizes || ["S", "M", "L", "XL", "XXL"],
        stock: stock || { S: 10, M: 10, L: 10, XL: 10, XXL: 10 },
        images: images || [], cover_image_index: cover_image_index || 0,
        weight: weight || 0.3, length: length || 30, breadth: breadth || 25, height: height || 3,
        badge: badge || "", seo_title, seo_description, seo_keywords,
        is_visible: true, is_in_stock: true,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Update product
router.put("/:id", async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    delete updates.id;
    delete updates.created_at;

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    const { error } = await supabase.from("products").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Toggle visibility
router.patch("/:id/visibility", async (req, res) => {
  try {
    const { is_visible } = req.body;
    const { data, error } = await supabase
      .from("products")
      .update({ is_visible, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to update visibility" });
  }
});

// Update stock
router.patch("/:id/stock", async (req, res) => {
  try {
    const { stock, is_in_stock } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (stock) updates.stock = stock;
    if (is_in_stock !== undefined) updates.is_in_stock = is_in_stock;

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to update stock" });
  }
});

// Set cover image
router.patch("/:id/cover", async (req, res) => {
  try {
    const { cover_image_index } = req.body;
    const { data, error } = await supabase
      .from("products")
      .update({ cover_image_index, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to update cover image" });
  }
});

export default router;
