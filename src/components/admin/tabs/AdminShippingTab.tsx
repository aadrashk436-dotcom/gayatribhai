import React, { useState } from "react"
import {
  Truck,
  CheckCircle2,
  FileText,
  Receipt,
  Activity,
  AlertTriangle,
  Ban,
  Eye,
  MapPin,
  ExternalLink,
  Package,
  RotateCcw,
} from "lucide-react"
import { AdminOrder, formatINR as defaultFormatINR } from "../types"

interface PincodeResult {
  city: string
  pincode: string
  delhivery: string
  blueDart: string
  dtdc: string
}

interface AdminShippingTabProps {
  checkPincode: string
  setCheckPincode: (pin: string) => void
  pincodeResult: PincodeResult | null
  handlePincodeCheck: (e: React.FormEvent) => void
  orderList?: AdminOrder[]
  handleVerifyOrder?: (id: string) => void
  handleMarkDispatched?: (id: string) => void
  handleMarkDelivered?: (id: string) => void
  handleDownloadLabel?: (orderId: string, shipmentId?: string | number) => void
  handleDownloadInvoice?: (orderId: string, shiprocketOrderId?: string | number) => void
  handleTrackLiveShipment?: (orderId: string) => void
  handleCancelShipmentOnly?: (orderId: string) => void
  setInspectOrderModal?: (order: AdminOrder | null) => void
  setAssignCourierModal?: (order: AdminOrder | null) => void
  setCancelOrderModal?: (order: AdminOrder | null) => void
  showToast?: (msg: string) => void
  formatINR?: (val: number) => string
}

export const AdminShippingTab: React.FC<AdminShippingTabProps> = ({
  checkPincode,
  setCheckPincode,
  pincodeResult,
  handlePincodeCheck,
  orderList = [],
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
  showToast,
  formatINR = defaultFormatINR,
}) => {
  const [shippingSubTab, setShippingSubTab] = useState<"active" | "ready" | "all">("active")

  // Orders that have been assigned to courier with an AWB
  const activeShipments = orderList.filter((o) => Boolean(o.awb))

  // Orders verified and ready for courier assignment
  const readyToAssign = orderList.filter((o) => o.status === "Verified" && !o.awb)

  // In-transit count
  const inTransitCount = activeShipments.filter(
    (o) => o.status === "Dispatched" || o.status === "Assigned to Courier"
  ).length

  // Delivered count
  const deliveredCount = activeShipments.filter((o) => o.status === "Delivered").length

  return (
    <div className="space-y-6">
      {/* Integration Details Card & Quick Metrics */}
      <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h4 className="font-serif text-lg font-bold text-white">Shiprocket Direct Logistics Operations</h4>
            <p className="text-xs text-zinc-400">
              Live automated courier allocation, AWB generation, label & invoice download, and tracking sync
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-400">
            🟢 Connected: gayatripuri634@gmail.com
          </span>
        </div>

        {/* 3 Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Ready for Courier Assignment</p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif text-white">{readyToAssign.length}</span>
              <span className="text-[11px] text-zinc-400">Verified Orders</span>
            </div>
          </div>

          <div className="rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Active Shipments (AWBs)</p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif text-white">{activeShipments.length}</span>
              <span className="text-[11px] text-zinc-400">{inTransitCount} In Transit</span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Delivered Shipments</p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif text-white">{deliveredCount}</span>
              <span className="text-[11px] text-zinc-400">Successfully Received</span>
            </div>
          </div>
        </div>

        {/* Warehouse specs strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="rounded-lg bg-white/5 border border-white/5 p-3">
            <p className="text-[10px] text-zinc-400 uppercase font-semibold">Surat Atelier Warehouse</p>
            <p className="text-white text-xs mt-0.5">Ring Road Textile Market, Surat, Gujarat 395002</p>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/5 p-3">
            <p className="text-[10px] text-zinc-400 uppercase font-semibold">Package Specs (Per Garment)</p>
            <p className="text-white text-xs mt-0.5">0.35 kg • 30cm × 25cm × 4cm (Signature Box)</p>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/5 p-3">
            <p className="text-[10px] text-zinc-400 uppercase font-semibold">Integrated Express Carriers</p>
            <p className="text-white text-xs mt-0.5">Delhivery Surface, BlueDart Air, DTDC Express</p>
          </div>
        </div>
      </div>

      {/* Orders & Shipments Management Section */}
      <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShippingSubTab("active")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                shippingSubTab === "active"
                  ? "bg-[#d4af37] text-black shadow-md shadow-[#d4af37]/20"
                  : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              Active Shipments with AWB ({activeShipments.length})
            </button>
            <button
              onClick={() => setShippingSubTab("ready")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                shippingSubTab === "ready"
                  ? "bg-[#d4af37] text-black shadow-md shadow-[#d4af37]/20"
                  : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              Ready to Assign ({readyToAssign.length})
            </button>
            <button
              onClick={() => setShippingSubTab("all")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                shippingSubTab === "all"
                  ? "bg-[#d4af37] text-black shadow-md shadow-[#d4af37]/20"
                  : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              All Orders ({orderList.length})
            </button>
          </div>

          <span className="text-xs text-zinc-400">
            {shippingSubTab === "active"
              ? "All live shipments with assigned Shiprocket AWB"
              : shippingSubTab === "ready"
              ? "Verified orders waiting for Shiprocket courier assignment"
              : "Complete order registry"}
          </span>
        </div>

        {/* Table of Shipments */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 font-semibold tracking-wider uppercase text-[11px]">
                <th className="py-3.5 px-3">Order & Date</th>
                <th className="py-3.5 px-3">Patron & Destination</th>
                <th className="py-3.5 px-3">Courier & Tracking</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-right">Logistics Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(() => {
                const displayOrders =
                  shippingSubTab === "active"
                    ? activeShipments
                    : shippingSubTab === "ready"
                    ? readyToAssign
                    : orderList

                if (displayOrders.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-500 text-xs">
                        {shippingSubTab === "active"
                          ? "No active courier shipments yet. Assign Shiprocket courier to verified orders to generate AWBs."
                          : shippingSubTab === "ready"
                          ? "No pending orders waiting for courier assignment. All current orders are fulfilled."
                          : "No orders registered."}
                      </td>
                    </tr>
                  )
                }

                return displayOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/[0.02] transition">
                    {/* Order ID */}
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => setInspectOrderModal && setInspectOrderModal(ord)}
                        className="font-mono font-bold text-[#d4af37] hover:underline cursor-pointer"
                        title="Inspect order details"
                      >
                        {ord.id}
                      </button>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{ord.date}</p>
                      <p className="text-white text-xs truncate max-w-[170px] mt-1">{ord.shirtName}</p>
                    </td>

                    {/* Patron & Destination */}
                    <td className="py-3.5 px-3 max-w-[200px]">
                      <p className="font-semibold text-white">{ord.customer}</p>
                      <p className="text-[11px] text-zinc-400">{ord.phone}</p>
                      <p className="text-[10px] text-zinc-300 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-2.5 w-2.5 text-[#d4af37] shrink-0" />
                        <span>{ord.city} (PIN {ord.pincode})</span>
                      </p>
                    </td>

                    {/* Courier & AWB */}
                    <td className="py-3.5 px-3">
                      {ord.awb ? (
                        <div>
                          <p className="font-semibold text-white text-xs">{ord.courier || "Shiprocket Express"}</p>
                          <p className="font-mono text-[11px] text-[#d4af37] mt-0.5">
                            AWB: <span className="font-bold">{ord.awb}</span>
                          </p>
                          <a
                            href={`https://shiprocket.co/tracking/${ord.awb}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:underline mt-1"
                          >
                            <span>Live Tracking</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      ) : (
                        <div className="text-zinc-500 italic text-[11px]">
                          {ord.status === "Pending Verification"
                            ? "Awaiting Admin Verification"
                            : "Ready for Shiprocket Assignment"}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
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
                    </td>

                    {/* Logistics Actions */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Step 1: Verify if pending */}
                        {ord.status === "Pending Verification" && handleVerifyOrder && (
                          <button
                            onClick={() => handleVerifyOrder(ord.id)}
                            className="rounded-lg bg-[#d4af37] px-2.5 py-1 text-[10px] font-bold text-black hover:brightness-110 shadow transition"
                            title="Verify patron details and approve order"
                          >
                            Verify
                          </button>
                        )}

                        {/* Step 2: Assign Courier (For all active orders without AWB) */}
                        {!ord.awb && ord.status !== "Cancelled" && ord.status !== "Delivered" && setAssignCourierModal && (
                          <button
                            onClick={() => setAssignCourierModal(ord)}
                            className="rounded-lg bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-blue-500 shadow transition flex items-center gap-1 cursor-pointer"
                            title="Assign Shiprocket Courier Partner and generate AWB"
                          >
                            <Truck className="h-3 w-3" />
                            <span>Assign Courier</span>
                          </button>
                        )}

                        {/* Re-assign Courier Button (For orders already with AWB) */}
                        {ord.awb && ord.status !== "Cancelled" && ord.status !== "Delivered" && setAssignCourierModal && (
                          <button
                            onClick={() => setAssignCourierModal(ord)}
                            className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-[10px] font-semibold text-blue-300 hover:bg-blue-500 hover:text-white transition flex items-center gap-1 cursor-pointer"
                            title={`Re-assign courier or change carrier from ${ord.courier || "current courier"}`}
                          >
                            <Truck className="h-3 w-3" />
                            <span>Re-assign</span>
                          </button>
                        )}

                        {/* Step 3: Dispatch / In Transit */}
                        {(ord.status === "Assigned to Courier" || (ord.status === "Verified" && ord.awb)) && handleMarkDispatched && (
                          <button
                            onClick={() => handleMarkDispatched(ord.id)}
                            className="rounded-lg bg-sky-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-sky-500 shadow transition flex items-center gap-1"
                            title="Mark in transit"
                          >
                            <Truck className="h-3 w-3" />
                            <span>In Transit</span>
                          </button>
                        )}

                        {/* Step 4: Mark Delivered */}
                        {(ord.status === "Dispatched" || ord.status === "Assigned to Courier") && handleMarkDelivered && (
                          <button
                            onClick={() => handleMarkDelivered(ord.id)}
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-500 shadow transition flex items-center gap-1"
                            title="Mark delivered"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Delivered</span>
                          </button>
                        )}

                        {/* Download Official Shipping Label (PDF): STRICTLY when assigned with AWB */}
                        {ord.awb && handleDownloadLabel && (
                          <button
                            onClick={() => handleDownloadLabel(ord.id, ord.shiprocket_shipment_id || undefined)}
                            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-black transition flex items-center gap-1"
                            title="Download official Shiprocket shipping label (PDF)"
                          >
                            <FileText className="h-3 w-3" />
                            <span>Label</span>
                          </button>
                        )}

                        {/* Download Official Tax Invoice (PDF): STRICTLY when assigned with AWB */}
                        {ord.awb && handleDownloadInvoice && (
                          <button
                            onClick={() => handleDownloadInvoice(ord.id, ord.shiprocket_order_id || undefined)}
                            className="rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/10 px-2 py-1 text-[10px] font-semibold text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition flex items-center gap-1"
                            title="Download official Shiprocket tax invoice (PDF)"
                          >
                            <Receipt className="h-3 w-3" />
                            <span>Invoice</span>
                          </button>
                        )}

                        {/* Sync Live Tracking Status */}
                        {ord.awb && (
                          <button
                            onClick={() => {
                              if (handleTrackLiveShipment) handleTrackLiveShipment(ord.id)
                              else if (showToast) showToast(`Tracking AWB #${ord.awb} via Shiprocket API`)
                            }}
                            className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-[10px] font-semibold text-blue-400 hover:bg-blue-500 hover:text-white transition flex items-center gap-1"
                            title="Sync live tracking status from Shiprocket API"
                          >
                            <Activity className="h-3 w-3" />
                            <span>Track</span>
                          </button>
                        )}

                        {/* Cancel Shipment Button (Triotech exact pattern: cancels AWB and reverts to Verified for re-shipping) */}
                        {ord.awb && ord.status !== "Cancelled" && ord.status !== "Delivered" && handleCancelShipmentOnly && (
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to cancel the shipment for Order #${ord.id} in Shiprocket? Courier AWB #${ord.awb} will be cancelled and order will return to Verified status.`
                                )
                              ) {
                                handleCancelShipmentOnly(ord.id)
                              }
                            }}
                            className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-300 hover:bg-amber-500 hover:text-black transition flex items-center gap-1 cursor-pointer"
                            title="Cancel shipment in Shiprocket and release courier AWB"
                          >
                            <RotateCcw className="h-3 w-3 text-amber-400" />
                            <span>Cancel Shipment</span>
                          </button>
                        )}

                        {/* Full Cancel Order button */}
                        {ord.status !== "Cancelled" && ord.status !== "Delivered" && setCancelOrderModal && (
                          <button
                            onClick={() => setCancelOrderModal(ord)}
                            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition cursor-pointer"
                            title={ord.awb ? "Cancel courier shipment on Shiprocket and mark order as Cancelled" : "Cancel order"}
                          >
                            <Ban className="h-3 w-3" />
                          </button>
                        )}

                        {/* Inspect details button */}
                        <button
                          onClick={() => setInspectOrderModal && setInspectOrderModal(ord)}
                          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition"
                          title="View complete order breakdown"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Pincode Serviceability Tester */}
      <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl space-y-4">
        <h4 className="font-serif text-base font-bold text-white">Live PIN Code Serviceability Checker</h4>
        <form onSubmit={handlePincodeCheck} className="flex flex-col sm:flex-row gap-3 max-w-md">
          <input
            type="text"
            maxLength={6}
            placeholder="Enter 6-digit PIN code (e.g. 110001)"
            value={checkPincode}
            onChange={(e) => setCheckPincode(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#d4af37] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 transition"
          >
            Check PIN
          </button>
        </form>

        {pincodeResult && (
          <div className="mt-4 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 p-4 text-xs space-y-2">
            <p className="font-bold text-white">
              Destination: {pincodeResult.city} (PIN: {pincodeResult.pincode}) - Serviceable ✅
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-zinc-300">
              <p>
                <strong>Delhivery:</strong> {pincodeResult.delhivery}
              </p>
              <p>
                <strong>BlueDart:</strong> {pincodeResult.blueDart}
              </p>
              <p>
                <strong>DTDC:</strong> {pincodeResult.dtdc}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
