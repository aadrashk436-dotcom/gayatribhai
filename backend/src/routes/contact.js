import { Router } from "express";
import supabase from "../config/supabase.js";
import { sendEmail } from "../services/email.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email and message are required" });
    }

    const { data, error } = await supabase.from("contact_messages").insert({
      name, email, phone: phone || "", subject: subject || "Customer Inquiry", message, is_read: false
    }).select().single();

    if (error) throw error;

    // Send acknowledgement email if possible
    try {
      await sendEmail({
        to: email,
        subject: "We received your message — Gayatri Bhai",
        html: `<p>Dear ${name},</p><p>Thank you for reaching out to Gayatri Bhai. We have received your inquiry regarding "<strong>${subject || "General Inquiry"}</strong>" and our atelier team will respond to you shortly.</p><p>Warm regards,<br/>The Gayatri Bhai Concierge</p>`
      });
    } catch (e) {
      console.warn("Could not send confirmation email to customer:", e.message);
    }

    res.status(201).json({ success: true, message: "Message sent successfully", data });
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
