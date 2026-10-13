import { NextResponse } from "next/server";

const BANNERS = [
  {
    id: "ban_1",
    title: "The Artisanal Linen Atelier",
    subtitle: "Handcrafted French Knot Embroidery & Pure Luxury",
    image_desktop: "/assets/banners/hero_desktop.jpg",
    image_mobile: "/assets/banners/hero_mobile.jpg",
    link: "/shop",
    sort_order: 1,
    is_active: true,
  },
];

export async function GET() {
  return NextResponse.json(BANNERS);
}
