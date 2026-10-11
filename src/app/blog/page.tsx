import type { Metadata } from "next"
import { BLOG_POSTS } from "@/data/blogData"
import BlogClient from "./BlogClient"

const BASE_URL = "https://gayatribhaishop-zkde-eight.vercel.app"

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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "The AVYR Journal",
    description:
      "Essays on craft, linen science, embroidery techniques, and relaxed resort menswear.",
    url: `${BASE_URL}/blog`,
    publisher: {
      "@type": "Organization",
      name: "AVYR by Gayatri",
      logo: `${BASE_URL}/favicon.svg`,
    },
    blogPost: BLOG_POSTS.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      url: `${BASE_URL}/blog/${post.slug}`,
      datePublished: post.date,
      author: {
        "@type": "Person",
        name: post.author.name,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogClient />
    </>
  )
}
