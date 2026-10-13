import { NextResponse } from "next/server";
import { products as localProducts } from "@/products";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://qnhtnbzeyqbrzjguhgsy.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");

    let items = localProducts;
    let source = "local";

    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          signal: controller.signal,
          next: { revalidate: 60 },
        });
        clearTimeout(timeout);
        if (res.ok) {
          const supabaseData = await res.json();
          if (Array.isArray(supabaseData) && supabaseData.length > 0) {
            items = supabaseData.map((p: any) => ({
              ...p,
              price: p.price > 10000 ? Math.round(p.price / 100) : p.price,
              mrp: p.mrp > 10000 ? Math.round(p.mrp / 100) : p.mrp,
              reviews: p.reviews_count || p.reviews || 0,
            }));
            source = "supabase";
          }
        }
      } catch {
        // Fallback to local products if Supabase is offline/paused
        items = localProducts;
      }
    }

    let filtered = [...items];

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

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newProduct = {
      id: body.id || `prod_${Date.now()}`,
      slug,
      name: body.name,
      description: body.description || "",
      price: Number(body.price) * 100, // paise
      mrp: Number(body.mrp || body.price) * 100,
      discount: Number(body.discount || 0),
      category: body.category || "Contemporary",
      sub_category: body.sub_category || body.category || "Contemporary",
      sku: body.sku || `GB-${Date.now().toString().slice(-6)}`,
      color: body.color || "Ivory",
      fabric: body.fabric || "Pure Linen",
      occasion: body.occasion || "Casual",
      rating: Number(body.rating || 4.5),
      reviews_count: Number(body.reviews_count || 0),
      badge: body.badge || "New",
      sizes: body.sizes || ["S", "M", "L", "XL", "XXL"],
      stock: body.stock || { S: 10, M: 10, L: 10, XL: 10, XXL: 10 },
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
          return NextResponse.json({ success: true, product: created[0] || newProduct });
        }
      } catch (err: any) {
        console.warn("Supabase insert error:", err.message);
      }
    }

    return NextResponse.json({ success: true, product: newProduct, note: "Saved locally" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create product" }, { status: 500 });
  }
}
