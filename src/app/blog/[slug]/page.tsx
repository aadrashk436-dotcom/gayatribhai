import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BLOG_POSTS } from "@/data/blogData"
import BlogSlugClient from "./BlogSlugClient"

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

const BASE_URL = "https://gayatribhaishop-zkde-eight.vercel.app"

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)

  if (!post) {
    return {
      title: "Article Not Found | The AVYR Journal",
      description: "The requested essay could not be found.",
    }
  }

  const title = `${post.title} | The AVYR Journal`
  const description = post.excerpt
  const imageUrl = post.coverImage.startsWith("http")
    ? post.coverImage
    : `${BASE_URL}${post.coverImage}`

  return {
    title,
    description,
    keywords: [...post.tags, "linen care", "artisanal fashion", "AVYR journal"],
    alternates: {
      canonical: `${BASE_URL}/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/blog/${post.slug}`,
      siteName: "The AVYR Journal",
      type: "article",
      publishedTime: post.date,
      authors: [post.author.name],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 800,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)

  if (!post) {
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
      name: post.author.name,
      jobTitle: post.author.role,
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
