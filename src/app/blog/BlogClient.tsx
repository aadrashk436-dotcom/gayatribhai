"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { useAppNavigation } from "@/lib/useAppNavigation"
import BlogView from "@/components/views/BlogView"
import { BLOG_POSTS as INITIAL_POSTS } from "@/data/blogData"
import type { BlogPost } from "@/types"
import { getBlogUrl } from "@/lib/navigation"

export default function BlogClient() {
  const { go, openProduct } = useAppNavigation()
  const { addToCart } = useStore()
  const router = useRouter()
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_POSTS)

  useEffect(() => {
    fetch("/api/blogs")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBlogs(data.filter((b: BlogPost) => b.is_published !== false))
        }
      })
      .catch(() => {})
  }, [])

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
