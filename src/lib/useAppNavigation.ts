"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { viewToPath, getProductUrl } from "@/lib/navigation"
import type { View } from "@/types"
import type { Product } from "@/lib/products"
import { useStore } from "@/lib/store"

export function useAppNavigation() {
  const router = useRouter()
  const setMenuOpen = useStore((s) => s.setMenuOpen)
  const setSearchOpen = useStore((s) => s.setSearchOpen)

  const go = useCallback(
    (view: View) => {
      setMenuOpen(false)
      setSearchOpen(false)
      router.push(viewToPath[view])
    },
    [router, setMenuOpen, setSearchOpen],
  )

  const openProduct = useCallback(
    (product: Product) => {
      setMenuOpen(false)
      setSearchOpen(false)
      router.push(getProductUrl(product))
    },
    [router, setMenuOpen, setSearchOpen],
  )

  const goBack = useCallback(() => {
    router.back()
  }, [router])

  return { go, openProduct, goBack }
}
