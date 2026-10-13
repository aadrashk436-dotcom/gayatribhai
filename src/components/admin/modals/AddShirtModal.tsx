"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Sparkles, Image as ImageIcon, Trash2, Upload, FileText, IndianRupee, Truck, Package, Plus } from "lucide-react"
import { Product, ATELIER_PRESET_IMAGES } from "../types"

interface AddShirtModalProps {
  isOpen: boolean
  onClose: () => void
  onAddProduct: (newProduct: Product) => void
  showToast: (msg: string) => void
}

export function AddShirtModal({ isOpen, onClose, onAddProduct, showToast }: AddShirtModalProps) {
  const [newShirtName, setNewShirtName] = useState("")
  const [newShirtCategory, setNewShirtCategory] = useState("Contemporary")
  const [newShirtPrice, setNewShirtPrice] = useState("2199")
  const [newShirtMRP, setNewShirtMRP] = useState("2499")
  const [newShirtFabric, setNewShirtFabric] = useState("100% Pure Organic French Linen")
  const [newShirtColor, setNewShirtColor] = useState("Ivory White")
  const [newShirtSKU, setNewShirtSKU] = useState(`M26/SS/CON/SF/${Math.floor(10 + Math.random() * 89)}`)
  const [newShirtDescription, setNewShirtDescription] = useState(
    "A handcrafted luxury shirt tailored from organic linen, adorned with intricate single-needle artisanal embroidery. Features a relaxed Cuban collar and natural wooden buttons for effortless sophistication."
  )
  const [newShirtOccasion, setNewShirtOccasion] = useState("Resort wear, sunset gatherings, festive soirees")
  const [newShirtBadge, setNewShirtBadge] = useState("New")
  const [newShirtImages, setNewShirtImages] = useState<string[]>([
    "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg",
  ])
  const [newShirtCustomImageUrl, setNewShirtCustomImageUrl] = useState("")
  const [newShirtStock, setNewShirtStock] = useState<Record<string, number>>({
    XS: 4,
    S: 5,
    M: 6,
    L: 6,
    XL: 5,
    XXL: 3,
    XXXL: 2,
  })
  const [quickStockValue, setQuickStockValue] = useState("5")
  const [newShirtWeight, setNewShirtWeight] = useState("0.35")
  const [newShirtLength, setNewShirtLength] = useState("30")
  const [newShirtBreadth, setNewShirtBreadth] = useState("25")
  const [newShirtHeight, setNewShirtHeight] = useState("4")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !files.length) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const dataUrl = ev.target.result as string
          setNewShirtImages((prev) => [...prev, dataUrl])
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ""
  }

  const handleAddImageUrl = () => {
    if (!newShirtCustomImageUrl.trim()) return
    setNewShirtImages((prev) => [...prev, newShirtCustomImageUrl.trim()])
    setNewShirtCustomImageUrl("")
  }

  const handleRemoveImage = (index: number) => {
    setNewShirtImages((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleTogglePresetImage = (url: string) => {
    setNewShirtImages((prev) => {
      if (prev.includes(url)) {
        return prev.filter((u) => u !== url)
      }
      return [...prev, url]
    })
  }

  const handleStockChange = (size: string, value: number) => {
    setNewShirtStock((prev) => ({
      ...prev,
      [size]: Math.max(0, value),
    }))
  }

  const handleApplyQuickStock = () => {
    const val = parseInt(quickStockValue, 10) || 0
    setNewShirtStock({
      XS: val,
      S: val,
      M: val,
      L: val,
      XL: val,
      XXL: val,
      XXXL: val,
    })
    showToast(`Stock updated to ${val} units across all sizes.`)
  }

  const handleAddShirtSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newShirtName.trim()) {
      showToast("Please enter a shirt title.")
      return
    }

    setIsSubmitting(true)
    const slug = newShirtName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    const numPrice = Number(newShirtPrice) || 2199
    const numMrp = Number(newShirtMRP) || numPrice
    const discount = numMrp > numPrice ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0

    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      slug,
      name: newShirtName.trim(),
      description: newShirtDescription.trim(),
      price: numPrice,
      mrp: numMrp,
      discount,
      category: newShirtCategory,
      sku: newShirtSKU.trim(),
      color: newShirtColor.trim(),
      sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
      images: newShirtImages.length > 0 ? newShirtImages : [ATELIER_PRESET_IMAGES[0].url],
      fabric: newShirtFabric.trim(),
      occasion: newShirtOccasion.trim(),
      rating: 4.8,
      reviews: 1,
      badge: newShirtBadge,
      stock: newShirtStock,
      is_visible: true,
      weight: Number(newShirtWeight) || 0.35,
      length: Number(newShirtLength) || 30,
      breadth: Number(newShirtBreadth) || 25,
      height: Number(newShirtHeight) || 4,
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      })
      if (!res.ok) console.warn("Could not save to API")
    } catch (err) {
      console.warn("Could not sync new product to API:", err)
    } finally {
      setIsSubmitting(false)
    }

    onAddProduct(newProduct)
    showToast(`"${newShirtName}" listed in catalog!`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#14171d] shadow-2xl max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-white/10 shrink-0">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 px-3 py-0.5 text-[10px] font-bold text-[#d4af37]">
              <Sparkles className="h-3 w-3" /> Haute Craftsmanship Studio
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1.5">
              Craft & List New Handcrafted Shirt
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Upload photography, define artisan embroidery details, and allocate size inventory.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleAddShirtSubmit} className="flex-1 overflow-y-auto admin-scroll p-5 sm:p-6 space-y-6 text-xs">
          {/* ── SECTION 1: PHOTOGRAPHY & IMAGERY ── */}
          <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#d4af37]" />
                  Garment Photography ({newShirtImages.length} Photos Selected)
                </h4>
                <p className="text-[11px] text-zinc-400">Photo #1 will be showcased as the storefront cover.</p>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
                High-Res Ready
              </span>
            </div>

            {/* Selected Images Preview Grid */}
            {newShirtImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {newShirtImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-white/15 bg-black"
                  >
                    <Image src={imgUrl} alt={`Shirt Photo ${idx + 1}`} fill className="object-cover" />
                    <span className="absolute top-2 left-2 rounded-full bg-black/80 px-2 py-0.5 text-[9px] font-bold text-[#d4af37] border border-white/10">
                      {idx === 0 ? "★ Main Cover" : `Angle #${idx + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 rounded-lg bg-rose-600/90 p-1 text-white opacity-0 group-hover:opacity-100 transition shadow"
                      title="Remove photo"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/20 p-6 text-center text-zinc-400">
                <p>No photos added yet. Upload from device or choose from the studio library below.</p>
              </div>
            )}

            {/* Photo Add Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
              {/* File Upload from Device */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                  Upload from Computer / Phone
                </label>
                <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#d4af37]/40 bg-[#d4af37]/10 p-3 text-xs font-semibold text-[#d4af37] hover:bg-[#d4af37]/20 cursor-pointer transition">
                  <Upload className="h-4 w-4" />
                  <span>Choose Photos (JPG, PNG, WebP)</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Add Image via URL */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                  Or Add via Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://... or /assets/..."
                    value={newShirtCustomImageUrl}
                    onChange={(e) => setNewShirtCustomImageUrl(e.target.value)}
                    className="flex-1 rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="rounded-xl border border-white/10 bg-white/10 px-3.5 py-2 font-semibold text-zinc-200 hover:bg-white/20 hover:text-white"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Atelier Preset Studio Library */}
            <div className="pt-2 border-t border-white/10">
              <p className="text-[11px] font-semibold text-zinc-400 mb-2">
                Studio Library (Click to toggle atelier shoot assets):
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 admin-scroll">
                {ATELIER_PRESET_IMAGES.map((preset) => {
                  const isSelected = newShirtImages.includes(preset.url)
                  return (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => handleTogglePresetImage(preset.url)}
                      className={`flex items-center gap-2 rounded-xl p-1.5 pr-3 border text-[11px] font-medium shrink-0 transition ${
                        isSelected
                          ? "border-[#d4af37] bg-[#d4af37]/20 text-white font-semibold"
                          : "border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      <div className="relative h-7 w-7 rounded-lg overflow-hidden shrink-0 border border-white/10">
                        <Image src={preset.url} alt={preset.label} fill className="object-cover" />
                      </div>
                      <span>{preset.label}</span>
                      {isSelected && <span className="text-[#d4af37] font-bold">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── SECTION 2: GARMENT IDENTITY & DETAILS ── */}
          <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-4 space-y-4">
            <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#d4af37]" />
              Garment Specifications
            </h4>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Shirt Name <span className="text-[#d4af37]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Azure Kantha Silk Linen Shirt"
                value={newShirtName}
                onChange={(e) => setNewShirtName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#14171d] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none text-sm font-medium"
              />
              {newShirtName && (
                <p className="mt-1 text-[10px] text-zinc-400 font-mono">
                  Live URL: /product/{newShirtName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Category</label>
                <select
                  value={newShirtCategory}
                  onChange={(e) => setNewShirtCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="Contemporary">Contemporary</option>
                  <option value="BeachSide">BeachSide</option>
                  <option value="Floral">Floral</option>
                  <option value="Nature">Nature</option>
                  <option value="Classic">Classic</option>
                  <option value="Festive">Festive</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Collection Badge</label>
                <select
                  value={newShirtBadge}
                  onChange={(e) => setNewShirtBadge(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="New">New Arrival</option>
                  <option value="Bestseller">Bestseller</option>
                  <option value="Signature">Signature Edition</option>
                  <option value="Limited Edition">Limited Edition</option>
                  <option value="Festive Edit">Festive Edit</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-400 mb-1">SKU Code</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newShirtSKU}
                    onChange={(e) => setNewShirtSKU(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => setNewShirtSKU(`M26/SS/ART/${Math.floor(10 + Math.random() * 89)}`)}
                    className="rounded-xl border border-white/10 bg-white/5 px-2.5 text-zinc-400 hover:text-white"
                    title="Randomize SKU"
                  >
                    ⚡
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Primary Color</label>
                <input
                  type="text"
                  placeholder="e.g. Sky Blue, Ivory, Rust"
                  value={newShirtColor}
                  onChange={(e) => setNewShirtColor(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Fabric & Thread</label>
                <input
                  type="text"
                  placeholder="e.g. 100% French Linen"
                  value={newShirtFabric}
                  onChange={(e) => setNewShirtFabric(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Occasion / Styling</label>
                <input
                  type="text"
                  placeholder="e.g. Resort wear, evening dinners"
                  value={newShirtOccasion}
                  onChange={(e) => setNewShirtOccasion(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-400 mb-1">
                Artisanal Story & Hand-Embroidery Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe the single-needle motifs, Cuban collar, pick stitching, and natural wooden buttons..."
                value={newShirtDescription}
                onChange={(e) => setNewShirtDescription(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#14171d] p-3 text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none leading-relaxed text-xs"
              />
            </div>
          </div>

          {/* ── SECTION 3: PRICING & DISCOUNTS ── */}
          <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-4 space-y-3">
            <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-[#d4af37]" />
              Pricing & Commercial Value
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">
                  Selling Price (₹) <span className="text-[#d4af37]">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  value={newShirtPrice}
                  onChange={(e) => setNewShirtPrice(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white font-mono text-sm font-bold focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-400 mb-1">
                  Original MRP Price (₹)
                </label>
                <input
                  type="number"
                  min={100}
                  value={newShirtMRP}
                  onChange={(e) => setNewShirtMRP(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white font-mono text-sm focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="pt-4 sm:pt-0">
                <span className="block text-[11px] font-semibold text-zinc-400 mb-1">Patron Discount</span>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-center">
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {Number(newShirtMRP) > Number(newShirtPrice)
                      ? `${Math.round(((Number(newShirtMRP) - Number(newShirtPrice)) / Number(newShirtMRP)) * 100)}% Off`
                      : "Regular MRP"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION: PACKAGE WEIGHT & DIMENSIONS ── */}
          <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div>
                <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#d4af37]" />
                  Package Weight & Shipping Dimensions
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Amazon & Shiprocket courier standard: shipping rates calculate from Dead Weight vs Volumetric Weight
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#d4af37]">
                  Divisor: 5000
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1 text-xs">
                  Weight (kg) <span className="text-[#d4af37]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.05"
                    required
                    value={newShirtWeight}
                    onChange={(e) => setNewShirtWeight(e.target.value)}
                    placeholder="0.35"
                    className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white font-mono text-xs focus:border-[#d4af37] focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">kg</span>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  = {(Number(newShirtWeight || 0) * 1000).toFixed(0)} grams
                </span>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1 text-xs">
                  Length (L in cm) <span className="text-[#d4af37]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={newShirtLength}
                    onChange={(e) => setNewShirtLength(e.target.value)}
                    placeholder="30"
                    className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white font-mono text-xs focus:border-[#d4af37] focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">cm</span>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">Garment fold length</span>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1 text-xs">
                  Breadth / Width (B in cm) <span className="text-[#d4af37]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={newShirtBreadth}
                    onChange={(e) => setNewShirtBreadth(e.target.value)}
                    placeholder="25"
                    className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white font-mono text-xs focus:border-[#d4af37] focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">cm</span>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">Box / satchel width</span>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1 text-xs">
                  Height (H in cm) <span className="text-[#d4af37]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={newShirtHeight}
                    onChange={(e) => setNewShirtHeight(e.target.value)}
                    placeholder="4"
                    className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white font-mono text-xs focus:border-[#d4af37] focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">cm</span>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">Folded box thickness</span>
              </div>
            </div>
          </div>

          {/* ── SECTION 4: SIZE MATRIX & STOCK ALLOCATION ── */}
          <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#d4af37]" />
                  Warehouse Ready Stock by Size
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Total Inventory: <strong className="text-white">{Object.values(newShirtStock).reduce((a, b) => a + (Number(b) || 0), 0)} Units</strong> ready to ship.
                </p>
              </div>

              {/* Quick Fill Toolbar */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-400">Quick set:</span>
                <input
                  type="number"
                  min={0}
                  value={quickStockValue}
                  onChange={(e) => setQuickStockValue(e.target.value)}
                  className="w-16 rounded-lg border border-white/10 bg-[#14171d] px-2 py-1 text-center text-white font-mono text-xs focus:border-[#d4af37] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyQuickStock}
                  className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 font-semibold text-zinc-200 hover:bg-white/20 hover:text-white"
                >
                  Fill All
                </button>
              </div>
            </div>

            {/* Size Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((sz) => {
                const currentVal = newShirtStock[sz] ?? 0
                return (
                  <div
                    key={sz}
                    className="rounded-xl border border-white/10 bg-[#14171d] p-3 text-center space-y-2 hover:border-[#d4af37]/40 transition"
                  >
                    <span className="text-xs font-mono font-bold text-[#d4af37] block">{sz}</span>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStockChange(sz, currentVal - 1)}
                        className="h-6 w-6 rounded-md bg-white/5 text-zinc-300 hover:bg-white/15 hover:text-white font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={currentVal}
                        onChange={(e) => handleStockChange(sz, parseInt(e.target.value, 10) || 0)}
                        className="w-12 rounded-md border border-white/10 bg-[#0d0f12] py-1 text-center text-white font-mono text-xs focus:border-[#d4af37] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleStockChange(sz, currentVal + 1)}
                        className="h-6 w-6 rounded-md bg-white/5 text-zinc-300 hover:bg-white/15 hover:text-white font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-white/10 px-5 py-2.5 font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-6 py-2.5 font-bold uppercase tracking-wider text-black shadow-lg shadow-[#d4af37]/25 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>{isSubmitting ? "Publishing..." : "Publish Shirt to Store"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
