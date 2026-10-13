"use client"

import React from "react"
import { Menu, ChevronRight, RefreshCw, Truck, Plus, Download } from "lucide-react"

interface AdminHeaderProps {
  activeTab: string
  setMobileMenuOpen: (open: boolean) => void
  isRefreshing: boolean
  onRefresh: () => void
  onAddNewShirt?: () => void
  onAddNewCoupon?: () => void
  onExportCSV?: () => void
  onAddNewBlog?: () => void
}

export function AdminHeader({
  activeTab,
  setMobileMenuOpen,
  isRefreshing,
  onRefresh,
  onAddNewShirt,
  onAddNewCoupon,
  onExportCSV,
  onAddNewBlog,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center justify-between border-b border-white/10 bg-[#0d0f12]/95 px-4 sm:px-8 backdrop-blur-xl gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:text-white lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <span>Gayatri Bhai</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#d4af37] font-semibold">{activeTab}</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
            {activeTab} Management
          </h2>
        </div>
      </div>

      {/* Quick Actions & Live Status Bar */}
      <div className="flex items-center gap-3">
        {/* Sync Live DB Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 px-3.5 py-1.5 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-black active:scale-95 transition disabled:opacity-50 shadow-sm"
          title="Reload live dynamic data from database"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-black" : ""}`} />
          <span className="hidden sm:inline">{isRefreshing ? "Syncing..." : "Sync Live DB"}</span>
        </button>

        {/* Live Status Indicators */}
        <div className="hidden lg:flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold text-zinc-300">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>DB Live Synced</span>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1 text-[#d4af37]">
            <Truck className="h-3 w-3" />
            <span>Shiprocket</span>
          </span>
        </div>

        {/* Action Buttons based on tab */}
        {activeTab === "Products" && onAddNewShirt && (
          <button
            onClick={onAddNewShirt}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-md hover:brightness-110 active:scale-95 transition"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add New Shirt</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}

        {activeTab === "Coupons" && onAddNewCoupon && (
          <button
            onClick={onAddNewCoupon}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-md hover:brightness-110 active:scale-95 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Coupon</span>
          </button>
        )}

        {activeTab === "Orders" && onExportCSV && (
          <button
            onClick={onExportCSV}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        )}

        {activeTab === "Blog CMS" && onAddNewBlog && (
          <button
            onClick={onAddNewBlog}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-md hover:brightness-110 active:scale-95 transition"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Write New Article</span>
            <span className="sm:hidden">New Blog</span>
          </button>
        )}
      </div>
    </header>
  )
}
