"use client"

import { useState, useEffect } from "react"
import { products } from "@/lib/products"
import { useStore } from "@/lib/store"
import { useAppNavigation } from "@/lib/useAppNavigation"
import ProductDetailView from "@/components/views/ProductDetailView"
import Empty from "@/components/common/Empty"
import type { Product } from "@/types"

export default function ProductClient({ slug }: { slug: string }) {
  const initial = products.find((p) => p.slug === slug)
  const [product, setProduct] = useState<Product | undefined>(initial as Product | undefined)
  const { openProduct, go, goBack } = useAppNavigation()
  const { wishlist, toggleWish, addToCart } = useStore()

  useEffect(() => {
    let isMounted = true
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data.products && isMounted) {
          const found = data.products.find((p: any) => p.slug === slug)
          if (found) setProduct(found)
        }
      })
      .catch((err) => console.warn("Product dynamic API load:", err))
    return () => {
      isMounted = false
    }
  }, [slug])

  if (!product) {
    return (
      <div className="standard-page" style={{ padding: "80px 20px", textAlign: "center" }}>
        <Empty
          icon="search"
          title="Product not found"
          copy="The shirt you are looking for does not exist."
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
