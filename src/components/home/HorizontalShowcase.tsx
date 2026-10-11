"use client"

import { useRef, useState, useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import type { Product } from "@/types"
import ProductCard from "../product/ProductCard"
import Icon from "../common/Icon"

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
  const scrollContainer = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current
        const container = root.current
        if (!el || !container) return

        const getDistance = () => {
          // Exact visible content width excluding scrollbars
          const visibleWidth = container.clientWidth || window.innerWidth
          return Math.max(0, el.scrollWidth - visibleWidth)
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: () => `+=${getDistance()}`,
            scrub: true,
            pin: true,
            pinSpacing: true,
            anticipatePin: 0,
            invalidateOnRefresh: true,
          },
        })

        tl.to(
          el,
          {
            x: () => -getDistance(),
            ease: "none",
            force3D: true,
          },
          0,
        )

        tl.to(
          ".showcase-progress",
          {
            scaleX: 1,
            ease: "none",
          },
          0,
        )

        // Ensure fresh measurement after initial hydration & render
        const timer = setTimeout(() => {
          ScrollTrigger.refresh()
        }, 150)

        return () => clearTimeout(timer)
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  // Mobile horizontal scroll helper
  const handleScroll = () => {
    if (!scrollContainer.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current
    setCanScrollLeft(scrollLeft > 15)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15)
  }

  const scrollByAmount = (direction: "left" | "right") => {
    if (!scrollContainer.current) return
    const amount = direction === "left" ? -300 : 300
    scrollContainer.current.scrollBy({ left: amount, behavior: "smooth" })
  }

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-surface-2 py-12 md:py-16 lg:py-0 lg:h-screen lg:min-h-0 lg:max-h-none lg:flex lg:flex-col lg:justify-center"
      aria-label="Best sellers collection"
    >
      {/* Header with compact luxury styling */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 px-5 md:px-10 lg:mb-6 lg:px-14">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent md:text-xs">
              Most loved editions
            </p>
          </div>
          <h2 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.05] tracking-[-0.02em] text-foreground">
            <span>Best </span>
            <span className="italic font-serif">sellers.</span>
          </h2>
        </div>

        {/* Desktop Progress Bar & Controls */}
        <div className="hidden items-center gap-6 lg:flex" aria-hidden="true">
          <div className="w-44">
            <div className="h-0.5 w-full bg-border rounded-full overflow-hidden">
              <div className="showcase-progress h-full w-full origin-left scale-x-0 bg-foreground" />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <span>Scroll to pan</span>
              <span>{items.length} Styles</span>
            </div>
          </div>
        </div>

        {/* Mobile Swipe Guidance & Arrow Nav Buttons */}
        <div className="flex items-center gap-2 lg:hidden">
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground mr-1">
            Swipe
          </span>
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm disabled:opacity-30 active:scale-95 transition-all"
          >
            <span className="rotate-90 inline-flex">
              <Icon name="chevron" size={13} />
            </span>
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm disabled:opacity-30 active:scale-95 transition-all"
          >
            <span className="-rotate-90 inline-flex">
              <Icon name="chevron" size={13} />
            </span>
          </button>
        </div>
      </div>

      {/* Product Cards Track with generous bottom clearance to prevent overlapping */}
      <div
        ref={scrollContainer}
        onScroll={handleScroll}
        data-lenis-prevent
        className="overflow-x-auto [scrollbar-width:none] lg:overflow-visible [&::-webkit-scrollbar]:hidden snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch] pb-5 pt-1"
      >
        <div
          ref={track}
          className="flex w-max gap-3.5 px-5 md:gap-5 md:px-10 lg:px-14 items-stretch pb-2 will-change-transform"
        >
          {items.map((p) => (
            <div
              key={p.id}
              className="w-[72vw] sm:w-[48vw] md:w-[36vw] lg:w-[245px] xl:w-[270px] shrink-0 snap-start"
            >
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
