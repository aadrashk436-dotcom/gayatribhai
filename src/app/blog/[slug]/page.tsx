import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getStoredBlogPosts, getStoredBlogPostBySlug } from "@/lib/blogs"
import BlogSlugClient from "./BlogSlugClient"

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

const BASE_URL = "https://gayatribhai.vercel.app"

export async function generateStaticParams() {
  const posts = getStoredBlogPosts(false)
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getStoredBlogPostBySlug(slug, false)

  if (!post) {
    return {
      title: "Article Not Found | The AVYR Journal",
      description: "The requested essay could not be found.",
    }
  }

  const title = post.seo?.metaTitle || `${post.title} | The AVYR Journal`
  const description = post.seo?.metaDescription || post.excerpt
  const imageUrl = (post.seo?.ogImage || post.coverImage).startsWith("http")
    ? (post.seo?.ogImage || post.coverImage)
    : `${BASE_URL}${post.seo?.ogImage || post.coverImage}`

  return {
    title,
    description,
    keywords: post.seo?.keywords?.length ? post.seo.keywords : [...post.tags, "linen care", "artisanal fashion", "AVYR journal"],
    alternates: {
      canonical: post.seo?.canonicalUrl || `${BASE_URL}/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/blog/${post.slug}`,
      siteName: "The AVYR Journal",
      type: "article",
      publishedTime: post.date,
      authors: [post.author?.name || "Gayatri Bhai Atelier"],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 800,
          alt: post.seo?.altText || post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: post.seo?.noIndex ? { index: false, follow: false } : undefined,
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params
  const post = getStoredBlogPostBySlug(slug, false)

  if (!post || post.is_published === false) {
    notFound()
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage.startsWith("http")
      ? post.coverImage
      : `${BASE_URL}${post.coverImage}`,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author?.name || "Gayatri Bhai Atelier",
      jobTitle: post.author?.role || "Master Artisan",
    },
    publisher: {
      "@type": "Organization",
      name: "AVYR by Gayatri",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/favicon.ico`,
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogSlugClient slug={slug} />
    </>
  )
}

