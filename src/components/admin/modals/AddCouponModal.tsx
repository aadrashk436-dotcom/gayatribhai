"use client"

import React, { useState } from "react"
import { Coupon } from "../types"

interface AddCouponModalProps {
  isOpen: boolean
  onClose: () => void
  onAddCoupon: (newCoupon: Coupon) => void
  showToast: (msg: string) => void
}

export function AddCouponModal({ isOpen, onClose, onAddCoupon, showToast }: AddCouponModalProps) {
  const [newCouponCode, setNewCouponCode] = useState("")
  const [newCouponDiscount, setNewCouponDiscount] = useState("15")
  const [newCouponMinSpend, setNewCouponMinSpend] = useState("2000")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCouponCode.trim()) return

    const newCpn: Coupon = {
      id: `cpn_${Date.now()}`,
      code: newCouponCode.toUpperCase().trim(),
      discount: `${newCouponDiscount}% Off`,
      type: "Percentage",
      minSpend: parseInt(newCouponMinSpend, 10) || 1500,
      usedCount: 0,
      maxUses: 200,
      active: true,
    }

    onAddCoupon(newCpn)
    showToast(`Coupon ${newCpn.code} created successfully!`)
    setNewCouponCode("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h3 className="font-serif text-lg font-bold text-white">Create New Coupon</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-400 mb-1">Coupon Code</label>
            <input
              type="text"
              required
              placeholder="e.g. FESTIVE20"
              value={newCouponCode}
              onChange={(e) => setNewCouponCode(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2 text-white uppercase font-mono focus:border-[#d4af37] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-400 mb-1">Discount %</label>
            <input
              type="number"
              value={newCouponDiscount}
              onChange={(e) => setNewCouponDiscount(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-400 mb-1">Min Spend (₹)</label>
            <input
              type="number"
              value={newCouponMinSpend}
              onChange={(e) => setNewCouponMinSpend(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2 font-semibold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#d4af37] px-5 py-2 font-bold uppercase tracking-wider text-black hover:brightness-110"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
