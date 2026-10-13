import { NextResponse } from "next/server";
import { products as localProducts } from "@/products";
import fs from "fs";
import path from "path";

// Helper to get catalog products including locally saved products
function getAllCatalogProducts() {
  try {
    const dbPath = path.join(process.cwd(), "backend", "src", "data", "db.json");
    if (fs.existsSync(dbPath)) {
      const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      if (Array.isArray(db.products) && db.products.length > 0) {
        return db.products;
      }
    }
  } catch (err) {
    console.warn("Could not read db products for shipping:", err);
  }
  return localProducts;
}

export async function POST(request: Request) {
  try {
    const { deliveryPincode, items } = await request.json();

    if (!deliveryPincode) {
      return NextResponse.json({ error: "Delivery pincode is required" }, { status: 400 });
    }

    const catalog = getAllCatalogProducts();

    // ── 1. CALCULATE COMBINED MULTI-ITEM WEIGHT & DIMENSIONS (Amazon / Courier standard) ──
    let totalDeadWeight = 0; // in kg
    let totalUnits = 0;
    let maxL = 30; // default garment packaging length (cm)
    let maxB = 25; // default garment packaging width (cm)
    let totalH = 0; // stacked height (cm)

    const cartItems = Array.isArray(items) && items.length > 0 ? items : [{ productId: "default", quantity: 1 }];

    cartItems.forEach((item: any) => {
      const pid = item.productId || item.id;
      const qty = Math.max(1, Number(item.quantity) || 1);
      const prod = catalog.find((p: any) => p.id === pid || p.slug === pid);

      // Shirt weight default: 0.35 kg (350 grams)
      const unitWeight = Number(prod?.weight) > 0 ? Number(prod.weight) : 0.35;
      const unitL = Number(prod?.length) > 0 ? Number(prod.length) : 30;
      const unitB = Number(prod?.breadth) > 0 ? Number(prod.breadth) : 25;
      const unitH = Number(prod?.height) > 0 ? Number(prod.height) : 4;

      totalDeadWeight += unitWeight * qty;
      totalUnits += qty;

      if (unitL > maxL) maxL = unitL;
      if (unitB > maxB) maxB = unitB;
      totalH += unitH * qty;
    });

    // Minimum package dimensions floor
    const pkgLength = Math.max(20, Math.round(maxL));
    const pkgBreadth = Math.max(15, Math.round(maxB));
    const pkgHeight = Math.max(3, Math.round(totalH));

    // Volumetric weight formula: (L × B × H) / 5000 (standard for air / courier logistics)
    const packageVolumeCm3 = pkgLength * pkgBreadth * pkgHeight;
    const volumetricWeight = packageVolumeCm3 / 5000;

    // Billable weight: maximum of actual dead weight and volumetric weight (min 0.5 kg courier base)
    const billableWeight = Math.max(0.5, Math.max(totalDeadWeight, volumetricWeight));

    // ── 2. LIVE SHIPROCKET COURIER SERVICEABILITY & RATE CHECK ──
    const email = process.env.SHIPROCKET_EMAIL || "gayatripuri634@gmail.com";
    const password = process.env.SHIPROCKET_PASSWORD || "1dIfzNNBvoux23^FX@ENPl3JlJyAE%@G";
    const pickupPincode = "452001"; // Indore Atelier Headquarters

    let couriersList: any[] = [];

    try {
      const loginRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();
      if (loginData.token) {
        const queryParams = new URLSearchParams({
          pickup_postcode: pickupPincode,
          delivery_postcode: deliveryPincode.toString(),
          weight: billableWeight.toFixed(2),
          length: pkgLength.toString(),
          breadth: pkgBreadth.toString(),
          height: pkgHeight.toString(),
          cod: "0",
        });

        const servRes = await fetch(
          `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?${queryParams.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${loginData.token}`,
            },
          }
        );
        const servData = await servRes.json();
        if (servData?.data?.available_courier_companies?.length) {
          couriersList = servData.data.available_courier_companies.map((c: any) => ({
            id: c.courier_company_id,
            name: c.courier_name,
            rate: Math.round(Number(c.rate) || 99),
            etd: c.etd || "2-3 business days",
            mode: c.courier_name?.toLowerCase().includes("air") ? "AIR" : "SURFACE",
          }));
        }
      }
    } catch (e) {
      console.warn("Live Shiprocket API serviceability fallback:", e);
    }

    // ── 3. DYNAMIC COURIER MATRIX IF OFFLINE OR FALLBACK ──
    if (!couriersList.length) {
      // Dynamic weight tiered calculation
      const extraWeightFactor = Math.max(0, billableWeight - 0.5);
      const blueDartRate = Math.round(95 + extraWeightFactor * 60);
      const delhiveryRate = Math.round(75 + extraWeightFactor * 45);
      const standardRate = Math.round(55 + extraWeightFactor * 30);

      couriersList = [
        {
          id: 1,
          name: "Blue Dart Express Air",
          rate: blueDartRate,
          etd: "1-2 business days",
          mode: "AIR",
          tag: "Fastest Delivery",
        },
        {
          id: 2,
          name: "Delhivery Air Express",
          rate: delhiveryRate,
          etd: "2-3 business days",
          mode: "AIR",
          tag: "Most Popular",
        },
        {
          id: 3,
          name: "Standard Atelier Surface",
          rate: standardRate,
          etd: "3-5 business days",
          mode: "SURFACE",
          tag: "Eco Delivery",
        },
      ];
    }

    const packageSummary = {
      totalUnits,
      deadWeightKg: Number(totalDeadWeight.toFixed(2)),
      volumetricWeightKg: Number(volumetricWeight.toFixed(2)),
      billableWeightKg: Number(billableWeight.toFixed(2)),
      dimensions: {
        length: pkgLength,
        breadth: pkgBreadth,
        height: pkgHeight,
        unit: "cm",
      },
      volumetricFormula: `(${pkgLength}cm × ${pkgBreadth}cm × ${pkgHeight}cm) / 5000 = ${volumetricWeight.toFixed(2)} kg`,
    };

    return NextResponse.json({
      serviceable: true,
      pickupPincode,
      deliveryPincode,
      packageSummary,
      recommended: couriersList[0],
      couriers: couriersList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to calculate shipping" }, { status: 500 });
  }
}
