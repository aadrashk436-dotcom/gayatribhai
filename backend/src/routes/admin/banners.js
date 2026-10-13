import { Router } from "express";
import supabase from "../../config/supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("home_banners").select("*").order("sort_order", { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: "Failed to fetch banners" }); }
});

router.post("/", async (req, res) => {
  try {
    const { title, subtitle, image_desktop, image_mobile, link, sort_order } = req.body;
    const { data, error } = await supabase.from("home_banners").insert({
      title, subtitle, image_desktop, image_mobile, link, sort_order: sort_order || 0, is_active: true,
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: "Failed to create banner" }); }
});

router.put("/:id", async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.id;
    const { data, error } = await supabase.from("home_banners").update(updates).eq("id", req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: "Failed to update banner" }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await supabase.from("home_banners").delete().eq("id", req.params.id);
    res.json({ message: "Banner deleted" });
  } catch (err) { res.status(500).json({ error: "Failed to delete banner" }); }
});

export default router;
