import React, { useState, useMemo } from "react"
import { Eye, MapPin, Truck, CheckCircle2, ChevronDown, ChevronUp, Search, Users, ShieldCheck } from "lucide-react"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "google" | "orders">("all")

  const toggleExpand = (customerId: string) => {
    setExpandedCustomerId((prev) => (prev === customerId ? null : customerId))
  }

  const googleCount = useMemo(() => {
    return customerList.filter(
      (c) =>
        c.authProvider === "google" ||
        (Array.isArray(c.authProviders) && c.authProviders.includes("google")) ||
        c.email?.toLowerCase().endsWith("@gmail.com")
    ).length
  }, [customerList])

  const buyersCount = useMemo(() => {
    return customerList.filter((c) => (c.ordersCount || 0) > 0).length
  }, [customerList])

  const filteredCustomers = useMemo(() => {
    return customerList.filter((c) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)

      if (!matchesSearch) return false

      if (filterType === "google") {
        return (
          c.authProvider === "google" ||
          (Array.isArray(c.authProviders) && c.authProviders.includes("google")) ||
          c.email?.toLowerCase().endsWith("@gmail.com")
        )
      }

      if (filterType === "orders") {
        return (c.ordersCount || 0) > 0
      }

      return true
    })
  }, [customerList, searchQuery, filterType])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-[#14171d] shadow-xl overflow-hidden">
        {/* Header & Controls */}
        <div className="p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h4 className="font-serif text-lg font-bold text-white">Patrons & VIP Loyalty Circle</h4>
              <span className="rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 px-2 py-0.5 text-[10px] font-bold text-[#d4af37]">
                {customerList.length} Live Synced
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Direct Google-authenticated patrons and store customers with real-time order tracking
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, phone..."
                className="w-48 sm:w-60 rounded-xl border border-white/10 bg-white/5 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 text-[11px]">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  filterType === "all" ? "bg-[#d4af37] text-black shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                All ({customerList.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("google")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition ${
                  filterType === "google" ? "bg-[#4285F4] text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                </svg>
                <span>Google ({googleCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType("orders")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  filterType === "orders" ? "bg-[#d4af37] text-black shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                Buyers ({buyersCount})
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400 font-semibold tracking-wider uppercase text-[11px]">
                <th className="py-4 px-4">Patron Name</th>
                <th className="py-4 px-4">Auth & Contact Details</th>
                <th className="py-4 px-4">Loyalty Tier</th>
                <th className="py-4 px-4">Total Orders</th>
                <th className="py-4 px-4">Lifetime Spend</th>
                <th className="py-4 px-4">Reward Points</th>
                <th className="py-4 px-4">Joined Date</th>
                <th className="py-4 px-4 text-right">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    <p className="font-semibold text-white text-sm">No patrons found</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {searchQuery
                        ? `No results matching "${searchQuery}". Try a different search.`
                        : "Patrons who register via Google or checkout will appear here instantly."}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("")
                          setFilterType("all")
                        }}
                        className="mt-3 text-xs text-[#d4af37] underline"
                      >
                        Reset search filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const customerOrders = orderList.filter(
                    (o) =>
                      (o.email && c.email && o.email.toLowerCase() === c.email.toLowerCase()) ||
                      (o.phone && c.phone && o.phone.replace(/\D/g, "") === c.phone.replace(/\D/g, "")) ||
                      (o.customer && c.name && o.customer.toLowerCase() === c.name.toLowerCase())
                  )
                  const isExpanded = expandedCustomerId === c.id
                  const isGoogleUser =
                    c.authProvider === "google" ||
                    (Array.isArray(c.authProviders) && c.authProviders.includes("google")) ||
                    c.email?.toLowerCase().endsWith("@gmail.com")

                  return (
                    <React.Fragment key={c.id}>
                      <tr className="hover:bg-white/[0.02] transition">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {/* Avatar: Render image URL or Initials */}
                            <div className="relative size-9 shrink-0">
                              {c.avatar && (c.avatar.startsWith("http") || c.avatar.startsWith("/")) ? (
                                <img
                                  src={c.avatar}
                                  alt={c.name}
                                  className="h-9 w-9 rounded-full object-cover border border-[#d4af37]/30 shadow"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none"
                                  }}
                                />
                              ) : null}
                              <div
                                style={{
                                  display:
                                    c.avatar && (c.avatar.startsWith("http") || c.avatar.startsWith("/"))
                                      ? "none"
                                      : "flex",
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#d4af37] to-[#e6c86e] font-bold text-black text-xs shrink-0"
                              >
                                {c.initials || "GB"}
                              </div>
                            </div>

                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-white text-sm">{c.name}</span>
                                {c.isAdmin && (
                                  <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
                                    Owner
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-500 font-mono">ID: {c.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-white text-xs">{c.email}</span>
                              {isGoogleUser && (
                                <span className="inline-flex items-center gap-1 rounded bg-[#4285F4]/15 px-1.5 py-0.5 text-[9px] font-semibold text-[#4285F4] border border-[#4285F4]/30">
                                  <svg width="10" height="10" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                                  </svg>
                                  Google Account
                                </span>
                              )}
                            </div>
                            {c.phone && <p className="text-zinc-400 text-[11px] font-mono">{c.phone}</p>}
                          </div>
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
