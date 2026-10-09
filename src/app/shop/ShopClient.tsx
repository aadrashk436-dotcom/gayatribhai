"use client"

import { useStore } from "@/lib/store"
import { useAppNavigation } from "@/lib/useAppNavigation"
import ShopView from "@/components/views/ShopView"

export default function ShopClient() {
  const { openProduct } = useAppNavigation()
  const { wishlist, toggleWish, addToCart } = useStore()

  return (
    <ShopView
      openProduct={openProduct}
      wishlist={wishlist}
      toggleWish={toggleWish}
      addToCart={addToCart}
    />
  )
}
