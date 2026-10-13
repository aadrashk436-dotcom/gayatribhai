"use client"

import React from "react"
import Image from "next/image"
import { Trash2 } from "lucide-react"
import { Product, formatINR } from "../types"

interface DeleteProductModalProps {
  product: Product | null
  onClose: () => void
  onConfirm: () => void
}

export function DeleteProductModal({ product, onClose, onConfirm }: DeleteProductModalProps) {
  if (!product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#16181f] p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3 text-rose-400">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 border border-rose-500/30">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">Delete Product?</h3>
            <p className="text-[11px] text-zinc-400">This action cannot be undone</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-[#0d0f12]">
          <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-black shrink-0">
            <Image
              src={product.images?.[0] || "/placeholder.jpg"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
            <p className="text-[11px] text-zinc-400">SKU: {product.sku} • {formatINR(product.price)}</p>
          </div>
        </div>

        <p className="text-xs text-zinc-300">
          Are you sure you want to delete <strong className="text-white">{product.name}</strong> from your catalog? It will be permanently removed from the website and database.
        </p>

        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
          >
            Keep Product
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-rose-500 shadow-lg"
          >
            Delete Shirt
          </button>
        </div>
      </div>
    </div>
  )
}
