"use client"

import { useStore } from "@/lib/store"
import { useAppNavigation } from "@/lib/useAppNavigation"
import BagView from "@/components/views/BagView"

export default function BagClient() {
  const { go, openProduct } = useAppNavigation()
  const { cart, setCart } = useStore()

  return (
    <BagView
      cart={cart}
      setCart={setCart}
      openProduct={openProduct}
      go={go}
    />
  )
}
