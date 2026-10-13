import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

function getDbPath(): string {
  return path.join(process.cwd(), "backend", "src", "data", "db.json")
}

export const DEFAULT_SEO_SETTINGS = {
  home: {
    metaTitle: "GAYATRI BHAI | Handcrafted Luxury French Linen Shirts",
    metaDescription:
      "Discover artisanal resortwear and heirloom hand-embroidered French linen shirts crafted with generational master Karigar perfection in India.",
    keywords:
      "luxury linen shirts, hand embroidered shirts, cuban collar linen, resortwear india, designer shirts",
    ogImage: "/assets/site_banners/slide1_desktop.jpg",
    canonicalUrl: "https://gayatribhaishop-zkde-eight.vercel.app",
  },
  shop: {
    metaTitle: "Shop Artisan Linen Shirts | Gayatri Bhai Collection",
    metaDescription:
      "Explore our limited drops of 100% pure organic French linen shirts with single-needle botanical and resort embroidery.",
    keywords:
      "buy linen shirts online, resort collection, handcrafted clothing, men luxury fashion",
    ogImage: "/assets/site_banners/slide2_desktop.jpg",
    canonicalUrl: "https://gayatribhaishop-zkde-eight.vercel.app/shop",
  },
  blog: {
    metaTitle: "The AVYR Journal | Essays on Craft, Linen Science & Sartorial Art",
    metaDescription:
      "Delve into the stories behind our atelier. In-depth guides to French flax, embroidery techniques, resort styling, and conscious luxury living.",
    keywords:
      "linen care, fabric science, cuban collar styling, artisan craft, menswear essays",
    ogImage: "/assets/site_banners/slide2_desktop.jpg",
    canonicalUrl: "https://gayatribhaishop-zkde-eight.vercel.app/blog",
  },
}

export async function GET() {
  try {
    const dbPath = getDbPath()
    if (fs.existsSync(dbPath)) {
      const db = JSON.parse(fs.readFileSync(dbPath, "utf8"))
      if (db.seo_settings) {
        return NextResponse.json({
          ...DEFAULT_SEO_SETTINGS,
          ...db.seo_settings,
        })
      }
    }
  } catch (e) {
    console.warn("Could not read SEO settings from db.json:", e)
  }
  return NextResponse.json(DEFAULT_SEO_SETTINGS)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const dbPath = getDbPath()
    let db: any = {}
    if (fs.existsSync(dbPath)) {
      db = JSON.parse(fs.readFileSync(dbPath, "utf8"))
    }
    db.seo_settings = {
      ...(db.seo_settings || DEFAULT_SEO_SETTINGS),
      ...body,
    }
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8")
    return NextResponse.json({
      success: true,
      message: "SEO Settings updated successfully",
      settings: db.seo_settings,
    })
  } catch (e: any) {
    console.error("POST /api/seo error:", e)
    return NextResponse.json(
      { error: e.message || "Failed to update SEO settings" },
      { status: 500 }
    )
  }
}
