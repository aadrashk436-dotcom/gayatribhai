export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import {
  getStoredProducts,
  getStoredProductBySlug,
  getStoredProductById,
  normalizeStoredProduct,
} from "@/lib/serverProducts";
import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://qnhtnbzeyqbrzjguhgsy.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

function getProductsFilePath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

function saveProductToDb(newProduct: any) {
  try {
    const dbPath = path.join(process.cwd(), "backend", "src", "data", "db.json");
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      data.products = data.products || [];
      const existingIdx = data.products.findIndex(
        (p: any) => p.id === newProduct.id || p.slug === newProduct.slug
      );
      if (existingIdx >= 0) {
        data.products[existingIdx] = {
          ...data.products[existingIdx],
          ...newProduct,
          updated_at: new Date().toISOString(),
        };
      } else {
        data.products.unshift(newProduct);
      }
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");

      // Also keep backend/src/data/products.json synchronized
      try {
        const prodJsonPath = path.join(process.cwd(), "backend", "src", "data", "products.json");
        fs.writeFileSync(prodJsonPath, JSON.stringify(data.products, null, 2), "utf8");
      } catch {}
    }
  } catch (err) {
    console.warn("Could not save product to file:", err);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const includeHidden =
      searchParams.get("include_hidden") === "true" || searchParams.get("admin") === "true";

    // 1. Single product lookup by slug
    if (slug) {
      const product = getStoredProductBySlug(slug, includeHidden);
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          {
            status: 404,
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate",
            },
          }
        );
      }
      return NextResponse.json(product, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    // 2. Single product lookup by id
    if (id) {
      const product = getStoredProductById(id, includeHidden);
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          {
            status: 404,
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate",
            },
          }
        );
      }
      return NextResponse.json(product, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    // 3. Multi-product listing
    const allProducts = getStoredProducts(includeHidden);
    let filtered = [...allProducts];

    if (category && category !== "all" && category !== "All Shirts") {
      filtered = filtered.filter(
        (p) => p.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.fabric?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      );
    }

    if (sort === "price_asc" || sort === "Price: Low to High") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc" || sort === "Price: High to Low") {
      filtered.sort((a, b) => b.price - a.price);
    }

    return NextResponse.json(
      {
        products: filtered,
        total: filtered.length,
        source: "db",
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.price) {
      return NextResponse.json({ error: "Product name and price are required" }, { status: 400 });
    }

    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const rawPrice = Number(body.price);
    const rawMrp = Number(body.mrp || body.price);
    // Convert to paise for internal db storage if provided in rupees (< 50000)
    const priceInPaise = rawPrice < 50000 ? Math.round(rawPrice * 100) : rawPrice;
    const mrpInPaise = rawMrp < 50000 ? Math.round(rawMrp * 100) : rawMrp;
    const calculatedDiscount =
      rawMrp > rawPrice
        ? Math.round(((rawMrp - rawPrice) / rawMrp) * 100)
        : Number(body.discount) || 0;

    const newProduct = {
      id: body.id || `prod_${Date.now()}`,
      slug,
      name: body.name,
      description: body.description || "",
      price: priceInPaise,
      mrp: mrpInPaise,
      discount: calculatedDiscount,
      category: body.category || "Contemporary",
      sub_category: body.sub_category || body.category || "Contemporary",
      sku: body.sku || `GB-${Date.now().toString().slice(-6)}`,
      color: body.color || "Ivory",
      fabric: body.fabric || "100% Pure Organic French Linen",
      occasion: body.occasion || "Resort wear, sunset gatherings",
      rating: Number(body.rating || 4.8),
      reviews_count: Number(body.reviews_count || 1),
      badge: body.badge || "New",
      sizes: body.sizes || ["XS", "S", "M", "L", "XL", "XXL"],
      stock: body.stock || { XS: 4, S: 5, M: 6, L: 6, XL: 5, XXL: 3 },
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ["/assets/site_banners/slide1_desktop.jpg"],
      weight: Number(body.weight || 0.35),
      length: Number(body.length || 30),
      breadth: Number(body.breadth || 25),
      height: Number(body.height || 4),
      is_visible: body.is_visible !== false,
      is_in_stock: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            Prefer: "return=representation",
          },
          body: JSON.stringify(newProduct),
        });
        if (res.ok) {
          const created = await res.json();
          saveProductToDb(created[0] || newProduct);
          return NextResponse.json({ success: true, product: normalizeStoredProduct(created[0] || newProduct) });
        }
      } catch (err: any) {
        console.warn("Supabase insert error:", err.message);
      }
    }

    saveProductToDb(newProduct);
    return NextResponse.json(
      {
        success: true,
        product: normalizeStoredProduct(newProduct),
        note: "Saved to local atelier database",
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create product" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    const filePath = getProductsFilePath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      data.products = data.products || [];
      const idx = data.products.findIndex((p: any) => p.id === id || p.slug === id);
      if (idx >= 0) {
        const normalizedUpdates: any = { ...updates };

        // Normalize price to paise in db.json if provided in rupees (< 50000)
        if (normalizedUpdates.price !== undefined) {
          const numPrice = Number(normalizedUpdates.price);
          normalizedUpdates.price = numPrice < 50000 ? Math.round(numPrice * 100) : numPrice;
        }

        // Normalize mrp to paise in db.json if provided in rupees (< 50000)
        if (normalizedUpdates.mrp !== undefined) {
          const numMrp = Number(normalizedUpdates.mrp);
          normalizedUpdates.mrp = numMrp < 50000 ? Math.round(numMrp * 100) : numMrp;
        }

        // Auto-calculate discount percentage if price and mrp are present
        if (normalizedUpdates.price && normalizedUpdates.mrp) {
          const p = Number(normalizedUpdates.price);
          const m = Number(normalizedUpdates.mrp);
          if (m > p) {
            normalizedUpdates.discount = Math.round(((m - p) / m) * 100);
          } else {
            normalizedUpdates.discount = 0;
          }
        }

        data.products[idx] = {
          ...data.products[idx],
          ...normalizedUpdates,
          updated_at: new Date().toISOString(),
        };

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

        try {
          const prodJsonPath = path.join(process.cwd(), "backend", "src", "data", "products.json");
          fs.writeFileSync(prodJsonPath, JSON.stringify(data.products, null, 2), "utf8");
        } catch {}

        const returnProduct = normalizeStoredProduct(data.products[idx]);

        return NextResponse.json(
          { success: true, product: returnProduct },
          { headers: { "Cache-Control": "no-store" } }
        );
      }
    }
    return NextResponse.json({ success: true, updated: updates, note: "Updated" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update product" }, { status: 500 });
  }
}

export const PUT = PATCH;

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    const filePath = getProductsFilePath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      if (Array.isArray(data.products)) {
        data.products = data.products.filter((p: any) => p.id !== id && p.slug !== id);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

        try {
          const prodJsonPath = path.join(process.cwd(), "backend", "src", "data", "products.json");
          fs.writeFileSync(prodJsonPath, JSON.stringify(data.products, null, 2), "utf8");
        } catch {}
      }
    }
    return NextResponse.json(
      { success: true, deletedId: id },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete product" }, { status: 500 });
  }
}
