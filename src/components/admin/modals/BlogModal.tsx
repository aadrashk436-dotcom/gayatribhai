"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { BookOpen, FileText, Globe, Image as ImageIcon } from "lucide-react"
import { BlogPost } from "../types"

interface BlogModalProps {
  isOpen: boolean
  onClose: () => void
  blogToEdit: BlogPost | null
  onSave: (payload: Partial<BlogPost>) => void
  showToast: (msg: string) => void
}

export function BlogModal({
  isOpen,
  onClose,
  blogToEdit,
  onSave,
  showToast,
}: BlogModalProps) {
  const [blogTitle, setBlogTitle] = useState("")
  const [blogSubtitle, setBlogSubtitle] = useState("")
  const [blogSlug, setBlogSlug] = useState("")
  const [blogCategory, setBlogCategory] = useState("Craft & Atelier")
  const [blogAuthorName, setBlogAuthorName] = useState("Gayatri Puri")
  const [blogAuthorRole, setBlogAuthorRole] = useState("Founder & Master Curator")
  const [blogExcerpt, setBlogExcerpt] = useState("")
  const [blogContent, setBlogContent] = useState("")
  const [blogKeyTakeaways, setBlogKeyTakeaways] = useState("")
  const [blogCoverImage, setBlogCoverImage] = useState("/assets/site_banners/slide1_desktop.jpg")
  const [blogReadTime, setBlogReadTime] = useState("5 min read")
  const [blogTags, setBlogTags] = useState("French Linen, Heritage Craft, Summer Style")
  const [blogFeatured, setBlogFeatured] = useState(false)
  const [blogPublished, setBlogPublished] = useState(true)
  const [blogMetaTitle, setBlogMetaTitle] = useState("")
  const [blogMetaDescription, setBlogMetaDescription] = useState("")
  const [blogKeywords, setBlogKeywords] = useState("luxury linen shirts, artisan embroidery, gayatri bhai atelier")
  const [blogCanonicalUrl, setBlogCanonicalUrl] = useState("")
  const [blogOgImage, setBlogOgImage] = useState("")
  const [blogAltText, setBlogAltText] = useState("")
  const [blogNoIndex, setBlogNoIndex] = useState(false)
  const [blogActiveTab, setBlogActiveTab] = useState<"content" | "seo">("content")

  useEffect(() => {
    if (blogToEdit) {
      setBlogTitle(blogToEdit.title || "")
      setBlogSubtitle(blogToEdit.subtitle || "")
      setBlogSlug(blogToEdit.slug || "")
      setBlogCategory(blogToEdit.category || "Craft & Atelier")
      setBlogAuthorName(blogToEdit.author?.name || "Gayatri Puri")
      setBlogAuthorRole(blogToEdit.author?.role || "Founder & Master Curator")
      setBlogExcerpt(blogToEdit.excerpt || "")
      setBlogContent(
        Array.isArray(blogToEdit.content)
          ? blogToEdit.content.join("\n\n")
          : (blogToEdit.content as any) || ""
      )
      setBlogKeyTakeaways(
        Array.isArray(blogToEdit.keyTakeaways) ? blogToEdit.keyTakeaways.join("\n") : ""
      )
      setBlogCoverImage(blogToEdit.coverImage || "/assets/site_banners/slide1_desktop.jpg")
      setBlogReadTime(blogToEdit.readTime || "5 min read")
      setBlogTags(Array.isArray(blogToEdit.tags) ? blogToEdit.tags.join(", ") : "")
      setBlogFeatured(Boolean(blogToEdit.featured))
      setBlogPublished(blogToEdit.is_published !== false)
      setBlogMetaTitle(blogToEdit.seo?.metaTitle || `${blogToEdit.title} | Gayatri Bhai Journal`)
      setBlogMetaDescription(blogToEdit.seo?.metaDescription || blogToEdit.excerpt || "")
      setBlogKeywords(
        Array.isArray(blogToEdit.seo?.keywords) ? blogToEdit.seo.keywords.join(", ") : ""
      )
      setBlogCanonicalUrl(blogToEdit.seo?.canonicalUrl || "")
      setBlogOgImage(blogToEdit.seo?.ogImage || blogToEdit.coverImage || "")
      setBlogAltText(blogToEdit.seo?.altText || blogToEdit.title || "")
      setBlogNoIndex(Boolean(blogToEdit.seo?.noIndex))
      setBlogActiveTab("content")
    } else {
      setBlogTitle("")
      setBlogSubtitle("")
      setBlogSlug("")
      setBlogCategory("Craft & Atelier")
      setBlogAuthorName("Gayatri Puri")
      setBlogAuthorRole("Founder & Master Curator")
      setBlogExcerpt("")
      setBlogContent("")
      setBlogKeyTakeaways("")
      setBlogCoverImage("/assets/site_banners/slide1_desktop.jpg")
      setBlogReadTime("5 min read")
      setBlogTags("French Linen, Heritage Craft, Summer Style")
      setBlogFeatured(false)
      setBlogPublished(true)
      setBlogMetaTitle("")
      setBlogMetaDescription("")
      setBlogKeywords("luxury linen shirts, artisan embroidery, gayatri bhai atelier")
      setBlogCanonicalUrl("")
      setBlogOgImage("")
      setBlogAltText("")
      setBlogNoIndex(false)
      setBlogActiveTab("content")
    }
  }, [blogToEdit, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!blogTitle.trim()) {
      showToast("Please enter a blog article title.")
      return
    }

    const contentParagraphs = blogContent
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean)

    const keyTakeawaysArray = blogKeyTakeaways
      .split("\n")
      .map((k) => k.trim())
      .filter(Boolean)

    const tagsArray = blogTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const keywordsArray = blogKeywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)

    const slugToUse = (blogSlug.trim() || blogTitle.trim())
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const blogPayload: Partial<BlogPost> = {
      id: blogToEdit ? blogToEdit.id : `blog-${Date.now()}`,
      title: blogTitle.trim(),
      subtitle: blogSubtitle.trim(),
      slug: slugToUse,
      category: blogCategory,
      excerpt: blogExcerpt.trim() || blogContent.slice(0, 150) + "...",
      content: contentParagraphs.length > 0 ? contentParagraphs : [blogExcerpt],
      keyTakeaways: keyTakeawaysArray,
      author: {
        name: blogAuthorName.trim() || "Gayatri Puri",
        role: blogAuthorRole.trim() || "Master Curator",
        avatar: (blogAuthorName.trim() || "GP").slice(0, 2).toUpperCase(),
      },
      coverImage: blogCoverImage.trim() || "/assets/site_banners/slide1_desktop.jpg",
      readTime: blogReadTime.trim() || "5 min read",
      date:
        blogToEdit?.date ||
        new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      tags: tagsArray,
      featured: blogFeatured,
      is_published: blogPublished,
      seo: {
        metaTitle: blogMetaTitle.trim() || `${blogTitle.trim()} | Gayatri Bhai Journal`,
        metaDescription: blogMetaDescription.trim() || blogExcerpt.slice(0, 155),
        keywords: keywordsArray,
        canonicalUrl:
          blogCanonicalUrl.trim() ||
          `https://gayatribhaishop-zkde-eight.vercel.app/blog/${slugToUse}`,
        ogImage: blogOgImage.trim() || blogCoverImage.trim(),
        altText: blogAltText.trim() || blogTitle.trim(),
        noIndex: blogNoIndex,
      },
    }

    onSave(blogPayload)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[94vh] overflow-y-auto rounded-3xl border border-[#d4af37]/40 bg-[#12141a] p-5 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 px-3 py-0.5 text-[10px] font-bold text-[#d4af37]">
                <BookOpen className="h-3 w-3" /> Atelier Journal CMS
              </span>
              <span className="text-[11px] text-zinc-400">• Rich SEO & Social Metadata</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1">
              {blogToEdit ? `Edit Article: "${blogToEdit.title}"` : "Compose & Publish New Journal Article"}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Write thoughtful menswear essays, manage live storefront visibility, and customize Google search previews.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:text-white hover:bg-white/5 transition"
          >
            ✕
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            type="button"
            onClick={() => setBlogActiveTab("content")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              blogActiveTab === "content"
                ? "border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>1. Article Content & Story</span>
          </button>
          <button
            type="button"
            onClick={() => setBlogActiveTab("seo")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              blogActiveTab === "seo"
                ? "border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>2. Google Search & Social SEO Studio</span>
            <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[9px] font-mono">
              SERP
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {blogActiveTab === "content" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Article Title <span className="text-[#d4af37]">*</span>
                  </label>
                  <input
                    type="text"
                    value={blogTitle}
                    onChange={(e) => {
                      setBlogTitle(e.target.value)
                      if (!blogToEdit && !blogSlug) {
                        setBlogSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, "")
                        )
                      }
                    }}
                    placeholder="e.g. The Connoisseur’s Guide to French Linen"
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Article Subtitle / Hook
                  </label>
                  <input
                    type="text"
                    value={blogSubtitle}
                    onChange={(e) => setBlogSubtitle(e.target.value)}
                    placeholder="e.g. Understanding natural flax fibers, breathability, and artisanal slub..."
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      URL Handle / Slug <span className="text-[#d4af37]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setBlogSlug(
                          blogTitle
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, "")
                        )
                      }
                      className="text-[10px] text-[#d4af37] hover:underline"
                    >
                      Auto Generate from Title
                    </button>
                  </div>
                  <div className="flex items-center rounded-xl border border-white/10 bg-[#0d0f12] px-3 py-2 text-xs text-zinc-400">
                    <span className="font-mono text-zinc-500 mr-1">/blog/</span>
                    <input
                      type="text"
                      value={blogSlug}
                      onChange={(e) => setBlogSlug(e.target.value)}
                      placeholder="guide-to-french-linen"
                      className="w-full bg-transparent text-white font-mono focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Editorial Category
                  </label>
                  <select
                    value={blogCategory}
                    onChange={(e) => setBlogCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value="Craft & Atelier">Craft & Atelier</option>
                    <option value="Fabric Science">Fabric Science</option>
                    <option value="Style Guides">Style Guides</option>
                    <option value="Resort Life">Resort Life</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Author Name</label>
                  <input
                    type="text"
                    value={blogAuthorName}
                    onChange={(e) => setBlogAuthorName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Author Role / Title</label>
                  <input
                    type="text"
                    value={blogAuthorRole}
                    onChange={(e) => setBlogAuthorRole(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Cover Photography */}
              <div className="rounded-2xl border border-white/10 bg-[#0d0f12] p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-[#d4af37]" />
                    Cover Photography
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400">1920 × 1080 Landscape</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative h-24 w-40 rounded-xl overflow-hidden border border-white/10 bg-black shrink-0">
                    {blogCoverImage ? (
                      <Image src={blogCoverImage} alt="Cover preview" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-zinc-500">
                        No Cover Image
                      </div>
                    )}
                  </div>

                  <div className="w-full space-y-2">
                    <input
                      type="text"
                      value={blogCoverImage}
                      onChange={(e) => setBlogCoverImage(e.target.value)}
                      placeholder="Enter image URL"
                      className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none font-mono"
                      required
                    />

                    <div className="flex flex-wrap gap-2 pt-1">
                      {[
                        { label: "Atelier Slide 1", url: "/assets/site_banners/slide1_desktop.jpg" },
                        { label: "Resort Slide 2", url: "/assets/site_banners/slide2_desktop.jpg" },
                        { label: "Terracotta Courtyard", url: "/assets/banners/hero-terracotta-widescreen.jpg" },
                        { label: "Surat Craft Detail", url: "/assets/banners/craft-detail.jpg" },
                      ].map((p) => (
                        <button
                          key={p.url}
                          type="button"
                          onClick={() => setBlogCoverImage(p.url)}
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-medium border transition ${
                            blogCoverImage === p.url
                              ? "border-[#d4af37] bg-[#d4af37]/20 text-white font-bold"
                              : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Excerpt / Summary
                </label>
                <textarea
                  rows={2}
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  placeholder="A short overview for social and previews..."
                  className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              {/* Full Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Full Article Body Paragraphs <span className="text-[#d4af37]">*</span>
                  </label>
                  <span className="text-[10px] text-zinc-400">Separate paragraphs with double Enter</span>
                </div>
                <textarea
                  rows={7}
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  placeholder="Write body paragraphs here..."
                  className="w-full rounded-xl border border-white/10 bg-[#0d0f12] p-4 text-xs text-white leading-relaxed focus:border-[#d4af37] focus:outline-none font-sans"
                  required
                />
              </div>

              {/* Key Takeaways & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Key Takeaways (One point per line)
                  </label>
                  <textarea
                    rows={3}
                    value={blogKeyTakeaways}
                    onChange={(e) => setBlogKeyTakeaways(e.target.value)}
                    placeholder="Key point 1...&#10;Key point 2..."
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] p-3 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Article Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={blogTags}
                      onChange={(e) => setBlogTags(e.target.value)}
                      placeholder="French Linen, Hand Embroidery"
                      className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Read Time</label>
                    <input
                      type="text"
                      value={blogReadTime}
                      onChange={(e) => setBlogReadTime(e.target.value)}
                      placeholder="5 min read"
                      className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blogPublished}
                    onChange={(e) => setBlogPublished(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#d4af37]"
                  />
                  <span className="text-xs font-semibold text-zinc-200">
                    Publish Live on Storefront
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blogFeatured}
                    onChange={(e) => setBlogFeatured(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#d4af37]"
                  />
                  <span className="text-xs font-semibold text-zinc-200">
                    Feature in Top Journal Hero Slot
                  </span>
                </label>
              </div>
            </div>
          )}

          {blogActiveTab === "seo" && (
            <div className="space-y-6">
              {/* SERP PREVIEW */}
              <div className="rounded-2xl border border-white/15 bg-[#090b0e] p-5 shadow-inner space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                    <Globe className="h-4 w-4 text-[#d4af37]" />
                    Live Google Search Result Preview
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400">Desktop & Mobile Snippet</span>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#16181d] p-4 font-sans space-y-1.5 shadow">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#d4af37]/20 text-[#d4af37] text-[9px] font-bold">
                      G
                    </span>
                    <span className="text-zinc-300">gayatribhai.com</span>
                    <span>›</span>
                    <span className="text-zinc-400">blog</span>
                    <span>›</span>
                    <span className="text-zinc-400 truncate max-w-[200px]">
                      {blogSlug || "article-slug"}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-medium text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-1">
                    {blogMetaTitle || `${blogTitle || "Article Title"} | Gayatri Bhai Journal`}
                  </h4>

                  <p className="text-xs text-[#bdc1c6] leading-relaxed line-clamp-2">
                    {blogMetaDescription || blogExcerpt || "Read this insightful artisanal guide on luxury linen craftsmanship..."}
                  </p>
                </div>
              </div>

              {/* SEO Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Google Search Meta Title
                  </label>
                  <input
                    type="text"
                    value={blogMetaTitle}
                    onChange={(e) => setBlogMetaTitle(e.target.value)}
                    placeholder="SEO Title"
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Search Snippet Meta Description
                  </label>
                  <textarea
                    rows={2}
                    value={blogMetaDescription}
                    onChange={(e) => setBlogMetaDescription(e.target.value)}
                    placeholder="Search snippet description"
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Focus Keywords
                  </label>
                  <input
                    type="text"
                    value={blogKeywords}
                    onChange={(e) => setBlogKeywords(e.target.value)}
                    placeholder="keywords, comma, separated"
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={blogAltText}
                      onChange={(e) => setBlogAltText(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      OG Image Override
                    </label>
                    <input
                      type="text"
                      value={blogOgImage}
                      onChange={(e) => setBlogOgImage(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="blogNoIndexCheckModal"
                    checked={blogNoIndex}
                    onChange={(e) => setBlogNoIndex(e.target.checked)}
                    className="h-4 w-4 rounded accent-rose-500"
                  />
                  <label htmlFor="blogNoIndexCheckModal" className="text-xs text-zinc-400 cursor-pointer">
                    Instruct search engines not to index this article (noindex, nofollow)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-5 border-t border-white/10">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                blogPublished
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}
            >
              Status: {blogPublished ? "Will Publish Live" : "Will Save as Draft / Hidden"}
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 px-5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 transition shadow-lg shadow-[#d4af37]/20"
              >
                {blogToEdit ? "Update Article & SEO" : "Publish Article to Store"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
