"use client"

import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import type { Product } from "@/types"
import ProductCard from "../product/ProductCard"
import { SplitLines } from "./useReveal"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function HorizontalShowcase({
  items,
  wishlist,
  toggleWish,
  openProduct,
  addToCart,
}: {
  items: Product[]
  wishlist: string[]
  toggleWish: (id: string) => void
  openProduct: (p: Product) => void
  addToCart: (p: Product) => void
}) {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current
        if (!el) return
        const distance = () => el.scrollWidth - window.innerWidth + 56
        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.8,
            pin: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })
        gsap.to(".showcase-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, scrub: true },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative overflow-hidden bg-surface-2 py-16 md:py-20 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-0">
      <div className="mb-8 flex items-end justify-between px-5 md:px-10 lg:mb-10 lg:px-14">
        <div>
          <p data-reveal className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-accent md:text-xs">
            Most loved
          </p>
          <h2 data-reveal-text className="font-display text-[clamp(2.2rem,7vw,4.5rem)] leading-[0.98] tracking-[-0.02em] text-foreground">
            <SplitLines lines={["Best", "sellers."]} />
          </h2>
        </div>
        <div className="hidden w-48 lg:block" aria-hidden="true">
          <div className="h-px w-full bg-border">
            <div className="showcase-progress h-px w-full origin-left scale-x-0 bg-foreground" />
          </div>
          <p className="mt-3 text-right text-xs uppercase tracking-[0.2em] text-muted-foreground">Scroll</p>
        </div>
      </div>
      <div className="overflow-x-auto [scrollbar-width:none] lg:overflow-visible [&::-webkit-scrollbar]:hidden">
        <div ref={track} className="flex w-max gap-3 px-5 md:gap-5 md:px-10 lg:px-14">
          {items.map((p) => (
            <div key={p.id} className="w-[64vw] shrink-0 sm:w-[40vw] md:w-[30vw] lg:w-[22vw] xl:w-[19vw]">
              <ProductCard
                product={p}
                wishlisted={wishlist.includes(p.id)}
                onWish={() => toggleWish(p.id)}
                onOpen={() => openProduct(p)}
                onAdd={() => addToCart(p)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
