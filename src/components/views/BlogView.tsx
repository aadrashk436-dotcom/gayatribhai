"use client"

import React, { useEffect, useState } from "react"
import { BLOG_POSTS } from "../../data/blogData"
import { products } from "../../products"
import type { BlogPost, Product, View } from "../../types"
import { money } from "../../utils/format"
import Button from "../common/Button"
import Icon from "../common/Icon"

export interface BlogViewProps {
  go: (v: View) => void
  openProduct: (p: Product) => void
  addToCart: (p: Product) => void
  selectedBlogId?: string | null
  setSelectedBlogId?: (id: string | null) => void
}

export function BlogView({
  go,
  openProduct,
  addToCart,
  selectedBlogId,
  setSelectedBlogId,
}: BlogViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Essays")
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(() => {
    if (selectedBlogId) {
      return BLOG_POSTS.find((p) => p.id === selectedBlogId) || null
    }
    return null
  })
  const [copied, setCopied] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href)
    }
  }, [])

  // Sync when selectedBlogId changes from outside (e.g. from Home page click)
  useEffect(() => {
    if (selectedBlogId) {
      const match = BLOG_POSTS.find((p) => p.id === selectedBlogId)
      if (match) {
        setActiveArticle(match)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
  }, [selectedBlogId])

  // Scroll to top whenever a new article is opened
  useEffect(() => {
    if (activeArticle) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [activeArticle?.id])

  const categories = [
    "All Essays",
    "Fabric Science",
    "Style Guides",
    "Craft & Atelier",
    "Resort Life",
  ]

  const filteredPosts =
    selectedCategory === "All Essays"
      ? BLOG_POSTS
      : BLOG_POSTS.filter((p) => p.category === selectedCategory)

  const featuredPost = BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0]

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const handleCloseArticle = () => {
    setActiveArticle(null)
    if (setSelectedBlogId) setSelectedBlogId(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // =========================================================================
  // 1. FULL PAGE ARTICLE READER VIEW
  // =========================================================================
  if (activeArticle) {
    const currentIndex = BLOG_POSTS.findIndex((p) => p.id === activeArticle.id)
    const prevPost = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null
    const nextPost =
      currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null

    return (
      <div className="full-page-article-view">
        {/* Sticky/Top Article Breadcrumb Bar */}
        <nav className="article-top-nav-bar" aria-label="Article navigation">
          <div className="reader-nav-left">
            <button
              type="button"
              className="reader-back-btn"
              onClick={handleCloseArticle}
            >
              <Icon name="arrow-left" size={13} />
              <span>Back to all essays</span>
            </button>
            <div className="reader-breadcrumbs">
              <button type="button" onClick={() => go("home")}>
                Home
              </button>
              <span className="crumb-sep">/</span>
              <button type="button" onClick={handleCloseArticle}>
                Journal
              </button>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">{activeArticle.title}</span>
            </div>
          </div>

          <div className="reader-nav-right">
            <span className="reader-meta-pill">
              <Icon name="clock" size={12} /> {activeArticle.readTime}
            </span>
            <button
              type="button"
              className="reader-share-btn"
              onClick={handleCopyLink}
              title="Share essay"
            >
              <Icon name="share" size={13} />
              <span>{copied ? "Copied! ✓" : "Share"}</span>
            </button>
          </div>
        </nav>

        {/* Main Article Content */}
        <article className="full-article-content-wrapper">
          {/* Header Metadata */}
          <header className="article-editorial-header">
            <div className="article-tag-row">
              <span className="article-cat-pill">{activeArticle.category}</span>
              <span className="meta-dot">·</span>
              <time dateTime={activeArticle.date}>{activeArticle.date}</time>
              <span className="meta-dot">·</span>
              <span>THE AVYR JOURNAL</span>
            </div>

            <h1 className="article-editorial-title">{activeArticle.title}</h1>
            <p className="article-editorial-subtitle">
              {activeArticle.subtitle}
            </p>

            {/* Author Profile Card */}
            <div className="article-author-card">
              <span className="author-avatar-large">
                {activeArticle.author.avatar}
              </span>
              <div className="author-info">
                <strong>{activeArticle.author.name}</strong>
                <p>{activeArticle.author.role}</p>
              </div>
            </div>
          </header>

          {/* Full Width Hero Image */}
          <div className="article-hero-cover-wrap">
            <img
              src={activeArticle.coverImage}
              alt={activeArticle.title}
              className="article-hero-cover-img"
            />
            <span className="article-cover-caption">
              Field Study · Master Craftsmanship & Natural Linen Cultivation at
              the AVYR Atelier
            </span>
          </div>

          {/* Atelier Key Takeaways Box */}
          <div className="article-takeaways-card">
            <div className="takeaways-header">
              <Icon name="sparkles" size={16} />
              <span>ATELIER KEY TAKEAWAYS</span>
            </div>
            <ul>
              {activeArticle.keyTakeaways.map((point, idx) => (
                <li key={idx}>
                  <Icon name="check" size={14} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Editorial Paragraphs */}
          <div className="article-body-typography">
            {activeArticle.content.map((paragraph, idx) => (
              <p
                key={idx}
                className={idx === 0 ? "editorial-dropcap-paragraph" : ""}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags Strip */}
          <div className="article-tags-wrap">
            <span className="tags-label">TOPICS:</span>
            {activeArticle.tags.map((tag) => (
              <span key={tag} className="article-tag-chip">
                #{tag}
              </span>
            ))}
          </div>

          {/* Featured Shirts from this Essay */}
          {activeArticle.relatedProductIds.length > 0 && (
            <section className="article-featured-shirts-section">
              <div className="featured-shirts-head">
                <span className="eyebrow">From This Story</span>
                <h3>Artisanal Shirts Featured in This Essay</h3>
                <p>
                  Designed with the exact embroidery techniques and linen
                  weights explored above.
                </p>
              </div>

              <div className="featured-shirts-grid">
                {activeArticle.relatedProductIds.map((pId) => {
                  const product = products.find((p) => p.id === pId)
                  if (!product) return null
                  return (
                    <div key={product.id} className="featured-shirt-card">
                      <div
                        className="shirt-card-media"
                        onClick={() => openProduct(product)}
                      >
                        <img src={product.images[0]} alt={product.name} />
                        <span className="shirt-badge">
                          {product.badge || "Handcrafted"}
                        </span>
                      </div>
                      <div className="shirt-card-body">
                        <small className="shirt-category">
                          {product.category}
                        </small>
                        <strong
                          className="shirt-title"
                          onClick={() => openProduct(product)}
                        >
                          {product.name}
                        </strong>
                        <div className="shirt-price-row">
                          <span className="shirt-price">
                            {money(product.price)}
                          </span>
                          {product.mrp && product.mrp > product.price && (
                            <s className="shirt-old-price">
                              {money(product.mrp)}
                            </s>
                          )}
                        </div>
                        <div className="shirt-actions-row">
                          <Button
                            variant="light"
                            className="shirt-add-btn"
                            onClick={() => addToCart(product)}
                          >
                            + Quick Bag
                          </Button>
                          <Button
                            variant="dark"
                            className="shirt-view-btn"
                            onClick={() => openProduct(product)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Social Share Bar */}
          <div className="article-bottom-share-strip">
            <span className="share-prompt">Enjoyed this essay? Share it:</span>
            <div className="share-buttons-row">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Read this insightful menswear essay: "${activeArticle.title}" on AVYR Journal:\n${currentUrl}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-share-pill whatsapp"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `"${activeArticle.title}" - A thoughtful exploration from AVYR Atelier Journal.`,
                )}&url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-share-pill twitter"
              >
                Twitter / X
              </a>
              <button
                type="button"
                className="social-share-pill copy"
                onClick={handleCopyLink}
              >
                {copied ? "Link Copied! ✓" : "Copy Link"}
              </button>
            </div>
          </div>

          {/* Next / Previous Story Cards */}
          <div className="article-nav-cards-strip">
            {prevPost ? (
              <div
                className="nav-story-card prev"
                onClick={() => {
                  setActiveArticle(prevPost)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
              >
                <span className="nav-story-direction">← Previous Essay</span>
                <h4>{prevPost.title}</h4>
                <small>
                  {prevPost.readTime} · {prevPost.category}
                </small>
              </div>
            ) : (
              <div />
            )}

            {nextPost ? (
              <div
                className="nav-story-card next"
                onClick={() => {
                  setActiveArticle(nextPost)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
              >
                <span className="nav-story-direction">Next Essay →</span>
                <h4>{nextPost.title}</h4>
                <small>
                  {nextPost.readTime} · {nextPost.category}
                </small>
              </div>
            ) : (
              <div />
            )}
          </div>

          {/* Bottom Back Button */}
          <div className="article-bottom-actions">
            <Button
              variant="outline"
              className="bottom-back-all-btn"
              onClick={handleCloseArticle}
            >
              ← Back to All Essays
            </Button>
            <Button
              variant="dark"
              className="bottom-shop-btn"
              onClick={() => go("shop")}
            >
              Explore Shirt Collection →
            </Button>
          </div>
        </article>
      </div>
    )
  }

  // =========================================================================
  // 2. FULL PAGE JOURNAL CATALOG VIEW
  // =========================================================================
  return (
    <div className="blog-page-container">
      {/* Blog Hero Header */}
      <header className="blog-hero-section">
        <div className="blog-hero-badge">
          <Icon name="sparkles" size={13} />
          <span>THE AVYR JOURNAL · VOLUME IV</span>
        </div>
        <h1>Essays on Craft, Linen & Modern Style</h1>
        <p className="blog-hero-lead">
          Thoughtful explorations of hand-guided embroidery, European flax
          cultivation, and relaxed Riviera menswear, penned by our designers and
          master karigars in Surat.
        </p>

        {/* Category Tabs */}
        <div className="blog-category-nav" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`blog-cat-btn ${
                selectedCategory === cat ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Featured Headline Story (shown when All Essays selected) */}
      {selectedCategory === "All Essays" && featuredPost && (
        <section
          className="featured-blog-card"
          onClick={() => setActiveArticle(featuredPost)}
        >
          <div className="featured-blog-img-wrap">
            <img
              src={featuredPost.coverImage}
              alt={featuredPost.title}
              loading="eager"
            />
            <span className="featured-badge">FEATURED ESSAY</span>
          </div>
          <div className="featured-blog-copy">
            <div className="article-meta-row">
              <span className="blog-cat-tag">{featuredPost.category}</span>
              <span className="meta-bullet">·</span>
              <span className="read-time-pill">
                <Icon name="clock" size={12} /> {featuredPost.readTime}
              </span>
              <span className="meta-bullet">·</span>
              <time dateTime={featuredPost.date}>{featuredPost.date}</time>
            </div>
            <h2>{featuredPost.title}</h2>
            <p className="featured-subtitle">{featuredPost.subtitle}</p>
            <p className="featured-excerpt">{featuredPost.excerpt}</p>
            <div className="featured-footer-row">
              <div className="author-pill">
                <span className="author-avatar">
                  {featuredPost.author.avatar}
                </span>
                <div>
                  <strong>{featuredPost.author.name}</strong>
                  <small>{featuredPost.author.role}</small>
                </div>
              </div>
              <Button variant="dark" className="read-article-btn">
                Read Full Essay <Icon name="arrow" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="blog-articles-section">
        <div className="blog-grid-header">
          <h3>
            {selectedCategory === "All Essays"
              ? "Latest Dispatches"
              : selectedCategory}
          </h3>
          <span>
            {filteredPosts.length}{" "}
            {filteredPosts.length === 1 ? "article" : "articles"}
          </span>
        </div>

        <div className="blog-articles-grid">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="blog-card"
              onClick={() => setActiveArticle(post)}
            >
              <div className="blog-card-media">
                <img src={post.coverImage} alt={post.title} loading="lazy" />
                <span className="card-cat-badge">{post.category}</span>
              </div>
              <div className="blog-card-body">
                <div className="blog-card-meta">
                  <span>
                    <Icon name="clock" size={11} /> {post.readTime}
                  </span>
                  <span>{post.date}</span>
                </div>
                <h4>{post.title}</h4>
                <p>{post.excerpt}</p>
                <div className="blog-card-footer">
                  <div className="mini-author">
                    <span className="mini-avatar">{post.author.avatar}</span>
                    <small>{post.author.name}</small>
                  </div>
                  <span className="read-more-link">
                    Read Essay <Icon name="arrow" size={13} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Atelier Journal Mission Note */}
      <section className="blog-mission-note">
        <div className="mission-content">
          <Icon name="sparkles" size={20} />
          <h4>Craftsmanship as a Living Philosophy</h4>
          <p>
            Every piece at AVYR begins with patient conversations between our
            textile designers and artisan communities. We document our journey
            not merely to celebrate menswear, but to preserve slow, mindful
            tailoring for modern generations.
          </p>
          <Button variant="outline" onClick={() => go("shop")}>
            Explore Our Handcrafted Collection →
          </Button>
        </div>
      </section>
    </div>
  )
}

export default BlogView
