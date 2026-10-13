"use client"

import React, { useState } from "react"
import { Ban } from "lucide-react"
import { AdminOrder } from "../types"

interface CancelOrderModalProps {
  order: AdminOrder | null
  onClose: () => void
  onConfirm: (orderId: string, reason: string) => void
}

export function CancelOrderModal({ order, onClose, onConfirm }: CancelOrderModalProps) {
  const [cancelReasonText, setCancelReasonText] = useState("Patron requested cancellation")

  if (!order) return null

  const handleConfirm = () => {
    onConfirm(order.id, cancelReasonText)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#14171d] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-rose-400">
            <Ban className="h-5 w-5" />
            <h3 className="font-serif text-lg font-bold text-white">Cancel Order #{order.id}</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>

        <p className="text-xs text-zinc-300">
          Are you sure you want to cancel order for <strong className="text-white">{order.customer}</strong>?
          This order has not been dispatched yet and will be safely marked as Cancelled.
        </p>

        <div>
          <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">Reason for Cancellation</label>
          <select
            value={cancelReasonText}
            onChange={(e) => setCancelReasonText(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
          >
            <option value="Patron requested cancellation">Patron requested cancellation</option>
            <option value="Delivery address incomplete / undeliverable">Delivery address incomplete / undeliverable</option>
            <option value="Patron requested size/color change before dispatch">Patron requested size/color change before dispatch</option>
            <option value="Item failed pre-dispatch quality audit">Item failed pre-dispatch quality audit</option>
            <option value="Suspected fraudulent order / unverified COD">Suspected fraudulent order / unverified COD</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
          >
            Keep Order
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-rose-500 shadow-lg"
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  )
}
