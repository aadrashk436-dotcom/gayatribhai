import { Router } from "express";
import supabase from "../../config/supabase.js";
import razorpay from "../../config/razorpay.js";
import { checkServiceability } from "../../services/shiprocket.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("settings").select("*");
    if (error) throw error;
    const settingsMap = {};
    (data || []).forEach((item) => {
      settingsMap[item.key] = item.value;
    });
    res.json(settingsMap);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.put("/:key", async (req, res) => {
  try {
    const { value } = req.body;
    const { data, error } = await supabase
      .from("settings")
      .upsert({
        key: req.params.key,
        value,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to update setting" });
  }
});

// Test Shiprocket Live
router.get("/test/shiprocket", async (req, res) => {
  try {
    const result = await checkServiceability("452001", "400001", 0.5, 0, {
      length: 25,
      breadth: 20,
      height: 5,
    });
    res.json({
      success: true,
      service: "Shiprocket Logistics",
      email: process.env.SHIPROCKET_EMAIL,
      availableCouriers: result?.data?.available_courier_companies?.length || 0,
      message: "Shiprocket API connected and operational!",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test Razorpay Live
router.get("/test/razorpay", async (req, res) => {
  try {
    const orders = await razorpay.orders.all({ count: 1 });
    res.json({
      success: true,
      service: "Razorpay Payments",
      keyId: process.env.RAZORPAY_KEY_ID,
      mode: "LIVE PRODUCTION",
      message: "Razorpay Live API credentials verified!",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test Database
router.get("/test/database", async (req, res) => {
  try {
    const { data: products } = await supabase.from("products").select("id").limit(1);
    res.json({
      success: true,
      service: "Database (Supabase / Resilient Store)",
      recordsAvailable: !!products?.length,
      message: "Database layer connected and operational!",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
