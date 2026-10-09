"use client"

import { products } from "../../products"
import type { Product, View } from "../../types"
import Empty from "../common/Empty"
import SectionTitle from "../common/SectionTitle"
import ProductCard from "../product/ProductCard"

export interface WishlistViewProps {
  ids: string[]
  openProduct: (p: Product) => void
  onRemove: (id: string) => void
  addToCart: (p: Product) => void
  go: (v: View) => void
}

export function WishlistView({
  ids,
  openProduct,
  onRemove,
  addToCart,
  go,
}: WishlistViewProps) {
  const items = products.filter((p) => ids.includes(p.id))

  return (
    <div className="standard-page">
      <SectionTitle
        eyebrow="Saved For Later"
        title={`Your wishlist (${items.length})`}
      />
      {items.length ? (
        <div className="product-grid">
          {items.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              wishlisted
              onWish={() => onRemove(p.id)}
              onOpen={() => openProduct(p)}
              onAdd={() => addToCart(p)}
            />
          ))}
        </div>
      ) : (
        <Empty
          icon="heart"
          title="Your wishlist is waiting"
          copy="Save the shirts you love and find them here anytime."
          action="Explore shirts"
          onAction={() => go("shop")}
        />
      )}
    </div>
  )
}

export default WishlistView
