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
  selectedOrderIds: string[]
  setSelectedOrderIds: (ids: string[]) => void
  isLoadingOrders: boolean
  handleSelectAllOrders: (checked: boolean) => void
  handleToggleSelectOrder: (id: string) => void
  handleBulkVerify: () => void
  handleBulkAssignShiprocket: () => void
  handleBulkCancel: () => void
  handleVerifyOrder: (id: string) => void
  handleMarkDispatched?: (id: string) => void
  handleMarkDelivered?: (id: string) => void
  setInspectOrderModal: (order: AdminOrder | null) => void
  setAssignCourierModal: (order: AdminOrder | null) => void
  setCancelOrderModal: (order: AdminOrder | null) => void
  setZoomImageModal: (state: ZoomImageModalState | null) => void
  showToast: (msg: string) => void
  formatINR: (val: number) => string
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orderList,
  filteredOrders,
  searchQuery,
  setSearchQuery,
  orderStatusFilter,
  setOrderStatusFilter,
  selectedOrderIds,
  setSelectedOrderIds,
  isLoadingOrders,
  handleSelectAllOrders,
  handleToggleSelectOrder,
  handleBulkVerify,
  handleBulkAssignShiprocket,
  handleBulkCancel,
  handleVerifyOrder,
  handleMarkDispatched,
  handleMarkDelivered,
  setInspectOrderModal,
  setAssignCourierModal,
  setCancelOrderModal,
  setZoomImageModal,
  showToast,
  formatINR,
}) => {
  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] space-y-4">
      {/* Search & Status Filter Bar (STICKY / FIXED AT TOP) */}
      <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#14171d]/95 p-4 backdrop-blur-xl shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by order ID, patron, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0d0f12] pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { name: "All", count: orderList.length },
            { name: "Pending Verification", count: orderList.filter((o) => o.status === "Pending Verification").length },
            { name: "Verified", count: orderList.filter((o) => o.status === "Verified").length },
            { name: "Assigned to Courier", count: orderList.filter((o) => o.status === "Assigned to Courier").length },
            { name: "Dispatched", count: orderList.filter((o) => o.status === "Dispatched").length },
            { name: "Delivered", count: orderList.filter((o) => o.status === "Delivered").length },
            { name: "Cancelled", count: orderList.filter((o) => o.status === "Cancelled").length },
          ].map((st) => (
            <button
              key={st.name}
              onClick={() => setOrderStatusFilter(st.name)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition shrink-0 ${
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
              {selectedOrderIds.length} {selectedOrderIds.length === 1 ? "order" : "orders"} selected for action
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBulkVerify}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition"
              title="Approve all selected pending orders"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verify & Approve</span>
            </button>

            <button
              onClick={handleBulkAssignShiprocket}
              className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-bold text-black hover:brightness-110 transition shadow"
              title="Generate Shiprocket AWBs for all selected orders"
            >
              <Truck className="h-3.5 w-3.5" />
              <span>Assign Shiprocket</span>
            </button>

            <button
              onClick={handleBulkCancel}
              className="flex items-center gap-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500 hover:text-white transition"
              title="Cancel selected undispatched orders"
            >
              <Ban className="h-3.5 w-3.5" />
              <span>Bulk Cancel</span>
            </button>

            <button
              onClick={() => setSelectedOrderIds([])}
              className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
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
                      <p className="text-xs text-zinc-500">Live store orders will appear here automatically when placed.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((ord) => {
                  const isSelected = selectedOrderIds.includes(ord.id)
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
                          className="font-mono text-sm font-bold text-[#d4af37] hover:underline flex items-center gap-1"
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
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            ord.paymentStatus === "Paid"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          {ord.paymentStatus}
                        </span>
                        <p className="text-[10px] text-zinc-400 mt-1">{ord.paymentMethod}</p>
                        <p className="text-[9px] font-mono text-zinc-500">{ord.paymentId}</p>
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
                            <p className="text-[10px] font-semibold text-zinc-300">{ord.courier}</p>
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
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Step 1: Admin Verification Button */}
                          {ord.status === "Pending Verification" && (
                            <button
                              onClick={() => handleVerifyOrder(ord.id)}
                              className="rounded-lg bg-[#d4af37] px-2.5 py-1 text-[11px] font-bold text-black hover:brightness-110 shadow transition"
                              title="Verify patron details and approve order"
                            >
                              Verify
                            </button>
                          )}

                          {/* Step 2: Assign to Shiprocket Button (Enabled ONLY AFTER admin verifies order) */}
                          {ord.status === "Verified" && !ord.awb && (
                            <button
                              onClick={() => setAssignCourierModal(ord)}
                              className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-500 shadow transition flex items-center gap-1"
                              title="Assign Shiprocket Courier and generate AWB"
                            >
                              <Truck className="h-3 w-3" />
                              <span>Shiprocket</span>
                            </button>
                          )}

                          {/* Step 3: Mark Dispatched / In Transit */}
                          {(ord.status === "Assigned to Courier" || (ord.status === "Verified" && ord.awb)) && handleMarkDispatched && (
                            <button
                              onClick={() => handleMarkDispatched(ord.id)}
                              className="rounded-lg bg-sky-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-sky-500 shadow transition flex items-center gap-1"
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
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-500 shadow transition flex items-center gap-1"
                              title="Mark order as Delivered & collect COD payment"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Delivered</span>
                            </button>
                          )}

                          {/* Cancellation button: allowed ONLY until shipping/AWB is assigned */}
                          {!ord.awb &&
                            ord.status !== "Assigned to Courier" &&
                            ord.status !== "Dispatched" &&
                            ord.status !== "Delivered" &&
                            ord.status !== "Cancelled" && (
                              <button
                                onClick={() => setCancelOrderModal(ord)}
                                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition"
                                title="Cancel order before courier shipping assignment"
                              >
                                Cancel
                              </button>
                            )}

                          {/* Tracking button if assigned */}
                          {ord.awb && (
                            <button
                              onClick={() => showToast(`Tracking AWB #${ord.awb} via Shiprocket API (${ord.status})`)}
                              className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-[11px] font-semibold text-blue-400 hover:bg-blue-500 hover:text-white transition"
                              title="Track shipment"
                            >
                              Track
                            </button>
                          )}

                          {/* Inspect Order Details */}
                          <button
                            onClick={() => setInspectOrderModal(ord)}
                            className="rounded-lg border border-white/10 bg-white/5 p-1 text-zinc-400 hover:text-white hover:bg-white/10 transition"
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
