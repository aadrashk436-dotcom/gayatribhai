import { Router } from "express";
import supabase from "../config/supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("reels")
      .select("*, products(id, name, slug, price, mrp, images)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reels" });
  }
});

router.post("/:id/like", async (req, res) => {
  try {
    const { data: reel } = await supabase.from("reels").select("likes").eq("id", req.params.id).single();
    if (reel) {
      const { data } = await supabase.from("reels").update({ likes: (reel.likes || 0) + 1 }).eq("id", req.params.id).select().single();
      return res.json(data);
    }
    res.status(404).json({ error: "Reel not found" });
  } catch (err) {
    res.status(500).json({ error: "Failed to like reel" });
  }
});

export default router;
