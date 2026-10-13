import { NextResponse } from "next/server"
import {
  getStoredBlogPosts,
  getStoredBlogPostBySlug,
  saveBlogPosts,
  normalizeBlogPost,
} from "@/lib/blogs"
import type { BlogPost } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get("all") === "true"
    const slug = searchParams.get("slug")
    const id = searchParams.get("id")

    if (slug) {
      const blog = getStoredBlogPostBySlug(slug, all)
      if (!blog) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 })
      }
      return NextResponse.json(blog)
    }

    if (id) {
      const posts = getStoredBlogPosts(true)
      const blog = posts.find((p) => p.id === id)
      if (!blog) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 })
      }
      return NextResponse.json(blog)
    }

    const posts = getStoredBlogPosts(all)
    return NextResponse.json(posts)
  } catch (error: any) {
    console.error("GET /api/blogs error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch blogs" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body || !body.title) {
      return NextResponse.json(
        { error: "Blog title is required" },
        { status: 400 }
      )
    }

    const currentPosts = getStoredBlogPosts(true)
    const newId = body.id || `blog-${Date.now()}`

    // Compute unique slug
    let baseSlug = (body.slug || body.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    if (!baseSlug) baseSlug = `article-${Date.now()}`

    let uniqueSlug = baseSlug
    let counter = 1
    while (currentPosts.some((p) => p.slug === uniqueSlug && p.id !== newId)) {
      uniqueSlug = `${baseSlug}-${counter}`
      counter++
    }

    const newBlog: BlogPost = normalizeBlogPost(
      {
        ...body,
        id: newId,
        slug: uniqueSlug,
      },
      newId
    )

    const updated = [newBlog, ...currentPosts]
    saveBlogPosts(updated)

    return NextResponse.json({
      success: true,
      message: "Blog article created successfully",
      blog: newBlog,
    })
  } catch (error: any) {
    console.error("POST /api/blogs error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create blog" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const id = body.id

    if (!id) {
      return NextResponse.json(
        { error: "Blog post ID is required" },
        { status: 400 }
      )
    }

    const currentPosts = getStoredBlogPosts(true)
    const existingIndex = currentPosts.findIndex((p) => p.id === id)

    if (existingIndex === -1) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      )
    }

    const existing = currentPosts[existingIndex]

    // Handle slug uniqueness if slug changed
    let updatedSlug = body.slug ? body.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : existing.slug
    if (updatedSlug !== existing.slug) {
      let candidate = updatedSlug
      let counter = 1
      while (currentPosts.some((p) => p.slug === candidate && p.id !== id)) {
        candidate = `${updatedSlug}-${counter}`
        counter++
      }
      updatedSlug = candidate
    }

    const merged = {
      ...existing,
      ...body,
      slug: updatedSlug,
      author: body.author ? { ...existing.author, ...body.author } : existing.author,
      seo: body.seo ? { ...existing.seo, ...body.seo } : existing.seo,
    }

    const normalized = normalizeBlogPost(merged, id)
    currentPosts[existingIndex] = normalized
    saveBlogPosts(currentPosts)

    return NextResponse.json({
      success: true,
      message: "Blog article updated successfully",
      blog: normalized,
    })
  } catch (error: any) {
    console.error("PATCH /api/blogs error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update blog" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const idFromQuery = searchParams.get("id")

    let id = idFromQuery
    if (!id) {
      try {
        const body = await request.json()
        id = body?.id
      } catch {
        // query param was empty
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "Blog post ID is required" },
        { status: 400 }
      )
    }

    const currentPosts = getStoredBlogPosts(true)
    const remaining = currentPosts.filter((p) => p.id !== id)

    if (remaining.length === currentPosts.length) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      )
    }

    saveBlogPosts(remaining)

    return NextResponse.json({
      success: true,
      message: "Blog article deleted successfully",
      remainingCount: remaining.length,
    })
  } catch (error: any) {
    console.error("DELETE /api/blogs error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete blog" },
      { status: 500 }
    )
  }
}
