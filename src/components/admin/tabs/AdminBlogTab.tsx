import React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Sparkles,
  ExternalLink,
  Plus,
  BookOpen,
  CheckCircle2,
  EyeOff,
  TrendingUp,
  Search,
  Maximize2,
  Eye,
  Edit3,
  Trash2,
} from "lucide-react"
import { ZoomImageModalState } from "../types"
import { SkeletonBlogs } from "../AdminSkeletonLoaders"

interface AdminBlogTabProps {
  blogList: any[]
  filteredBlogs: any[]
  isLoadingBlogs: boolean
  blogSearchQuery: string
  setBlogSearchQuery: (q: string) => void
  blogCategoryFilter: string
  setBlogCategoryFilter: (cat: string) => void
  blogStatusFilter: "All" | "Published" | "Draft"
  setBlogStatusFilter: (status: "All" | "Published" | "Draft") => void
  handleOpenAddBlog: () => void
  handleOpenEditBlog: (blog: any) => void
  handleOpenDeleteBlog: (blog: any) => void
  handleToggleBlogPublish: (id: string) => void
  setZoomImageModal: (state: ZoomImageModalState | null) => void
}

export const AdminBlogTab: React.FC<AdminBlogTabProps> = ({
  blogList,
  filteredBlogs,
  isLoadingBlogs,
  blogSearchQuery,
  setBlogSearchQuery,
  blogCategoryFilter,
  setBlogCategoryFilter,
  blogStatusFilter,
  setBlogStatusFilter,
  handleOpenAddBlog,
  handleOpenEditBlog,
  handleOpenDeleteBlog,
  handleToggleBlogPublish,
  setZoomImageModal,
}) => {
  return (
    <div className="space-y-6">
      {/* Studio Header Card */}
      <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 px-3 py-0.5 text-[10px] font-bold text-[#d4af37]">
              <Sparkles className="h-3 w-3" /> Editorial CMS & SEO Studio
            </span>
            <span className="text-[11px] text-zinc-400">
              • {blogList.filter((b) => b.is_published !== false).length} Live on Store
            </span>
          </div>
          <h4 className="font-serif text-lg font-bold text-white mt-1">
            Atelier Journal Articles & SEO Content Manager
          </h4>
          <p className="text-xs text-zinc-400 mt-0.5 max-w-2xl">
            Publish new stories, edit craft essays, hide/unhide articles, manage Google SERP snippet previews, focus keywords, and social share OpenGraph metadata.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/blog"
            target="_blank"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Live Journal</span>
          </Link>
          <button
            onClick={handleOpenAddBlog}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#14171d] p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Total Essays</span>
            <BookOpen className="h-4 w-4 text-[#d4af37]" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-serif text-white mt-1">{blogList.length}</p>
          <span className="text-[10px] text-zinc-400">In atelier database</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#14171d] p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Published (Live)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-serif text-emerald-400 mt-1">
            {blogList.filter((b) => b.is_published !== false).length}
          </p>
          <span className="text-[10px] text-emerald-400/80">Visible to search & patrons</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#14171d] p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Drafts / Hidden</span>
            <EyeOff className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-serif text-amber-400 mt-1">
            {blogList.filter((b) => b.is_published === false).length}
          </p>
          <span className="text-[10px] text-zinc-400">Hidden from storefront</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#14171d] p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Total Read Views</span>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-serif text-white mt-1">
            {blogList.reduce((acc, b) => acc + (b.views_count || 350), 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-zinc-400">Patron readership</span>
        </div>
      </div>

      {/* Search, Category & Status Filter Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#14171d] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={blogSearchQuery}
            onChange={(e) => setBlogSearchQuery(e.target.value)}
            placeholder="Search articles by title, keywords, tag, author..."
            className="w-full rounded-xl border border-white/10 bg-[#0d0f12] pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
          />
          {blogSearchQuery && (
            <button
              onClick={() => setBlogSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={blogCategoryFilter}
            onChange={(e) => setBlogCategoryFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0d0f12] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Fabric Science">Fabric Science</option>
            <option value="Style Guides">Style Guides</option>
            <option value="Craft & Atelier">Craft & Atelier</option>
            <option value="Resort Life">Resort Life</option>
          </select>

          {/* Status Pills */}
          <div className="flex rounded-xl border border-white/10 bg-[#0d0f12] p-1">
            {(["All", "Published", "Draft"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setBlogStatusFilter(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  blogStatusFilter === status
                    ? "bg-[#d4af37] text-black font-bold shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {status === "All" ? "All" : status === "Published" ? "Live" : "Drafts"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles List */}
      {isLoadingBlogs ? (
        <SkeletonBlogs />
      ) : filteredBlogs.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#14171d] p-12 text-center space-y-4">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-zinc-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h5 className="font-serif text-lg font-bold text-white">No Blog Articles Found</h5>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              No journal essays match your search or filter criteria. Clear filters or create a new article to get started.
            </p>
          </div>
          <button
            onClick={handleOpenAddBlog}
            className="rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 transition"
          >
            Write First Article
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBlogs.map((blog, index) => {
            const isPublished = blog.is_published !== false
            const hasSeo = Boolean(blog.seo?.metaTitle && blog.seo?.metaDescription)
            return (
              <div
                key={blog.id || index}
                className={`rounded-2xl border bg-[#14171d] p-5 shadow-xl transition space-y-4 ${
                  isPublished
                    ? "border-white/10 hover:border-[#d4af37]/40"
                    : "border-amber-500/20 bg-[#14171d]/80 opacity-80"
                }`}
              >
                {/* Top Row: Meta & Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      onClick={() =>
                        setZoomImageModal({
                          url: blog.coverImage || "/assets/site_banners/slide1_desktop.jpg",
                          title: `${blog.title} • Atelier Journal`,
                          isMobile: false,
                        })
                      }
                      className="relative h-16 w-24 sm:h-20 sm:w-32 rounded-xl overflow-hidden border border-white/10 bg-black shrink-0 cursor-pointer group/blogimg hover:border-[#d4af37]/60 transition"
                      title="Click to view full cover photo (HD Zoom)"
                    >
                      <Image
                        src={blog.coverImage || "/assets/site_banners/slide1_desktop.jpg"}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover/blogimg:scale-105 transition-transform duration-300"
                      />
                      {blog.featured && (
                        <span className="absolute top-1.5 left-1.5 rounded-full bg-[#d4af37] text-black px-1.5 py-0.5 text-[8px] font-extrabold uppercase">
                          Featured
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/blogimg:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <Maximize2 className="h-4 w-4 text-[#d4af37]" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#d4af37]">
                          {blog.category || "Craft & Atelier"}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isPublished
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {isPublished ? "● Live on Store" : "○ Draft / Hidden"}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-mono ${
                            hasSeo
                              ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {hasSeo ? "✓ SEO Ready" : "SEO Basic"}
                        </span>
                      </div>

                      <h5 className="font-serif text-base font-bold text-white mt-1 line-clamp-1 hover:text-[#d4af37] transition">
                        {blog.title}
                      </h5>
                      <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                        {blog.subtitle || blog.excerpt}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 mt-1">
                        <span>
                          By <strong className="text-zinc-300">{blog.author?.name || "Gayatri Puri"}</strong>
                        </span>
                        <span>•</span>
                        <span>{blog.date}</span>
                        <span>•</span>
                        <span>{blog.readTime || "5 min read"}</span>
                        <span>•</span>
                        <span className="font-mono text-zinc-400">/blog/{blog.slug}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-center">
                    {/* Live View Button */}
                    <Link
                      href={`/blog/${blog.slug}`}
                      target="_blank"
                      className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition"
                      title="Preview article on live storefront"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>

                    {/* Visibility Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleBlogPublish(blog.id)}
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                        isPublished
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                      title={isPublished ? "Hide from customer view" : "Publish live to journal"}
                    >
                      {isPublished ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>Hide / Draft</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span>Make Live</span>
                        </>
                      )}
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditBlog(blog)}
                      className="flex items-center gap-1.5 rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/15 px-3 py-1.5 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Article</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenDeleteBlog(blog)}
                      className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500 hover:text-white transition"
                      title="Delete article"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Article SEO & Tags Snapshot */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1 text-zinc-400">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                      Google Search Meta Title
                    </span>
                    <p className="text-xs font-medium text-zinc-200 truncate">
                      {blog.seo?.metaTitle || `${blog.title} | Gayatri Bhai Journal`}
                    </p>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">
                      {blog.seo?.metaDescription || blog.excerpt}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                      Focus Keywords & Topics
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(blog.seo?.keywords) && blog.seo.keywords.length > 0 ? (
                        blog.seo.keywords.slice(0, 4).map((kw: string, i: number) => (
                          <span
                            key={i}
                            className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-zinc-300"
                          >
                            #{kw}
                          </span>
                        ))
                      ) : Array.isArray(blog.tags) && blog.tags.length > 0 ? (
                        blog.tags.slice(0, 4).map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-zinc-300"
                          >
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-zinc-400 italic">No focus keywords set</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
