import { Router } from "express";
import supabase from "../../config/supabase.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contact inquiries" });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    const { is_read } = req.body;
    const { data, error } = await supabase.from("contact_messages").update({ is_read: is_read ?? true }).eq("id", req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to update inquiry status" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await supabase.from("contact_messages").delete().eq("id", req.params.id);
    res.json({ message: "Inquiry deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete inquiry" });
  }
});

export default router;
