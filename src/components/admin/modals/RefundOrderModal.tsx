"use client"

import React, { useState } from "react"
import { RefreshCw, AlertTriangle, ShieldCheck, CheckCircle2, IndianRupee } from "lucide-react"
import { AdminOrder, formatINR } from "../types"

interface RefundOrderModalProps {
  order: AdminOrder | null
  onClose: () => void
  onConfirmRefund: (orderId: string, amount: number, reason: string) => Promise<void> | void
}

export function RefundOrderModal({ order, onClose, onConfirmRefund }: RefundOrderModalProps) {
  const [amount, setAmount] = useState<number>(() => {
    if (!order) return 0
    return order.total > 10000 ? Math.round(order.total / 100) : order.total
  })
  const [reasonPreset, setReasonPreset] = useState("Customer requested cancellation")
  const [customReason, setCustomReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!order) return null

  const maxAmount = order.total > 10000 ? Math.round(order.total / 100) : order.total
  const paymentId = order.razorpayPaymentId || order.paymentId || "N/A"

  const handleExecute = async () => {
    const finalReason = reasonPreset === "Custom reason" ? customReason || "Admin authorized refund" : reasonPreset
    setIsSubmitting(true)
    try {
      await onConfirmRefund(order.id, amount, finalReason)
      onClose()
    } catch {
      // Handled by parent
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-[#d4af37]/30 bg-[#14171d] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5 text-[#d4af37]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                Refund Order #{order.id}
              </h3>
              <p className="text-xs text-zinc-400">Direct Razorpay Gateway Settlement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-zinc-400 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Order Summary Card */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Patron:</span>
            <strong className="text-white font-semibold">{order.customer}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Payment ID:</span>
            <code className="text-[#d4af37] font-mono text-[11px] bg-black/30 px-1.5 py-0.5 rounded">
              {paymentId}
            </code>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Original Total:</span>
            <span className="text-white font-mono font-bold text-sm">{formatINR(maxAmount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Current Status:</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {order.paymentStatus} • {order.status}
            </span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-zinc-300">
            Refund Amount (₹)
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4af37]" />
            <input
              type="number"
              min={1}
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(Math.min(maxAmount, Math.max(1, Number(e.target.value) || 0)))}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-white/10 bg-[#0d0f12] pl-10 pr-4 py-2.5 text-sm font-mono text-white focus:border-[#d4af37] focus:outline-none"
            />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-400">
            <span>Minimum: ₹1</span>
            <button
              type="button"
              onClick={() => setAmount(maxAmount)}
              className="text-[#d4af37] hover:underline cursor-pointer"
            >
              Set Full Amount ({formatINR(maxAmount)})
            </button>
          </div>
        </div>

        {/* Reason Selection */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-zinc-300">
            Refund Reason Code
          </label>
          <select
            value={reasonPreset}
            onChange={(e) => setReasonPreset(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
          >
            <option value="Customer requested cancellation">Customer requested cancellation</option>
            <option value="Pre-dispatch quality audit failed">Pre-dispatch quality audit failed</option>
            <option value="Garment size or silhouette unavailable">Garment size or silhouette unavailable</option>
            <option value="Courier undeliverable / RTO reconciliation">Courier undeliverable / RTO reconciliation</option>
            <option value="Accidental duplicate checkout">Accidental duplicate checkout</option>
            <option value="Custom reason">Custom reason...</option>
          </select>

          {reasonPreset === "Custom reason" && (
            <input
              type="text"
              placeholder="Enter custom reason for audit logs..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none mt-2"
            />
          )}
        </div>

        {/* Informational Policy Banner */}
        <div className="rounded-xl border border-[#d4af37]/25 bg-[#d4af37]/5 p-3 text-[11px] text-zinc-300 flex items-start gap-2 leading-relaxed">
          <ShieldCheck className="h-4 w-4 text-[#d4af37] shrink-0 mt-0.5" />
          <span>
            Refund will be processed directly through the <strong className="text-white">Razorpay Payment Gateway API</strong> to the customer&apos;s original payment method (UPI / Cards / Net Banking) within standard banking timelines.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            disabled={isSubmitting || amount <= 0}
            className="flex items-center gap-2 rounded-xl bg-[#d4af37] hover:brightness-110 px-5 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-lg cursor-pointer disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <>
                <span className="size-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Processing Refund...</span>
              </>
            ) : (
              <span>Execute Refund ({formatINR(amount)})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
