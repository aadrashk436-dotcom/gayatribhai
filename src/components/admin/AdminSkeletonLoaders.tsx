"use client"

import React from "react"
import { Image as ImageIcon, Monitor, Smartphone } from "lucide-react"

export function SkeletonMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-[#16191f] p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-white/10" />
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5" />
          </div>
          <div className="space-y-2">
            <div className="h-7 w-32 rounded bg-[#d4af37]/20" />
            <div className="h-3 w-28 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonProducts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-[#14171d] p-4 shadow-xl space-y-3.5">
          <div className="relative aspect-[4/3] w-full rounded-xl bg-gradient-to-br from-white/5 via-white/10 to-white/5 border border-white/5 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-white/10" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 rounded bg-white/10" />
              <div className="h-3 w-12 rounded bg-emerald-500/20" />
            </div>
            <div className="h-4 w-3/4 rounded bg-white/20" />
            <div className="h-3 w-full rounded bg-white/5" />
          </div>
          <div className="pt-2 border-t border-white/5 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="h-5 w-8 rounded bg-white/5" />
            ))}
          </div>
          <div className="pt-3 border-t border-white/5 flex justify-between items-center">
            <div className="h-5 w-24 rounded bg-[#d4af37]/20" />
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded-lg bg-white/5" />
              <div className="h-8 w-14 rounded-lg bg-[#d4af37]/20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonOrdersTable() {
  return (
    <tbody className="divide-y divide-white/5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <tr key={i} className="animate-pulse">
          <td className="py-4 px-3"><div className="h-4 w-4 rounded bg-white/10" /></td>
          <td className="py-4 px-3 space-y-1.5">
            <div className="h-4 w-24 rounded bg-[#d4af37]/20 font-mono" />
            <div className="h-3 w-16 rounded bg-white/10" />
          </td>
          <td className="py-4 px-3 space-y-1.5">
            <div className="h-4 w-28 rounded bg-white/15" />
            <div className="h-3 w-20 rounded bg-white/10" />
          </td>
          <td className="py-4 px-3 space-y-1.5">
            <div className="h-4 w-40 rounded bg-white/10" />
            <div className="h-3 w-24 rounded bg-white/5" />
          </td>
          <td className="py-4 px-3 space-y-1.5">
            <div className="h-4 w-16 rounded bg-white/15 font-mono" />
            <div className="h-3 w-20 rounded bg-emerald-500/20" />
          </td>
          <td className="py-4 px-3">
            <div className="h-6 w-28 rounded-full bg-white/10" />
          </td>
          <td className="py-4 px-3 text-right">
            <div className="h-8 w-24 rounded-xl bg-white/10 ml-auto" />
          </td>
        </tr>
      ))}
    </tbody>
  )
}

export function SkeletonBanners() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-[#14171d] p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <div className="space-y-2">
              <div className="h-3 w-28 rounded bg-[#d4af37]/30" />
              <div className="h-5 w-52 rounded bg-white/20" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-20 rounded-xl bg-white/10" />
              <div className="h-8 w-20 rounded-xl bg-white/10" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
            <div className="lg:col-span-7 space-y-2">
              <div className="h-3 w-40 rounded bg-white/10" />
              <div className="aspect-[16/9] w-full rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                <Monitor className="h-10 w-10 text-white/10" />
              </div>
            </div>
            <div className="lg:col-span-5 space-y-2 flex flex-col items-center">
              <div className="h-3 w-32 rounded bg-white/10" />
              <div className="w-[240px] aspect-[9/16] rounded-[36px] bg-white/5 border-[5px] border-white/10 flex items-center justify-center">
                <Smartphone className="h-10 w-10 text-white/10" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonBlogs() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-[#14171d] p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-32 rounded-xl bg-white/5 border border-white/5 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="flex gap-2">
                <div className="h-4 w-24 rounded-full bg-[#d4af37]/20" />
                <div className="h-4 w-16 rounded-full bg-emerald-500/20" />
              </div>
              <div className="h-5 w-2/3 rounded bg-white/20" />
              <div className="h-3 w-1/2 rounded bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonInventory() {
  return (
    <tbody className="divide-y divide-white/5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <tr key={i} className="animate-pulse">
          <td className="py-3.5 px-3">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-white/5 border border-white/5 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded bg-white/20" />
                <div className="h-3 w-20 rounded bg-white/10" />
              </div>
            </div>
          </td>
          <td className="py-3.5 px-3"><div className="h-4 w-16 rounded bg-[#d4af37]/20" /></td>
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <td key={s} className="py-3.5 px-2 text-center"><div className="h-6 w-8 rounded-lg bg-white/5 mx-auto" /></td>
          ))}
          <td className="py-3.5 px-3 text-center"><div className="h-5 w-16 rounded-full bg-white/10 mx-auto" /></td>
          <td className="py-3.5 px-3 text-right"><div className="h-4 w-20 rounded bg-white/15 ml-auto" /></td>
          <td className="py-3.5 px-3 text-right"><div className="h-7 w-12 rounded-lg bg-white/10 ml-auto" /></td>
        </tr>
      ))}
    </tbody>
  )
}
