"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useStore } from "@/lib/store"
import { pathToView } from "@/lib/navigation"
import { useAppNavigation } from "@/lib/useAppNavigation"
import Announcement from "@/components/layout/Announcement"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import MobileNav from "@/components/layout/MobileNav"
import SearchOverlay from "@/components/layout/SearchOverlay"
import Icon from "@/components/common/Icon"
import SmoothScroll from "@/components/providers/SmoothScroll"

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const view = pathToView(pathname)
  const { go, openProduct } = useAppNavigation()

  const {
    cart,
    wishlist,
    user,
    menuOpen,
    setMenuOpen,
    searchOpen,
    setSearchOpen,
    query,
    setQuery,
    toast,
    setToast,
  } = useStore()

  // Close menu & search on route change
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [pathname, setMenuOpen, setSearchOpen])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(""), 2400)
    return () => window.clearTimeout(timer)
  }, [toast, setToast])

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="app">
      <SmoothScroll />
      <Announcement />
      <Header
        view={view}
        go={go}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        setSearchOpen={setSearchOpen}
        wishlistCount={wishlist.length}
        cartCount={cartCount}
        user={user}
      />
      <main>{children}</main>
      {!["checkout", "admin", "login"].includes(view) && <Footer go={go} />}
      {!["product", "checkout"].includes(view) && (
        <MobileNav
          view={view}
          go={go}
          cartCount={cartCount}
          wishlistCount={wishlist.length}
          onSearchOpen={() => setSearchOpen(true)}
        />
      )}
      {searchOpen && (
        <SearchOverlay
          query={query}
          setQuery={setQuery}
          onClose={() => setSearchOpen(false)}
          openProduct={openProduct}
        />
      )}
      {toast && (
        <div className="toast">
          <Icon name="check" size={18} />
          {toast}
        </div>
      )}
    </div>
  )
}
