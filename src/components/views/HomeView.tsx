"use client"

import { useRef, useState, useEffect } from "react"
import { products } from "../../products"
import type { BlogPost, Product, View } from "../../types"
import ProductCard from "../product/ProductCard"
import HeroSlider from "../home/HeroSlider"
import Marquee from "../home/Marquee"
import CategoryRail from "../home/CategoryRail"
import SectionHead from "../home/SectionHead"
import { DuoBanners, PerkBanners, WideBanner } from "../home/PromoBanners"
import HorizontalShowcase from "../home/HorizontalShowcase"
import CraftStory from "../home/CraftStory"
import ReelsSection from "../home/ReelsSection"
import BlogPreviewSection from "../home/BlogPreviewSection"
import Newsletter from "../home/Newsletter"
import { useReveal } from "../home/useReveal"

export interface HomeViewProps {
  openProduct: (p: Product) => void
  go: (v: View) => void
  wishlist: string[]
  toggleWish: (id: string) => void
  addToCart: (p: Product) => void
  onOpenArticle?: (post: BlogPost) => void
}

export function HomeView({ openProduct, go, wishlist, toggleWish, addToCart, onOpenArticle }: HomeViewProps) {
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)
  const [items, setItems] = useState<Product[]>(products)

  useEffect(() => {
    let isMounted = true
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data.products?.length && isMounted) {
          setItems(data.products)
        }
      })
      .catch((err) => console.warn("API products fallback:", err))
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div ref={root} className="home-v2 bg-background text-foreground">
      <HeroSlider />
      <Marquee />
      <CategoryRail />

      <section className="px-5 pb-16 md:px-10 md:pb-24 lg:px-14">
        <SectionHead kicker="Just in" title={["New", "arrivals."]} href="/shop" />
        <div data-stagger className="grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-5 lg:grid-cols-4">
          {items.slice(0, 8).map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              wishlisted={wishlist.includes(p.id)}
              onWish={() => toggleWish(p.id)}
              onOpen={() => openProduct(p)}
              onAdd={() => addToCart(p)}
            />
          ))}
        </div>
      </section>

      <WideBanner />
      <PerkBanners />

      <HorizontalShowcase
        items={items.slice(8, 18)}
        wishlist={wishlist}
        toggleWish={toggleWish}
        openProduct={openProduct}
        addToCart={addToCart}
      />

      <DuoBanners />
      <CraftStory />
      <ReelsSection openProduct={openProduct} addToCart={addToCart} go={go} />
      <BlogPreviewSection go={go} onOpenArticle={onOpenArticle} />
      <Newsletter />
    </div>
  )
}

export default HomeView
