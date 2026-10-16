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
  RefreshCw,
  Copy,
  ChevronLeft,
  ChevronRight,
  Package,
  Lock,
  ArrowRight,
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

  const pipelineScrollRef = React.useRef<HTMLDivElement>(null)
  const [isSyncingLive, setIsSyncingLive] = React.useState(false)
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false)
  const [currentStatus, setCurrentStatus] = React.useState<string>(order.status || "Pending Verification")
  const [isVerified, setIsVerified] = React.useState<boolean>(
    order.status !== "Pending Verification" || Boolean(order.verified)
  )
  const [liveCheckpoint, setLiveCheckpoint] = React.useState<string | null>(order.currentStatusText || null)
  const [liveSRStatus, setLiveSRStatus] = React.useState<string | null>(order.shiprocketStatus || null)

  React.useEffect(() => {
    setCurrentStatus(order.status || "Pending Verification")
    setIsVerified(order.status !== "Pending Verification" || Boolean(order.verified))
    setLiveSRStatus(order.shiprocketStatus || null)
    setLiveCheckpoint(order.currentStatusText || null)
  }, [order.status, order.verified, order.shiprocketStatus, order.currentStatusText, order.id])

  const effectiveStatus = currentStatus || order.status
  const isPendingVerification = !isVerified && effectiveStatus === "Pending Verification"

  const scrollPipeline = (direction: "left" | "right") => {
    if (pipelineScrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280
      pipelineScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  const handleVerify = async () => {
    if (isVerifying) return
    setIsVerifying(true)
    // Instant optimistic update so UI immediately reflects approval
    setCurrentStatus("Verified")
    setIsVerified(true)
    try {
      await onVerify(order.id)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleManualStatusChange = async (newStatus: "Verified" | "Assigned to Courier" | "Dispatched" | "Delivered") => {
    if (isUpdatingStatus) return
    setIsUpdatingStatus(true)
    setCurrentStatus(newStatus)
    if (newStatus === "Verified") {
      setIsVerified(true)
    }

    try {
      if (newStatus === "Verified") {
        await onVerify(order.id)
        return
      }
      if (newStatus === "Dispatched" && onMarkDispatched) {
        onMarkDispatched(order.id)
        return
      }
      if (newStatus === "Delivered" && onMarkDelivered) {
        onMarkDelivered(order.id)
        return
      }

      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, status: newStatus }),
      })
      if (res.ok) {
        showToast(`Status updated to ${newStatus}`)
        localStorage.setItem("gb_orders_last_updated", String(Date.now()))
        window.dispatchEvent(new Event("gb-orders-updated"))
      }
    } catch {
      showToast("Failed to update status on server")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleSyncLive = async () => {
    setIsSyncingLive(true)
    try {
      const res = await fetch(`/api/shipping/shiprocket/track?orderId=${encodeURIComponent(order.id)}`)
      const data = await res.json()
      if (res.ok && data.success) {
        setLiveCheckpoint(data.currentStatusText || data.status)
        if (data.shiprocketStatus) {
          setLiveSRStatus(data.shiprocketStatus)
        } else if (data.trackingData?.current_status) {
          setLiveSRStatus(data.trackingData.current_status)
        }
        if (data.status) {
          setCurrentStatus(data.status)
          if (data.status !== "Pending Verification") {
            setIsVerified(true)
          }
        }
        showToast(`Live status synced: ${data.shiprocketStatus || data.currentStatusText || data.status}`)
        if (onTrackLive) onTrackLive(order.id)
      } else {
        showToast(data.error || "Unable to sync live status")
      }
    } catch {
      showToast("Error connecting to Shiprocket")
    } finally {
      setIsSyncingLive(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl my-auto max-h-[92vh] flex flex-col rounded-2xl border border-white/10 bg-[#14171d] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Sticky Top Header: ALWAYS completely visible, never cut off! */}
        <div className="shrink-0 flex items-center justify-between border-b border-white/10 px-5 sm:px-6 py-4 bg-[#111419]/95 backdrop-blur z-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white">Order #{order.id}</h3>
              {(liveSRStatus || order.shiprocketStatus) ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 px-3 py-0.5 text-xs font-bold shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  <Truck className="h-3 w-3 text-sky-400" />
                  <span>{liveSRStatus || order.shiprocketStatus}</span>
                </span>
              ) : (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${effectiveStatus === "Delivered"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : effectiveStatus === "Assigned to Courier" || effectiveStatus === "Dispatched"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : effectiveStatus === "Verified"
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        : effectiveStatus === "Cancelled"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                >
                  {effectiveStatus}
                </span>
              )}
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
          {/* Prominent Current Status & Logistics Activity Card */}
          <div className="rounded-xl border border-[#d4af37]/30 bg-gradient-to-r from-[#d4af37]/[0.08] via-white/[0.03] to-transparent p-4 sm:p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-[#d4af37]" />
                  Order Current Status:
                </span>
                {(liveSRStatus || order.shiprocketStatus) ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm bg-sky-500/20 text-sky-400 border border-sky-500/40">
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                      <Truck className="h-3.5 w-3.5 text-sky-400" />
                      <span>{liveSRStatus || order.shiprocketStatus}</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      (Shiprocket Live)
                    </span>
                  </div>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${effectiveStatus === "Delivered"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : effectiveStatus === "Dispatched" || effectiveStatus === "Assigned to Courier"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                        : effectiveStatus === "Verified"
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                          : effectiveStatus === "Cancelled"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    {effectiveStatus}
                  </span>
                )}
              </div>

              {order.awb && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSyncLive}
                    disabled={isSyncingLive}
                    className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 transition cursor-pointer disabled:opacity-50"
                    title="Refresh real-time tracking from Shiprocket"
                  >
                    <RotateCcw className={`h-3 w-3 text-[#d4af37] ${isSyncingLive ? "animate-spin" : ""}`} />
                    <span>{isSyncingLive ? "Syncing..." : "Sync Live Status"}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <p className="text-zinc-200 font-medium leading-relaxed">
                  {liveCheckpoint || order.currentStatusText || (
                    effectiveStatus === "Delivered"
                      ? "Order has been successfully delivered and accepted."
                      : effectiveStatus === "Dispatched"
                        ? "Consignment is in transit with courier delivery partner."
                        : effectiveStatus === "Assigned to Courier"
                          ? "AWB generated and shipment booked for courier pickup."
                          : effectiveStatus === "Verified"
                            ? "Order verified by admin and prepared for courier dispatch."
                            : effectiveStatus === "Cancelled"
                              ? `Order cancelled. Reason: ${order.cancelReason || "Cancelled by store"}`
                              : "Order placed and awaiting atelier admin approval."
                  )}
                </p>
                {order.etd && (
                  <p className="text-[11px] text-zinc-400">
                    Estimated Delivery: <strong className="text-white">{order.etd}</strong>
                  </p>
                )}
              </div>

              {order.awb && (
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg shrink-0">
                  <span className="text-[11px] text-zinc-400 font-medium">{order.courier || order.courierName || "Courier"}:</span>
                  <span className="font-mono text-xs font-bold text-[#d4af37]">{order.awb}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(String(order.awb))
                      showToast(`Copied AWB #${order.awb}`)
                    }}
                    className="text-zinc-400 hover:text-white p-0.5 cursor-pointer transition"
                    title="Copy AWB Number"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Fulfillment Lifecycle Stepper: Clean & Unique Left-Right Scroll Carousel */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/30 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3.5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-[#d4af37]" />
                    Order Fulfillment Lifecycle
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                    (Horizontal Pipeline Track)
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Swipe or use arrows to navigate through fulfillment lifecycle stages
                </p>
              </div>

              {/* Left / Right Carousel Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => scrollPipeline("left")}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-95 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
                  title="Scroll Left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollPipeline("right")}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-95 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
                  title="Scroll Right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Snap Scroll Container */}
            <div
              ref={pipelineScrollRef}
              className="flex items-stretch gap-3 overflow-x-auto admin-scroll snap-x snap-mandatory pb-3 pt-1 px-1 scroll-smooth"
            >
              {/* STAGE 1: ORDER PLACED */}
              <div className="min-w-[240px] sm:min-w-[260px] max-w-[270px] shrink-0 snap-start rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-3.5 flex flex-col justify-between shadow-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                      <CheckCircle2 className="h-3 w-3" /> Step 1 • Placed
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">100%</span>
                  </div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-emerald-400" />
                    Order Placed
                  </h4>
                  <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                    Captured on {order.date || "Atelier store"}. Total: <strong className="text-white">{formatINR(order.total)}</strong>
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Payment: <span className="text-zinc-200">{order.paymentMethod || "Online"}</span> ({order.paymentStatus || "Captured"})
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-medium">✓ Order Confirmed</span>
                  <span className="text-zinc-400">{order.items?.length || 1} {order.items?.length === 1 ? "shirt" : "shirts"}</span>
                </div>
              </div>

              {/* STAGE 2: ATELIER VERIFICATION */}
              <div
                className={`min-w-[240px] sm:min-w-[260px] max-w-[270px] shrink-0 snap-start rounded-xl border p-3.5 flex flex-col justify-between shadow-md relative overflow-hidden group ${
                  isVerified || effectiveStatus !== "Pending Verification"
                    ? "border-purple-500/40 bg-purple-950/15"
                    : "border-amber-500/50 bg-amber-950/20 ring-1 ring-amber-500/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isVerified || effectiveStatus !== "Pending Verification"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse"
                      }`}
                    >
                      <ShieldCheck className="h-3 w-3" />
                      {isVerified || effectiveStatus !== "Pending Verification" ? "Step 2 • Verified" : "Step 2 • Action Required"}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {isVerified || effectiveStatus !== "Pending Verification" ? "Done" : "Pending"}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className={`h-3.5 w-3.5 ${isVerified || effectiveStatus !== "Pending Verification" ? "text-purple-400" : "text-amber-400"}`} />
                    Admin Quality Check
                  </h4>
                  <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                    {isVerified || effectiveStatus !== "Pending Verification"
                      ? "Patron details & inventory reserved. Approved for courier dispatch."
                      : "Sanity check on phone, address and micro-batch stock."}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Phone: <span className="font-mono text-zinc-200">{order.phone}</span>
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10">
                  {isVerified || effectiveStatus !== "Pending Verification" ? (
                    <div className="flex items-center justify-between text-[10px] text-purple-300 font-medium">
                      <span>✓ Approved by Admin</span>
                      <span className="text-[9px] text-zinc-400">Ready for Shiprocket</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={isVerifying}
                      className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#c59d28] hover:brightness-110 active:scale-95 text-black font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>Approving...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-3 w-3" />
                          <span>Approve & Verify</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* STAGE 3: SHIPROCKET LOGISTICS & AWB */}
              <div
                className={`min-w-[240px] sm:min-w-[260px] max-w-[270px] shrink-0 snap-start rounded-xl border p-3.5 flex flex-col justify-between shadow-md relative overflow-hidden group ${
                  order.awb
                    ? "border-blue-500/40 bg-blue-950/20"
                    : isVerified || effectiveStatus !== "Pending Verification"
                    ? "border-sky-500/40 bg-sky-950/20 ring-1 ring-sky-500/30"
                    : "border-white/10 bg-white/[0.02] opacity-75"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        order.awb
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          : isVerified || effectiveStatus !== "Pending Verification"
                          ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 animate-pulse"
                          : "bg-zinc-800 text-zinc-400 border border-white/10"
                      }`}
                    >
                      <Truck className="h-3 w-3" />
                      {order.awb ? "Step 3 • Booked" : isVerified ? "Step 3 • Ready to Book" : "Step 3 • Locked"}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {order.awb ? "AWB Active" : isVerified ? "Ready" : "Waiting"}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Truck className={`h-3.5 w-3.5 ${order.awb ? "text-blue-400" : "text-[#d4af37]"}`} />
                    Shiprocket Courier & AWB
                  </h4>
                  {order.awb ? (
                    <div className="mt-1 space-y-1">
                      <p className="text-[11px] text-zinc-300">
                        Carrier: <strong className="text-white">{order.courier || order.courierName || "Shiprocket"}</strong>
                      </p>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#d4af37] bg-black/40 px-2 py-1 rounded border border-white/10">
                        <span>#{order.awb}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(String(order.awb))
                            showToast(`Copied AWB #${order.awb}`)
                          }}
                          className="hover:text-white p-0.5 ml-auto cursor-pointer"
                          title="Copy AWB"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                      {isVerified || effectiveStatus !== "Pending Verification"
                        ? "Order verified! Generate AWB and book courier pickup instantly."
                        : "Verify order first to unlock Shiprocket courier booking."}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10">
                  {order.awb ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onClose()
                          onOpenAssignCourier(order)
                        }}
                        className="flex-1 py-1 px-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[10px] font-bold transition text-center cursor-pointer"
                      >
                        Re-assign
                      </button>
                      {onDownloadLabel && (
                        <button
                          type="button"
                          onClick={() => onDownloadLabel(order.id, order.shiprocket_shipment_id || undefined)}
                          className="py-1 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition cursor-pointer"
                          title="Download Shipping Label PDF"
                        >
                          <FileText className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ) : isVerified || effectiveStatus !== "Pending Verification" ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        onOpenAssignCourier(order)
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Truck className="h-3 w-3" />
                      <span>Assign Shiprocket</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                      <Lock className="h-3 w-3" />
                      <span>Locked until verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* STAGE 4: IN TRANSIT / DISPATCHED */}
              <div
                className={`min-w-[240px] sm:min-w-[260px] max-w-[270px] shrink-0 snap-start rounded-xl border p-3.5 flex flex-col justify-between shadow-md relative overflow-hidden group ${
                  effectiveStatus === "Dispatched"
                    ? "border-sky-500/50 bg-sky-950/25 ring-1 ring-sky-500/40"
                    : effectiveStatus === "Delivered"
                    ? "border-emerald-500/30 bg-emerald-950/15"
                    : order.awb
                    ? "border-white/15 bg-white/[0.03]"
                    : "border-white/10 bg-white/[0.02] opacity-75"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        effectiveStatus === "Dispatched"
                          ? "bg-sky-500/20 text-sky-400 border border-sky-500/40 animate-pulse"
                          : effectiveStatus === "Delivered"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-zinc-800 text-zinc-400 border border-white/10"
                      }`}
                    >
                      <Activity className="h-3 w-3" />
                      Step 4 • In Transit
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {effectiveStatus === "Dispatched" ? "Live" : effectiveStatus === "Delivered" ? "Completed" : "Waiting"}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Activity className={`h-3.5 w-3.5 ${effectiveStatus === "Dispatched" ? "text-sky-400" : "text-zinc-400"}`} />
                    Courier Handover & Transit
                  </h4>
                  <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                    {effectiveStatus === "Dispatched"
                      ? (liveCheckpoint || order.currentStatusText || "Consignment scanned & in transit with delivery partner.")
                      : effectiveStatus === "Delivered"
                      ? "Transit phase completed successfully."
                      : order.awb
                      ? "AWB assigned. Ready to mark picked up or sync live tracking."
                      : "Awaiting courier booking."}
                  </p>
                  {order.etd && (
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Est. Delivery: <strong className="text-zinc-200">{order.etd}</strong>
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10">
                  {effectiveStatus === "Dispatched" ? (
                    <button
                      type="button"
                      onClick={handleSyncLive}
                      disabled={isSyncingLive}
                      className="w-full py-1.5 px-3 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className={`h-3 w-3 ${isSyncingLive ? "animate-spin" : ""}`} />
                      <span>{isSyncingLive ? "Syncing..." : "Sync Live Track"}</span>
                    </button>
                  ) : effectiveStatus === "Assigned to Courier" || (effectiveStatus === "Verified" && order.awb) ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (onMarkDispatched) onMarkDispatched(order.id)
                        setCurrentStatus("Dispatched")
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Truck className="h-3 w-3" />
                      <span>Mark In Transit</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-zinc-500">
                      {effectiveStatus === "Delivered" ? "✓ Transit Finished" : "Awaiting Handover"}
                    </span>
                  )}
                </div>
              </div>

              {/* STAGE 5: DELIVERED */}
              <div
                className={`min-w-[240px] sm:min-w-[260px] max-w-[270px] shrink-0 snap-start rounded-xl border p-3.5 flex flex-col justify-between shadow-md relative overflow-hidden group ${
                  effectiveStatus === "Delivered"
                    ? "border-emerald-500/50 bg-emerald-950/25 ring-1 ring-emerald-500/40"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        effectiveStatus === "Delivered"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-zinc-800 text-zinc-400 border border-white/10"
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Step 5 • Delivery
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {effectiveStatus === "Delivered" ? "Completed" : "Final"}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${effectiveStatus === "Delivered" ? "text-emerald-400" : "text-zinc-500"}`} />
                    Delivered & Accepted
                  </h4>
                  <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                    {effectiveStatus === "Delivered"
                      ? "Consignment delivered to patron. Order marked completed and settled."
                      : "Pending courier delivery confirmation to patron doorstep."}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Destination: <span className="text-zinc-200">{order.city || order.shippingAddress?.city || "India"}</span>
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10">
                  {effectiveStatus === "Delivered" ? (
                    <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold">
                      <span>✓ Order Fulfilled</span>
                      <span className="text-zinc-400 font-mono">100%</span>
                    </div>
                  ) : effectiveStatus === "Dispatched" || effectiveStatus === "Assigned to Courier" ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (onMarkDelivered) onMarkDelivered(order.id)
                        setCurrentStatus("Delivered")
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Mark Delivered</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-zinc-500">Awaiting transit</span>
                  )}
                </div>
              </div>
            </div>

            {/* Direct Status Override Pill Switcher: Instant Left-Right clickable control */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                  Quick Status Selector:
                </span>
                <span className="text-[9px] text-[#d4af37] font-mono">
                  (Click any status to switch)
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto admin-scroll pb-1">
                {(["Verified", "Assigned to Courier", "Dispatched", "Delivered"] as const).map((st) => {
                  const isActive = effectiveStatus === st
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleManualStatusChange(st)}
                      disabled={isUpdatingStatus}
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                        isActive
                          ? "bg-[#d4af37] text-black shadow-md ring-2 ring-[#d4af37]/40"
                          : "bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                      <span>{st}</span>
                    </button>
                  )
                })}
              </div>
            </div>
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
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Payment Information</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">{order.paymentMethod}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${order.paymentStatus === "Paid"
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
              {effectiveStatus === "Cancelled" && (order.razorpayPaymentId || order.paymentMethod?.includes("Razorpay") || order.paymentMethod?.includes("Online")) && order.paymentStatus !== "Refunded" && (
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
                    {(liveSRStatus || order.shiprocketStatus) && (
                      <div className="flex items-center gap-1.5 bg-sky-950/70 border border-sky-500/40 px-2.5 py-1.5 rounded-lg shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                        <span className="text-xs font-mono font-bold text-sky-300">
                          Shiprocket Live Status: {liveSRStatus || order.shiprocketStatus}
                        </span>
                      </div>
                    )}
                    {(liveCheckpoint || (order.currentStatusText && order.currentStatusText !== (liveSRStatus || order.shiprocketStatus))) && (
                      <p className="text-[10px] text-zinc-300 italic px-1">
                        📍 {liveCheckpoint || order.currentStatusText}
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
                    {isPendingVerification
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
            {isPendingVerification ? (
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-black" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Verify & Approve</span>
                  </>
                )}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 px-3 py-2 text-xs font-bold text-purple-300">
                <ShieldCheck className="h-4 w-4 text-purple-400" />
                <span>Verified</span>
              </span>
            )}

            {!order.awb && effectiveStatus !== "Cancelled" && effectiveStatus !== "Delivered" && (
              <button
                onClick={() => {
                  onClose()
                  onOpenAssignCourier(order)
                }}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg cursor-pointer transition ${
                  isVerified || effectiveStatus !== "Pending Verification"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 ring-2 ring-blue-500/30"
                    : "bg-blue-600/80 hover:bg-blue-600"
                }`}
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Assign Shiprocket</span>
              </button>
            )}

            {order.awb && effectiveStatus !== "Cancelled" && effectiveStatus !== "Delivered" && (
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

            {effectiveStatus === "Assigned to Courier" && onMarkDispatched && (
              <button
                onClick={() => {
                  onMarkDispatched(order.id)
                  setCurrentStatus("Dispatched")
                }}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 shadow-lg cursor-pointer"
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Mark In Transit</span>
              </button>
            )}

            {(effectiveStatus === "Assigned to Courier" || effectiveStatus === "Dispatched") && onMarkDelivered && (
              <button
                onClick={() => {
                  onMarkDelivered(order.id)
                  setCurrentStatus("Delivered")
                }}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-500 shadow-lg cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mark Delivered</span>
              </button>
            )}

            {/* Cancel Shipment Only: Allows resetting AWB without cancelling the patron's order */}
            {Boolean((order.awb && order.awb !== "null" && String(order.awb).length > 3) || order.shiprocket_shipment_id || effectiveStatus === "Assigned to Courier") && effectiveStatus !== "Delivered" && onCancelShipmentOnly && (
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
            {effectiveStatus !== "Delivered" && effectiveStatus !== "Cancelled" && (
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
