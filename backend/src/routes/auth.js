import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "../config/supabase.js";
import { authenticateCustomer } from "../middleware/auth.js";

const router = Router();

// Customer Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { data: customer, error } = await supabase
      .from("customers")
      .insert({
        name,
        email: email.toLowerCase(),
        phone: phone || "",
        password_hash: passwordHash,
      })
      .select("id, name, email, phone, created_at")
      .single();

    if (error) throw error;

    const token = jwt.sign(
      { id: customer.id, email: customer.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({ token, customer });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Customer Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { data: customer, error } = await supabase
      .from("customers")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !customer) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, customer.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: customer.id, email: customer.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const { password_hash, ...customerData } = customer;
    res.json({ token, customer: customerData });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get profile
router.get("/me", authenticateCustomer, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, email, phone, avatar_url, total_spent, total_orders, created_at")
      .eq("id", req.customer.id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Customer not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update profile
router.put("/me", authenticateCustomer, async (req, res) => {
  try {
    const { name, phone, avatar_url } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (avatar_url) updates.avatar_url = avatar_url;

    const { data, error } = await supabase
      .from("customers")
      .update(updates)
      .eq("id", req.customer.id)
      .select("id, name, email, phone, avatar_url")
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
