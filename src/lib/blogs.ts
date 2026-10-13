import fs from "fs"
import path from "path"
import { BLOG_POSTS as INITIAL_BLOG_POSTS } from "@/data/blogData"
import type { BlogPost } from "@/types"

function getDbPath(): string {
  return path.join(process.cwd(), "backend", "src", "data", "db.json")
}

/**
 * Normalizes a blog post object to ensure all required fields exist
 */
export function normalizeBlogPost(raw: any, fallbackId?: string): BlogPost {
  const authorName =
    typeof raw.author === "object" && raw.author?.name
      ? raw.author.name
      : raw.author_name || "Gayatri Bhai Atelier"
  const authorRole =
    typeof raw.author === "object" && raw.author?.role
      ? raw.author.role
      : "Master Karigar & Curator"
  const authorAvatar =
    typeof raw.author === "object" && raw.author?.avatar
      ? raw.author.avatar
      : authorName.slice(0, 2).toUpperCase()

  const contentArray: string[] = Array.isArray(raw.content)
    ? raw.content
    : typeof raw.content === "string"
    ? raw.content.split("\n\n").filter(Boolean)
    : [raw.excerpt || ""]

  const tagsArray: string[] = Array.isArray(raw.tags)
    ? raw.tags
    : typeof raw.tags === "string"
    ? raw.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
    : ["Artisanal Linen", "Handmade"]

  const keyTakeaways: string[] = Array.isArray(raw.keyTakeaways)
    ? raw.keyTakeaways
    : Array.isArray(raw.key_takeaways)
    ? raw.key_takeaways
    : []

  const title = raw.title || "Untitled Essay"
  const excerpt = raw.excerpt || ""

  return {
    id: raw.id || fallbackId || `blog-${Date.now()}`,
    slug: raw.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    title,
    subtitle: raw.subtitle || "",
    excerpt,
    content: contentArray,
    keyTakeaways,
    author: {
      name: authorName,
      role: authorRole,
      avatar: authorAvatar,
    },
    category: raw.category || "Craft & Atelier",
    coverImage: raw.coverImage || raw.cover_image || "/assets/site_banners/slide1_desktop.jpg",
    readTime: raw.readTime || raw.read_time || "4 min read",
    date: raw.date || raw.created_at || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    tags: tagsArray,
    featured: Boolean(raw.featured),
    relatedProductIds: Array.isArray(raw.relatedProductIds) ? raw.relatedProductIds : [],
    is_published: raw.is_published !== false,
    views_count: raw.views_count || 120,
    seo: {
      metaTitle: raw.seo?.metaTitle || raw.meta_title || `${title} | Gayatri Bhai Journal`,
      metaDescription: raw.seo?.metaDescription || raw.meta_description || excerpt.slice(0, 155),
      keywords: Array.isArray(raw.seo?.keywords)
        ? raw.seo.keywords
        : tagsArray,
      canonicalUrl: raw.seo?.canonicalUrl || raw.canonical_url || "",
      ogImage: raw.seo?.ogImage || raw.coverImage || raw.cover_image || "",
      altText: raw.seo?.altText || raw.alt_text || title,
      noIndex: Boolean(raw.seo?.noIndex),
    },
  }
}

/**
 * Seed initial blog posts into db.json if not present
 */
export function getStoredBlogPosts(includeUnpublished = false): BlogPost[] {
  try {
    const dbPath = getDbPath()
    if (fs.existsSync(dbPath)) {
      const fileData = fs.readFileSync(dbPath, "utf8")
      const parsed = JSON.parse(fileData)
      if (Array.isArray(parsed.blog_posts) && parsed.blog_posts.length > 0) {
        // Map stored posts
        const normalized = parsed.blog_posts.map((p: any, idx: number) =>
          normalizeBlogPost(p, `blog-${idx + 1}`)
        )
        return includeUnpublished
          ? normalized
          : normalized.filter((p: BlogPost) => p.is_published !== false)
      }
    }
  } catch (err) {
    console.warn("Could not read blogs from db.json, falling back to static data:", err)
  }

  // Fallback to initial blog data
  const staticNormalized = INITIAL_BLOG_POSTS.map((p, idx) =>
    normalizeBlogPost(p, `blog-${idx + 1}`)
  )
  return includeUnpublished
    ? staticNormalized
    : staticNormalized.filter((p) => p.is_published !== false)
}

/**
 * Save all blog posts to db.json
 */
export function saveBlogPosts(posts: BlogPost[]): boolean {
  try {
    const dbPath = getDbPath()
    let data: any = {}
    if (fs.existsSync(dbPath)) {
      data = JSON.parse(fs.readFileSync(dbPath, "utf8"))
    }
    data.blog_posts = posts
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8")
    return true
  } catch (err) {
    console.error("Failed to save blog posts to db.json:", err)
    return false
  }
}

/**
 * Find single blog post by slug
 */
export function getStoredBlogPostBySlug(slug: string, includeUnpublished = false): BlogPost | undefined {
  const posts = getStoredBlogPosts(includeUnpublished)
  return posts.find((p) => p.slug === slug)
}
