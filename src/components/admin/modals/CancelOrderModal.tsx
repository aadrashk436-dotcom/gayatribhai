"use client"

import React, { useState } from "react"
import { Ban, AlertTriangle, CheckCircle2 } from "lucide-react"
import { AdminOrder } from "../types"

interface CancelOrderModalProps {
  order: AdminOrder | null
  onClose: () => void
  onConfirm: (orderId: string, reason: string) => Promise<void> | void
  onCancelShipmentOnly?: (orderId: string, reason?: string) => Promise<void> | void
}

export function CancelOrderModal({ order, onClose, onConfirm, onCancelShipmentOnly }: CancelOrderModalProps) {
  const [cancelReasonText, setCancelReasonText] = useState("Patron requested cancellation")
  const [customReason, setCustomReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittingAction, setSubmittingAction] = useState<"all" | "shipmentOnly" | null>(null)

  if (!order) return null

  const getReason = () =>
    cancelReasonText === "Other custom reason"
      ? customReason || "Cancelled by Store Admin"
      : cancelReasonText

  const handleConfirmFull = async () => {
    setIsSubmitting(true)
    setSubmittingAction("all")
    try {
      await onConfirm(order.id, getReason())
      onClose()
    } catch {
      // Handled by parent
    } finally {
      setIsSubmitting(false)
      setSubmittingAction(null)
    }
  }

  const handleConfirmShipmentOnly = async () => {
    if (!onCancelShipmentOnly) return
    setIsSubmitting(true)
    setSubmittingAction("shipmentOnly")
    try {
      await onCancelShipmentOnly(order.id, getReason())
      onClose()
    } catch {
      // Handled by parent
    } finally {
      setIsSubmitting(false)
      setSubmittingAction(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#14171d] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5 text-rose-400">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 border border-rose-500/40">
              <Ban className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                {order.awb ? `Cancel Shipment / Order #${order.id}` : `Cancel Order #${order.id}`}
              </h3>
              <p className="text-xs text-zinc-400">{order.customer}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="text-zinc-400 hover:text-white transition cursor-pointer">✕</button>
        </div>

        {order.awb ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-rose-300 font-bold">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Active Shiprocket Shipment (AWB: #{order.awb})</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              You can cancel <strong className="text-white">only the courier shipment</strong> to re-assign a new courier, or cancel <strong className="text-rose-400 font-bold">both order & shipment</strong>.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-zinc-300">
            Are you sure you want to cancel the order for <strong className="text-white">{order.customer}</strong>? This unfulfilled order will be marked as <strong className="text-rose-400">Cancelled</strong>.
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-zinc-400">Reason for Cancellation</label>
          <select
            value={cancelReasonText}
            onChange={(e) => setCancelReasonText(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
          >
            <option value="Patron requested cancellation">Patron requested cancellation</option>
            <option value="Delivery address incomplete / undeliverable">Delivery address incomplete / undeliverable</option>
            <option value="Patron requested size/color change before dispatch">Patron requested size/color change before dispatch</option>
            <option value="Item failed pre-dispatch quality audit">Item failed pre-dispatch quality audit</option>
            <option value="Suspected fraudulent order / unverified COD">Suspected fraudulent order / unverified COD</option>
            <option value="Shipment cancelled by Admin via Shiprocket">Shipment cancelled by Admin via Shiprocket</option>
            <option value="Other custom reason">Other custom reason...</option>
          </select>

          {cancelReasonText === "Other custom reason" && (
            <input
              type="text"
              placeholder="Enter custom cancellation reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none mt-2"
            />
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-50 cursor-pointer"
          >
            Keep Order
          </button>

          {order.awb && onCancelShipmentOnly && (
            <button
              onClick={handleConfirmShipmentOnly}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500 hover:text-black px-4 py-2 text-xs font-bold text-amber-300 disabled:opacity-50 cursor-pointer transition shadow"
              title="Cancel only the AWB shipment and retain order for re-assigning"
            >
              {submittingAction === "shipmentOnly" ? (
                <>
                  <span className="size-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>Cancelling AWB...</span>
                </>
              ) : (
                <span>Cancel Shipment Only</span>
              )}
            </button>
          )}

          <button
            onClick={handleConfirmFull}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg disabled:opacity-60 cursor-pointer transition"
          >
            {submittingAction === "all" ? (
              <>
                <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Cancelling Order...</span>
              </>
            ) : (
              <span>{order.awb ? "Cancel Entire Order" : "Confirm Cancellation"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
