"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { BLOG_POSTS } from "../../data/blogData"
import type { BlogPost, View } from "../../types"
import { getBlogUrl } from "../../lib/navigation"
import Icon from "../common/Icon"

export interface BlogPreviewSectionProps {
  go?: (v: View) => void
  onOpenArticle?: (post: BlogPost) => void
}

export function BlogPreviewSection({
  onOpenArticle,
}: BlogPreviewSectionProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() =>
    BLOG_POSTS.filter((p) => p.is_published !== false)
  )
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    fetch("/api/blogs")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBlogPosts(data.filter((b: BlogPost) => b.is_published !== false))
        }
      })
      .catch(() => {})
  }, [])

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
  }, [blogPosts])

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const cardEl = el.querySelector<HTMLElement>(".journal-preview-card")
    const cardWidth = cardEl ? cardEl.offsetWidth : 360
    const scrollAmount = (cardWidth + 24) * (direction === "left" ? -1 : 1)
    el.scrollBy({ left: scrollAmount, behavior: "smooth" })
  }

  return (
    <section
      className="relative overflow-hidden bg-surface-1 py-16 md:py-24 lg:py-28"
      aria-label="The AVYR Journal - Editorial Essays and Craft Guides"
    >
      <div className="px-5 md:px-10 lg:px-14">
        {/* Header Row */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-12">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent md:text-xs">
                The Atelier Journal
              </p>
            </div>
            <h2 className="font-display text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.02em] text-foreground">
              <span>Stories of </span>
              <span className="font-serif italic">craft, linen & style.</span>
            </h2>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 border-b border-foreground pb-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:text-accent hover:border-accent md:text-[13px]"
            >
              <span>Explore all essays</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                <path d="M5 12h14m-5-5 5 5-5 5" />
              </svg>
            </Link>

            {/* Navigation Arrows for Slider */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                aria-label="Previous stories"
                className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                aria-label="Next stories"
                className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Track */}
      <div className="relative w-full">
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto px-5 pb-6 pt-1 md:gap-7 md:px-10 lg:px-14 snap-x snap-mandatory scrollbar-none"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {blogPosts.map((post) => {
            const articleUrl = getBlogUrl(post.slug)
            return (
              <article
                key={post.id}
                className="journal-preview-card group relative flex w-[82vw] sm:w-[360px] md:w-[410px] shrink-0 snap-start flex-col overflow-hidden rounded-md border border-border bg-background transition-all duration-300 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-xl"
                itemScope
                itemType="https://schema.org/BlogPosting"
              >
                {/* Media Wrapper */}
                <Link
                  href={articleUrl}
                  onClick={(e) => {
                    if (onOpenArticle) {
                      e.preventDefault()
                      onOpenArticle(post)
                    }
                  }}
                  className="relative block aspect-[16/10] overflow-hidden bg-surface-2"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 82vw, (max-width: 1024px) 360px, 410px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

                  {/* Category Badge */}
                  <span className="absolute left-3.5 top-3.5 rounded-full bg-black/75 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                    {post.category}
                  </span>
                </Link>

                {/* Content Body */}
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  {/* Meta Strip */}
                  <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Icon name="clock" size={12} /> {post.readTime}
                    </span>
                    <span>·</span>
                    <time dateTime={post.date} itemProp="datePublished">
                      {post.date}
                    </time>
                  </div>

                  {/* Headline */}
                  <h3
                    className="mb-2.5 font-display text-xl font-normal leading-[1.22] text-foreground transition-colors group-hover:text-accent md:text-2xl"
                    itemProp="headline"
                  >
                    <Link
                      href={articleUrl}
                      onClick={(e) => {
                        if (onOpenArticle) {
                          e.preventDefault()
                          onOpenArticle(post)
                        }
                      }}
                      className="hover:underline focus:outline-none"
                    >
                      {post.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p
                    className="mb-6 flex-1 text-xs leading-relaxed text-muted line-clamp-3 md:text-[13px]"
                    itemProp="description"
                  >
                    {post.excerpt}
                  </p>

                  {/* Card Footer */}
                  <div className="mt-auto flex items-center justify-between border-t border-border/80 pt-4">
                    <div
                      className="flex items-center gap-2.5"
                      itemProp="author"
                      itemScope
                      itemType="https://schema.org/Person"
                    >
                      <span className="inline-flex size-6 items-center justify-center rounded-full bg-surface-2 text-[10px] font-bold text-foreground">
                        {post.author.avatar}
                      </span>
                      <span
                        className="text-[11px] font-medium text-muted"
                        itemProp="name"
                      >
                        {post.author.name}
                      </span>
                    </div>

                    <Link
                      href={articleUrl}
                      onClick={(e) => {
                        if (onOpenArticle) {
                          e.preventDefault()
                          onOpenArticle(post)
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent transition-colors group-hover:text-foreground"
                    >
                      <span>Read</span>
                      <Icon
                        name="arrow"
                        size={13}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default BlogPreviewSection
