"use client"

import React, { useRef, useState } from "react"
import Image from "next/image"
import type { Product } from "../../types"
import { money } from "../../utils/format"
import Icon from "../common/Icon"

export interface ProductCardProps {
  product: Product
  wishlisted: boolean
  onWish: () => void
  onOpen: () => void
  onAdd: () => void
}

export function ProductCard({
  product,
  wishlisted,
  onWish,
  onOpen,
  onAdd,
}: ProductCardProps) {
  const [imgIndex, setImgIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAdd()
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1600)
  }

  const [isInteracting, setIsInteracting] = useState(false)

  // Drag / Swipe / Touch state tracking
  const mouseStartX = useRef<number | null>(null)
  const isMouseDragging = useRef<boolean>(false)
  const touchStartPos = useRef<{ x: number; y: number; time: number } | null>(
    null,
  )
  const isHorizontalSwipe = useRef<boolean>(false)
  const touchOpenedRef = useRef<boolean>(false)

  const prevSlide = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation()
    setImgIndex(
      (prev) => (prev - 1 + product.images.length) % product.images.length,
    )
  }

  const nextSlide = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation()
    setImgIndex((prev) => (prev + 1) % product.images.length)
  }

  // Mouse Drag handlers for Desktop slide
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only handle primary mouse button
    if (e.button !== 0) return
    mouseStartX.current = e.clientX
    isMouseDragging.current = false
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseStartX.current === null) return
    const diff = mouseStartX.current - e.clientX
    if (Math.abs(diff) > 10) {
      isMouseDragging.current = true
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartX.current !== null && isMouseDragging.current) {
      const diff = mouseStartX.current - e.clientX
      if (Math.abs(diff) > 30) {
        if (diff > 0) {
          nextSlide(e)
        } else {
          prevSlide(e)
        }
      }
    }
    mouseStartX.current = null
    // Reset dragging flag shortly after to allow click handler to inspect it
    setTimeout(() => {
      isMouseDragging.current = false
    }, 60)
  }

  // Touch handlers for Mobile & Tablet (Clean tap -> instant open, Swipe -> slide image)
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStartPos.current = {
      x: t.clientX,
      y: t.clientY,
      time: Date.now(),
    }
    isHorizontalSwipe.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return
    const t = e.touches[0]
    const diffX = touchStartPos.current.x - t.clientX
    const diffY = touchStartPos.current.y - t.clientY

    // If vertical movement is greater, user is scrolling the page vertically!
    if (Math.abs(diffY) > Math.abs(diffX)) {
      isHorizontalSwipe.current = false
      return
    }

    // Only flag as horizontal swipe if movement is clearly horizontal and > 15px
    if (Math.abs(diffX) > 15 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
      isHorizontalSwipe.current = true
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return
    const t = e.changedTouches[0]
    const diffX = touchStartPos.current.x - t.clientX
    const diffY = touchStartPos.current.y - t.clientY
    const totalDist = Math.hypot(diffX, diffY)
    const duration = Date.now() - touchStartPos.current.time

    // 1. Horizontal swipe gesture on photo: slide next/prev
    if (isHorizontalSwipe.current && Math.abs(diffX) > 30) {
      if (diffX > 0) {
        nextSlide(e)
      } else {
        prevSlide(e)
      }
    }
    // 2. Intentional clean tap on phone: finger barely moved and tap duration < 450ms
    else if (totalDist < 16 && duration < 450) {
      touchOpenedRef.current = true
      onOpen()
      setTimeout(() => {
        touchOpenedRef.current = false
      }, 400)
    }

    touchStartPos.current = null
    isHorizontalSwipe.current = false
  }

  // Card click handler for Desktop mouse or fallback
  const handleCardClick = (e: React.MouseEvent) => {
    // If already handled via mobile touch tap, ignore synthetic mouse click
    if (touchOpenedRef.current) {
      e.stopPropagation()
      return
    }
    // If mouse was dragging to slide on desktop, ignore
    if (isMouseDragging.current) {
      e.stopPropagation()
      return
    }
    onOpen()
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} (${money(product.price)}) on AVYR!`,
      url: window.location.href,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // fallback
      }
    }
    try {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <article
      className="product-card group"
      onMouseEnter={() => setIsInteracting(true)}
    >
      <div
        className="product-image-wrap"
        onClick={handleCardClick}
        onMouseDown={(e) => {
          setIsInteracting(true)
          handleMouseDown(e)
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={(e) => {
          setIsInteracting(true)
          handleTouchStart(e)
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Hardware-accelerated Horizontal Sliding Track */}
        <div
          className="card-slider-track"
          style={{ transform: `translateX(-${imgIndex * 100}%)` }}
        >
          {(isInteracting || imgIndex > 0
            ? product.images
            : product.images.slice(0, 1)
          ).map((imgSrc, idx) => (
            <div key={imgSrc + idx} className="card-slide-item">
              <Image
                src={imgSrc}
                alt={`${product.name} view ${idx + 1}`}
                className="product-image"
                width={600}
                height={850}
                sizes="(max-width: 640px) 70vw, (max-width: 1024px) 35vw, 290px"
                quality={80}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Card Left & Right Slide Arrows (Elevated z-index, stops click propagation) */}
        {product.images.length > 1 && (
          <>
            <button
              type="button"
              className="card-nav-arrow card-prev"
              onClick={prevSlide}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Previous photo (slide left)"
              title="Previous photo"
            >
              <span
                style={{ display: "inline-flex", transform: "rotate(90deg)" }}
              >
                <Icon name="chevron" size={13} />
              </span>
            </button>
            <button
              type="button"
              className="card-nav-arrow card-next"
              onClick={nextSlide}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Next photo (slide right)"
              title="Next photo"
            >
              <span
                style={{ display: "inline-flex", transform: "rotate(-90deg)" }}
              >
                <Icon name="chevron" size={13} />
              </span>
            </button>

            {/* Interactive Card Mini Dots */}
            <div
              className="card-mini-dots"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {product.images.slice(0, 6).map((_, i) => (
                <button
                  type="button"
                  key={i}
                  className={`card-dot ${i === imgIndex ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setImgIndex(i)
                  }}
                  onMouseEnter={() => setImgIndex(i)}
                  aria-label={`Slide to photo ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="card-badge-wrap">
          {Boolean(product.badge) && (
            <span
              className={`badge ${product.badge === "Limited" ? "badge-dark" : ""}`}
            >
              {product.badge}
            </span>
          )}
          {Object.values(product.stock).some((n) => n > 0 && n < 4) && (
            <span className="low-stock">Low stock</span>
          )}
        </div>

        {/* Card Top Action Buttons (Wishlist & Share) */}
        <div
          className="card-top-actions"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            className={`wish-btn ${wishlisted ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation()
              onWish()
            }}
            aria-label="Toggle wishlist"
          >
            <Icon name="heart" filled={wishlisted} />
          </button>
          <button
            className="card-share-btn"
            onClick={handleShare}
            aria-label="Share product"
            title={copied ? "Link copied!" : "Share product"}
          >
            <Icon name="share" size={13} />
            {copied && <span className="card-copied-tag">Copied!</span>}
          </button>
        </div>
      </div>

      <div className="product-info" onClick={onOpen}>
        <div className="product-meta">
          <span className="product-category-tag">{product.category}</span>
          <span className="rating">
            <Icon name="star" size={11} filled /> {product.rating} (
            {product.reviews})
          </span>
        </div>
        <h3>{product.name}</h3>
        <div className="price">
          <strong className="current-price">{money(product.price)}</strong>
          <s className="original-price">{money(product.mrp)}</s>
          <span className="discount-tag">{product.discount}% off</span>
        </div>
        <p className="product-fabric">{product.color} · Cotton linen</p>

        {/* Dedicated Modern Add To Bag Action */}
        <div
          className="product-card-action"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className={`card-add-to-bag-btn ${isAdded ? "added" : ""}`}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to bag`}
          >
            <Icon name={isAdded ? "check" : "bag"} size={13} />
            <span>{isAdded ? "Added to Bag" : "Add to Bag"}</span>
          </button>
          <button
            type="button"
            className={`card-wish-action-btn ${wishlisted ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation()
              onWish()
            }}
            aria-label="Toggle wishlist"
            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Icon name="heart" size={15} filled={wishlisted} />
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
