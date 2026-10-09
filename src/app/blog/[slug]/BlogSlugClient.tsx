"use client"

import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { useAppNavigation } from "@/lib/useAppNavigation"
import BlogView from "@/components/views/BlogView"
import { BLOG_POSTS } from "@/data/blogData"
import { getBlogUrl } from "@/lib/navigation"

export default function BlogSlugClient({ slug }: { slug: string }) {
  const { go, openProduct } = useAppNavigation()
  const { addToCart } = useStore()
  const router = useRouter()

  const blogPost = BLOG_POSTS.find((p) => p.slug === slug)

  return (
    <BlogView
      go={go}
      openProduct={openProduct}
      addToCart={(p) => addToCart(p)}
      selectedBlogId={blogPost?.id || null}
      setSelectedBlogId={(id) => {
        if (id) {
          const post = BLOG_POSTS.find((p) => p.id === id)
          if (post) router.push(getBlogUrl(post.slug))
        } else {
          router.push("/blog")
        }
      }}
    />
  )
}
