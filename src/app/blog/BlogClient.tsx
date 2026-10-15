"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { useAppNavigation } from "@/lib/useAppNavigation"
import BlogView from "@/components/views/BlogView"
import type { BlogPost } from "@/types"
import { getBlogUrl } from "@/lib/navigation"

interface BlogClientProps {
  initialPosts?: BlogPost[]
}

export default function BlogClient({ initialPosts }: BlogClientProps) {
  const { go, openProduct } = useAppNavigation()
  const { addToCart } = useStore()
  const router = useRouter()
  const [blogs, setBlogs] = useState<BlogPost[]>(() => initialPosts || [])

  const loadBlogs = useCallback(() => {
    fetch(`/api/blogs?_t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setBlogs(data.filter((b: BlogPost) => b.is_published !== false))
        }
      })
      .catch(() => {})
  }, [])

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

  return (
    <BlogView
      go={go}
      openProduct={openProduct}
      addToCart={(p) => addToCart(p)}
      selectedBlogId={null}
      postsOverride={blogs}
      setSelectedBlogId={(id) => {
        if (id) {
          const post = blogs.find((p) => p.id === id)
          if (post) router.push(getBlogUrl(post.slug))
        }
      }}
    />
  )
}
