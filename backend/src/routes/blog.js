import { Router } from "express";
import supabase from "../config/supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { category, tag } = req.query;
    let query = supabase
      .from("blog_posts")
      .select("id, slug, title, subtitle, excerpt, cover_image, author_name, author_role, category, tags, read_time, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (category) query = query.eq("category", category);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", req.params.slug)
      .eq("is_published", true)
      .single();

    if (error || !data) return res.status(404).json({ error: "Article not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch article" });
  }
});

export default router;
