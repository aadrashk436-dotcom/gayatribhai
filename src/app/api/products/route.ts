import { NextResponse } from "next/server";
import { products as localProducts } from "@/products";
import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://qnhtnbzeyqbrzjguhgsy.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

function getProductsFilePath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

function readStoredProducts() {
  try {
    const dbFilePath = path.join(process.cwd(), "backend", "src", "data", "db.json");
    if (fs.existsSync(dbFilePath)) {
      const data = JSON.parse(fs.readFileSync(dbFilePath, "utf8"));
      if (Array.isArray(data.products) && data.products.length > 0) {
        return data.products.map((p: any) => ({
          ...p,
          price: p.price > 10000 ? Math.round(p.price / 100) : p.price,
          mrp: p.mrp > 10000 ? Math.round(p.mrp / 100) : p.mrp,
          reviews: p.reviews_count || p.reviews || 0,
        }));
      }
    }
    const productsJsonPath = path.join(process.cwd(), "backend", "src", "data", "products.json");
    if (fs.existsSync(productsJsonPath)) {
      const prodData = JSON.parse(fs.readFileSync(productsJsonPath, "utf8"));
      if (Array.isArray(prodData) && prodData.length > 0) {
        return prodData.map((p: any) => ({
          ...p,
          price: p.price > 10000 ? Math.round(p.price / 100) : p.price,
          mrp: p.mrp > 10000 ? Math.round(p.mrp / 100) : p.mrp,
          reviews: p.reviews_count || p.reviews || 0,
        }));
      }
    }
  } catch (err) {
    console.warn("Could not read stored products:", err);
  }
  return null;
}

function saveProductToDb(newProduct: any) {
  try {
    const dbPath = path.join(process.cwd(), "backend", "src", "data", "db.json");
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      data.products = data.products || [];
      const existingIdx = data.products.findIndex((p: any) => p.id === newProduct.id || p.slug === newProduct.slug);
      if (existingIdx >= 0) {
        data.products[existingIdx] = { ...data.products[existingIdx], ...newProduct, updated_at: new Date().toISOString() };
      } else {
        data.products.unshift(newProduct);
      }
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");

      // Also keep backend/src/data/products.json synchronized
      const prodJsonPath = path.join(process.cwd(), "backend", "src", "data", "products.json");
      fs.writeFileSync(prodJsonPath, JSON.stringify(data.products, null, 2), "utf8");
    }
  } catch (err) {
    console.warn("Could not save product to file:", err);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const includeHidden = searchParams.get("include_hidden") === "true" || searchParams.get("admin") === "true";

    const stored = readStoredProducts();
    let items = stored || localProducts;
    let source = stored ? "db" : "local";

    let filtered = [...items];

    // Unless explicitly requested by admin, filter out hidden/draft products from storefront
    if (!includeHidden) {
      filtered = filtered.filter((p) => p.is_visible !== false);
    }

    if (category && category !== "all") {
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

    if (sort === "price_asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      filtered.sort((a, b) => b.price - a.price);
    }

    return NextResponse.json({
      products: filtered,
      total: filtered.length,
      source,
    });
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

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const rawPrice = Number(body.price);
    const rawMrp = Number(body.mrp || body.price);
    const priceInPaise = rawPrice < 10000 ? rawPrice * 100 : rawPrice;
    const mrpInPaise = rawMrp < 10000 ? rawMrp * 100 : rawMrp;
    const calculatedDiscount = rawMrp > rawPrice ? Math.round(((rawMrp - rawPrice) / rawMrp) * 100) : (Number(body.discount) || 0);

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
      fabric: body.fabric || "Pure Linen",
      occasion: body.occasion || "Casual",
      rating: Number(body.rating || 4.8),
      reviews_count: Number(body.reviews_count || 1),
      badge: body.badge || "New",
      sizes: body.sizes || ["XS", "S", "M", "L", "XL", "XXL"],
      stock: body.stock || { XS: 4, S: 5, M: 6, L: 6, XL: 5, XXL: 3 },
      images: body.images || [],
      weight: Number(body.weight || 0.35),
      length: Number(body.length || 30),
      breadth: Number(body.breadth || 25),
      height: Number(body.height || 4),
      is_visible: true,
      is_in_stock: true,
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
          return NextResponse.json({ success: true, product: created[0] || newProduct });
        }
      } catch (err: any) {
        console.warn("Supabase insert error:", err.message);
      }
    }

    saveProductToDb(newProduct);
    return NextResponse.json({ success: true, product: newProduct, note: "Saved to local atelier database" });
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

        // Normalize price to paise in db.json if provided in rupees (< 10000)
        if (normalizedUpdates.price !== undefined) {
          const numPrice = Number(normalizedUpdates.price);
          normalizedUpdates.price = numPrice < 10000 ? numPrice * 100 : numPrice;
        }

        // Normalize mrp to paise in db.json if provided in rupees (< 10000)
        if (normalizedUpdates.mrp !== undefined) {
          const numMrp = Number(normalizedUpdates.mrp);
          normalizedUpdates.mrp = numMrp < 10000 ? numMrp * 100 : numMrp;
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

        const returnProduct = {
          ...data.products[idx],
          price: data.products[idx].price > 10000 ? Math.round(data.products[idx].price / 100) : data.products[idx].price,
          mrp: data.products[idx].mrp > 10000 ? Math.round(data.products[idx].mrp / 100) : data.products[idx].mrp,
        };

        return NextResponse.json({ success: true, product: returnProduct });
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
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete product" }, { status: 500 });
  }
}
