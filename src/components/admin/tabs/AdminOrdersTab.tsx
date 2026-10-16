import React from "react"
import Image from "next/image"
import {
  Search,
  MapPin,
  CheckCircle2,
  Truck,
  Ban,
  ShieldCheck,
  Eye,
  FileText,
  Receipt,
  Activity,
  RotateCw,
  RefreshCw,
  Download,
  Undo2,
  RotateCcw,
  Copy,
  Clock,
  Package,
  Layers,
  AlertTriangle,
} from "lucide-react"
import { AdminOrder, ZoomImageModalState } from "../types"
import { SkeletonOrdersTable } from "../AdminSkeletonLoaders"

interface AdminOrdersTabProps {
  orderList: AdminOrder[]
  filteredOrders: AdminOrder[]
  searchQuery: string
  setSearchQuery: (q: string) => void
  orderStatusFilter: string
  setOrderStatusFilter: (status: string) => void
  orderPaymentFilter?: string
  setOrderPaymentFilter?: (filter: string) => void
  orderSortBy?: string
  setOrderSortBy?: (sort: string) => void
  selectedOrderIds: string[]
  setSelectedOrderIds: (ids: string[]) => void
  isLoadingOrders: boolean
  handleSelectAllOrders: (checked: boolean) => void
  handleToggleSelectOrder: (id: string) => void
  handleBulkVerify: () => void
  handleBulkAssignShiprocket: () => void
  handleBulkCancel: () => void
  handleBulkCancelShipmentsOnly?: () => void
  handleBulkDownloadLabels?: () => void
  handleBulkDownloadInvoices?: () => void
  handleBulkDownloadLabelsAndInvoices?: () => void
  handleBulkSyncTracking?: () => void
  handleVerifyOrder: (id: string) => void
  handleMarkDispatched?: (id: string) => void
  handleMarkDelivered?: (id: string) => void
  handleDownloadLabel?: (orderId: string, shipmentId?: string | number) => void
  handleDownloadInvoice?: (orderId: string, shiprocketOrderId?: string | number) => void
  handleTrackLiveShipment?: (orderId: string) => void
  handleCancelShipmentOnly?: (orderId: string) => void
  setInspectOrderModal: (order: AdminOrder | null) => void
  setAssignCourierModal: (order: AdminOrder | null) => void
  setCancelOrderModal: (order: AdminOrder | null) => void
  setRefundOrderModal?: (order: AdminOrder | null) => void
  setZoomImageModal: (state: ZoomImageModalState | null) => void
  showToast: (msg: string) => void
  formatINR: (val: number) => string
  handleRefreshOrders?: (silent?: boolean) => void
  isRealTimeConnected?: boolean
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orderList,
  filteredOrders,
  searchQuery,
  setSearchQuery,
  orderStatusFilter,
  setOrderStatusFilter,
  orderPaymentFilter = "All",
  setOrderPaymentFilter,
  orderSortBy = "date_desc",
  setOrderSortBy,
  selectedOrderIds,
  setSelectedOrderIds,
  isLoadingOrders,
  handleSelectAllOrders,
  handleToggleSelectOrder,
  handleBulkVerify,
  handleBulkAssignShiprocket,
  handleBulkCancel,
  handleBulkCancelShipmentsOnly,
  handleBulkDownloadLabels,
  handleBulkDownloadInvoices,
  handleBulkDownloadLabelsAndInvoices,
  handleBulkSyncTracking,
  handleVerifyOrder,
  handleMarkDispatched,
  handleMarkDelivered,
  handleDownloadLabel,
  handleDownloadInvoice,
  handleTrackLiveShipment,
  handleCancelShipmentOnly,
  setInspectOrderModal,
  setAssignCourierModal,
  setCancelOrderModal,
  setRefundOrderModal,
  setZoomImageModal,
  showToast,
  formatINR,
  handleRefreshOrders,
  isRealTimeConnected = true,
}) => {
  const [verifyingId, setVerifyingId] = React.useState<string | null>(null)

  const handleVerifyClick = async (orderId: string) => {
    if (verifyingId) return
    setVerifyingId(orderId)
    try {
      await handleVerifyOrder(orderId)
    } finally {
      setVerifyingId(null)
    }
  }

  const selectedWithAwbCount = filteredOrders.filter(
    (o) => selectedOrderIds.includes(o.id) && Boolean(o.awb)
  ).length

  // Top KPI Metrics Calculations
  const totalOrdersCount = orderList.length
  const totalRevenue = orderList.reduce((acc, o) => acc + (o.total || 0), 0)
  const pendingCount = orderList.filter((o) => o.status === "Pending Verification").length
  const verifiedCount = orderList.filter((o) => o.status === "Verified").length
  const assignedCount = orderList.filter(
    (o) => o.status === "Assigned to Courier" || (Boolean(o.awb) && o.status !== "Cancelled" && o.status !== "Delivered")
  ).length
  const dispatchedCount = orderList.filter((o) => o.status === "Dispatched").length
  const deliveredCount = orderList.filter((o) => o.status === "Delivered").length
  const refundsCount = orderList.filter(
    (o) => o.paymentStatus === "Refunded" || o.paymentStatus === "Refund Pending" || o.status === "Cancelled"
  ).length

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] space-y-4">
      {/* ══════════════ TOP STATS & CURRENT STATUS OVERVIEW BAR ══════════════ */}
      <div className="shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* Card 1: All Orders */}
        <button
          type="button"
          onClick={() => setOrderStatusFilter("All")}
          className={`rounded-2xl border p-3.5 text-left transition-all duration-200 cursor-pointer shadow-lg flex flex-col justify-between ${
            orderStatusFilter === "All"
              ? "bg-[#1f242e] border-[#d4af37] ring-1 ring-[#d4af37]/40 shadow-[#d4af37]/10"
              : "bg-[#14171d]/90 border-white/10 hover:border-white/20 hover:bg-[#181c24]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Orders</span>
            <div className="w-7 h-7 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <Layers className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-black text-white">{totalOrdersCount}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5 truncate font-medium">
              Gross: <span className="text-zinc-200 font-bold">{formatINR(totalRevenue)}</span>
            </p>
          </div>
        </button>

        {/* Card 2: Pending Verification */}
        <button
          type="button"
          onClick={() => setOrderStatusFilter("Pending Verification")}
          className={`rounded-2xl border p-3.5 text-left transition-all duration-200 cursor-pointer shadow-lg flex flex-col justify-between ${
            orderStatusFilter === "Pending Verification"
              ? "bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/40"
              : "bg-[#14171d]/90 border-white/10 hover:border-amber-500/30 hover:bg-[#181c24]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Needs Review</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <p className="text-xl sm:text-2xl font-black text-amber-300">{pendingCount}</p>
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </div>
            <p className="text-[10px] text-amber-200/80 mt-0.5 truncate">
              {pendingCount > 0 ? "Pending admin approval" : "All orders verified"}
            </p>
          </div>
        </button>

        {/* Card 3: Ready to Ship / Booked */}
        <button
          type="button"
          onClick={() => setOrderStatusFilter("Assigned to Courier")}
          className={`rounded-2xl border p-3.5 text-left transition-all duration-200 cursor-pointer shadow-lg flex flex-col justify-between ${
            orderStatusFilter === "Assigned to Courier"
              ? "bg-sky-950/40 border-sky-500 ring-1 ring-sky-500/40"
              : "bg-[#14171d]/90 border-white/10 hover:border-sky-500/30 hover:bg-[#181c24]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Ready to Ship</span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Truck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-black text-sky-300">{verifiedCount + assignedCount}</p>
            <p className="text-[10px] text-sky-200/80 mt-0.5 truncate">
              {verifiedCount > 0 ? `${verifiedCount} verified • ${assignedCount} booked` : `${assignedCount} AWBs booked`}
            </p>
          </div>
        </button>

        {/* Card 4: Dispatched / In Transit */}
        <button
          type="button"
          onClick={() => setOrderStatusFilter("Dispatched")}
          className={`rounded-2xl border p-3.5 text-left transition-all duration-200 cursor-pointer shadow-lg flex flex-col justify-between ${
            orderStatusFilter === "Dispatched"
              ? "bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/40"
              : "bg-[#14171d]/90 border-white/10 hover:border-indigo-500/30 hover:bg-[#181c24]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">In Transit</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Activity className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-black text-indigo-300">{dispatchedCount}</p>
            <p className="text-[10px] text-indigo-200/80 mt-0.5 truncate">
              On the road with courier
            </p>
          </div>
        </button>

        {/* Card 5: Delivered */}
        <button
          type="button"
          onClick={() => setOrderStatusFilter("Delivered")}
          className={`rounded-2xl border p-3.5 text-left transition-all duration-200 cursor-pointer shadow-lg flex flex-col justify-between ${
            orderStatusFilter === "Delivered"
              ? "bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/40"
              : "bg-[#14171d]/90 border-white/10 hover:border-emerald-500/30 hover:bg-[#181c24]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Delivered</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-black text-emerald-300">{deliveredCount}</p>
            <p className="text-[10px] text-emerald-200/80 mt-0.5 truncate">
              Completed & received
            </p>
          </div>
        </button>

        {/* Card 6: Refunds & Cancelled */}
        <button
          type="button"
          onClick={() => setOrderStatusFilter("Refunds")}
          className={`rounded-2xl border p-3.5 text-left transition-all duration-200 cursor-pointer shadow-lg flex flex-col justify-between ${
            orderStatusFilter === "Refunds"
              ? "bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/40"
              : "bg-[#14171d]/90 border-white/10 hover:border-rose-500/30 hover:bg-[#181c24]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Refunds / Void</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <RotateCcw className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-black text-rose-300">{refundsCount}</p>
            <p className="text-[10px] text-rose-200/80 mt-0.5 truncate">
              Cancelled / Refunded
            </p>
          </div>
        </button>
      </div>

      {/* Search, Filter & Status Controls Bar */}
      <div className="shrink-0 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#14171d]/95 p-4 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input, Refresh & Live Stream Indicator */}
          <div className="flex items-center gap-2 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by order ID, customer, phone, AWB, SKU, payment ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0d0f12] pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            {/* Real-time Stream Live Badge */}
            {isRealTimeConnected && (
              <div
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-2 text-xs font-semibold text-emerald-400 shrink-0 select-none shadow-sm"
                title="Live Real-time SSE / WebSocket event stream active. Order statuses and tracking update automatically without reloading."
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] font-mono tracking-tight">Live Stream</span>
              </div>
            )}

            {handleRefreshOrders && (
              <button
                onClick={() => handleRefreshOrders(false)}
                disabled={isLoadingOrders}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0d0f12] px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-[#d4af37] hover:border-[#d4af37]/40 transition shrink-0 cursor-pointer disabled:opacity-50"
                title="Refresh live orders from database"
              >
                <RotateCw className={`h-3.5 w-3.5 ${isLoadingOrders ? "animate-spin text-[#d4af37]" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
          </div>

          {/* Secondary Filters: Payment Method & Sorting */}
          <div className="flex items-center gap-2 shrink-0">
            {setOrderPaymentFilter && (
              <select
                value={orderPaymentFilter}
                onChange={(e) => setOrderPaymentFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#0d0f12] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none cursor-pointer"
                title="Filter by payment method"
              >
                <option value="All">All Payments</option>
                <option value="Online">Online (Razorpay)</option>
                <option value="COD">Cash on Delivery</option>
              </select>
            )}

            {setOrderSortBy && (
              <select
                value={orderSortBy}
                onChange={(e) => setOrderSortBy(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#0d0f12] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none cursor-pointer"
                title="Sort order listing"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="amount_desc">Amount: High to Low</option>
                <option value="amount_asc">Amount: Low to High</option>
              </select>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-white/5 pt-2">
          {[
            { name: "All", count: orderList.length },
            { name: "Pending Verification", count: orderList.filter((o) => o.status === "Pending Verification").length },
            { name: "Verified", count: orderList.filter((o) => o.status === "Verified").length },
            { name: "Assigned to Courier", count: orderList.filter((o) => o.status === "Assigned to Courier").length },
            { name: "Dispatched", count: orderList.filter((o) => o.status === "Dispatched").length },
            { name: "Delivered", count: orderList.filter((o) => o.status === "Delivered").length },
            { name: "Cancelled", count: orderList.filter((o) => o.status === "Cancelled").length },
            {
              name: "Refunds",
              count: orderList.filter((o) => o.paymentStatus === "Refunded" || o.paymentStatus === "Refund Pending" || o.status === "Cancelled").length,
            },
          ].map((st) => (
            <button
              key={st.name}
              onClick={() => setOrderStatusFilter(st.name)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition shrink-0 cursor-pointer ${
                orderStatusFilter === st.name
                  ? "bg-[#d4af37] text-black font-bold shadow-md shadow-[#d4af37]/20"
                  : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              <span>{st.name}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  orderStatusFilter === st.name ? "bg-black/20 text-black" : "bg-white/10 text-zinc-300"
                }`}
              >
                {st.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions Floating Toolbar (When orders are selected) */}
      {selectedOrderIds.length > 0 && (
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d4af37]/40 bg-[#161a22] p-3.5 shadow-2xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d4af37] font-bold text-black text-xs">
              {selectedOrderIds.length}
            </span>
            <span className="text-xs font-semibold text-white">
              {selectedOrderIds.length} {selectedOrderIds.length === 1 ? "order" : "orders"} selected
              {selectedWithAwbCount > 0 && (
                <span className="text-[#d4af37] ml-1.5">({selectedWithAwbCount} with Shiprocket AWB)</span>
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBulkVerify}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition cursor-pointer"
              title="Approve all selected pending orders"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verify & Approve</span>
            </button>

            <button
              onClick={handleBulkAssignShiprocket}
              className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-bold text-black hover:brightness-110 transition shadow cursor-pointer"
              title="Generate Shiprocket AWBs for all selected orders"
            >
              <Truck className="h-3.5 w-3.5" />
              <span>Assign Shiprocket</span>
            </button>

            {/* Bulk 1-Click Labels & Invoices: Downloads both in one click */}
            {selectedWithAwbCount > 0 && handleBulkDownloadLabelsAndInvoices && (
              <button
                onClick={handleBulkDownloadLabelsAndInvoices}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500/25 to-[#d4af37]/25 border border-[#d4af37]/40 px-3 py-1.5 text-xs font-bold text-white hover:brightness-125 transition cursor-pointer"
                title={`1-Click: Download both official labels & tax invoices for ${selectedWithAwbCount} orders`}
              >
                <Download className="h-3.5 w-3.5 text-[#d4af37]" />
                <span>1-Click Labels & Invoices ({selectedWithAwbCount})</span>
              </button>
            )}

            {/* Bulk Download Labels: only active for assigned orders with AWBs */}
            {selectedWithAwbCount > 0 && handleBulkDownloadLabels && (
              <button
                onClick={handleBulkDownloadLabels}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                title={`Download official Shiprocket shipping labels for ${selectedWithAwbCount} assigned orders`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Labels ({selectedWithAwbCount})</span>
              </button>
            )}

            {/* Bulk Download Invoices: only active for assigned orders with AWBs */}
            {selectedWithAwbCount > 0 && handleBulkDownloadInvoices && (
              <button
                onClick={handleBulkDownloadInvoices}
                className="flex items-center gap-1.5 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 px-3 py-1.5 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition cursor-pointer"
                title={`Download official Shiprocket tax invoices for ${selectedWithAwbCount} assigned orders`}
              >
                <Receipt className="h-3.5 w-3.5" />
                <span>Invoices ({selectedWithAwbCount})</span>
              </button>
            )}

            {/* Bulk Sync Tracking */}
            {selectedWithAwbCount > 0 && handleBulkSyncTracking && (
              <button
                onClick={handleBulkSyncTracking}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600/20 border border-blue-500/40 px-3 py-1.5 text-xs font-bold text-blue-400 hover:bg-blue-600 hover:text-white transition cursor-pointer"
                title="Sync live tracking status with Shiprocket API"
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Sync Live Status</span>
              </button>
            )}

            {/* Bulk Cancel Shipments: resets AWB and leaves orders in Verified status for re-shipping (Triotech pattern) */}
            {selectedWithAwbCount > 0 && handleBulkCancelShipmentsOnly && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      `Are you sure you want to cancel Shiprocket shipments for ${selectedWithAwbCount} selected orders? Courier AWBs will be cancelled and orders will return to Verified status.`
                    )
                  ) {
                    handleBulkCancelShipmentsOnly()
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-black transition cursor-pointer"
                title={`Cancel Shiprocket shipments & AWBs for ${selectedWithAwbCount} orders (reverts to Verified)`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Cancel Shipping ({selectedWithAwbCount})</span>
              </button>
            )}

            <button
              onClick={handleBulkCancel}
              className="flex items-center gap-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500 hover:text-white transition cursor-pointer"
              title="Cancel entire orders and shipments"
            >
              <Ban className="h-3.5 w-3.5" />
              <span>Bulk Cancel Orders</span>
            </button>

            <button
              onClick={() => setSelectedOrderIds([])}
              className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Orders Detailed Table (SCROLLABLE CONTAINER) */}
      <div className="flex-1 rounded-2xl border border-white/10 bg-[#14171d] shadow-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1 admin-scroll">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-[#121418] border-b border-white/10 text-zinc-400 font-semibold tracking-wider uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredOrders.length > 0 &&
                      filteredOrders.every((o) => selectedOrderIds.includes(o.id))
                    }
                    onChange={(e) => handleSelectAllOrders(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#d4af37] cursor-pointer"
                    title="Select all visible orders"
                  />
                </th>
                <th className="py-3.5 px-3">Order Details</th>
                <th className="py-3.5 px-3">Patron & Shipping</th>
                <th className="py-3.5 px-3">Shirt Item</th>
                <th className="py-3.5 px-3">Payment</th>
                <th className="py-3.5 px-3">Current Status & Logistics</th>
                <th className="py-3.5 px-3 text-right">Fulfillment Actions</th>
              </tr>
            </thead>
            {isLoadingOrders && orderList.length === 0 ? (
              <SkeletonOrdersTable />
            ) : filteredOrders.length === 0 ? (
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="font-semibold text-white text-sm">No orders found</p>
                      <p className="text-xs text-zinc-500">
                        {searchQuery || orderStatusFilter !== "All" || orderPaymentFilter !== "All"
                          ? "Try adjusting your search query, status tab, or payment filter."
                          : "Live store orders will appear here automatically when placed."}
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((ord) => {
                  const isSelected = selectedOrderIds.includes(ord.id)
                  const isPrepaid =
                    ord.paymentMethod?.includes("Razorpay") ||
                    ord.paymentMethod?.includes("Online") ||
                    ord.paymentStatus === "Paid" ||
                    ord.paymentStatus === "Refund Pending" ||
                    Boolean(ord.razorpayPaymentId)

                  const canRefund =
                    isPrepaid &&
                    ord.paymentStatus !== "Refunded" &&
                    (ord.status === "Cancelled" || ord.paymentStatus === "Refund Pending" || ord.paymentStatus === "Paid")

                  return (
                    <tr
                      key={ord.id}
                      className={`transition ${isSelected ? "bg-[#d4af37]/5" : "hover:bg-white/[0.02]"}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOrder(ord.id)}
                          className="h-4 w-4 rounded accent-[#d4af37] cursor-pointer"
                        />
                      </td>

                      {/* Order & Date */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => setInspectOrderModal(ord)}
                          className="font-mono text-sm font-bold text-[#d4af37] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {ord.id}
                        </button>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{ord.date}</p>
                        <p className="font-mono text-xs font-semibold text-white mt-1.5">{formatINR(ord.total)}</p>
                      </td>

                      {/* Customer & Address */}
                      <td className="py-3.5 px-3 max-w-[220px]">
                        <p className="font-semibold text-white text-xs">{ord.customer}</p>
                        <p className="text-zinc-400 text-[11px]">{ord.phone}</p>
                        <p className="text-zinc-300 text-[11px] mt-1 line-clamp-1" title={ord.address}>
                          {ord.address}
                        </p>
                        <p className="text-zinc-400 text-[10px] flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-[#d4af37] shrink-0" />
                          <span>
                            {ord.city} (PIN {ord.pincode})
                          </span>
                        </p>
                      </td>

                      {/* Product Item with Thumbnail */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            onClick={() =>
                              setZoomImageModal({
                                url:
                                  ord.image ||
                                  "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg",
                                title: `${ord.shirtName} • Order ${ord.id}`,
                                isMobile: false,
                              })
                            }
                            className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-black border border-white/10 cursor-pointer group/ordimg hover:border-[#d4af37]/60 transition"
                            title="Click to view full photo (HD Zoom)"
                          >
                            <Image
                              src={
                                ord.image ||
                                "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg"
                              }
                              alt={ord.shirtName}
                              fill
                              className="object-cover group-hover/ordimg:scale-110 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-semibold text-xs truncate max-w-[170px]" title={ord.shirtName}>
                              {ord.shirtName}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-mono">{ord.sku}</p>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <span className="rounded bg-white/10 px-1.5 py-0.2 text-[9px] font-mono text-zinc-200">
                                Size: {ord.size}
                              </span>
                              <span className="text-[9px] text-zinc-400">Qty: {ord.qty}</span>
                              {ord.items && ord.items.length > 1 && (
                                <span className="rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 px-1.5 py-0.2 text-[9px] font-bold text-[#d4af37]">
                                  +{ord.items.length - 1} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              ord.paymentStatus === "Paid"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : ord.paymentStatus === "Refunded"
                                ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                : ord.paymentStatus === "Refund Pending"
                                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            {ord.paymentStatus}
                          </span>

                          {/* Quick manual refund trigger if cancelled and not refunded yet */}
                          {ord.status === "Cancelled" && (ord.razorpayPaymentId || ord.paymentMethod?.includes("Razorpay") || ord.paymentMethod?.includes("Online")) && ord.paymentStatus !== "Refunded" && setRefundOrderModal && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setRefundOrderModal(ord)
                              }}
                              className="inline-flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/50 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded transition cursor-pointer animate-pulse hover:animate-none"
                              title="Order Cancelled: Authorize Razorpay Refund"
                            >
                              <RotateCcw className="h-2.5 w-2.5 text-amber-400" />
                              <span>Refund</span>
                            </button>
                          )}
                        </div>

                        <p className="text-[10px] text-zinc-400 mt-1">{ord.paymentMethod}</p>

                        {/* Razorpay Payment ID with 1-Click Copy */}
                        {(ord.razorpayPaymentId || ord.paymentId) && (
                          <div className="mt-1 flex items-center gap-1 group/pay">
                            <span
                              className="font-mono text-[9px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-500/30 px-1.5 py-0.5 rounded select-all"
                              title={`Razorpay Payment ID: ${ord.razorpayPaymentId || ord.paymentId}`}
                            >
                              {ord.razorpayPaymentId || ord.paymentId}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                const idToCopy = ord.razorpayPaymentId || ord.paymentId || ""
                                navigator.clipboard.writeText(idToCopy)
                                if (showToast) showToast(`Copied Payment ID: ${idToCopy}`)
                              }}
                              className="text-zinc-500 hover:text-indigo-300 p-0.5 transition cursor-pointer"
                              title="Copy Payment ID"
                            >
                              <Copy className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        )}

                        {/* Razorpay Refund ID Display with 1-Click Copy (Triotech exact luxury styling) */}
                        {ord.refundId && (
                          <div className="mt-1 flex items-center gap-1 group/rfnd">
                            <span
                              className="font-mono text-[9px] font-bold text-rose-300 bg-rose-950/90 border border-rose-500/40 px-1.5 py-0.5 rounded select-all flex items-center gap-1 shadow-sm"
                              title={`Razorpay Refund ID: ${ord.refundId}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                              REFUND: {ord.refundId}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigator.clipboard.writeText(ord.refundId!)
                                if (showToast) showToast(`Copied Refund ID: ${ord.refundId}`)
                              }}
                              className="text-zinc-500 hover:text-rose-300 p-0.5 transition cursor-pointer"
                              title="Copy Razorpay Refund ID"
                            >
                              <Copy className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status & Logistics */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1.5">
                          {/* If Shiprocket status exists, show the live Shiprocket Status badge prominently */}
                          {ord.shiprocketStatus ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-sm ${
                                    ord.shiprocketStatus.toLowerCase().includes("delivered")
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                      : ord.shiprocketStatus.toLowerCase().includes("cancel")
                                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                                      : ord.shiprocketStatus.toLowerCase().includes("pickup") ||
                                        ord.shiprocketStatus.toLowerCase().includes("transit") ||
                                        ord.shiprocketStatus.toLowerCase().includes("dispatched") ||
                                        ord.shiprocketStatus.toLowerCase().includes("out for delivery")
                                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                                      : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                                  }`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                  <Truck className="h-2.5 w-2.5" />
                                  <span>{ord.shiprocketStatus}</span>
                                </span>
                                <span className="text-[9px] font-semibold text-sky-400 font-mono">
                                  (Shiprocket Live)
                                </span>
                              </div>
                              {ord.status && ord.status !== ord.shiprocketStatus && (
                                <p className="text-[9px] text-zinc-400 font-medium pl-0.5">
                                  Store Status: <span className="text-zinc-300 font-semibold">{ord.status}</span>
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                                Status:
                              </span>
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  ord.status === "Delivered"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : ord.status === "Assigned to Courier" || ord.status === "Dispatched"
                                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                    : ord.status === "Verified"
                                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                    : ord.status === "Cancelled"
                                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                {ord.status === "Delivered" && <CheckCircle2 className="h-2.5 w-2.5" />}
                                {ord.status === "Dispatched" && <Truck className="h-2.5 w-2.5" />}
                                {ord.status === "Assigned to Courier" && <Package className="h-2.5 w-2.5" />}
                                {ord.status === "Verified" && <ShieldCheck className="h-2.5 w-2.5" />}
                                {ord.status === "Pending Verification" && <Clock className="h-2.5 w-2.5" />}
                                {ord.status === "Cancelled" && <Ban className="h-2.5 w-2.5" />}
                                <span>{ord.status}</span>
                              </span>
                            </div>
                          )}

                          {ord.awb ? (
                            <div className="mt-1 space-y-1">
                              <p className="text-[10px] font-semibold text-zinc-200 flex items-center gap-1">
                                <Truck className="h-2.5 w-2.5 text-[#d4af37] shrink-0" />
                                <span>{ord.courier || ord.courierName || "Shiprocket Partner"}</span>
                              </p>
                              <div className="flex items-center gap-1 flex-wrap">
                                {String(ord.awb).includes("Booking") ? (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-[#d4af37] bg-[#d4af37]/15 px-2 py-0.5 rounded border border-[#d4af37]/30 animate-pulse">
                                    <RefreshCw className="h-2.5 w-2.5 animate-spin text-[#d4af37]" />
                                    Booking AWB...
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-mono font-bold text-[#d4af37] bg-[#d4af37]/15 px-2 py-0.5 rounded-md border border-[#d4af37]/30 select-all shadow-sm">
                                      AWB: {ord.awb}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        navigator.clipboard.writeText(String(ord.awb))
                                        if (showToast) showToast(`Copied AWB #${ord.awb}`)
                                      }}
                                      className="text-zinc-400 hover:text-[#d4af37] p-1 rounded hover:bg-white/5 cursor-pointer transition"
                                      title="Copy AWB Number"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-0.5">
                              {(ord.status === "Verified" || ord.verified) && (
                                <span className="text-[10px] text-purple-300/80 italic flex items-center gap-1">
                                  <span>Ready to assign courier</span>
                                </span>
                              )}
                              {ord.status === "Pending Verification" && !ord.verified && (
                                <span className="text-[10px] text-amber-400/80 italic flex items-center gap-1">
                                  <span>Awaiting verification</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {ord.currentStatusText && ord.currentStatusText !== ord.shiprocketStatus && (
                          <p className="text-[9px] text-sky-200 mt-1 line-clamp-2 bg-sky-950/40 p-1 rounded border border-sky-500/20 flex items-start gap-1" title={ord.currentStatusText}>
                            <span className="text-sky-400">📍</span>
                            <span>{ord.currentStatusText}</span>
                          </p>
                        )}

                        {ord.cancelReason && (
                          <p className="text-[10px] text-rose-400 mt-1 line-clamp-1 italic">
                            {ord.cancelReason}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end flex-wrap gap-1.5">
                          {/* Step 1: Admin Verification Button */}
                          {ord.status === "Pending Verification" && !ord.verified && (
                            <button
                              onClick={() => handleVerifyClick(ord.id)}
                              disabled={verifyingId === ord.id}
                              className="rounded-lg bg-[#d4af37] px-2.5 py-1 text-[11px] font-bold text-black hover:brightness-110 shadow transition flex items-center gap-1 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                              title="Verify patron details and approve order"
                            >
                              {verifyingId === ord.id ? (
                                <>
                                  <RefreshCw className="h-3 w-3 animate-spin text-black" />
                                  <span>Verifying...</span>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="h-3 w-3 text-black" />
                                  <span>Verify</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Verified Badge if approved and awaiting courier */}
                          {(ord.status === "Verified" || ord.verified) && !ord.awb && ord.status !== "Cancelled" && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-purple-500/15 border border-purple-500/30 px-2 py-1 text-[10px] font-bold text-purple-300">
                              <ShieldCheck className="h-3 w-3 text-purple-400" />
                              <span>Verified</span>
                            </span>
                          )}

                          {/* Step 2: Assign to Shiprocket Button (Available for orders without active shipment) */}
                          {!Boolean((ord.awb && ord.awb !== "null" && String(ord.awb).length > 3) || ord.shiprocket_shipment_id || ord.status === "Assigned to Courier" || ord.status === "Dispatched") && ord.status !== "Cancelled" && ord.status !== "Delivered" && (
                            <button
                              onClick={() => setAssignCourierModal(ord)}
                              className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-500 shadow transition flex items-center gap-1 cursor-pointer"
                              title="Assign Shiprocket Courier and generate AWB"
                            >
                              <Truck className="h-3 w-3" />
                              <span>Shiprocket</span>
                            </button>
                          )}

                          {/* Re-assign Courier Button (Available when order has an active shipment/AWB) */}
                          {Boolean((ord.awb && ord.awb !== "null" && String(ord.awb).length > 3) || ord.shiprocket_shipment_id || ord.status === "Assigned to Courier") && ord.status !== "Delivered" && (
                            <button
                              onClick={() => setAssignCourierModal(ord)}
                              className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-[11px] font-semibold text-blue-300 hover:bg-blue-500 hover:text-white transition flex items-center gap-1 cursor-pointer"
                              title={`Re-assign courier or change carrier from ${ord.courier || "current courier"}`}
                            >
                              <Truck className="h-3 w-3" />
                              <span>Re-assign</span>
                            </button>
                          )}

                          {/* Step 3: Mark Dispatched / In Transit */}
                          {(ord.status === "Assigned to Courier" || (ord.status === "Verified" && ord.awb)) && handleMarkDispatched && (
                            <button
                              onClick={() => handleMarkDispatched(ord.id)}
                              className="rounded-lg bg-sky-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-sky-500 shadow transition flex items-center gap-1 cursor-pointer"
                              title="Mark courier picked up and in transit"
                            >
                              <Truck className="h-3 w-3" />
                              <span>In Transit</span>
                            </button>
                          )}

                          {/* Step 4: Mark Delivered */}
                          {(ord.status === "Dispatched" || ord.status === "Assigned to Courier") && handleMarkDelivered && (
                            <button
                              onClick={() => handleMarkDelivered(ord.id)}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-500 shadow transition flex items-center gap-1 cursor-pointer"
                              title="Mark order as Delivered & collect COD payment"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Delivered</span>
                            </button>
                          )}

                          {/* Shiprocket Shipping Label (PDF): ONLY shown & selectable once assigned with AWB */}
                          {Boolean(ord.awb && ord.awb !== "null" && String(ord.awb).length > 3) && handleDownloadLabel && (
                            <button
                              onClick={() => handleDownloadLabel(ord.id, ord.shiprocket_shipment_id || undefined)}
                              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-black transition flex items-center gap-1 cursor-pointer"
                              title="Download official Shiprocket shipping label (PDF)"
                            >
                              <FileText className="h-3 w-3" />
                              <span>Label</span>
                            </button>
                          )}

                          {/* Shiprocket Tax Invoice (PDF): ONLY shown & selectable once assigned with AWB */}
                          {Boolean(ord.awb && ord.awb !== "null" && String(ord.awb).length > 3) && handleDownloadInvoice && (
                            <button
                              onClick={() => handleDownloadInvoice(ord.id, ord.shiprocket_order_id || undefined)}
                              className="rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/10 px-2 py-1 text-[11px] font-semibold text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition flex items-center gap-1 cursor-pointer"
                              title="Download official Shiprocket tax invoice (PDF)"
                            >
                              <Receipt className="h-3 w-3" />
                              <span>Invoice</span>
                            </button>
                          )}

                          {/* Live Shiprocket Tracking & Status Synchronization button */}
                          {Boolean(ord.awb && ord.awb !== "null" && String(ord.awb).length > 3) && (
                            <button
                              onClick={() => {
                                if (handleTrackLiveShipment) {
                                  handleTrackLiveShipment(ord.id)
                                } else {
                                  showToast(`Tracking AWB #${ord.awb} via Shiprocket API (${ord.status})`)
                                }
                              }}
                              className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-[11px] font-semibold text-blue-400 hover:bg-blue-500 hover:text-white transition flex items-center gap-1 cursor-pointer"
                              title="Sync live status instantly from Shiprocket API"
                            >
                              <Activity className="h-3 w-3" />
                              <span>Track</span>
                            </button>
                          )}

                          {/* Cancel Shipment Button (Triotech exact pattern: cancels AWB on Shiprocket and resets order to Verified for re-shipping) */}
                          {Boolean((ord.awb && ord.awb !== "null" && String(ord.awb).length > 3) || ord.shiprocket_shipment_id || ord.status === "Assigned to Courier") && ord.status !== "Delivered" && handleCancelShipmentOnly && (
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Are you sure you want to cancel the shipment for Order #${ord.orderNumber || ord.id} in Shiprocket? Courier AWB #${ord.awb || ""} will be cancelled and order will return to Verified status.`
                                  )
                                ) {
                                  handleCancelShipmentOnly(ord.id)
                                }
                              }}
                              className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500 hover:text-black transition flex items-center gap-1 cursor-pointer shadow-sm"
                              title="Cancel shipment in Shiprocket and release courier AWB"
                            >
                              <RotateCcw className="h-3 w-3 text-amber-400" />
                              <span>Cancel Shipment</span>
                            </button>
                          )}

                          {/* Full Cancellation button: Admin can cancel undispatched orders or cancel active shipments on Shiprocket */}
                          {ord.status !== "Cancelled" && ord.status !== "Delivered" && (
                            <button
                              onClick={() => setCancelOrderModal(ord)}
                              className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition cursor-pointer"
                              title={
                                ord.awb
                                  ? "Cancel shipment on Shiprocket and mark order as Cancelled"
                                  : "Cancel order before courier shipping assignment"
                              }
                            >
                              Cancel
                            </button>
                          )}

                          {/* Direct Razorpay Refund Button (for cancelled or refund pending orders) */}
                          {canRefund && setRefundOrderModal && (
                            <button
                              onClick={() => setRefundOrderModal(ord)}
                              className="rounded-lg bg-[#d4af37] px-2 py-1 text-[11px] font-bold text-black hover:brightness-110 shadow transition flex items-center gap-1 cursor-pointer"
                              title={`Execute Razorpay refund for Order #${ord.id}`}
                            >
                              <RefreshCw className="h-3 w-3" />
                              <span>Refund</span>
                            </button>
                          )}

                          {/* Inspect Order Details */}
                          <button
                            onClick={() => setInspectOrderModal(ord)}
                            className="rounded-lg border border-white/10 bg-white/5 p-1 text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                            title="View complete address and product items"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
