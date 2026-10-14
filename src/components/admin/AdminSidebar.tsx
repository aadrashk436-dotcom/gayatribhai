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
  const handleAdminLogout = () => {
    try {
      localStorage.removeItem("gb_admin_token")
      localStorage.removeItem("gb_admin_user")
      sessionStorage.clear()
    } catch {}
    window.location.href = "/login"
  }

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 h-screen flex-shrink-0 flex flex-col border-r border-white/15 bg-gradient-to-b from-[#181c26] via-[#12151c] to-[#0c0e13] shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:h-screen lg:w-72 lg:shrink-0 lg:flex lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-white/15 px-6 bg-white/[0.02]">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d4af37]/60 bg-[#d4af37]/20 text-[#d4af37] shadow-lg shadow-[#d4af37]/15 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-serif text-lg font-extrabold tracking-[0.16em] text-[#d4af37] drop-shadow-sm">
                GAYATRI BHAI
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                Atelier Admin Suite
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1.5 text-zinc-300 hover:text-white hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Admin User Profile Capsule */}
        <div className="m-4 rounded-2xl border border-white/15 bg-[#1a1f2b] p-3.5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#d4af37] to-[#fce8a6] font-extrabold text-black text-sm shadow-md">
              GP
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white tracking-wide">Gayatri Puri</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold">
                  Store Owner (Online)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-2 admin-scroll">
          <p className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d4af37]">
            Management
          </p>
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
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold tracking-wider transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#d4af37] via-[#e2c462] to-[#c59d28] text-black shadow-lg shadow-[#d4af37]/30 font-extrabold scale-[1.01]"
                    : "text-zinc-100 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComp
                    className={`h-4 w-4 transition-transform ${
                      isActive
                        ? "text-black"
                        : "text-[#d4af37] group-hover:scale-110 group-hover:text-[#f3e5ab]"
                    }`}
                  />
                  <span className="tracking-wide">{item.name}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                      isActive
                        ? "bg-black text-white"
                        : item.badge === "Live"
                        ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40"
                        : String(item.badge).includes("Alert")
                        ? "bg-amber-500/25 text-amber-300 border border-amber-500/40"
                        : "bg-white/15 text-white border border-white/20"
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
        <div className="border-t border-white/15 p-4 space-y-2.5 bg-black/30">
          <Link
            href="/"
            target="_blank"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#1a1f2b] py-2.5 text-xs font-bold tracking-wider text-zinc-100 transition hover:bg-white/15 hover:text-white shadow-sm"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>View Customer Storefront</span>
          </Link>
          <button
            type="button"
            onClick={handleAdminLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/15 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-300 hover:bg-rose-600 hover:text-white transition shadow-md active:scale-95 cursor-pointer"
            title="Sign out of Admin Suite"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  )
}

export default AdminSidebar
