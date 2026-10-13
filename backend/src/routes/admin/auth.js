import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "../../config/supabase.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("is_active", true)
      .single();

    if (error || !admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password_hash, ...adminData } = admin;
    res.json({ token, admin: adminData });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
