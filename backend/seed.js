import "dotenv/config";
import { supabase } from "./src/config/supabase.js";
import fs from "fs";
import path from "path";

async function seed() {
  console.log("🌱 Starting seed...");
  try {
    // Read products from frontend
    const frontendProductsPath = "C:/Users/hqsav/gayatribhai/src/products.ts";
    const content = fs.readFileSync(frontendProductsPath, "utf-8");
    
    // Extract JSON array from export const products = [...]
    const jsonMatch = content.match(/export const products:\s*Product\[\]\s*=\s*(\[[\s\S]*?\])\s*$/m);
    let rawProducts = [];
    if (jsonMatch) {
      try {
        // Evaluate safely
        rawProducts = eval(jsonMatch[1]);
      } catch (e) {
        console.warn("Could not eval directly, skipping auto-parse:", e.message);
      }
    }

    if (rawProducts && rawProducts.length) {
      console.log(`Found ${rawProducts.length} products to seed.`);
      for (const p of rawProducts) {
        const productRow = {
          slug: p.slug,
          name: p.name,
          description: p.description,
          price: (p.price || 0) * 100, // paise
          mrp: (p.mrp || p.price || 0) * 100,
          discount: p.discount || 0,
          category: p.category || "Contemporary",
          sku: p.sku || `GB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          color: p.color || "",
          fabric: p.fabric || "Pure Linen",
          occasion: p.occasion || "Casual",
          rating: p.rating || 4.5,
          reviews_count: p.reviews || 0,
          badge: p.badge || "",
          sizes: p.sizes || ["S", "M", "L", "XL", "XXL"],
          stock: p.stock || { S: 10, M: 10, L: 10, XL: 10, XXL: 10 },
          images: p.images || [],
          cover_image_index: 0,
          weight: 0.35,
          length: 30,
          breadth: 25,
          height: 4,
          is_visible: true,
          is_in_stock: true,
        };

        const { error } = await supabase.from("products").upsert(productRow, { onConflict: "slug" });
        if (error) console.error(`Error upserting ${p.name}:`, error.message);
        else console.log(`✓ Seeded ${p.name}`);
      }
    }

    console.log(" Seeding completed successfully!");
  } catch (err) {
    console.error("Seeding error:", err);
  }
}

seed();
