"use client"

import { useStore } from "@/lib/store"
import { useAppNavigation } from "@/lib/useAppNavigation"
import HomeView from "@/components/views/HomeView"
import { getBlogUrl } from "@/lib/navigation"
import { useRouter } from "next/navigation"
import type { BlogPost } from "@/types"

export default function HomeClient() {
  const { go, openProduct } = useAppNavigation()
  const { wishlist, toggleWish, addToCart } = useStore()
  const router = useRouter()

  const handleOpenArticle = (post: BlogPost) => {
    router.push(getBlogUrl(post.slug))
  }

  return (
    <HomeView
      openProduct={openProduct}
      go={go}
      wishlist={wishlist}
      toggleWish={toggleWish}
      addToCart={addToCart}
      onOpenArticle={handleOpenArticle}
    />
  )
}
