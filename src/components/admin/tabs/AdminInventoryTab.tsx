import React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Package,
  TrendingUp,
  IndianRupee,
  AlertTriangle,
  Search,
  Eye,
  EyeOff,
  Edit3,
  ExternalLink,
} from "lucide-react"
import { Product, ZoomImageModalState } from "../types"
import { SkeletonInventory } from "../AdminSkeletonLoaders"

interface InventoryStats {
  totalUnits: number
  totalValuation: number
  lowStockItems: number
  outOfStockItems: number
}

interface AdminInventoryTabProps {
  productList: Product[]
  inventoryStats: InventoryStats
  inventoryFilteredList: Product[]
  inventorySearch: string
  setInventorySearch: (s: string) => void
  inventoryStockFilter: "all" | "low" | "out"
  setInventoryStockFilter: (f: "all" | "low" | "out") => void
  isLoadingProducts: boolean
  formatINR: (val: number) => string
  setZoomImageModal: (state: ZoomImageModalState | null) => void
  handleStockAdjust: (
    productId: string,
    size: "XS" | "S" | "M" | "L" | "XL" | "XXL",
    delta: number
  ) => void
  handleOpenEditProduct: (product: Product) => void
  handleToggleProductVisibility: (product: Product) => void
}

export const AdminInventoryTab: React.FC<AdminInventoryTabProps> = ({
  productList,
  inventoryStats,
  inventoryFilteredList,
  inventorySearch,
  setInventorySearch,
  inventoryStockFilter,
  setInventoryStockFilter,
  isLoadingProducts,
  formatINR,
  setZoomImageModal,
  handleStockAdjust,
  handleOpenEditProduct,
  handleToggleProductVisibility,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Inventory KPI Valuation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#14171d] p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tracked Shirts</span>
            <h4 className="font-serif text-2xl font-bold text-white mt-1">{productList.length} Styles</h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">Active catalog SKUs</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-[#d4af37]">
            <Package className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#14171d] p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Stock</span>
            <h4 className="font-serif text-2xl font-bold text-white mt-1">
              {inventoryStats.totalUnits.toLocaleString("en-IN")} Pcs
            </h4>
            <p className="text-[11px] text-emerald-400 mt-0.5">Physical items ready to ship</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#d4af37]/30 bg-[#14171d] p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">Total Valuation</span>
            <h4 className="font-serif text-2xl font-bold text-[#d4af37] mt-1">
              {formatINR(inventoryStats.totalValuation)}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">At current selling prices</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37]">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-[#14171d] p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Stock Alerts</span>
            <div className="flex items-center gap-2 mt-1">
              <h4 className="font-serif text-2xl font-bold text-white">
                {inventoryStats.lowStockItems + inventoryStats.outOfStockItems}
              </h4>
              <span className="text-[11px] text-zinc-400">
                ({inventoryStats.lowStockItems} low, {inventoryStats.outOfStockItems} out)
              </span>
            </div>
            <p className="text-[11px] text-amber-400/80 mt-0.5">Restock recommended</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Inventory Card */}
      <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl space-y-6">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <span>Live Stock Management & Price Ledger</span>
              <span className="rounded-full bg-[#d4af37]/20 border border-[#d4af37]/30 px-2.5 py-0.5 text-xs font-mono font-bold text-[#d4af37]">
                {inventoryFilteredList.length} Shirts
              </span>
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              View product photo, unit price, size-wise stock steppers, and total inventory value
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search by shirt name, SKU..."
                className="w-full rounded-xl border border-white/10 bg-[#0d0f12] pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            {/* Stock Filter Pills */}
            <div className="inline-flex rounded-xl border border-white/10 bg-[#0d0f12] p-1 text-xs">
              <button
                onClick={() => setInventoryStockFilter("all")}
                className={`rounded-lg px-3 py-1 font-semibold transition ${
                  inventoryStockFilter === "all"
                    ? "bg-[#d4af37] text-black shadow font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                All ({productList.length})
              </button>
              <button
                onClick={() => setInventoryStockFilter("low")}
                className={`rounded-lg px-3 py-1 font-semibold transition flex items-center gap-1 ${
                  inventoryStockFilter === "low"
                    ? "bg-amber-500 text-black shadow font-bold"
                    : "text-zinc-400 hover:text-amber-400"
                }`}
              >
                <span>Low Stock</span>
                <span className="text-[10px] font-mono font-bold">({inventoryStats.lowStockItems})</span>
              </button>
              <button
                onClick={() => setInventoryStockFilter("out")}
                className={`rounded-lg px-3 py-1 font-semibold transition flex items-center gap-1 ${
                  inventoryStockFilter === "out"
                    ? "bg-rose-500 text-white shadow font-bold"
                    : "text-zinc-400 hover:text-rose-400"
                }`}
              >
                <span>Out of Stock</span>
                <span className="text-[10px] font-mono font-bold">({inventoryStats.outOfStockItems})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table with Photos, Prices & Size Steppers */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[960px]">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 font-semibold tracking-wider uppercase text-[11px]">
                <th className="py-3 px-3">Product / Shirt</th>
                <th className="py-3 px-3">Unit Price (₹)</th>
                <th className="py-3 px-2 text-center">XS</th>
                <th className="py-3 px-2 text-center">S</th>
                <th className="py-3 px-2 text-center">M</th>
                <th className="py-3 px-2 text-center">L</th>
                <th className="py-3 px-2 text-center">XL</th>
                <th className="py-3 px-2 text-center">XXL</th>
                <th className="py-3 px-3 text-center">Total Stock</th>
                <th className="py-3 px-3 text-right">Inventory Value</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            {isLoadingProducts ? (
              <SkeletonInventory />
            ) : (
              <tbody className="divide-y divide-white/5">
                {inventoryFilteredList.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-zinc-500">
                      No shirts found matching your search or filter.
                    </td>
                  </tr>
                ) : (
                  inventoryFilteredList.map((p) => {
                    const totalUnits = Object.values(p.stock || {}).reduce(
                      (a, b) => a + (Number(b) || 0),
                      0
                    )
                    const itemValuation = totalUnits * p.price
                    const isHidden = p.is_visible === false

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-white/[0.02] transition group ${
                          isHidden ? "opacity-75 bg-amber-500/[0.02]" : ""
                        }`}
                      >
                        {/* Product Photo & Details */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            {/* Shirt Image Thumbnail */}
                            <div
                              onClick={() =>
                                setZoomImageModal({
                                  url: p.images?.[0] || "/placeholder.jpg",
                                  title: `${p.name} • SKU: ${p.sku}`,
                                  isMobile: false,
                                })
                              }
                              className="relative h-14 w-14 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0 group-hover:border-[#d4af37]/60 transition shadow cursor-pointer"
                              title="Click to view full photo (HD Zoom)"
                            >
                              <Image
                                src={p.images?.[0] || "/placeholder.jpg"}
                                alt={p.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {isHidden && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                  <EyeOff className="h-4 w-4 text-amber-400" />
                                </div>
                              )}
                            </div>

                            {/* Name & Metadata */}
                            <div className="min-w-0 max-w-[240px]">
                              <div className="flex items-center gap-2">
                                <h5 className="font-semibold text-white truncate group-hover:text-[#d4af37] transition">
                                  {p.name}
                                </h5>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[10px] text-zinc-400">{p.sku}</span>
                                <span className="text-zinc-600">•</span>
                                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-zinc-300 border border-white/5">
                                  {p.category}
                                </span>
                                {isHidden && (
                                  <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/30">
                                    Draft
                                  </span>
                                )}
                              </div>
                              {p.fabric && (
                                <p className="text-[10px] text-zinc-500 truncate mt-0.5">{p.fabric}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Unit Price & MRP */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-serif text-sm font-bold text-[#d4af37]">
                              ₹{p.price.toLocaleString("en-IN")}
                            </span>
                            {p.mrp && p.mrp > p.price && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[10px] text-zinc-500 line-through">
                                  ₹{p.mrp.toLocaleString("en-IN")}
                                </span>
                                <span className="text-[9px] font-bold text-emerald-400">
                                  {Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Size Stock Steppers: XS to XXL */}
                        {(["XS", "S", "M", "L", "XL", "XXL"] as const).map((sz) => {
                          const qty = p.stock?.[sz] ?? 0
                          return (
                            <td key={sz} className="py-3.5 px-1.5 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className="text-[9px] font-bold text-zinc-400 mb-0.5">{sz}</span>
                                <div
                                  className={`inline-flex items-center rounded-lg border px-1 py-0.5 shadow-sm transition ${
                                    qty === 0
                                      ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                                      : qty < 5
                                      ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                                      : "border-white/10 bg-[#0d0f12] text-white"
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleStockAdjust(p.id, sz, -1)}
                                    disabled={qty <= 0}
                                    className="h-5 w-5 rounded flex items-center justify-center text-zinc-400 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed font-bold transition hover:bg-white/5"
                                    title={`Decrease ${sz} stock`}
                                  >
                                    -
                                  </button>
                                  <span className="font-mono text-xs font-bold w-5 text-center">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleStockAdjust(p.id, sz, 1)}
                                    className="h-5 w-5 rounded flex items-center justify-center text-zinc-400 hover:text-emerald-400 font-bold transition hover:bg-white/5"
                                    title={`Increase ${sz} stock`}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </td>
                          )
                        })}

                        {/* Total Units & Health Status */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-mono text-sm font-bold text-white">
                              {totalUnits} <span className="text-[10px] text-zinc-400 font-normal">pcs</span>
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold mt-1 ${
                                totalUnits === 0
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                  : totalUnits < 10
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              }`}
                            >
                              {totalUnits === 0 ? "Out of Stock" : totalUnits < 10 ? "Low Stock" : "Healthy"}
                            </span>
                          </div>
                        </td>

                        {/* Inventory Valuation */}
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <span className="font-mono font-bold text-[#d4af37] text-xs">
                            ₹{itemValuation.toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* Quick Actions (Edit, Eye, Storefront link) */}
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditProduct(p)}
                              className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-300 hover:text-[#d4af37] hover:border-[#d4af37]/40 hover:bg-[#d4af37]/10 transition"
                              title="Edit shirt & photos"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleProductVisibility(p)}
                              className={`rounded-lg border p-1.5 transition ${
                                isHidden
                                  ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                                  : "border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10"
                              }`}
                              title={isHidden ? "Unhide product on store" : "Hide product from store"}
                            >
                              {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                            <Link
                              href={`/product/${p.slug}`}
                              target="_blank"
                              className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition"
                              title="Open product page in store"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
