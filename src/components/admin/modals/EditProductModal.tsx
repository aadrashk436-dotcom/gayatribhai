"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Edit3, Sparkles, Upload, Maximize2, Trash2, Truck } from "lucide-react"
import { Product, ZoomImageModalState } from "../types"

interface EditProductModalProps {
  product: Product | null
  onClose: () => void
  onSave: (updated: Product) => void
  onOpenZoom: (zoomState: NonNullable<ZoomImageModalState>) => void
  showToast: (msg: string) => void
}

export function EditProductModal({
  product,
  onClose,
  onSave,
  onOpenZoom,
  showToast,
}: EditProductModalProps) {
  const [formData, setFormData] = useState<Product | null>(null)
  const [customImageUrl, setCustomImageUrl] = useState("")

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        images: [...(product.images || [])],
        stock: { ...(product.stock || {}) },
      })
      setCustomImageUrl("")
    }
  }, [product])

  if (!formData) return null

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !files.length) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const dataUrl = ev.target.result as string
          setFormData((prev) =>
            prev ? { ...prev, images: [...prev.images, dataUrl] } : null
          )
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ""
  }

  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return
    setFormData((prev) =>
      prev ? { ...prev, images: [...prev.images, customImageUrl.trim()] } : null
    )
    setCustomImageUrl("")
  }

  const handleDeletePhoto = (index: number) => {
    if (!formData.images || formData.images.length <= 1) {
      showToast("A shirt must keep at least 1 photo.")
      return
    }
    const updatedImages = formData.images.filter((_, idx) => idx !== index)
    setFormData({ ...formData, images: updatedImages })
    showToast("Photo removed from gallery.")
  }

  const handleSetCoverPhoto = (index: number) => {
    if (index === 0) return
    const target = formData.images[index]
    const rest = formData.images.filter((_, idx) => idx !== index)
    const reordered = [target, ...rest]
    setFormData({ ...formData, images: reordered })
    showToast("Cover photo updated!")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#12141a] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-white">Edit Shirt & Photo Gallery</h3>
              <p className="text-xs text-zinc-400">SKU: {formData.sku} • ID: {formData.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Product Title / Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
              >
                <option value="Casual Shirts">Casual Shirts</option>
                <option value="Formal Shirts">Formal Shirts</option>
                <option value="Resort Wear">Resort Wear</option>
                <option value="Evening Wear">Evening Wear</option>
                <option value="Hand-Embroidered">Hand-Embroidered</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Price (₹ INR Selling Price)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Original MRP (₹ Strike-through)</label>
              <input
                type="number"
                value={formData.mrp || formData.price}
                onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Fabric</label>
              <input
                type="text"
                value={formData.fabric}
                onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>

          {/* Story / Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Product Story & Craftsmanship</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
              placeholder="Detailing the yarn, weave, drape and artisan touch..."
            />
          </div>

          {/* ── PHOTO MANAGER SECTION ── */}
          <div className="rounded-2xl border border-[#d4af37]/30 bg-[#0d0f12] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h4 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#d4af37]" />
                  <span>Product Photos ({formData.images?.length || 0})</span>
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  First photo is the <strong className="text-[#d4af37]">Cover Image</strong>. Click &ldquo;Make Cover&rdquo; to set any photo as main thumbnail.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5 text-[#d4af37]" />
                  <span>Upload Photos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadPhoto}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Add Photo by URL */}
            <div className="flex gap-2">
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="Or paste image URL (e.g. /assets/products/... or https://...)"
                className="flex-1 rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/20 px-4 py-2 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition"
              >
                + Add Image
              </button>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {formData.images?.map((imgSrc, idx) => {
                const isCover = idx === 0
                return (
                  <div
                    key={idx}
                    className={`relative rounded-xl overflow-hidden border ${
                      isCover ? "border-[#d4af37] ring-2 ring-[#d4af37]/30 shadow-lg" : "border-white/10 bg-black/40"
                    } group flex flex-col justify-between`}
                  >
                    <div
                      onClick={() =>
                        onOpenZoom({
                          url: imgSrc,
                          title: `${formData.name} (Photo #${idx + 1})`,
                          isMobile: false,
                        })
                      }
                      className="relative aspect-square w-full bg-black cursor-pointer group/cardimg"
                      title="Click to view full photo (HD Zoom)"
                    >
                      <Image
                        src={imgSrc}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className="object-cover group-hover/cardimg:scale-105 transition-transform duration-300"
                      />
                      {isCover && (
                        <span className="absolute top-2 left-2 rounded-full bg-[#d4af37] text-black px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow">
                          ★ Cover Photo
                        </span>
                      )}
                      <span className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-mono text-zinc-300">
                        #{idx + 1}
                      </span>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cardimg:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <Maximize2 className="h-4 w-4 text-[#d4af37]" />
                      </div>
                    </div>

                    {/* Action Toolbar on card */}
                    <div className="p-2 bg-[#12141a] flex items-center justify-between gap-1 border-t border-white/10">
                      {!isCover ? (
                        <button
                          type="button"
                          onClick={() => handleSetCoverPhoto(idx)}
                          className="rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 px-2 py-1 text-[10px] font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition flex-1 text-center"
                        >
                          Make Cover
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-400 px-1 py-0.5 flex-1 text-center">
                          Primary Showcase
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(idx)}
                        className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-1 text-rose-400 hover:bg-rose-500 hover:text-white transition"
                        title="Delete this photo"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Size Inventory Steppers */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">Inventory Stock by Size</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(["XS", "S", "M", "L", "XL", "XXL"] as const).map((size) => (
                <div key={size} className="rounded-xl border border-white/10 bg-[#0d0f12] p-2.5 text-center">
                  <span className="text-xs font-bold text-zinc-400">{size}</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock[size] ?? 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: {
                          ...formData.stock,
                          [size]: Math.max(0, parseInt(e.target.value) || 0),
                        },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#161922] py-1 text-center text-xs font-bold text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Package Weight & Dimensions */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0f12] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#d4af37]" />
                  <span>Shipping Package Weight & Dimensions</span>
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Used to calculate live courier delivery rates (Shiprocket, BlueDart, Delhivery)
                </p>
              </div>
              <span className="rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#d4af37]">
                Divisor: 5000
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Weight (kg) <span className="text-[#d4af37]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.05"
                    value={formData.weight ?? 0.35}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: Number(e.target.value) || 0.35,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#161922] px-3 py-2 text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">kg</span>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  = {((formData.weight ?? 0.35) * 1000).toFixed(0)} grams
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Length (L in cm) <span className="text-[#d4af37]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={formData.length ?? 30}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        length: Number(e.target.value) || 30,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#161922] px-3 py-2 text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">cm</span>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">Garment fold length</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Breadth (B in cm) <span className="text-[#d4af37]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={formData.breadth ?? 25}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        breadth: Number(e.target.value) || 25,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#161922] px-3 py-2 text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">cm</span>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">Box / satchel width</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Height (H in cm) <span className="text-[#d4af37]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={formData.height ?? 4}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        height: Number(e.target.value) || 4,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#161922] px-3 py-2 text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">cm</span>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">Package thickness</span>
              </div>
            </div>

            {/* Volumetric comparison */}
            <div className="rounded-xl border border-white/5 bg-[#14171d] p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Dead Weight:</span>
                  <p className="font-mono font-bold text-white">{(formData.weight ?? 0.35).toFixed(2)} kg</p>
                </div>
                <span className="text-zinc-600">vs</span>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Volumetric Weight:</span>
                  <p className="font-mono font-bold text-[#d4af37]">
                    {(((formData.length ?? 30) * (formData.breadth ?? 25) * (formData.height ?? 4)) / 5000).toFixed(2)} kg
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-right">
                <span className="text-[10px] font-bold uppercase text-emerald-400">Billable Courier Weight</span>
                <p className="font-mono font-bold text-white text-sm">
                  {Math.max(
                    formData.weight ?? 0.35,
                    ((formData.length ?? 30) * (formData.breadth ?? 25) * (formData.height ?? 4)) / 5000
                  ).toFixed(2)} kg
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#d4af37] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-[#b8972e] transition shadow-lg"
            >
              Save Shirt Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
