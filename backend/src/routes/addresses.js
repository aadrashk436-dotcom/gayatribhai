import { Router } from "express";
import supabase from "../config/supabase.js";
import { authenticateCustomer } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateCustomer, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("customer_id", req.customer.id)
      .order("is_default", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
});

router.post("/", authenticateCustomer, async (req, res) => {
  try {
    const { name, phone, street, area, city, state, pincode, type, is_default } = req.body;
    if (!name || !phone || !street || !city || !state || !pincode) {
      return res.status(400).json({ error: "All required address fields must be provided" });
    }

    if (is_default) {
      await supabase.from("addresses").update({ is_default: false }).eq("customer_id", req.customer.id);
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        customer_id: req.customer.id,
        name,
        phone,
        street,
        area: area || "",
        city,
        state,
        pincode,
        type: type || "HOME",
        is_default: is_default ?? false
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to create address" });
  }
});

router.put("/:id", authenticateCustomer, async (req, res) => {
  try {
    const { is_default } = req.body;
    if (is_default) {
      await supabase.from("addresses").update({ is_default: false }).eq("customer_id", req.customer.id);
    }

    const updates = { ...req.body };
    delete updates.id;
    delete updates.customer_id;

    const { data, error } = await supabase
      .from("addresses")
      .update(updates)
      .eq("id", req.params.id)
      .eq("customer_id", req.customer.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to update address" });
  }
});

router.delete("/:id", authenticateCustomer, async (req, res) => {
  try {
    await supabase.from("addresses").delete().eq("id", req.params.id).eq("customer_id", req.customer.id);
    res.json({ message: "Address deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete address" });
  }
});

export default router;
