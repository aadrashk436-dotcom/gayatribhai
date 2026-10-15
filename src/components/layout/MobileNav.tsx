"use client"

import Link from "next/link"
import type { IconName, View } from "../../types"
import Icon from "../common/Icon"

export interface MobileNavProps {
  view: View
  go: (v: View) => void
  cartCount: number
  wishlistCount?: number
  onSearchOpen?: () => void
}

export function MobileNav({ view, cartCount, wishlistCount = 0, onSearchOpen }: MobileNavProps) {
  const tabs: { label: string; href?: string; icon: IconName; view?: View; count?: number }[] = [
    { label: "Home", href: "/", icon: "home", view: "home" },
    { label: "Shop", href: "/shop", icon: "filter", view: "shop" },
    { label: "Search", icon: "search" },
    { label: "Saved", href: "/wishlist", icon: "heart", view: "wishlist", count: wishlistCount },
    { label: "Profile", href: "/account", icon: "user", view: "account" },
  ]

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between rounded-full border border-border bg-background/90 px-2 py-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.35)] backdrop-blur-xl md:hidden"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map((tab) => {
        const active = tab.view === view || (tab.view === "account" && view === "login")
        const inner = (
          <>
            <span className="relative">
              <Icon name={tab.icon} size={19} filled={tab.icon === "heart" && active} />
              {tab.count ? (
                <span className="absolute -right-2 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold leading-4 text-white">
                  {tab.count}
                </span>
              ) : null}
            </span>
            <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
          </>
        )
        const cls = `flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-full transition-all ${
          active ? "bg-[#141414] text-white dark:bg-[#d4af37] dark:text-[#0c0c0c] font-bold shadow-sm" : "text-foreground/70 hover:text-foreground"
        }`
        return tab.href ? (
          <Link key={tab.label} href={tab.href} className={cls} aria-current={active ? "page" : undefined}>
            {inner}
          </Link>
        ) : (
          <button key={tab.label} type="button" onClick={onSearchOpen} className={cls}>
            {inner}
          </button>
        )
      })}
      <span className="sr-only">{`${cartCount} items in bag`}</span>
    </nav>
  )
}

export default MobileNav
