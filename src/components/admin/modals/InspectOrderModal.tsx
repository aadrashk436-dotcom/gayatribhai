"use client"

import React from "react"
import Image from "next/image"
import {
  X,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Ban,
  Printer,
  AlertTriangle,
  FileText,
  Receipt,
  Activity,
  RotateCcw,
  Copy,
} from "lucide-react"
import { AdminOrder, formatINR } from "../types"

interface InspectOrderModalProps {
  order: AdminOrder | null
  onClose: () => void
  onVerify: (orderId: string) => void
  onOpenAssignCourier: (order: AdminOrder) => void
  onOpenCancelOrder: (order: AdminOrder) => void
  onCancelShipmentOnly?: (orderId: string) => void
  onRefund?: (orderId: string, amount?: number) => void
  onMarkDispatched?: (orderId: string) => void
  onMarkDelivered?: (orderId: string) => void
  onDownloadLabel?: (orderId: string, shipmentId?: string | number) => void
  onDownloadInvoice?: (orderId: string, shiprocketOrderId?: string | number) => void
  onTrackLive?: (orderId: string) => void
  showToast: (msg: string) => void
}

export function InspectOrderModal({
  order,
  onClose,
  onVerify,
  onOpenAssignCourier,
  onOpenCancelOrder,
  onCancelShipmentOnly,
  onRefund,
  onMarkDispatched,
  onMarkDelivered,
  onDownloadLabel,
  onDownloadInvoice,
  onTrackLive,
  showToast,
}: InspectOrderModalProps) {
  if (!order) return null

  const isPrepaid =
    order.paymentMethod?.includes("Razorpay") ||
    order.paymentMethod?.includes("Online") ||
    order.paymentStatus === "Paid" ||
    order.paymentStatus === "Refund Pending" ||
    Boolean(order.razorpayPaymentId)

  const canRefund =
    isPrepaid &&
    order.paymentStatus !== "Refunded" &&
    (order.status === "Cancelled" || order.paymentStatus === "Refund Pending" || order.paymentStatus === "Paid")

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl my-auto max-h-[92vh] flex flex-col rounded-2xl border border-white/10 bg-[#14171d] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Sticky Top Header: ALWAYS completely visible, never cut off! */}
        <div className="shrink-0 flex items-center justify-between border-b border-white/10 px-5 sm:px-6 py-4 bg-[#111419]/95 backdrop-blur z-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white">Order #{order.id}</h3>
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
              {order.paymentStatus === "Refunded" && (
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold">
                  Refunded
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1">Placed on {order.date} • Luxury Micro-Batch Fulfillment</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close inspection"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Modal Body: smoothly scrolls, never cuts off header or footer! */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
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
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Payment Information</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">{order.paymentMethod}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    order.paymentStatus === "Paid"
                      ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                      : order.paymentStatus === "Refunded"
                      ? "bg-blue-500/15 border border-blue-500/30 text-blue-400"
                      : order.paymentStatus === "Refund Pending"
                      ? "bg-rose-500/15 border border-rose-500/30 text-rose-400"
                      : "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>

              {/* Razorpay Payment ID with 1-Click Copy */}
              {(order.razorpayPaymentId || order.paymentId) && (
                <div className="flex items-center justify-between gap-2 text-xs bg-indigo-950/40 p-2 rounded-lg border border-indigo-500/20">
                  <span className="text-indigo-300 font-bold text-[10px]">Payment ID:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-indigo-200">
                    <span className="select-all text-[10px] truncate max-w-[150px]">
                      {order.razorpayPaymentId || order.paymentId}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const idToCopy = order.razorpayPaymentId || order.paymentId || ""
                        navigator.clipboard.writeText(idToCopy)
                        showToast(`Copied Payment ID: ${idToCopy}`)
                      }}
                      className="text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer transition"
                      title="Copy Payment ID"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Razorpay Order ID */}
              {order.razorpayOrderId && (
                <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1 font-mono">
                  <span>Razorpay Order ID:</span>
                  <span className="text-zinc-300 select-all truncate max-w-[150px]">{order.razorpayOrderId}</span>
                </div>
              )}

              {/* Razorpay Refund ID Display (Triotech exact luxury styling) */}
              {order.refundId && (
                <div className="mt-2.5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-rose-400">
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                      Razorpay Refund Issued
                    </span>
                    <span className="text-[10px] text-rose-300 font-bold bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                      Refunded
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs font-mono bg-[#0d0f12] px-2.5 py-1.5 rounded-lg border border-rose-500/30">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-zinc-400 text-[10px]">Refund ID:</span>
                      <span className="font-bold text-rose-200 select-all truncate text-[11px]">
                        {order.refundId}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(order.refundId!)
                        showToast(`Copied Refund ID: ${order.refundId}`)
                      }}
                      className="text-zinc-400 hover:text-rose-200 p-1 hover:bg-rose-500/10 rounded transition-colors shrink-0 cursor-pointer"
                      title="Copy Razorpay Refund ID"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {order.refundAmount && (
                    <div className="flex items-center justify-between text-[11px] px-1 font-semibold text-rose-300">
                      <span>Amount Refunded:</span>
                      <span>{formatINR(order.refundAmount)}</span>
                    </div>
                  )}
                  {order.refundReason && (
                    <p className="text-[10px] text-zinc-400 italic px-1">
                      Reason: {order.refundReason}
                    </p>
                  )}
                  {order.refundedAt && (
                    <p className="text-[9px] text-zinc-500 px-1">
                      Processed: {new Date(order.refundedAt).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              )}

              {/* Warning box if Cancelled and Paid, but NOT refunded yet */}
              {order.status === "Cancelled" && (order.razorpayPaymentId || order.paymentMethod?.includes("Razorpay") || order.paymentMethod?.includes("Online")) && order.paymentStatus !== "Refunded" && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>Refund Pending</span>
                  </div>
                  <p className="text-[10px] text-amber-200/90 leading-tight">
                    Order is cancelled. Razorpay online payment has not been refunded yet. Use the refund button below to authorize live payout.
                  </p>
                </div>
              )}
            </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Shiprocket Logistics</p>
            {order.awb ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white">{order.courier || "Shiprocket Express"}</p>
                  <span className="rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold">
                    AWB: {order.awb}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Live Tracking Active
                    </p>
                    {order.etd && (
                      <span className="text-[10px] text-zinc-400">
                        Est: <strong className="text-zinc-200">{order.etd}</strong>
                      </span>
                    )}
                  </div>
                  {order.shiprocketStatus && (
                    <div className="flex items-center gap-1.5 bg-sky-950/60 border border-sky-500/30 px-2 py-1 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                      <span className="text-[10px] font-mono font-bold text-sky-300 uppercase">
                        Shiprocket: {order.shiprocketStatus}
                      </span>
                    </div>
                  )}
                  {order.currentStatusText && order.currentStatusText !== order.shiprocketStatus && (
                    <p className="text-[10px] text-zinc-300 italic px-1">
                      {order.currentStatusText}
                    </p>
                  )}
                </div>

                {/* Official Shiprocket Downloads: STRICTLY visible only when AWB is assigned */}
                <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2">
                  {onDownloadLabel && (
                    <button
                      onClick={() => onDownloadLabel(order.id, order.shiprocket_shipment_id || undefined)}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition shadow"
                      title="Download official Shiprocket shipping label (PDF)"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Download Label (PDF)</span>
                    </button>
                  )}

                  {onDownloadInvoice && (
                    <button
                      onClick={() => onDownloadInvoice(order.id, order.shiprocket_order_id || undefined)}
                      className="flex items-center gap-1.5 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 px-3 py-1.5 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition shadow"
                      title="Download official Shiprocket tax invoice (PDF)"
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      <span>Download Invoice (PDF)</span>
                    </button>
                  )}

                  {onTrackLive && (
                    <button
                      onClick={() => onTrackLive(order.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 px-3 py-1.5 text-xs font-bold text-blue-300 hover:bg-blue-600 hover:text-white transition shadow"
                      title="Sync live status from Shiprocket API"
                    >
                      <Activity className="h-3.5 w-3.5" />
                      <span>Sync Live Status</span>
                    </button>
                  )}
                </div>
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
                <p className="text-[10px] text-zinc-500 italic mt-1.5">
                  ℹ️ Shipping label & tax invoice become available for download once assigned to Shiprocket with an AWB.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Sticky Bottom Actions Footer: ALWAYS visible, never cut off! */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 sm:px-6 py-3.5 bg-[#111419]/95 backdrop-blur z-10">
          <div className="flex flex-wrap items-center gap-2">
            {order.status === "Pending Verification" && (
              <button
                onClick={() => onVerify(order.id)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 shadow-lg"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verify & Approve</span>
              </button>
            )}

            {!order.awb && order.status !== "Cancelled" && order.status !== "Delivered" && (
              <button
                onClick={() => {
                  onClose()
                  onOpenAssignCourier(order)
                }}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-500 shadow-lg cursor-pointer"
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Assign Shiprocket</span>
              </button>
            )}

            {order.awb && order.status !== "Cancelled" && order.status !== "Delivered" && (
              <button
                onClick={() => {
                  onClose()
                  onOpenAssignCourier(order)
                }}
                className="flex items-center gap-1.5 rounded-xl border border-blue-500/40 bg-blue-500/10 px-3.5 py-2 text-xs font-bold text-blue-300 hover:bg-blue-500 hover:text-white shadow-lg cursor-pointer transition"
                title={`Re-assign courier or change carrier from ${order.courier || "current courier"}`}
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Re-assign Courier</span>
              </button>
            )}

            {order.status === "Assigned to Courier" && onMarkDispatched && (
              <button
                onClick={() => onMarkDispatched(order.id)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 shadow-lg cursor-pointer"
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Mark In Transit</span>
              </button>
            )}

            {(order.status === "Assigned to Courier" || order.status === "Dispatched") && onMarkDelivered && (
              <button
                onClick={() => onMarkDelivered(order.id)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-500 shadow-lg cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mark Delivered</span>
              </button>
            )}

            {/* Cancel Shipment Only: Allows resetting AWB without cancelling the patron's order */}
            {Boolean((order.awb && order.awb !== "null" && String(order.awb).length > 3) || order.shiprocket_shipment_id || order.status === "Assigned to Courier") && order.status !== "Delivered" && onCancelShipmentOnly && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      `Are you sure you want to cancel the shipment for Order #${order.orderNumber || order.id} in Shiprocket? Courier AWB #${order.awb || ""} will be cancelled and order will return to Verified status.`
                    )
                  ) {
                    onCancelShipmentOnly(order.id)
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-black transition cursor-pointer"
                title="Cancel only the Shiprocket AWB shipment so you can re-assign a new courier"
              >
                <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                <span>Cancel Shipment</span>
              </button>
            )}

            {/* Cancel Order button: Available until delivered */}
            {order.status !== "Delivered" && order.status !== "Cancelled" && (
              <button
                onClick={() => {
                  onClose()
                  onOpenCancelOrder(order)
                }}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition cursor-pointer"
                title={
                  order.awb
                    ? "Cancel courier shipment on Shiprocket and mark order as Cancelled"
                    : "Cancel order"
                }
              >
                <Ban className="h-3.5 w-3.5" />
                <span>{order.awb ? "Cancel Shipment & Order" : "Cancel Order"}</span>
              </button>
            )}

            {/* Live Razorpay Gateway Refund Trigger */}
            {canRefund && onRefund && (
              <button
                onClick={() => onRefund(order.id, order.total)}
                className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] text-black px-4 py-2 text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-lg cursor-pointer transition"
                title="Execute direct refund via Razorpay gateway"
              >
                <span>💳 Refund {formatINR(order.total)} via Razorpay</span>
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
