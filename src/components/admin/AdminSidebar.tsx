"use client"

import React from "react"
import Link from "next/link"
import { ShieldCheck, X, ExternalLink, LogOut } from "lucide-react"

interface NavItem {
  name: string
  icon: React.ElementType
  badge: string | number | null
}

interface AdminSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  navItems: NavItem[]
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  navItems,
}: AdminSidebarProps) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 h-screen flex-shrink-0 flex flex-col border-r border-white/10 bg-[#121418] transition-transform duration-300 ease-in-out lg:static lg:h-screen lg:w-72 lg:shrink-0 lg:flex lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/15 text-[#d4af37] shadow-inner">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-[0.16em] text-[#d4af37]">GAYATRI BHAI</span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Atelier Admin Suite</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Admin User Profile Capsule */}
        <div className="m-4 rounded-xl border border-white/10 bg-white/5 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#d4af37] to-[#f3e5ab] font-bold text-black text-sm">
              GP
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">Gayatri Puri</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Store Owner (Live)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2 admin-scroll">
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Management</p>
          {navItems.map((item) => {
            const IconComp = item.icon
            const isActive = activeTab === item.name
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name)
                  setMobileMenuOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold tracking-wider transition-all duration-150 ${
                  isActive
                    ? "bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20 font-bold"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComp className={`h-4 w-4 ${isActive ? "text-black" : "text-zinc-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? "bg-black/20 text-black"
                        : item.badge === "Live"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : String(item.badge).includes("Alert")
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-white/10 text-zinc-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-white/10 p-4 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold tracking-wider text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>View Customer Storefront</span>
          </Link>
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Switch / Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  )
}
