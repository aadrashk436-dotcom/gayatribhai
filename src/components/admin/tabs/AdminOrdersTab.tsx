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
  handleRefreshOrders?: () => void
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
}) => {
  const selectedWithAwbCount = filteredOrders.filter(
    (o) => selectedOrderIds.includes(o.id) && Boolean(o.awb)
  ).length

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] space-y-4">
      {/* Search, Filter & Status Controls Bar */}
      <div className="shrink-0 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#14171d]/95 p-4 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input & Refresh */}
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
            {handleRefreshOrders && (
              <button
                onClick={handleRefreshOrders}
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
                <th className="py-3.5 px-3">Logistics Status</th>
                <th className="py-3.5 px-3 text-right">Fulfillment Actions</th>
              </tr>
            </thead>
            {isLoadingOrders ? (
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
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
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
                          {ord.status}
                        </span>

                        {ord.awb && (
                          <div className="mt-1.5 space-y-0.5">
                            <p className="text-[10px] font-semibold text-zinc-300">{ord.courier || ord.courierName}</p>
                            <p className="text-[9px] font-mono text-[#d4af37]">AWB: {ord.awb}</p>
                          </div>
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
                          {ord.status === "Pending Verification" && (
                            <button
                              onClick={() => handleVerifyOrder(ord.id)}
                              className="rounded-lg bg-[#d4af37] px-2.5 py-1 text-[11px] font-bold text-black hover:brightness-110 shadow transition cursor-pointer"
                              title="Verify patron details and approve order"
                            >
                              Verify
                            </button>
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
