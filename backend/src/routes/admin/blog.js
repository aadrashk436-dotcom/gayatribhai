import { Router } from "express";
import supabase from "../../config/supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from("blog_posts").select("*").eq("id", req.params.id).single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, subtitle, slug, excerpt, content, cover_image, author_name, author_role, category, tags, read_time, is_published, seo_title, seo_description } = req.body;
    const postSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const { data, error } = await supabase.from("blog_posts").insert({
      title, subtitle, slug: postSlug, excerpt, content, cover_image, author_name: author_name || "Gayatri Bhai Editorial", author_role: author_role || "Fashion Editor", category: category || "Style Guide", tags: tags || [], read_time: read_time || "4 min read", is_published: is_published ?? true, seo_title, seo_description
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    delete updates.id;
    const { data, error } = await supabase.from("blog_posts").update(updates).eq("id", req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to update blog post" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await supabase.from("blog_posts").delete().eq("id", req.params.id);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete blog post" });
  }
});

export default router;
