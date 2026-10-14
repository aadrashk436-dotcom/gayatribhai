import type { Metadata } from "next"
import { products } from "@/lib/products"
import ShopClient from "./ShopClient"

const BASE_URL = "https://gayatribhai.vercel.app"

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
    canonical: "https://gayatribhai.vercel.app/shop",
  },
  openGraph: {
    title: "Shop Luxury Artisanal Shirts | AVYR by Gayatri",
    description:
      "Handcrafted 100% French linen shirts with artisanal embroidery. Explore the complete collection.",
    url: "https://gayatribhai.vercel.app/shop",
    siteName: "AVYR by Gayatri",
    images: [
      {
        url: "https://gayatribhai.vercel.app/assets/site_banners/slide1_desktop.jpg",
        width: 1920,
        height: 1080,
        alt: "AVYR Artisanal Shirts Collection",
      },
    ],
  },
}

export default function ShopPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Luxury Artisanal Hand-Embroidered Shirts Collection",
    description:
      "Handcrafted 100% pure French linen shirts with artisanal embroidery and mother-of-pearl accents.",
    numberOfItems: products.length,
    itemListElement: products.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: p.name,
      url: `${BASE_URL}/product/${p.slug}`,
      image: p.images[0]?.startsWith("http")
        ? p.images[0]
        : `${BASE_URL}${p.images[0]}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ShopClient />
    </>
  )
}
