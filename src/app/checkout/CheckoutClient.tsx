"use client"

import { useStore } from "@/lib/store"
import { useAppNavigation } from "@/lib/useAppNavigation"
import CheckoutView from "@/components/views/CheckoutView"

export default function CheckoutClient() {
  const { go } = useAppNavigation()
  const { cart, setCart, addresses, user } = useStore()

  return (
    <CheckoutView
      cart={cart}
      setCart={setCart}
      go={go}
      addresses={addresses}
      user={user}
    />
  )
}
