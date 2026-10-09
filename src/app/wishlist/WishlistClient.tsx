"use client"

import { useStore } from "@/lib/store"
import { useAppNavigation } from "@/lib/useAppNavigation"
import WishlistView from "@/components/views/WishlistView"

export default function WishlistClient() {
  const { go, openProduct } = useAppNavigation()
  const { wishlist, toggleWish, addToCart } = useStore()

  return (
    <WishlistView
      ids={wishlist}
      openProduct={openProduct}
      onRemove={toggleWish}
      addToCart={addToCart}
      go={go}
    />
  )
}
