"use client"

import { products } from "@/lib/products"
import { useStore } from "@/lib/store"
import { useAppNavigation } from "@/lib/useAppNavigation"
import ProductDetailView from "@/components/views/ProductDetailView"
import Empty from "@/components/common/Empty"

export default function ProductClient({ slug }: { slug: string }) {
  const product = products.find((p) => p.slug === slug)
  const { openProduct, go, goBack } = useAppNavigation()
  const { wishlist, toggleWish, addToCart } = useStore()

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
