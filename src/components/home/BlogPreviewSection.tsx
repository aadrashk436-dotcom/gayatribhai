import React, { useEffect, useRef, useState } from "react"
import { BLOG_POSTS } from "../../data/blogData"
import type { BlogPost, View } from "../../types"
import Button from "../common/Button"
import Icon from "../common/Icon"

export interface BlogPreviewSectionProps {
  go: (v: View) => void
  onOpenArticle?: (post: BlogPost) => void
}

export function BlogPreviewSection({
  go,
  onOpenArticle,
}: BlogPreviewSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScrollState()
    el.addEventListener("scroll", checkScrollState, { passive: true })
    window.addEventListener("resize", checkScrollState)
    return () => {
      el.removeEventListener("scroll", checkScrollState)
      window.removeEventListener("resize", checkScrollState)
    }
  }, [])

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const cardEl = el.querySelector<HTMLElement>(".home-blog-card")
    const cardWidth = cardEl ? cardEl.offsetWidth : 360
    const scrollAmount = (cardWidth + 20) * (direction === "left" ? -1 : 1)
    el.scrollBy({ left: scrollAmount, behavior: "smooth" })
  }

  return (
    <section className="page-section home-blog-section">
      <div className="home-blog-header">
        <div className="home-blog-title-wrap">
          <span className="eyebrow">The AVYR Journal</span>
          <h2>Stories of craft, linen & style</h2>
        </div>

        <div className="home-blog-controls">
          <Button
            variant="text"
            onClick={() => go("blog")}
            className="blog-view-all-btn"
          >
            Read all essays <Icon name="arrow" size={16} />
          </Button>

          <div className="blog-nav-arrows">
            <button
              type="button"
              className="blog-nav-arrow"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Previous articles"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              className="blog-nav-arrow"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Next articles"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="home-blog-carousel-wrapper">
        <div className="home-blog-grid home-blog-slider" ref={scrollRef}>
          {BLOG_POSTS.map((post) => (
            <article
              key={post.id}
              className="home-blog-card"
              onClick={() => {
                if (onOpenArticle) {
                  onOpenArticle(post)
                } else {
                  go("blog")
                }
              }}
            >
              <div className="home-blog-media">
                <img src={post.coverImage} alt={post.title} loading="lazy" />
                <span className="blog-pill-tag">{post.category}</span>
              </div>
              <div className="home-blog-content">
                <div className="home-blog-meta">
                  <span>
                    <Icon name="clock" size={11} /> {post.readTime}
                  </span>
                  <span>·</span>
                  <time>{post.date}</time>
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <div className="home-blog-footer">
                  <span className="author-name">By {post.author.name}</span>
                  <span className="read-arrow">
                    Read essay <Icon name="arrow" size={14} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BlogPreviewSection
