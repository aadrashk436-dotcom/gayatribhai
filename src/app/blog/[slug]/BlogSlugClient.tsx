"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { useAppNavigation } from "@/lib/useAppNavigation"
import BlogView from "@/components/views/BlogView"
import type { BlogPost } from "@/types"
import { getBlogUrl } from "@/lib/navigation"

interface BlogSlugClientProps {
  slug: string
  initialPost?: BlogPost
}

export default function BlogSlugClient({ slug, initialPost }: BlogSlugClientProps) {
  const { go, openProduct } = useAppNavigation()
  const { addToCart } = useStore()
  const router = useRouter()
  const [blogs, setBlogs] = useState<BlogPost[]>(() => (initialPost ? [initialPost] : []))

  const loadBlogs = useCallback(() => {
    fetch(`/api/blogs?_t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          const published = data.filter((b: BlogPost) => b.is_published !== false)
          setBlogs(published)

          // If current post is not found among published blogs, redirect back to /blog
          const currentPost = published.find((p) => p.slug === slug)
          if (!currentPost && published.length > 0) {
            router.push("/blog")
          }
        }
      })
      .catch(() => {})
  }, [router, slug])

  useEffect(() => {
    loadBlogs()

    const onBlogUpdate = () => loadBlogs()
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === "gb_blogs_last_update") loadBlogs()
    }
    const onFocus = () => loadBlogs()

    window.addEventListener("gb-blogs-updated", onBlogUpdate)
    window.addEventListener("storage", onStorageChange)
    window.addEventListener("focus", onFocus)

    return () => {
      window.removeEventListener("gb-blogs-updated", onBlogUpdate)
      window.removeEventListener("storage", onStorageChange)
      window.removeEventListener("focus", onFocus)
    }
  }, [loadBlogs])

  const blogPost = blogs.find((p) => p.slug === slug) || initialPost

  return (
    <BlogView
      go={go}
      openProduct={openProduct}
      addToCart={(p) => addToCart(p)}
      selectedBlogId={blogPost?.id || null}
      postsOverride={blogs}
      setSelectedBlogId={(id) => {
        if (id) {
          const post = blogs.find((p) => p.id === id)
          if (post) router.push(getBlogUrl(post.slug))
        } else {
          router.push("/blog")
        }
      }}
    />
  )
}
