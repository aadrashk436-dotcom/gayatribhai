import React from "react"
import { Globe, CheckCircle2 } from "lucide-react"
import { SiteSeoSettings } from "../types"

interface AdminSeoTabProps {
  siteSeoSettings: SiteSeoSettings
  setSiteSeoSettings: React.Dispatch<React.SetStateAction<SiteSeoSettings>>
  handleSaveSeoSettings: () => void
}

export const AdminSeoTab: React.FC<AdminSeoTabProps> = ({
  siteSeoSettings,
  setSiteSeoSettings,
  handleSaveSeoSettings,
}) => {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Store Identity Card */}
      <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl space-y-6">
        <div>
          <h4 className="font-serif text-lg font-bold text-white">Store Identity & Live Credentials</h4>
          <p className="text-xs text-zinc-400">Verified e-commerce platform configuration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-400 mb-1">Brand Name</label>
            <input
              type="text"
              disabled
              value="Gayatri Bhai Atelier (AVYR)"
              className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-400 mb-1">Owner Email & Admin Account</label>
            <input
              type="text"
              disabled
              value="gayatripuri634@gmail.com"
              className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-400 mb-1">Razorpay API Key ID (Active Test Mode)</label>
            <input
              type="text"
              disabled
              value="rzp_test_Tl6r6m9eEhjxUb"
              className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-400 mb-1">Supabase Database URL</label>
            <input
              type="text"
              disabled
              value="https://qnhtnbzeyqbrzjguhgsy.supabase.co"
              className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* 🌟 PAGE-LEVEL SEO & SEARCH ENGINE CONFIGURATION */}
      <div className="rounded-2xl border border-[#d4af37]/30 bg-[#14171d] p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 px-3 py-0.5 text-[10px] font-bold text-[#d4af37]">
                <Globe className="h-3 w-3" /> Search Engine Optimization
              </span>
            </div>
            <h4 className="font-serif text-lg font-bold text-white mt-1">
              Global & Page-Level SEO Manager
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Configure meta titles, meta descriptions, and search keywords for Homepage, Shop, and Blog pages.
            </p>
          </div>

          <button
            onClick={handleSaveSeoSettings}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition shrink-0"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Save All SEO Settings</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Homepage SEO */}
          <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">
                1. Homepage SEO (/)
              </span>
              <span className="font-mono text-[10px] text-zinc-400">Primary Domain Landing</span>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Homepage Meta Title</label>
                <input
                  type="text"
                  value={siteSeoSettings.home.metaTitle}
                  onChange={(e) =>
                    setSiteSeoSettings((prev) => ({
                      ...prev,
                      home: { ...prev.home, metaTitle: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Homepage Meta Description</label>
                <textarea
                  rows={2}
                  value={siteSeoSettings.home.metaDescription}
                  onChange={(e) =>
                    setSiteSeoSettings((prev) => ({
                      ...prev,
                      home: { ...prev.home, metaDescription: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Focus Keywords (Comma-separated)</label>
                <input
                  type="text"
                  value={siteSeoSettings.home.keywords}
                  onChange={(e) =>
                    setSiteSeoSettings((prev) => ({
                      ...prev,
                      home: { ...prev.home, keywords: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Shop Page SEO */}
          <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">
                2. Shop & Catalog SEO (/shop)
              </span>
              <span className="font-mono text-[10px] text-zinc-400">Products Listing Page</span>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Shop Meta Title</label>
                <input
                  type="text"
                  value={siteSeoSettings.shop.metaTitle}
                  onChange={(e) =>
                    setSiteSeoSettings((prev) => ({
                      ...prev,
                      shop: { ...prev.shop, metaTitle: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Shop Meta Description</label>
                <textarea
                  rows={2}
                  value={siteSeoSettings.shop.metaDescription}
                  onChange={(e) =>
                    setSiteSeoSettings((prev) => ({
                      ...prev,
                      shop: { ...prev.shop, metaDescription: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Shop Focus Keywords</label>
                <input
                  type="text"
                  value={siteSeoSettings.shop.keywords}
                  onChange={(e) =>
                    setSiteSeoSettings((prev) => ({
                      ...prev,
                      shop: { ...prev.shop, keywords: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Blog Page SEO */}
          <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">
                3. Editorial Blog & Journal SEO (/blog)
              </span>
              <span className="font-mono text-[10px] text-zinc-400">Content Marketing Hub</span>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Blog Hub Meta Title</label>
                <input
                  type="text"
                  value={siteSeoSettings.blog.metaTitle}
                  onChange={(e) =>
                    setSiteSeoSettings((prev) => ({
                      ...prev,
                      blog: { ...prev.blog, metaTitle: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Blog Hub Meta Description</label>
                <textarea
                  rows={2}
                  value={siteSeoSettings.blog.metaDescription}
                  onChange={(e) =>
                    setSiteSeoSettings((prev) => ({
                      ...prev,
                      blog: { ...prev.blog, metaDescription: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">Blog Hub Focus Keywords</label>
                <input
                  type="text"
                  value={siteSeoSettings.blog.keywords}
                  onChange={(e) =>
                    setSiteSeoSettings((prev) => ({
                      ...prev,
                      blog: { ...prev.blog, keywords: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveSeoSettings}
            className="rounded-xl bg-[#d4af37] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 transition shadow-lg"
          >
            Save All SEO Configurations
          </button>
        </div>
      </div>
    </div>
  )
}
