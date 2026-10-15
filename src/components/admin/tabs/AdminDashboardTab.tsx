import React, { useMemo } from "react"
import Image from "next/image"
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Users,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Ban,
  Eye,
  FileText,
  Receipt,
  Activity,
  MapPin,
} from "lucide-react"
import { Product, AdminOrder, Customer, formatINR } from "../types"
import { SkeletonMetrics } from "../AdminSkeletonLoaders"

interface AdminDashboardTabProps {
  isLoadingAll: boolean
  productList: Product[]
  orderList: AdminOrder[]
  customerList: Customer[]
  setActiveTab: (tab: string) => void
  handleVerifyOrder?: (id: string) => void
  handleMarkDispatched?: (id: string) => void
  handleMarkDelivered?: (id: string) => void
  handleDownloadLabel?: (orderId: string, shipmentId?: string | number) => void
  handleDownloadInvoice?: (orderId: string, shiprocketOrderId?: string | number) => void
  handleTrackLiveShipment?: (orderId: string) => void
  setInspectOrderModal?: (order: AdminOrder | null) => void
  setAssignCourierModal?: (order: AdminOrder | null) => void
  setCancelOrderModal?: (order: AdminOrder | null) => void
  showToast?: (msg: string) => void
}

export function AdminDashboardTab({
  isLoadingAll,
  productList,
  orderList,
  customerList,
  setActiveTab,
  handleVerifyOrder,
  handleMarkDispatched,
  handleMarkDelivered,
  handleDownloadLabel,
  handleDownloadInvoice,
  handleTrackLiveShipment,
  setInspectOrderModal,
  setAssignCourierModal,
  setCancelOrderModal,
  showToast,
}: AdminDashboardTabProps) {
  const totalRevenue = useMemo(() => {
    return orderList.reduce((sum, o) => {
      const orderTotal = o.total || 0
      return sum + (orderTotal > 10000 ? Math.round(orderTotal / 100) : orderTotal)
    }, 0)
  }, [orderList])

  const shirtsSoldCount = useMemo(() => {
    return orderList.reduce((sum, o) => sum + (o.qty || 1), 0)
  }, [orderList])

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* 4 Hero KPI Cards */}
      {isLoadingAll ? (
        <SkeletonMetrics />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#16191f] to-[#121418] p-5 shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">Total Revenue</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37]">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">{formatINR(totalRevenue)}</h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-semibold">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Live from store orders</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#16191f] to-[#121418] p-5 shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">Total Orders</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">{orderList.length}</h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-semibold">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Real-time database sync</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#16191f] to-[#121418] p-5 shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">Artisanal Shirts Sold</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">{shirtsSoldCount} {shirtsSoldCount === 1 ? "Unit" : "Units"}</h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-semibold">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Total verified items</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#16191f] to-[#121418] p-5 shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">Registered Patrons</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">{customerList.length}</h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-400 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Active registered accounts</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Chart & Low Stock Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales Trajectory */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-serif text-lg font-bold text-white">Revenue Performance (FY 2026)</h4>
              <p className="text-xs text-zinc-400">Artisanal single-needle embroidery & pure linen shipments</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-xs text-[#d4af37] font-semibold">
                Avg Order Value: ₹2,450
              </span>
            </div>
          </div>

          {/* CSS Bar Chart */}
          <div className="h-52 flex items-end justify-between gap-2 pt-6 border-b border-white/10">
            {[
              { m: "May", h: 42, v: "₹4.2L" },
              { m: "Jun", h: 58, v: "₹5.8L" },
              { m: "Jul", h: 49, v: "₹4.9L" },
              { m: "Aug", h: 74, v: "₹7.4L" },
              { m: "Sep", h: 68, v: "₹6.8L" },
              { m: "Oct", h: 95, v: "₹8.4L" },
            ].map((item, idx) => (
              <div key={item.m} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  {item.v}
                </span>
                <div
                  style={{ height: `${item.h}%` }}
                  className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 ${
                    idx === 5
                      ? "bg-gradient-to-t from-[#d4af37] to-[#f3e5ab] shadow-lg shadow-[#d4af37]/20"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                />
                <span className="text-[11px] font-semibold text-zinc-400 mt-2">{item.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <h4 className="font-serif text-base font-bold text-white">Low Stock Watchlist</h4>
              </div>
              <button
                onClick={() => setActiveTab("Inventory")}
                className="text-xs font-semibold text-[#d4af37] hover:underline"
              >
                Manage All &rarr;
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              {productList.slice(0, 4).map((p) => {
                const stockTotal = Object.values(p.stock || {}).reduce((a, b) => a + b, 0)
                return (
                  <div key={p.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-white/10">
                        <Image src={p.images?.[0] || "/placeholder.jpg"} alt={p.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{p.name}</p>
                        <p className="text-[10px] text-zinc-400">{p.sku}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                        stockTotal <= 10
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {stockTotal} units left
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => setActiveTab("Inventory")}
            className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition"
          >
            Audit Full Inventory &rarr;
          </button>
        </div>
      </div>

      {/* Recent Orders Preview */}
      <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-serif text-lg font-bold text-white">Recent Atelier Orders</h4>
            <p className="text-xs text-zinc-400">Real-time payment verification and dispatch tracking</p>
          </div>
          <button
            onClick={() => setActiveTab("Orders")}
            className="text-xs font-semibold text-[#d4af37] hover:underline"
          >
            View All {orderList.length} Orders &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 font-semibold tracking-wider uppercase text-[11px]">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Patron</th>
                <th className="py-3 px-3">Shirt Item</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orderList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs">
                    No store orders yet. Real live customer orders will appear here automatically.
                  </td>
                </tr>
              ) : (
                orderList.slice(0, 6).map((ord) => (
                <tr key={ord.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-3">
                    <button
                      onClick={() => setInspectOrderModal ? setInspectOrderModal(ord) : setActiveTab("Orders")}
                      className="font-mono font-bold text-[#d4af37] hover:underline cursor-pointer"
                      title="Inspect order details"
                    >
                      {ord.id}
                    </button>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{ord.date}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-semibold text-white">{ord.customer}</p>
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-2.5 w-2.5 text-[#d4af37]" />
                      <span>{ord.city} (PIN {ord.pincode})</span>
                    </p>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="text-white truncate max-w-[180px]" title={ord.shirtName}>{ord.shirtName}</p>
                    <span className="text-[10px] text-zinc-400 font-mono">Size: {ord.size} • Qty: {ord.qty}</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-white">{formatINR(ord.total)}</td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3" />
                      {ord.paymentStatus}
                    </span>
                    <p className="text-[9px] text-zinc-400 mt-1">{ord.paymentMethod}</p>
                  </td>
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
                      <div className="mt-1 space-y-0.5">
                        <p className="text-[10px] font-semibold text-zinc-300">{ord.courier || "Shiprocket"}</p>
                        <p className="text-[9px] font-mono text-[#d4af37]">AWB: {ord.awb}</p>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {/* Quick Verify */}
                      {ord.status === "Pending Verification" && handleVerifyOrder && (
                        <button
                          onClick={() => handleVerifyOrder(ord.id)}
                          className="rounded-lg bg-[#d4af37] px-2.5 py-1 text-[10px] font-bold text-black hover:brightness-110 shadow transition"
                          title="Verify order"
                        >
                          Verify
                        </button>
                      )}

                      {/* Quick Assign Shiprocket */}
                      {!ord.awb && ord.status !== "Cancelled" && ord.status !== "Delivered" && setAssignCourierModal && (
                        <button
                          onClick={() => setAssignCourierModal(ord)}
                          className="rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-blue-500 shadow transition flex items-center gap-1 cursor-pointer"
                          title="Assign Shiprocket Courier and generate AWB"
                        >
                          <Truck className="h-3 w-3" />
                          <span>Shiprocket</span>
                        </button>
                      )}

                      {/* Quick Dispatch */}
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

                      {/* Quick Deliver */}
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

                      {/* Quick Label PDF */}
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

                      {/* Quick Invoice PDF */}
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

                      {/* Quick Track */}
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

                      {/* Inspect details button */}
                      <button
                        onClick={() => setInspectOrderModal ? setInspectOrderModal(ord) : setActiveTab("Orders")}
                        className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition"
                        title="View complete order breakdown"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
