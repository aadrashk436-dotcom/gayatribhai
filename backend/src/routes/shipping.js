import { Router } from "express";
import supabase from "../config/supabase.js";
import { checkServiceability } from "../services/shiprocket.js";
import { calculatePackageDimensions } from "../utils/helpers.js";

const router = Router();

// Calculate shipping cost
router.post("/calculate", async (req, res) => {
  try {
    const { deliveryPincode, items } = req.body;
    if (!deliveryPincode || !items?.length) {
      return res.status(400).json({ error: "Delivery pincode and items required" });
    }

    // Fetch products for dimensions
    const productIds = items.map((i) => i.productId || i.id);
    const { data: products } = await supabase
      .from("products")
      .select("id, weight, length, breadth, height, price")
      .in("id", productIds);

    // Calculate combined package
    const dims = calculatePackageDimensions(items, products || []);

    // Calculate declared value
    let declaredValue = 0;
    for (const item of items) {
      const product = (products || []).find((p) => p.id === (item.productId || item.id));
      if (product) declaredValue += (product.price / 100) * (item.quantity || 1);
    }

    const result = await checkServiceability(
      process.env.PICKUP_POSTCODE,
      deliveryPincode,
      dims.weight,
      0, // prepaid
      {
        length: dims.length,
        breadth: dims.breadth,
        height: dims.height,
        declared_value: declaredValue,
      }
    );

    if (!result?.data?.available_courier_companies?.length) {
      return res.status(400).json({
        error: "Delivery not available to this pincode",
        serviceable: false,
      });
    }

    const couriers = result.data.available_courier_companies.map((c) => ({
      id: c.courier_company_id,
      name: c.courier_name,
      rate: c.rate,
      estimatedDays: c.estimated_delivery_days,
      etd: c.etd,
      rating: c.rating,
    }));

    const recommended = couriers.find(
      (c) => c.id === result.data.recommendation_courier_company_id
    ) || couriers[0];

    res.json({
      serviceable: true,
      packageWeight: dims.weight,
      packageDimensions: { length: dims.length, breadth: dims.breadth, height: dims.height },
      recommended,
      couriers,
    });
  } catch (err) {
    console.error("Shipping calc error:", err);
    res.status(500).json({ error: "Failed to calculate shipping" });
  }
});

export default router;
