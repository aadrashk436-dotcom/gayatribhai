"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import type { Product } from "@/types"
import ProductCard from "../product/ProductCard"
import Icon from "../common/Icon"

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
  const scrollContainer = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Mouse Drag to Pan
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeftStart = useRef(0)
  const hasDragged = useRef(false)

  const handleScroll = useCallback(() => {
    if (!scrollContainer.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current
    const maxScroll = Math.max(1, scrollWidth - clientWidth)
    setCanScrollLeft(scrollLeft > 15)
    setCanScrollRight(scrollLeft < maxScroll - 15)
    setScrollProgress(Math.min(1, Math.max(0, scrollLeft / maxScroll)))
  }, [])

  useEffect(() => {
    handleScroll()
    const container = scrollContainer.current
    if (!container) return

    const onResize = () => handleScroll()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [handleScroll])

  const scrollByAmount = (direction: "left" | "right") => {
    if (!scrollContainer.current) return
    const amount = direction === "left" ? -460 : 460
    scrollContainer.current.scrollBy({ left: amount, behavior: "smooth" })
  }

  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainer.current) return
    isDragging.current = true
    hasDragged.current = false
    startX.current = e.pageX - scrollContainer.current.offsetLeft
    scrollLeftStart.current = scrollContainer.current.scrollLeft
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollContainer.current) return
    const x = e.pageX - scrollContainer.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    if (Math.abs(walk) > 5) {
      hasDragged.current = true
      scrollContainer.current.scrollLeft = scrollLeftStart.current - walk
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  return (
    <section
      className="relative overflow-hidden bg-surface-2 py-14 md:py-20 lg:py-24"
      aria-label="Best sellers collection"
    >
      {/* Header with Luxury Styling */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 px-5 md:px-10 lg:mb-10 lg:px-14">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent md:text-xs">
              Most loved editions
            </p>
          </div>
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.02em] text-foreground">
            <span>Best </span>
            <span className="italic font-serif">sellers.</span>
          </h2>
        </div>

        {/* Desktop & Mobile Interactive Controls */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Progress Indicator */}
          <div className="hidden sm:block w-36 md:w-48" aria-hidden="true">
            <div className="h-0.5 w-full bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground transition-transform duration-150 origin-left"
                style={{ transform: `scaleX(${Math.max(0.08, scrollProgress)})` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <span>Explore</span>
              <span>{items.length} Styles</span>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByAmount("left")}
              disabled={!canScrollLeft}
              aria-label="Previous products"
              title="Previous"
              className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition-all hover:border-foreground/40 hover:bg-surface-2 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <span className="rotate-90 inline-flex">
                <Icon name="chevron" size={14} />
              </span>
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount("right")}
              disabled={!canScrollRight}
              aria-label="Next products"
              title="Next"
              className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition-all hover:border-foreground/40 hover:bg-surface-2 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <span className="-rotate-90 inline-flex">
                <Icon name="chevron" size={14} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Cards Track with smooth horizontal scroll and grab-to-drag */}
      <div
        ref={scrollContainer}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch] pb-4 pt-1 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex w-max gap-4 px-5 md:gap-6 md:px-10 lg:px-14 items-stretch">
          {items.map((p) => (
            <div
              key={p.id}
              className="w-[72vw] sm:w-[48vw] md:w-[36vw] lg:w-[270px] xl:w-[295px] shrink-0 snap-start"
            >
              <ProductCard
                product={p}
                wishlisted={wishlist.includes(p.id)}
                onWish={() => toggleWish(p.id)}
                onOpen={() => {
                  if (!hasDragged.current) openProduct(p)
                }}
                onAdd={() => addToCart(p)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
