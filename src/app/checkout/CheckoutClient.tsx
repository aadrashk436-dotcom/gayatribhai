"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { useAppNavigation } from "@/lib/useAppNavigation"
import CheckoutView from "@/components/views/CheckoutView"

export default function CheckoutClient() {
  const router = useRouter()
  const { go } = useAppNavigation()
  const { cart, setCart, addresses, user, setToast } = useStore()
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    // Check Zustand store hydration
    const unsub = useStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })
    if (useStore.persist.hasHydrated()) {
      setHasHydrated(true)
    }
    return () => unsub()
  }, [])

  useEffect(() => {
    if (hasHydrated && !user) {
      setToast("Please sign in or create an account to proceed to checkout.")
      router.replace("/login?redirect=/checkout")
    }
  }, [hasHydrated, user, router, setToast])

  if (!hasHydrated || !user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center bg-background text-foreground">
        <div className="size-9 animate-spin rounded-full border-2 border-foreground border-t-transparent mb-4" />
        <h2 className="font-display text-2xl">Gayatri Bhai Atelier</h2>
        <p className="mt-2 text-sm text-muted-foreground">Redirecting to secure sign in for checkout...</p>
      </div>
    )
  }

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
