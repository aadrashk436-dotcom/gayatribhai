"use client"

import { useState, useEffect, useCallback } from "react"
import { useStore } from "@/lib/store"
import { useAppNavigation } from "@/lib/useAppNavigation"
import ProductDetailView from "@/components/views/ProductDetailView"
import Empty from "@/components/common/Empty"
import type { Product } from "@/types"

interface ProductClientProps {
  slug: string
  initialProduct?: Product
}

export default function ProductClient({ slug, initialProduct }: ProductClientProps) {
  const [product, setProduct] = useState<Product | undefined>(initialProduct)
  const { openProduct, go, goBack } = useAppNavigation()
  const { wishlist, toggleWish, addToCart } = useStore()

  const loadProduct = useCallback(() => {
    fetch(`/api/products?slug=${encodeURIComponent(slug)}&_t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.id && data.is_visible !== false) {
          setProduct(data)
        } else if (data && data.is_visible === false) {
          setProduct(undefined)
        }
      })
      .catch((err) => console.warn("Product dynamic API load:", err))
  }, [slug])

  useEffect(() => {
    loadProduct()

    const onProductsUpdate = () => loadProduct()
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === "gb_products_last_update") loadProduct()
    }
    const onFocus = () => loadProduct()

    window.addEventListener("gb-products-updated", onProductsUpdate)
    window.addEventListener("storage", onStorageChange)
    window.addEventListener("focus", onFocus)

    return () => {
      window.removeEventListener("gb-products-updated", onProductsUpdate)
      window.removeEventListener("storage", onStorageChange)
      window.removeEventListener("focus", onFocus)
    }
  }, [loadProduct])

  if (!product || product.is_visible === false) {
    return (
      <div className="standard-page" style={{ padding: "80px 20px", textAlign: "center" }}>
        <Empty
          icon="search"
          title="Product not found"
          copy="The shirt you are looking for does not exist or is currently unavailable."
          action="Browse all shirts"
          onAction={() => go("shop")}
        />
      </div>
    )
  }

  return (
    <ProductDetailView
      product={product}
      openProduct={openProduct}
      wishlisted={wishlist.includes(product.id)}
      toggleWish={() => toggleWish(product.id)}
      addToCart={addToCart}
      go={go}
      goBack={goBack}
    />
  )
}
