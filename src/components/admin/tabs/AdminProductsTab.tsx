"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  Maximize2,
  Image as ImageIcon,
  EyeOff,
  Eye,
  ExternalLink,
  Edit3,
  Trash2,
  IndianRupee,
  Plus,
} from "lucide-react"
import { Product, formatINR, ZoomImageModalState } from "../types"
import { SkeletonProducts } from "../AdminSkeletonLoaders"

interface AdminProductsTabProps {
  isLoadingProducts: boolean
  productList: Product[]
  onOpenEditProduct: (p: Product) => void
  onOpenQuickPrice: (p: Product) => void
  onToggleVisibility: (p: Product) => void
  onOpenDeleteProduct: (p: Product) => void
  onOpenZoom: (zoomState: NonNullable<ZoomImageModalState>) => void
  onAddNewShirt?: () => void
}

export function AdminProductsTab({
  isLoadingProducts,
  productList,
  onOpenEditProduct,
  onOpenQuickPrice,
  onToggleVisibility,
  onOpenDeleteProduct,
  onOpenZoom,
  onAddNewShirt,
}: AdminProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")

  const filteredProducts = useMemo(() => {
    return productList.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCat = categoryFilter === "All" || p.category === categoryFilter
      return matchSearch && matchCat
    })
  }, [productList, searchQuery, categoryFilter])

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] space-y-4 animate-in fade-in duration-150">
      {/* Search & Filter Bar (STICKY & FIXED AT TOP) */}
      <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#14171d]/95 p-4 backdrop-blur-xl shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search shirts by name, SKU, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0d0f12] pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["All", "Contemporary", "BeachSide", "Classic", "Festive"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition shrink-0 ${
                categoryFilter === cat
                  ? "bg-[#d4af37] text-black font-bold shadow-md shadow-[#d4af37]/20"
                  : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}

          {onAddNewShirt && (
            <button
              type="button"
              onClick={onAddNewShirt}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6c762] px-3.5 py-1.5 text-xs font-bold text-black hover:brightness-110 shadow-lg shadow-[#d4af37]/20 transition shrink-0 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Add Shirt</span>
            </button>
          )}
        </div>
      </div>

      {/* Counter & Status Strip */}
      <div className="shrink-0 flex items-center justify-between px-1 text-xs text-zinc-400">
        <span>Displaying <strong className="text-white">{filteredProducts.length}</strong> haute shirts in catalog</span>
        <span className="text-[11px] text-[#d4af37] font-semibold flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Database Synced
        </span>
      </div>

      {/* Product Catalog Grid (INDEPENDENTLY SCROLLABLE) */}
      <div className="flex-1 overflow-y-auto admin-scroll pr-1 pb-16">
        {isLoadingProducts ? (
          <SkeletonProducts />
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-white/10 bg-[#14171d]/60">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-white">No products found</h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              {searchQuery || categoryFilter !== "All"
                ? "Try adjusting your search query or category filter."
                : "Your catalog is empty. Add your first handcrafted shirt to get started."}
            </p>
            {onAddNewShirt && (
              <button
                type="button"
                onClick={onAddNewShirt}
                className="mt-4 flex items-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-bold text-black hover:brightness-110 shadow-lg shadow-[#d4af37]/20 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Craft & List New Shirt</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProducts.map((p) => {
              const totalUnits = Object.values(p.stock || {}).reduce((a, b) => a + b, 0)
              const isHidden = p.is_visible === false
              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border bg-[#14171d] p-4 shadow-xl flex flex-col justify-between group transition duration-200 ${
                    isHidden
                      ? "border-amber-500/30 opacity-90"
                      : "border-white/10 hover:border-[#d4af37]/40"
                  }`}
                >
                  <div>
                    <div
                      onClick={() =>
                        onOpenZoom({
                          url: p.images?.[0] || "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg",
                          title: `${p.name} • SKU: ${p.sku}`,
                          isMobile: false,
                        })
                      }
                      className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-black mb-3 cursor-pointer group/img"
                      title="Click to view full uncropped photo (HD Zoom)"
                    >
                      <Image
                        src={p.images?.[0] || "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg"}
                        alt={p.name}
                        fill
                        className="object-cover group-hover/img:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="rounded-full bg-black/85 backdrop-blur-md border border-[#d4af37]/60 px-3 py-1.5 text-[11px] font-bold text-[#d4af37] flex items-center gap-1.5 shadow-2xl">
                          <Maximize2 className="h-3.5 w-3.5" /> Pura Dekho (HD Zoom)
                        </span>
                      </div>
                      <span className="absolute top-2.5 left-2.5 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-[#d4af37] border border-white/10">
                        {p.category}
                      </span>
                      <span className="absolute top-2.5 right-2.5 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white border border-white/10">
                        {totalUnits} Units in Stock
                      </span>

                      {/* Photo Count Pill */}
                      <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/80 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono text-zinc-300 border border-white/10 flex items-center gap-1">
                        <ImageIcon className="h-3 w-3 text-[#d4af37]" />
                        {p.images?.length || 1} Photos
                      </span>

                      {/* Hidden from Store Overlay */}
                      {isHidden && (
                        <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center">
                          <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 text-[11px] font-bold flex items-center gap-1.5 shadow">
                            <EyeOff className="h-3.5 w-3.5" /> Hidden from Store (Draft)
                          </span>
                          <p className="text-[10px] text-zinc-400 mt-1">Patrons cannot see or purchase this item</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-400">{p.sku}</span>
                        {p.discount ? (
                          <span className="text-[10px] font-semibold text-emerald-400">{p.discount}% Off</span>
                        ) : null}
                      </div>
                      <h4 className="font-serif text-base font-bold text-white line-clamp-1">{p.name}</h4>
                      <p className="text-xs text-zinc-400 line-clamp-2">{p.description}</p>
                    </div>

                    {/* Size Stock Badges */}
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                        Stock by Size
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(p.stock || {}).map(([size, count]) => (
                          <span
                            key={size}
                            className={`rounded-lg px-2 py-0.5 text-[10px] font-mono font-semibold ${
                              count <= 2
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : "bg-white/5 text-zinc-300 border border-white/10"
                            }`}
                          >
                            {size}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-serif text-lg font-bold text-white">{formatINR(p.price)}</span>
                      {p.mrp && p.mrp > p.price && (
                        <span className="ml-2 text-xs text-zinc-500 line-through">{formatINR(p.mrp)}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Store link */}
                      <Link
                        href={`/product/${p.slug}`}
                        target="_blank"
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white transition"
                        title="View on Storefront"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>

                      {/* Quick Edit Price Button */}
                      <button
                        onClick={() => onOpenQuickPrice(p)}
                        className="rounded-lg bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition flex items-center gap-1"
                        title="Quick Price & MRP edit"
                      >
                        <IndianRupee className="h-3 w-3" />
                        <span>Price</span>
                      </button>

                      {/* Visibility Toggle Button */}
                      <button
                        onClick={() => onToggleVisibility(p)}
                        className={`rounded-lg border p-2 transition ${
                          isHidden
                            ? "border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/30"
                            : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                        }`}
                        title={isHidden ? "Unhide and publish to store" : "Hide from customer storefront"}
                      >
                        {isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>

                      {/* Edit Shirt Button */}
                      <button
                        onClick={() => onOpenEditProduct(p)}
                        className="rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 px-2.5 py-1.5 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition"
                        title="Edit all product fields"
                      >
                        Edit
                      </button>

                      {/* Delete Shirt Button */}
                      <button
                        onClick={() => onOpenDeleteProduct(p)}
                        className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500 hover:text-white transition"
                        title="Delete shirt from catalog"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
