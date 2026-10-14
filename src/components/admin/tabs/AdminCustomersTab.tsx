import React from "react"
import { Customer } from "../types"

interface AdminCustomersTabProps {
  customerList: Customer[]
  formatINR: (val: number) => string
}

export const AdminCustomersTab: React.FC<AdminCustomersTabProps> = ({
  customerList,
  formatINR,
}) => {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-[#14171d] shadow-xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h4 className="font-serif text-lg font-bold text-white">Patrons & VIP Loyalty Circle</h4>
            <p className="text-xs text-zinc-400">
              Total {customerList.length} registered customers with reward point balances
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
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customerList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    <p className="font-semibold text-white text-sm">No registered patrons yet</p>
                    <p className="text-xs text-zinc-500 mt-1">Patrons who sign up or check out will be listed here dynamically.</p>
                  </td>
                </tr>
              ) : (
                customerList.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition">
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

                  <td className="py-4 px-4 font-mono font-bold text-white">{c.ordersCount} orders</td>
                  <td className="py-4 px-4 font-mono font-bold text-white">{formatINR(c.totalSpent)}</td>
                  <td className="py-4 px-4 font-mono text-[#d4af37] font-semibold">{c.points} pts</td>
                  <td className="py-4 px-4 text-zinc-400">{c.joined}</td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
