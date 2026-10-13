"use client"

import React from "react"
import { Trash2 } from "lucide-react"
import { BlogPost } from "../types"

interface DeleteBlogModalProps {
  blog: BlogPost | null
  onClose: () => void
  onConfirm: () => void
}

export function DeleteBlogModal({ blog, onClose, onConfirm }: DeleteBlogModalProps) {
  if (!blog) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#14171d] p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">Delete Journal Article?</h3>
            <p className="text-[11px] text-zinc-400">This action cannot be undone</p>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-white/10 bg-[#0d0f12] space-y-1">
          <span className="text-[10px] text-[#d4af37] font-semibold uppercase">
            {blog.category}
          </span>
          <h5 className="text-xs font-bold text-white">{blog.title}</h5>
          <p className="text-[11px] text-zinc-400">Slug: /blog/{blog.slug}</p>
        </div>

        <p className="text-xs text-zinc-300">
          Are you sure you want to delete <strong className="text-white">&ldquo;{blog.title}&rdquo;</strong>? It will be removed from the journal, sitemap, and customer view.
        </p>

        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
          >
            Keep Article
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-rose-500 shadow-lg"
          >
            Delete Article
          </button>
        </div>
      </div>
    </div>
  )
}
