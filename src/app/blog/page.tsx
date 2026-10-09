import type { Metadata } from "next"
import BlogClient from "./BlogClient"

export const metadata: Metadata = {
  title: "The AVYR Journal | Essays on Craft, Linen Science & Sartorial Art",
  description:
    "Delve into the stories behind our atelier. In-depth guides to French flax, embroidery techniques, resort styling, and conscious luxury living.",
  alternates: {
    canonical: "https://gayatribhaishop-zkde-eight.vercel.app/blog",
  },
  openGraph: {
    title: "The AVYR Journal | Stories of Craft & Style",
    description:
      "Essays on craft, fabric science, and artisanal fashion by the AVYR atelier.",
    url: "https://gayatribhaishop-zkde-eight.vercel.app/blog",
    siteName: "The AVYR Journal",
    images: [
      {
        url: "https://gayatribhaishop-zkde-eight.vercel.app/assets/site_banners/slide2_desktop.jpg",
        width: 1920,
        height: 1080,
        alt: "The AVYR Journal",
      },
    ],
  },
}

export default function BlogPage() {
  return <BlogClient />
}
