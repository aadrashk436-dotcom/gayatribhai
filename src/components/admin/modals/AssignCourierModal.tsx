"use client"

import React, { useState, useEffect } from "react"
import { AdminOrder } from "../types"
import { Truck, Check, Sparkles, RefreshCw } from "lucide-react"

interface CourierOption {
  id: number | string
  courierId?: number | string
  name: string
  rate: number
  rateFormatted: string
  etd: string
  sla: string
  rating?: number
  recommended?: boolean
}

interface AssignCourierModalProps {
  order: AdminOrder | null
  onClose: () => void
  onAssign: (orderId: string, courierName: string, courierId?: number | string) => Promise<void> | void
}

export function AssignCourierModal({ order, onClose, onAssign }: AssignCourierModalProps) {
  const [couriers, setCouriers] = useState<CourierOption[]>([])
  const [selectedCourier, setSelectedCourier] = useState<CourierOption | null>(null)
  const [isLoadingCouriers, setIsLoadingCouriers] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!order) return
    let isMounted = true

    const fetchCouriers = async () => {
      setIsLoadingCouriers(true)
      setErrorNotice(null)
      try {
        const pin = String(order.pincode || "395007").replace(/\D/g, "")
        const isCod =
          order.paymentMethod === "Cash on Delivery" ||
          order.paymentMethod === "COD" ||
          order.paymentStatus === "Pending COD"

        const res = await fetch(
          `/api/shipping/shiprocket/serviceability?pincode=${encodeURIComponent(pin)}&isCod=${isCod}`
        )
        const data = await res.json()

        if (isMounted && data.couriers && Array.isArray(data.couriers) && data.couriers.length > 0) {
          setCouriers(data.couriers)
          // Default select the recommended one or first one
          const rec = data.couriers.find((c: CourierOption) => c.recommended) || data.couriers[0]
          setSelectedCourier(rec)
        } else if (isMounted) {
          // Fallback couriers
          const fallback: CourierOption[] = [
            {
              id: 1,
              courierId: 1,
              name: "Blue Dart Express Air",
              rate: 95,
              rateFormatted: "₹95",
              etd: "24-48 Hours",
              sla: "Next Day Air (24-48 hrs)",
              recommended: true,
            },
            {
              id: 58,
              courierId: 58,
              name: "Shadowfax Surface",
              rate: 55,
              rateFormatted: "₹55",
              etd: "2-3 Days",
              sla: "2-3 Business Days",
              recommended: false,
            },
          ]
          setCouriers(fallback)
          setSelectedCourier(fallback[0])
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorNotice("Using cached courier options")
          const fallback: CourierOption[] = [
            {
              id: 1,
              courierId: 1,
              name: "Blue Dart Express Air",
              rate: 95,
              rateFormatted: "₹95",
              etd: "24-48 Hours",
              sla: "Next Day Air (24-48 hrs)",
              recommended: true,
            },
          ]
          setCouriers(fallback)
          setSelectedCourier(fallback[0])
        }
      } finally {
        if (isMounted) setIsLoadingCouriers(false)
      }
    }

    fetchCouriers()

    return () => {
      isMounted = false
    }
  }, [order])

  if (!order) return null

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      const courierName = selectedCourier?.name || "Shiprocket Express Partner"
      const courierId = selectedCourier?.courierId || selectedCourier?.id
      await onAssign(order.id, courierName, courierId)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
              <Truck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">Assign Shiprocket Courier</h3>
              <p className="text-xs text-zinc-400">
                Order #{order.orderNumber || order.id} • {order.customer}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">✕</button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-300">
              Live Shiprocket Couriers for PIN <strong className="text-[#d4af37]">{order.pincode}</strong> ({order.city}):
            </p>
            {isLoadingCouriers && (
              <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                <RefreshCw className="h-3 w-3 animate-spin text-[#d4af37]" />
                Checking live rates...
              </span>
            )}
          </div>

          {errorNotice && (
            <p className="text-[11px] text-amber-400 italic">{errorNotice}</p>
          )}

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {couriers.map((c) => {
              const isSelected = selectedCourier?.id === c.id || selectedCourier?.name === c.name
              return (
                <label
                  key={c.id || c.name}
                  onClick={() => setSelectedCourier(c)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? "border-[#d4af37] bg-[#d4af37]/10 shadow-sm"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="courier"
                      checked={isSelected}
                      onChange={() => setSelectedCourier(c)}
                      className="accent-[#d4af37] h-4 w-4"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white">
                          {c.name}
                        </p>
                        {c.recommended && (
                          <span className="flex items-center gap-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] px-2 py-0.2 text-[9px] font-bold">
                            <Sparkles className="h-2.5 w-2.5" />
                            Fastest / Best
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{c.sla || c.etd}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-emerald-400">{c.rateFormatted}</span>
                    {c.rating && (
                      <p className="text-[10px] text-zinc-400">⭐ {c.rating}/5</p>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-3 text-[11px] text-zinc-400 space-y-1">
          <p className="font-semibold text-zinc-300">Registered Atelier Warehouse (Pickup):</p>
          <p className="text-zinc-400">Gayatri Bhai Atelier • Shop No 12, Ring Road Textile Market, Surat, Gujarat 395002</p>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || !selectedCourier}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-5 py-2 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 shadow-lg disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="size-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Booking Shiprocket...</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Generate AWB & Book</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
