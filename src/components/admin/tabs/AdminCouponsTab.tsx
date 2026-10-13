import React from "react"
import { Coupon } from "../types"

interface AdminCouponsTabProps {
  couponList: Coupon[]
  formatINR: (val: number) => string
  showToast: (msg: string) => void
}

export const AdminCouponsTab: React.FC<AdminCouponsTabProps> = ({
  couponList,
  formatINR,
  showToast,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {couponList.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-white/10 bg-[#14171d] p-5 shadow-xl space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 px-3 py-1 font-mono text-sm font-bold text-[#d4af37]">
                {c.code}
              </span>
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5">
                Active
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-serif text-2xl font-bold text-white">{c.discount}</h4>
              <p className="text-xs text-zinc-400">Min Order Requirement: {formatINR(c.minSpend)}</p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span>
                Used: {c.usedCount} / {c.maxUses} times
              </span>
              <button
                onClick={() => showToast(`Coupon ${c.code} is active and valid for customers.`)}
                className="text-[#d4af37] font-semibold hover:underline"
              >
                Details &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
