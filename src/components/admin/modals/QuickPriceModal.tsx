"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { IndianRupee, Sparkles, X, Check, ArrowRight } from "lucide-react"
import { Product, formatINR } from "../types"

interface QuickPriceModalProps {
  product: Product | null
  onClose: () => void
  onSaved: (updatedProduct: Product) => void
  showToast: (msg: string) => void
}

export function QuickPriceModal({ product, onClose, onSaved, showToast }: QuickPriceModalProps) {
  const [price, setPrice] = useState<string>("")
  const [mrp, setMrp] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (product) {
      setPrice(String(product.price || ""))
      setMrp(String(product.mrp || product.price || ""))
    }
  }, [product])

  if (!product) return null

  const numPrice = Number(price) || 0
  const numMrp = Number(mrp) || numPrice
  const discountPercent = numMrp > numPrice && numMrp > 0
    ? Math.round(((numMrp - numPrice) / numMrp) * 100)
    : 0

  const handleApplyDiscountPreset = (percent: number) => {
    if (!numMrp) return
    const calculatedPrice = Math.round(numMrp * (1 - percent / 100))
    // Round to nearest 99 or neat currency
    setPrice(String(calculatedPrice))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!numPrice || numPrice <= 0) {
      showToast("Please enter a valid selling price.")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          price: numPrice,
          mrp: numMrp,
          discount: discountPercent,
        }),
      })

      if (!res.ok) throw new Error("Failed to update price")

      const data = await res.json()
      const updatedProduct: Product = data.product || {
        ...product,
        price: numPrice,
        mrp: numMrp,
        discount: discountPercent,
      }

      onSaved(updatedProduct)
      showToast(`Price for "${product.name}" updated to ${formatINR(numPrice)} (MRP ${formatINR(numMrp)})!`)
      onClose()
    } catch (err: any) {
      console.error("Price save error:", err)
      showToast("Error updating price in database. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-[#d4af37]/40 bg-[#14171d] p-6 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37]">
              <IndianRupee className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-white">Quick Price & MRP Editor</h3>
                <span className="rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#d4af37]">
                  Instant DB Sync
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">Edit store selling price, strike-through MRP, and live discounts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Product Snapshot Card */}
        <div className="flex items-center gap-4 rounded-2xl bg-black/40 border border-white/10 p-3.5">
          <div className="relative h-16 w-14 shrink-0 rounded-xl overflow-hidden bg-black border border-white/10">
            <Image
              src={product.images?.[0] || "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-serif text-sm font-bold text-white truncate">{product.name}</h4>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono mt-0.5">
              <span>SKU: {product.sku}</span>
              <span>•</span>
              <span className="text-[#d4af37]">Cat: {product.category}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-emerald-400">Current: {formatINR(product.price)}</span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-[11px] text-zinc-500 line-through">{formatINR(product.mrp)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Price Edit Form */}
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Selling Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Selling Price (₹)</span>
                <span className="text-[10px] text-[#d4af37] font-bold">Patron Pays</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#d4af37]">₹</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/60 pl-8 pr-3 py-2.5 text-sm font-bold text-white placeholder-zinc-600 focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                  placeholder="2199"
                />
              </div>
            </div>

            {/* MRP */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>MRP / Strikethrough (₹)</span>
                <span className="text-[10px] text-zinc-400">Original Tag</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/60 pl-8 pr-3 py-2.5 text-sm font-semibold text-white placeholder-zinc-600 focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                  placeholder="2499"
                />
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Quick Discount Presets (Calculated from MRP):</span>
            <div className="flex flex-wrap gap-2">
              {[10, 15, 20, 25, 30].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleApplyDiscountPreset(pct)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:border-[#d4af37]/60 hover:bg-[#d4af37]/15 hover:text-[#d4af37] transition"
                >
                  {pct}% Off
                </button>
              ))}
            </div>
          </div>

          {/* Live Discount Preview Badge */}
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500/10 via-zinc-900 to-transparent border border-emerald-500/20 px-4 py-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-zinc-300">Live Customer Display:</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <strong className="text-emerald-400 text-sm">{formatINR(numPrice)}</strong>
              {numMrp > numPrice && (
                <>
                  <span className="text-zinc-500 line-through text-xs">{formatINR(numMrp)}</span>
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-[#d4af37] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#e5c358] transition shadow-lg disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Saving to Database...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Price Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
