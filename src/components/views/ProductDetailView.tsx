"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { products } from "../../products"
import { allSizes, type Product } from "../../types"
import { money } from "../../utils/format"
import Button from "../common/Button"
import Icon from "../common/Icon"
import Modal from "../common/Modal"
import SectionTitle from "../common/SectionTitle"
import ProductAccordion from "../product/ProductAccordion"
import ProductCard from "../product/ProductCard"

import type { View } from "../../types"

export interface ProductDetailViewProps {
  product: Product
  openProduct: (p: Product) => void
  wishlisted: boolean
  toggleWish: () => void
  addToCart: (p: Product, size?: string) => void
  go?: (v: View) => void
  goBack?: () => void
}

export function ProductDetailView({
  product,
  openProduct,
  wishlisted,
  toggleWish,
  addToCart,
  go,
  goBack,
}: ProductDetailViewProps) {
  const [image, setImage] = useState(0)
  const [size, setSize] = useState(() => {
    try {
      return localStorage.getItem("avyr-size") || ""
    } catch {
      return ""
    }
  })
  const [sizeError, setSizeError] = useState(false)
  const [sizeGuide, setSizeGuide] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pincode, setPincode] = useState("")
  const [checked, setChecked] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("")
  const [isZoomOpen, setIsZoomOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href)
    }
  }, [])

  const touchStartPos = useRef<{ x: number; y: number } | null>(null)
  const touchMovePos = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => setImage(0), [product])

  const prevImage = () => {
    setImage(
      (prev) => (prev - 1 + product.images.length) % product.images.length,
    )
  }

  const nextImage = () => {
    setImage((prev) => (prev + 1) % product.images.length)
  }

  // Keyboard navigation for left and right image slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevImage()
      if (e.key === "ArrowRight") nextImage()
      if (e.key === "Escape") setIsZoomOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [product.images.length])

  // Touch & Mouse gesture handlers for mobile, tablet, and desktop drag-to-slide
  const isDraggingMouse = useRef<boolean>(false)
  const mouseStartX = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
    touchMovePos.current = null
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return
    touchMovePos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  const handleTouchEnd = () => {
    if (!touchStartPos.current || !touchMovePos.current) {
      touchStartPos.current = null
      touchMovePos.current = null
      return
    }
    const diffX = touchStartPos.current.x - touchMovePos.current.x
    const diffY = touchStartPos.current.y - touchMovePos.current.y

    // Only slide if horizontal movement is dominant and > 35px
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
      if (diffX > 0) {
        nextImage()
      } else {
        prevImage()
      }
    }
    touchStartPos.current = null
    touchMovePos.current = null
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    mouseStartX.current = e.clientX
    isDraggingMouse.current = false
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseStartX.current === null) return
    if (Math.abs(mouseStartX.current - e.clientX) > 10) {
      isDraggingMouse.current = true
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartX.current !== null && isDraggingMouse.current) {
      const diff = mouseStartX.current - e.clientX
      if (Math.abs(diff) > 35) {
        if (diff > 0) {
          nextImage()
        } else {
          prevImage()
        }
      }
    }
    mouseStartX.current = null
    isDraggingMouse.current = false
  }

  const handleMouseLeave = () => {
    mouseStartX.current = null
    isDraggingMouse.current = false
  }

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: `${product.name} | AVYR`,
      text: `Check out ${product.name} (${money(product.price)}) from AVYR Artisanal Shirts.`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // If user dismisses or share fails, fallback to modal
      }
    }
    setShareOpen(true)
  }

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2400)
    } catch {
      // clipboard fallback
    }
  }

  const selectSize = (s: string) => {
    setSize(s)
    try {
      localStorage.setItem("avyr-size", s)
    } catch {
      // storage unavailable
    }
  }

  const handleAddToCart = () => {
    if (!size) {
      const el = document.getElementById("product-size-section")
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      setSizeError(true)
      setTimeout(() => setSizeError(false), 2400)
      return
    }
    addToCart(product, size)
  }

  return (
    <div className="product-page">
      {/* Top Bar with Back Navigation & Breadcrumbs */}
      <div className="product-top-bar">
        <button
          type="button"
          className="product-back-btn"
          onClick={() =>
            goBack ? goBack() : go ? go("shop") : window.history.back()
          }
          aria-label="Go back to collection"
        >
          <span style={{ display: "inline-flex", transform: "rotate(180deg)" }}>
            <Icon name="arrow" size={14} />
          </span>
          <span>Back</span>
        </button>
        <nav
          className="breadcrumbs"
          aria-label="Breadcrumbs"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          <span
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <Link href="/" className="breadcrumb-link" itemProp="item">
              <span itemProp="name">Home</span>
            </Link>
            <meta itemProp="position" content="1" />
          </span>
          <span className="breadcrumb-sep">/</span>
          <span
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <Link href="/shop" className="breadcrumb-link" itemProp="item">
              <span itemProp="name">Shirts</span>
            </Link>
            <meta itemProp="position" content="2" />
          </span>
          <span className="breadcrumb-sep">/</span>
          <span
            className="breadcrumb-current"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <span itemProp="name">{product.name}</span>
            <meta itemProp="position" content="3" />
          </span>
        </nav>
      </div>
      <div className="product-detail">
        <div className="gallery">
          {/* Thumbnails rail with active indicator */}
          <div className="thumbnails">
            {product.images.map((src, i) => (
              <button
                className={image === i ? "active" : ""}
                onClick={() => setImage(i)}
                key={src + i}
                type="button"
                aria-label={`View photo ${i + 1}`}
              >
                <img src={src} alt={`${product.name} view ${i + 1}`} />
              </button>
            ))}
          </div>

          {/* Interactive Bidirectional Slide Main Image */}
          <div
            className="main-image"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {/* Sliding Track for smooth left-to-right & right-to-left animation */}
            <div
              className="gallery-slider-track"
              style={{ transform: `translateX(-${image * 100}%)` }}
            >
              {product.images.map((src, i) => (
                <div key={src + i} className="gallery-slide-item">
                  <img
                    src={src}
                    alt={`${product.name} view ${i + 1}`}
                    loading={i === 0 ? "eager" : "lazy"}
                    draggable={false}
                  />
                </div>
              ))}
            </div>

            {/* Left & Right Slide Controls */}
            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-nav-arrow gallery-prev"
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  aria-label="Previous photo (slide left)"
                >
                  <span
                    style={{
                      display: "inline-flex",
                      transform: "rotate(180deg)",
                    }}
                  >
                    <Icon name="arrow" size={16} />
                  </span>
                </button>
                <button
                  type="button"
                  className="gallery-nav-arrow gallery-next"
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  aria-label="Next photo (slide right)"
                >
                  <Icon name="arrow" size={16} />
                </button>
              </>
            )}

            {/* Floating Top-Right Action Badges (Wishlist & Share & Zoom) */}
            <div className="gallery-floating-actions">
              <button
                type="button"
                className="gallery-action-btn"
                onClick={() => setIsZoomOpen(true)}
                aria-label="Inspect fabric in high resolution"
                title="Zoom image"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </button>
              <button
                type="button"
                className={`gallery-action-btn ${wishlisted ? "active" : ""}`}
                onClick={toggleWish}
                aria-label="Wishlist item"
                title={wishlisted ? "Saved in wishlist" : "Save to wishlist"}
              >
                <Icon name="heart" size={16} filled={wishlisted} />
              </button>
              <button
                type="button"
                className="gallery-action-btn"
                onClick={handleShare}
                aria-label="Share product"
                title="Share product"
              >
                <Icon name="share" size={16} />
              </button>
            </div>

            {/* Image Slide Counter & Pagination Dots */}
            <div className="gallery-meta-bar">
              <div className="gallery-counter">
                <b>0{image + 1}</b> / 0{product.images.length}
              </div>
              <div className="gallery-dots">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`gallery-dot ${i === image ? "active" : ""}`}
                    onClick={() => setImage(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              className="gallery-hint"
              onClick={(e) => {
                e.stopPropagation()
                setIsZoomOpen(true)
              }}
              aria-label="Inspect fabric in high resolution"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                style={{
                  display: "inline-block",
                  verticalAlign: "-1px",
                  marginRight: "4px",
                }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              Tap to inspect craft
            </button>
          </div>
        </div>

        <div className="product-summary">
          <span className="eyebrow">AVYR · Artisan Series</span>
          <h1>{product.name}</h1>
          <div className="detail-rating">
            <span>
              <Icon name="star" size={14} filled /> {product.rating}
            </span>
            <button type="button">{product.reviews} reviews</button>
            <b>Handcrafted</b>
          </div>
          <div className="detail-price">
            <strong>{money(product.price)}</strong>
            <s>{money(product.mrp)}</s>
            <span>Save {product.discount}%</span>
          </div>
          <p className="tax">
            Inclusive of all taxes · or 3 interest-free payments
          </p>
          <div className="offer">
            <strong>PRIVATE OFFER</strong>
            <span>
              Use <b>FIRST10</b> for 10% off your first order
            </span>
          </div>
          <div className="selection-head">
            <div>
              <strong>Colour</strong>
              <span>{product.color}</span>
            </div>
          </div>
          <button className="color-swatch active" type="button">
            <img src={product.images[0]} alt={product.color} />
          </button>
          <div className="selection-head" id="product-size-section">
            <div>
              <strong>Select size</strong>
              {size ? (
                <span className="selected-size-label">· Size {size}</span>
              ) : (
                sizeError && (
                  <span className="size-required-badge">
                    Please choose a size
                  </span>
                )
              )}
            </div>
            <button type="button" onClick={() => setSizeGuide(true)}>
              Size guide
            </button>
          </div>
          <div className={`size-grid ${sizeError && !size ? "shake" : ""}`}>
            {allSizes.map((s) => (
              <button
                key={s}
                disabled={!product.stock[s]}
                className={size === s ? "active" : ""}
                onClick={() => {
                  selectSize(s)
                  setSizeError(false)
                }}
                type="button"
              >
                <span>{s}</span>
                {product.stock[s] > 0 && product.stock[s] < 4 && (
                  <small>Only {product.stock[s]}</small>
                )}
              </button>
            ))}
          </div>
          {!size && (
            <p className={`size-note ${sizeError ? "highlight" : ""}`}>
              Select your size to continue. Relaxed fit—we recommend your usual
              size.
            </p>
          )}

          {/* Action buttons: Add to bag, Wishlist & Dedicated Share Button */}
          <div className="detail-actions">
            <Button className="add-bag" onClick={handleAddToCart}>
              {size ? "Add to bag" : "Select size"} <Icon name="bag" />
            </Button>
            <Button
              variant="outline"
              className={`detail-wish-btn ${wishlisted ? "wishlisted" : ""}`}
              onClick={toggleWish}
            >
              <Icon name="heart" filled={wishlisted} />
              {wishlisted ? "Saved" : "Wishlist"}
            </Button>
            <Button
              variant="outline"
              className="detail-share-btn"
              onClick={handleShare}
            >
              <Icon name="share" size={15} />
              Share
            </Button>
          </div>

          <div className="delivery">
            <strong>Check delivery</strong>
            <div>
              <input
                value={pincode}
                onChange={(e) =>
                  setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter pincode"
              />
              <button
                type="button"
                onClick={() => setChecked(pincode.length === 6)}
              >
                Check
              </button>
            </div>
            {checked && (
              <p>
                <Icon name="check" size={15} /> Delivery by Tuesday · Free
                shipping available
              </p>
            )}
          </div>
          <div className="service-row">
            <span>
              <Icon name="truck" />
              <b>48-hour dispatch</b>
            </span>
            <span>
              <Icon name="refresh" />
              <b>Easy 7-day return</b>
            </span>
            <span>
              <Icon name="shield" />
              <b>Authentic craft</b>
            </span>
          </div>
          <ProductAccordion product={product} />
        </div>
      </div>

      <section className="page-section recommendations">
        <SectionTitle eyebrow="Style It Your Way" title="You may also like" />
        <div className="product-grid">
          {products
            .filter((p) => p.id !== product.id)
            .slice(0, 4)
            .map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                wishlisted={false}
                onWish={() => {}}
                onOpen={() => openProduct(p)}
                onAdd={() => addToCart(p)}
              />
            ))}
        </div>
      </section>

      <div className="mobile-sticky-add">
        <div className="mobile-sticky-info">
          <div className="mobile-sticky-price-row">
            <strong>{money(product.price)}</strong>
            <s>{money(product.mrp)}</s>
          </div>
          <span
            className={`mobile-sticky-size ${
              sizeError && !size ? "size-error-text" : ""
            }`}
          >
            {size ? `Size: ${size}` : "Select size"}
          </span>
        </div>
        <div className="mobile-sticky-buttons">
          <button
            type="button"
            className={`mobile-sticky-wish-btn ${wishlisted ? "active" : ""}`}
            onClick={toggleWish}
            aria-label="Wishlist item"
          >
            <Icon name="heart" size={17} filled={wishlisted} />
          </button>
          <button
            type="button"
            className="mobile-sticky-share-btn"
            onClick={handleShare}
            aria-label="Share product"
          >
            <Icon name="share" size={17} />
          </button>
          <Button
            className={`mobile-sticky-submit-btn ${!size ? "need-size" : ""}`}
            onClick={handleAddToCart}
          >
            {size ? "Add to bag" : "Select size"}
          </Button>
        </div>
      </div>

      {/* Size Guide Modal */}
      {sizeGuide && (
        <Modal onClose={() => setSizeGuide(false)}>
          <span className="eyebrow">Find Your Fit</span>
          <h2>{"Men's shirt size guide"}</h2>
          <p>
            Measurements are in inches. For a relaxed fit, choose your regular
            size.
          </p>
          <table>
            <thead>
              <tr>
                <th>Size</th>
                <th>Chest</th>
                <th>Shoulder</th>
                <th>Length</th>
              </tr>
            </thead>
            <tbody>
              {allSizes.map((s, i) => (
                <tr key={s}>
                  <td>{s}</td>
                  <td>{36 + i * 2}</td>
                  <td>{16 + i}</td>
                  <td>{27 + i}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button onClick={() => setSizeGuide(false)}>Got it</Button>
        </Modal>
      )}

      {/* Dedicated Interactive Share Modal */}
      {shareOpen && (
        <Modal onClose={() => setShareOpen(false)}>
          <div className="share-modal-body">
            <span className="eyebrow">Share The Craft</span>
            <h2>Share this shirt</h2>
            <p className="share-modal-subtitle">
              Send this artisanal handcrafted piece to friends or social
              platforms.
            </p>

            <div className="share-product-card">
              <img src={product.images[0]} alt={product.name} />
              <div className="share-card-info">
                <strong>{product.name}</strong>
                <span>
                  {product.category} · {product.color}
                </span>
                <b className="share-card-price">{money(product.price)}</b>
              </div>
            </div>

            <div className="share-social-grid">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Check out this handcrafted shirt: ${product.name} (${money(product.price)}) on AVYR:\n${currentUrl}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-share-link whatsapp"
              >
                <span className="social-icon">💬</span>
                <span>WhatsApp</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Handcrafted excellence: ${product.name} from AVYR Atelier.`,
                )}&url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-share-link twitter"
              >
                <span className="social-icon">𝕏</span>
                <span>Twitter / X</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  currentUrl,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-share-link facebook"
              >
                <span className="social-icon">📘</span>
                <span>Facebook</span>
              </a>
            </div>

            <div className="share-link-wrapper">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="share-link-input"
                aria-label="Product link"
              />
              <Button
                onClick={handleCopyLink}
                variant="dark"
                className="copy-link-btn"
              >
                {copied ? "Copied! ✓" : "Copy Link"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Fullscreen High-Resolution Image Zoom Modal (Amazon / Luxury boutique style) */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-[150] flex flex-col bg-black/95 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between px-5 py-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-display text-lg tracking-wide">{product.name}</span>
              <span className="text-xs uppercase tracking-widest text-white/60">
                0{image + 1} / 0{product.images.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
              aria-label="Close zoom"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Fullscreen Image Container */}
          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden p-2 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={product.images[image]}
              alt={`${product.name} view ${image + 1}`}
              className="max-h-[82vh] max-w-full object-contain select-none transition-transform duration-300"
              draggable={false}
            />

            {/* Prev / Next Arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 active:scale-95 sm:left-6"
                  aria-label="Previous image"
                >
                  <span style={{ display: "inline-flex", transform: "rotate(180deg)" }}>
                    <Icon name="arrow" size={18} />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 active:scale-95 sm:right-6"
                  aria-label="Next image"
                >
                  <Icon name="arrow" size={18} />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div
            className="flex items-center justify-center gap-2 pb-6 px-4 overflow-x-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {product.images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setImage(i)}
                className={`relative h-16 w-11 shrink-0 overflow-hidden rounded border transition ${
                  i === image ? "border-[#cca466] opacity-100 scale-105" : "border-white/30 opacity-60 hover:opacity-90"
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-cover object-top" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetailView
