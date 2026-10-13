import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getBannersFilePath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

export interface BannerSlide {
  id: string;
  kicker: string;
  lines: [string, string];
  cta: string;
  desktop: string;
  mobile: string;
  alt: string;
  tone: "light" | "dark";
  link: string;
  is_active: boolean;
  sort_order: number;
}

export const INITIAL_BANNERS: BannerSlide[] = [
  {
    id: "atelier",
    kicker: "Summer Atelier '26",
    lines: ["Woven", "by hand."],
    cta: "Shop linen",
    desktop: "/assets/site_banners/slide1_desktop.jpg",
    mobile: "/assets/site_banners/slide1_mobile.jpg",
    alt: "Model in an ivory hand-embroidered French linen shirt on an Aegean seaside stone terrace",
    tone: "light",
    link: "/shop",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "resort",
    kicker: "The Resort Edit",
    lines: ["Coastal", "state."],
    cta: "Shop resort",
    desktop: "/assets/site_banners/slide2_desktop.jpg",
    mobile: "/assets/site_banners/slide2_mobile.jpg",
    alt: "Model relaxing on a luxury coastal villa terrace in a sky-blue Cuban collar linen shirt",
    tone: "light",
    link: "/shop",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "studio",
    kicker: "New Arrivals",
    lines: ["Rust &", "ease."],
    cta: "Shop new in",
    desktop: "/assets/banners/hero-terracotta-widescreen.jpg",
    mobile: "/assets/banners/hero-studio-mobile.jpg",
    alt: "Model walking through a sunlit sandstone courtyard in a terracotta embroidered linen shirt",
    tone: "light",
    link: "/shop",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "evening",
    kicker: "After Dark",
    lines: ["Evening", "tailoring."],
    cta: "Shop evening",
    desktop: "/assets/banners/hero-evening-desktop.jpg",
    mobile: "/assets/site_banners/slide3_mobile.jpg",
    alt: "Model on an evening rooftop at dusk in a navy embroidered shirt",
    tone: "light",
    link: "/shop",
    is_active: true,
    sort_order: 4,
  },
];

function readStoredBanners(): BannerSlide[] {
  try {
    const filePath = getBannersFilePath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      if (Array.isArray(data.banners) && data.banners.length > 0) {
        return data.banners;
      }
    }
  } catch (err) {
    console.warn("Could not read banners from db.json:", err);
  }
  return INITIAL_BANNERS;
}

function saveBanners(banners: BannerSlide[]) {
  try {
    const filePath = getBannersFilePath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      data.banners = banners;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    }
  } catch (err) {
    console.warn("Could not save banners to db.json:", err);
  }
}

export async function GET() {
  const banners = readStoredBanners();
  return NextResponse.json(banners);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (Array.isArray(body)) {
      saveBanners(body);
      return NextResponse.json({ success: true, banners: body });
    } else if (body && body.banner) {
      const current = readStoredBanners();
      const existingIdx = current.findIndex((b) => b.id === body.banner.id);
      let updated: BannerSlide[];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = { ...updated[existingIdx], ...body.banner };
      } else {
        updated = [body.banner, ...current];
      }
      saveBanners(updated);
      return NextResponse.json({ success: true, banners: updated });
    }
    return NextResponse.json({ error: "Invalid banner payload format" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update banners" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Banner id is required" }, { status: 400 });
    }
    const current = readStoredBanners();
    const updated = current.filter((b) => b.id !== id);
    saveBanners(updated);
    return NextResponse.json({ success: true, banners: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete banner" }, { status: 500 });
  }
}
