"use client"

import React, { useRef, useState } from "react"
import { REELS_DATA } from "../../data/reelsData"
import { products } from "../../products"
import type { Product, ReelItem, View } from "../../types"
import { money } from "../../utils/format"
import Button from "../common/Button"
import Icon from "../common/Icon"
import Modal from "../common/Modal"

export interface ReelsSectionProps {
  openProduct: (p: Product) => void
  addToCart: (p: Product) => void
  go: (v: View) => void
}

export function ReelsSection({
  openProduct,
  addToCart,
  go,
}: ReelsSectionProps) {
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null)
  const [likesState, setLikesState] = useState<Record<string, {
    count: number
    liked: boolean
  }>>(() => {
    const initial: Record<string, { count: number; liked: boolean }> = {}
    REELS_DATA.forEach((r) => {
      initial[r.id] = { count: r.likes, liked: false }
    })
    return initial
  })
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})
  const modalVideoRef = useRef<HTMLVideoElement | null>(null)

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setLikesState((prev) => {
      const current = prev[id] || { count: 0, liked: false }
      return {
        ...prev,
        [id]: {
          liked: !current.liked,
          count: current.liked ? current.count - 1 : current.count + 1,
        },
      }
    })
  }

  const handleCardVideoHover = (id: string, play: boolean) => {
    const el = videoRefs.current[id]
    if (el) {
      if (play) {
        el.play().catch(() => {})
      } else {
        el.pause()
      }
    }
  }

  const openFullscreenReel = (index: number) => {
    setActiveReelIndex(index)
    setIsPlaying(true)
  }

  const closeFullscreenReel = () => {
    setActiveReelIndex(null)
  }

  const nextReel = () => {
    if (activeReelIndex !== null) {
      setActiveReelIndex((prev) => (prev! + 1) % REELS_DATA.length)
      setIsPlaying(true)
    }
  }

  const prevReel = () => {
    if (activeReelIndex !== null) {
      setActiveReelIndex(
        (prev) => (prev! - 1 + REELS_DATA.length) % REELS_DATA.length,
      )
      setIsPlaying(true)
    }
  }

  const activeReel: ReelItem | null =
    activeReelIndex !== null ? REELS_DATA[activeReelIndex] : null
  const activeProduct: Product | undefined = activeReel
    ? products.find((p) => p.id === activeReel.productId)
    : undefined

  return (
    <section className="reels-section-wrapper">
      <div className="reels-section-header">
        <div className="reels-head-copy">
          <span className="eyebrow gold-shimmer">
            <Icon name="sparkles" size={13} /> AVYR Shorts · Lookbook in Motion
          </span>
          <h2>Artisanal Looks in 4K</h2>
          <p>
            Experience how our shirts drape, breathe, and catch the summer
            light. Tap any reel to shop the complete look.
          </p>
        </div>
        <div className="reels-header-action">
          <Button variant="outline" onClick={() => go("shop")}>
            Shop all shirts <Icon name="arrow" />
          </Button>
        </div>
      </div>

      {/* Horizontal Reels Reel Strip */}
      <div className="reels-strip-track">
        {REELS_DATA.map((reel, index) => {
          const matchingProduct = products.find((p) => p.id === reel.productId)
          const likeInfo = likesState[reel.id] || {
            count: reel.likes,
            liked: false,
          }

          return (
            <article
              key={reel.id}
              className="reel-card-item"
              onClick={() => openFullscreenReel(index)}
              onMouseEnter={() => handleCardVideoHover(reel.id, true)}
              onMouseLeave={() => handleCardVideoHover(reel.id, false)}
            >
              {/* Media Container (Video or High-Res Poster) */}
              <div className="reel-visual-frame">
                {reel.videoUrl ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[reel.id] = el
                    }}
                    src={reel.videoUrl}
                    poster={reel.posterUrl}
                    muted
                    loop
                    playsInline
                    className="reel-video-element"
                  />
                ) : (
                  <img
                    src={reel.posterUrl}
                    alt={reel.title}
                    className="reel-poster-img"
                    loading="lazy"
                  />
                )}

                {/* Gradient Overlays */}
                <div className="reel-gradient-top" />
                <div className="reel-gradient-bottom" />

                {/* Top Badge (Views count & Tag) */}
                <div className="reel-top-bar">
                  <span className="reel-tag-pill">{reel.tag}</span>
                  <span className="reel-views-pill">
                    <Icon name="eye" size={11} /> {reel.views}
                  </span>
                </div>

                {/* Center Play Button on hover */}
                <div className="reel-center-play">
                  <div className="play-pulse-circle">
                    <Icon name="play" size={18} filled />
                  </div>
                </div>

                {/* Bottom Overlay Info & "Shop Look" Pill */}
                <div className="reel-bottom-meta">
                  <div className="reel-author-tag">
                    <span className="reel-dot" />
                    <small>{reel.stylist}</small>
                  </div>
                  <h4 className="reel-title">{reel.title}</h4>

                  {/* Product Mini Pill */}
                  {matchingProduct && (
                    <div
                      className="reel-product-pill"
                      onClick={(e) => {
                        e.stopPropagation()
                        openProduct(matchingProduct)
                      }}
                      title={`View ${matchingProduct.name}`}
                    >
                      <img
                        src={matchingProduct.images[0]}
                        alt={matchingProduct.name}
                        className="pill-thumb"
                      />
                      <div className="pill-info">
                        <strong className="pill-name">
                          {matchingProduct.name}
                        </strong>
                        <span className="pill-price">
                          {money(matchingProduct.price)}
                        </span>
                      </div>
                      <span className="pill-shop-badge">Shop →</span>
                    </div>
                  )}
                </div>

                {/* Floating Heart Like Action */}
                <button
                  type="button"
                  className={`reel-heart-btn ${likeInfo.liked ? "liked" : ""}`}
                  onClick={(e) => toggleLike(e, reel.id)}
                  aria-label="Like reel"
                >
                  <Icon name="heart" size={15} filled={likeInfo.liked} />
                  <span>{likeInfo.count}</span>
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {/* Fullscreen Immersive Reels Modal */}
      {activeReel && (
        <div className="reel-fullscreen-backdrop" onClick={closeFullscreenReel}>
          <div
            className="reel-fullscreen-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Control Bar */}
            <div className="reel-modal-header">
              <div className="reel-modal-creator">
                <span className="creator-avatar">A</span>
                <div>
                  <strong>{activeReel.stylist}</strong>
                  <small>
                    {activeReel.tag} · {activeReel.views} views
                  </small>
                </div>
              </div>
              <div className="reel-modal-header-actions">
                <button
                  type="button"
                  className="reel-icon-btn"
                  onClick={() => setIsMuted(!isMuted)}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  <Icon name={isMuted ? "volume-mute" : "volume"} size={18} />
                </button>
                <button
                  type="button"
                  className="reel-icon-btn close"
                  onClick={closeFullscreenReel}
                  aria-label="Close story"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>
            </div>

            {/* Video Player Main Canvas */}
            <div className="reel-modal-canvas">
              {activeReel.videoUrl ? (
                <video
                  ref={modalVideoRef}
                  src={activeReel.videoUrl}
                  poster={activeReel.posterUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="reel-modal-video"
                  onClick={() => {
                    if (modalVideoRef.current) {
                      if (modalVideoRef.current.paused) {
                        modalVideoRef.current.play()
                        setIsPlaying(true)
                      } else {
                        modalVideoRef.current.pause()
                        setIsPlaying(false)
                      }
                    }
                  }}
                />
              ) : (
                <img
                  src={activeReel.posterUrl}
                  alt={activeReel.title}
                  className="reel-modal-image"
                />
              )}

              {/* Tap to Play/Pause Indicator Overlay */}
              {!isPlaying && (
                <div className="reel-paused-overlay">
                  <Icon name="play" size={36} filled />
                </div>
              )}

              {/* Left & Right Slide Navigation Arrows */}
              <button
                type="button"
                className="reel-arrow-nav left"
                onClick={prevReel}
                aria-label="Previous reel"
              >
                <span
                  style={{
                    display: "inline-flex",
                    transform: "rotate(180deg)",
                  }}
                >
                  <Icon name="arrow" size={18} />
                </span>
              </button>
              <button
                type="button"
                className="reel-arrow-nav right"
                onClick={nextReel}
                aria-label="Next reel"
              >
                <Icon name="arrow" size={18} />
              </button>

              {/* Bottom Captions & Direct Buy Card */}
              <div className="reel-modal-footer">
                <div className="reel-modal-copy">
                  <h3>{activeReel.title}</h3>
                  <p>{activeReel.caption}</p>
                </div>

                {activeProduct && (
                  <div className="reel-modal-product-card">
                    <img
                      src={activeProduct.images[0]}
                      alt={activeProduct.name}
                      onClick={() => {
                        openProduct(activeProduct)
                        closeFullscreenReel()
                      }}
                    />
                    <div className="reel-product-details">
                      <span className="category-pill">
                        {activeProduct.category}
                      </span>
                      <strong
                        onClick={() => {
                          openProduct(activeProduct)
                          closeFullscreenReel()
                        }}
                      >
                        {activeProduct.name}
                      </strong>
                      <div className="price-tag">
                        <b>{money(activeProduct.price)}</b>
                        <s>{money(activeProduct.mrp)}</s>
                      </div>
                    </div>
                    <div className="reel-product-actions">
                      <Button
                        variant="light"
                        onClick={() => {
                          addToCart(activeProduct)
                          closeFullscreenReel()
                        }}
                      >
                        + Add to Bag
                      </Button>
                      <Button
                        variant="dark"
                        onClick={() => {
                          openProduct(activeProduct)
                          closeFullscreenReel()
                        }}
                      >
                        View Shirt
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ReelsSection
