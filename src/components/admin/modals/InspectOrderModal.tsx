"use client"

import React from "react"
import Image from "next/image"
import { X, Phone, Mail, MapPin, CheckCircle2, ShieldCheck, Truck, Ban, Printer, AlertTriangle } from "lucide-react"
import { AdminOrder, formatINR } from "../types"

interface InspectOrderModalProps {
  order: AdminOrder | null
  onClose: () => void
  onVerify: (orderId: string) => void
  onOpenAssignCourier: (order: AdminOrder) => void
  onOpenCancelOrder: (order: AdminOrder) => void
  onMarkDispatched?: (orderId: string) => void
  onMarkDelivered?: (orderId: string) => void
  showToast: (msg: string) => void
}

export function InspectOrderModal({
  order,
  onClose,
  onVerify,
  onOpenAssignCourier,
  onOpenCancelOrder,
  onMarkDispatched,
  onMarkDelivered,
  showToast,
}: InspectOrderModalProps) {
  if (!order) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-serif text-xl font-bold text-white">Order #{order.id}</h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  order.status === "Delivered"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : order.status === "Assigned to Courier" || order.status === "Dispatched"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : order.status === "Verified"
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    : order.status === "Cancelled"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">Placed on {order.date} • Luxury Micro-Batch Fulfillment</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Customer & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Patron Details</p>
            <p className="text-sm font-bold text-white">{order.customer}</p>
            <p className="text-xs text-zinc-300 flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-[#d4af37]" />
              <a href={`tel:${order.phone}`} className="hover:underline">{order.phone}</a>
            </p>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-zinc-400" />
              <a href={`mailto:${order.email}`} className="hover:underline">{order.email}</a>
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Delivery Address</p>
            <p className="text-xs text-zinc-200 leading-relaxed font-medium">
              {order.address}
            </p>
            <p className="text-xs text-white font-semibold flex items-center gap-1.5 mt-1">
              <MapPin className="h-3.5 w-3.5 text-[#d4af37]" />
              {order.city} — PIN {order.pincode}
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Shiprocket Serviceable PIN
            </span>
          </div>
        </div>

        {/* Ordered Shirts Breakdown (All Items) */}
        {(() => {
          const modalItems = Array.isArray(order.items) && order.items.length > 0
            ? order.items
            : [
                {
                  productId: order.id,
                  name: order.shirtName,
                  sku: order.sku,
                  size: order.size,
                  quantity: order.qty || 1,
                  price: order.price,
                  image: order.image,
                  color: "Exclusive",
                },
              ]

          const totalItemsQty = modalItems.reduce((acc, it) => acc + (it.quantity || 1), 0)

          return (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Ordered Garments ({modalItems.length} {modalItems.length === 1 ? "design" : "designs"} • {totalItemsQty} total {totalItemsQty === 1 ? "pc" : "pcs"})
                </p>
                <span className="text-[10px] text-[#d4af37] font-semibold">Micro-Batch Atelier</span>
              </div>

              <div className="divide-y divide-white/5 space-y-2.5">
                {modalItems.map((item, idx) => (
                  <div key={`${item.id || item.productId || idx}-${idx}`} className="flex items-center justify-between gap-4 pt-2.5 first:pt-0">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-black border border-white/10">
                        <Image
                          src={item.image || order.image || "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg"}
                          alt={item.name || order.shirtName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-serif text-sm font-bold text-white">{item.name || order.shirtName}</p>
                        <p className="text-[10px] font-mono text-zinc-400">SKU: {item.sku || order.sku}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-200">
                            Size: {item.size || order.size}
                          </span>
                          <span className="text-[10px] text-zinc-400">Qty: {item.quantity || 1}</span>
                          {item.color && <span className="text-[10px] text-zinc-400">• {item.color}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-base font-bold text-white">{formatINR((item.price || order.price) * (item.quantity || 1))}</p>
                      <p className="text-[10px] text-zinc-400">{item.quantity || 1} × {formatINR(item.price || order.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Financials */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Grand Total (incl. Taxes & Shipping)</span>
                <span className="font-serif text-base font-bold text-[#d4af37]">{formatINR(order.total)}</span>
              </div>
            </div>
          )
        })()}

        {/* Payment & Logistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Payment Information</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-300">{order.paymentMethod}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  order.paymentStatus === "Paid"
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                    : "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 mt-1">ID: {order.paymentId}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Shiprocket Logistics</p>
            {order.awb ? (
              <div>
                <p className="text-xs font-bold text-white">{order.courier}</p>
                <p className="text-[10px] font-mono text-[#d4af37]">AWB: {order.awb}</p>
                <p className="text-[10px] text-emerald-400 font-semibold mt-1">Pickup Scheduled & Tracking Active</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  No Courier Assigned Yet
                </p>
                <p className="text-[10px] text-zinc-400 mt-1">
                  {order.status === "Pending Verification"
                    ? "Requires Admin verification before shipping."
                    : "Verified & ready to assign courier."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            {order.status === "Pending Verification" && (
              <button
                onClick={() => onVerify(order.id)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 shadow-lg"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verify & Approve</span>
              </button>
            )}

            {order.status === "Verified" && !order.awb && (
              <button
                onClick={() => {
                  onClose()
                  onOpenAssignCourier(order)
                }}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-500 shadow-lg"
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Assign Shiprocket</span>
              </button>
            )}

            {order.status === "Assigned to Courier" && onMarkDispatched && (
              <button
                onClick={() => onMarkDispatched(order.id)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 shadow-lg"
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Mark In Transit</span>
              </button>
            )}

            {(order.status === "Assigned to Courier" || order.status === "Dispatched") && onMarkDelivered && (
              <button
                onClick={() => onMarkDelivered(order.id)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-500 shadow-lg"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mark Delivered</span>
              </button>
            )}

            {!order.awb &&
              order.status !== "Assigned to Courier" &&
              order.status !== "Dispatched" &&
              order.status !== "Delivered" &&
              order.status !== "Cancelled" && (
                <button
                  onClick={() => {
                    onClose()
                    onOpenCancelOrder(order)
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition"
                >
                  <Ban className="h-3.5 w-3.5" />
                  <span>Cancel Order</span>
                </button>
              )}
          </div>

          <button
            onClick={() => {
              showToast(`Generating packing slip for Order #${order.id}...`)
              window.print()
            }}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Slip</span>
          </button>
        </div>
      </div>
    </div>
  )
}
