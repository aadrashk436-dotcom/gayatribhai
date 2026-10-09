import type { Metadata } from "next"
import ShopClient from "./ShopClient"

export const metadata: Metadata = {
  title: "Shop Luxury Artisanal Shirts | AVYR by Gayatri Atelier",
  description:
    "Explore our complete collection of 100% pure French linen shirts, featuring intricate hand embroidery, mother-of-pearl buttons, and relaxed resort silhouettes.",
  keywords: [
    "buy linen shirts online",
    "hand embroidered shirts india",
    "luxury resortwear men",
    "pure french linen shirts",
    "AVYR collection",
  ],
  alternates: {
    canonical: "https://gayatribhaishop-zkde-eight.vercel.app/shop",
  },
  openGraph: {
    title: "Shop Luxury Artisanal Shirts | AVYR by Gayatri",
    description:
      "Handcrafted 100% French linen shirts with artisanal embroidery. Explore the complete collection.",
    url: "https://gayatribhaishop-zkde-eight.vercel.app/shop",
    siteName: "AVYR by Gayatri",
    images: [
      {
        url: "https://gayatribhaishop-zkde-eight.vercel.app/assets/site_banners/slide1_desktop.jpg",
        width: 1920,
        height: 1080,
        alt: "AVYR Artisanal Shirts Collection",
      },
    ],
  },
}

export default function ShopPage() {
  return <ShopClient />
}
