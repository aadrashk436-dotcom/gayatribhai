import { Router } from "express";
import supabase from "../../config/supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("reels").select("*, products(name, slug, images)").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reels" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, caption, video_url, poster_url, product_id, tag, is_active } = req.body;
    const { data, error } = await supabase.from("reels").insert({
      title, caption, video_url, poster_url, product_id: product_id || null, tag: tag || "Lookbook", is_active: is_active ?? true, views: 0, likes: 0
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to create reel" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.id;
    const { data, error } = await supabase.from("reels").update(updates).eq("id", req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to update reel" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await supabase.from("reels").delete().eq("id", req.params.id);
    res.json({ message: "Reel deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete reel" });
  }
});

export default router;
