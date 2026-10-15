import React, { useState } from "react"
import { Eye, MapPin, Truck, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react"
import { Customer, AdminOrder } from "../types"

interface AdminCustomersTabProps {
  customerList: Customer[]
  orderList?: AdminOrder[]
  formatINR: (val: number) => string
  setInspectOrderModal?: (order: AdminOrder | null) => void
  setActiveTab?: (tab: string) => void
}

export const AdminCustomersTab: React.FC<AdminCustomersTabProps> = ({
  customerList,
  orderList = [],
  formatINR,
  setInspectOrderModal,
  setActiveTab,
}) => {
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null)

  const toggleExpand = (customerId: string) => {
    setExpandedCustomerId((prev) => (prev === customerId ? null : customerId))
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-[#14171d] shadow-xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h4 className="font-serif text-lg font-bold text-white">Patrons & VIP Loyalty Circle</h4>
            <p className="text-xs text-zinc-400">
              Total {customerList.length} registered customers with reward point balances and live order fulfillment tracking
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400 font-semibold tracking-wider uppercase text-[11px]">
                <th className="py-4 px-4">Patron Name</th>
                <th className="py-4 px-4">Contact Details</th>
                <th className="py-4 px-4">Loyalty Tier</th>
                <th className="py-4 px-4">Total Orders</th>
                <th className="py-4 px-4">Lifetime Spend</th>
                <th className="py-4 px-4">Reward Points</th>
                <th className="py-4 px-4">Joined Date</th>
                <th className="py-4 px-4 text-right">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customerList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    <p className="font-semibold text-white text-sm">No registered patrons yet</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Patrons who sign up or check out will be listed here dynamically.
                    </p>
                  </td>
                </tr>
              ) : (
                customerList.map((c) => {
                  const customerOrders = orderList.filter(
                    (o) =>
                      (o.email && c.email && o.email.toLowerCase() === c.email.toLowerCase()) ||
                      (o.phone && c.phone && o.phone.replace(/\D/g, "") === c.phone.replace(/\D/g, "")) ||
                      (o.customer && c.name && o.customer.toLowerCase() === c.name.toLowerCase())
                  )
                  const isExpanded = expandedCustomerId === c.id

                  return (
                    <React.Fragment key={c.id}>
                      <tr className="hover:bg-white/[0.02] transition">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#d4af37] to-[#e6c86e] font-bold text-black text-xs">
                              {c.avatar}
                            </div>
                            <span className="font-semibold text-white text-sm">{c.name}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <p className="text-white">{c.email}</p>
                          <p className="text-zinc-400 text-[11px]">{c.phone}</p>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              c.tier === "Platinum"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : c.tier === "Gold"
                                ? "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30"
                                : "bg-zinc-500/20 text-zinc-300"
                            }`}
                          >
                            {c.tier} Member
                          </span>
                        </td>

                        <td className="py-4 px-4 font-mono font-bold text-white">
                          {c.ordersCount || customerOrders.length} orders
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-white">{formatINR(c.totalSpent)}</td>
                        <td className="py-4 px-4 font-mono text-[#d4af37] font-semibold">{c.points} pts</td>
                        <td className="py-4 px-4 text-zinc-400">{c.joined}</td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => toggleExpand(c.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition"
                          >
                            <span>{customerOrders.length} Orders</span>
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Patron Orders Drawer */}
                      {isExpanded && (
                        <tr className="bg-black/30">
                          <td colSpan={8} className="p-4 border-y border-white/5">
                            <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-4 space-y-3">
                              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                                <span className="font-semibold text-white text-xs">
                                  Order History for {c.name} ({customerOrders.length} records)
                                </span>
                                {setActiveTab && (
                                  <button
                                    onClick={() => setActiveTab("Orders")}
                                    className="text-[11px] text-[#d4af37] hover:underline"
                                  >
                                    Manage in Orders Tab &rarr;
                                  </button>
                                )}
                              </div>

                              {customerOrders.length === 0 ? (
                                <p className="text-zinc-500 text-xs italic py-2">
                                  No orders associated with this email or phone yet.
                                </p>
                              ) : (
                                <div className="divide-y divide-white/5 space-y-2">
                                  {customerOrders.map((ord) => (
                                    <div
                                      key={ord.id}
                                      className="flex flex-wrap items-center justify-between gap-3 pt-2 first:pt-0"
                                    >
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => setInspectOrderModal && setInspectOrderModal(ord)}
                                            className="font-mono font-bold text-[#d4af37] hover:underline"
                                          >
                                            {ord.id}
                                          </button>
                                          <span className="text-zinc-400 text-[10px]">• {ord.date}</span>
                                          <span
                                            className={`rounded-full px-2 py-0.2 text-[9px] font-bold ${
                                              ord.status === "Delivered"
                                                ? "bg-emerald-500/20 text-emerald-400"
                                                : ord.status === "Assigned to Courier" || ord.status === "Dispatched"
                                                ? "bg-blue-500/20 text-blue-400"
                                                : ord.status === "Verified"
                                                ? "bg-purple-500/20 text-purple-400"
                                                : ord.status === "Cancelled"
                                                ? "bg-rose-500/20 text-rose-400"
                                                : "bg-amber-500/20 text-amber-400"
                                            }`}
                                          >
                                            {ord.status}
                                          </span>
                                        </div>
                                        <p className="text-white text-xs mt-0.5 truncate max-w-sm">
                                          {ord.shirtName} (Size: {ord.size} • Qty: {ord.qty})
                                        </p>
                                        {ord.awb && (
                                          <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1 font-mono">
                                            <Truck className="h-2.5 w-2.5 text-[#d4af37]" />
                                            <span>
                                              {ord.courier || "Shiprocket"}: AWB {ord.awb}
                                            </span>
                                          </p>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold text-white text-xs">
                                          {formatINR(ord.total)}
                                        </span>
                                        {setInspectOrderModal && (
                                          <button
                                            onClick={() => setInspectOrderModal(ord)}
                                            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-300 hover:text-white hover:bg-white/10 transition"
                                            title="Inspect order details"
                                          >
                                            <Eye className="h-3.5 w-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
