"use client"

import React, { useState } from "react"
import { AdminOrder } from "../types"

interface AssignCourierModalProps {
  order: AdminOrder | null
  onClose: () => void
  onAssign: (orderId: string, courierName: string) => void
}

export function AssignCourierModal({ order, onClose, onAssign }: AssignCourierModalProps) {
  const [selectedCourierName, setSelectedCourierName] = useState("BlueDart Express Air")

  if (!order) return null

  const handleConfirm = () => {
    onAssign(order.id, selectedCourierName)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-white">Assign Shiprocket Courier</h3>
            <p className="text-xs text-zinc-400">Order #{order.id} • {order.customer}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-zinc-300">
            Select courier service for destination PIN <strong className="text-[#d4af37]">{order.pincode}</strong> ({order.city}):
          </p>

          {[
            { name: "BlueDart Express Air", sla: "Next Day Air (24-48 hrs)", rate: "₹95", rec: true },
            { name: "Delhivery Surface Express", sla: "2-3 Business Days", rate: "₹49", rec: false },
            { name: "DTDC Pan-India Air", sla: "3-4 Business Days", rate: "₹55", rec: false },
          ].map((c) => (
            <label
              key={c.name}
              onClick={() => setSelectedCourierName(c.name)}
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                selectedCourierName === c.name
                  ? "border-[#d4af37] bg-[#d4af37]/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="courier"
                  checked={selectedCourierName === c.name}
                  onChange={() => setSelectedCourierName(c.name)}
                  className="accent-[#d4af37]"
                />
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    {c.name}
                    {c.rec && <span className="rounded-full bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 text-[9px] font-bold">Recommended</span>}
                  </p>
                  <p className="text-[10px] text-zinc-400">{c.sla}</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400">{c.rate}</span>
            </label>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-3 text-[11px] text-zinc-400 space-y-1">
          <p className="font-semibold text-zinc-300">Origin Warehouse:</p>
          <p>Gayatri Bhai Atelier Hub #1, Surat/Mumbai Central Warehouse</p>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-xl bg-[#d4af37] px-5 py-2 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 shadow-lg"
          >
            Generate AWB & Book
          </button>
        </div>
      </div>
    </div>
  )
}
