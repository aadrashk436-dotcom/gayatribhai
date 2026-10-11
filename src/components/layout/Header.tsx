"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { gsap } from "gsap"
import type { User, View } from "../../types"
import { products } from "../../products"
import Icon from "../common/Icon"
import ThemeToggle from "../providers/ThemeToggle"
import { getLenis } from "../providers/SmoothScroll"

export interface HeaderProps {
  view: View
  go: (v: View) => void
  menuOpen: boolean
  setMenuOpen: (v: boolean) => void
  setSearchOpen: (v: boolean) => void
  wishlistCount: number
  cartCount: number
  user?: User | null
}

const NAV: { label: string; href: string; view: View; tag?: string }[] = [
  { label: "Shirts", href: "/shop", view: "shop" },
  { label: "New In", href: "/shop", view: "shop", tag: "New" },
  { label: "Resort", href: "/shop", view: "shop" },
  { label: "Journal", href: "/blog", view: "blog" },
  { label: "Sale", href: "/shop", view: "shop", tag: "30%" },
]

function Badge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-[18px] text-white">
      {count}
    </span>
  )
}

export function Header({ view, go, menuOpen, setMenuOpen, setSearchOpen, wishlistCount, cartCount, user }: HeaderProps) {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const drawer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 10)
      setHidden(y > 240 && y > last)
      last = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === "Escape") setMenuOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [setSearchOpen, setMenuOpen])

  useEffect(() => {
    const lenis = getLenis()
    if (menuOpen) {
      lenis?.stop()
      document.body.style.overflow = "hidden"
      if (drawer.current) {
        gsap.fromTo(
          drawer.current.querySelectorAll("[data-drawer-item]"),
          { y: 30, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.05, ease: "power3.out", delay: 0.15 },
        )
      }
    } else {
      lenis?.start()
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  const isActive = (item: (typeof NAV)[number]) => item.label === "Shirts" ? view === "shop" : item.view === view && item.view === "blog"

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b transition-[transform,background-color,border-color] duration-500 ${
          hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
        } ${scrolled ? "border-border bg-background/85 backdrop-blur-xl" : "border-transparent bg-background"}`}
      >
        <div className="mx-auto flex h-16 items-center gap-2 px-3 md:h-[76px] md:px-8 lg:px-14">
          <button
            type="button"
            className="relative inline-flex size-10 items-center justify-center rounded-full text-foreground lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className="relative block h-3 w-5">
              <span className={`absolute left-0 top-0 h-[1.5px] w-5 bg-current transition-transform duration-300 ${menuOpen ? "translate-y-[5px] rotate-45" : ""}`} />
              <span className={`absolute bottom-0 left-0 h-[1.5px] bg-current transition-all duration-300 ${menuOpen ? "w-5 -translate-y-[5.5px] -rotate-45" : "w-3.5"}`} />
            </span>
          </button>

          <nav className="hidden flex-1 items-center gap-8 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group relative flex items-center gap-1.5 py-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-foreground"
              >
                {item.label}
                {item.tag && (
                  <span className={`rounded-full px-1.5 py-px text-[9px] font-bold tracking-wider ${item.tag === "New" ? "bg-foreground text-background" : "bg-[#b4321f] text-white"}`}>
                    {item.tag}
                  </span>
                )}
                <span className={`absolute -bottom-0.5 left-0 h-px bg-foreground transition-all duration-300 ${isActive(item) ? "w-full" : "w-0 group-hover:w-full"}`} />
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            aria-label="AVYR home"
            className="absolute left-1/2 -translate-x-1/2 font-display text-[26px] font-medium leading-none tracking-[0.28em] text-foreground md:text-[32px]"
          >
            AVYR
          </Link>

          <div className="ml-auto flex items-center gap-0.5 md:gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden h-10 items-center gap-2 rounded-full border border-border px-4 text-sm text-muted-foreground transition-colors hover:border-foreground/40 xl:flex"
              aria-label="Search products"
            >
              <Icon name="search" size={15} />
              <span>Search</span>
              <kbd className="ml-3 rounded border border-border px-1.5 font-sans text-[10px]">⌘K</kbd>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5 xl:hidden"
              aria-label="Search products"
            >
              <Icon name="search" size={19} />
            </button>
            <ThemeToggle />
            <Link
              href={user ? "/account" : "/login"}
              className={`hidden items-center gap-1.5 rounded-full text-foreground transition-all hover:bg-foreground/5 md:inline-flex ${
                user
                  ? "size-10 justify-center"
                  : "h-9 border border-border/80 px-3 hover:border-foreground/40"
              }`}
              aria-label={user ? `Account: ${user.name}` : "Sign in"}
            >
              {user ? (
                <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
              ) : (
                <>
                  <Icon name="user" size={15} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Sign in</span>
                </>
              )}
            </Link>
            <Link
              href="/wishlist"
              className="relative hidden size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5 md:inline-flex"
              aria-label={`Wishlist, ${wishlistCount} items`}
            >
              <Icon name="heart" size={19} filled={wishlistCount > 0} />
              <Badge count={wishlistCount} />
            </Link>
            <Link
              href="/bag"
              className="relative inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5"
              aria-label={`Shopping bag, ${cartCount} items`}
            >
              <Icon name="bag" size={19} />
              <Badge count={cartCount} />
            </Link>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${menuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <aside
        ref={drawer}
        className={`fixed inset-y-0 left-0 z-[70] flex w-[88%] max-w-sm flex-col bg-background text-foreground shadow-2xl transition-transform duration-[600ms] ease-[cubic-bezier(.7,0,.2,1)] lg:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile menu"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <span className="font-display text-2xl tracking-[0.28em]">AVYR</span>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button type="button" onClick={() => setMenuOpen(false)} className="inline-flex size-10 items-center justify-center rounded-full" aria-label="Close menu">
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>

        <div data-lenis-prevent className="flex-1 overflow-y-auto px-5 py-6">
          <nav className="flex flex-col" aria-label="Mobile">
            {[{ label: "Home", href: "/", view: "home" as View }, ...NAV].map((item) => (
              <Link
                data-drawer-item
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between border-b border-border py-4 font-display text-[28px] leading-none"
              >
                <span>{item.label}</span>
                {"tag" in item && item.tag ? (
                  <span className="rounded-full bg-foreground px-2 py-0.5 font-sans text-[10px] font-bold tracking-wider text-background">{item.tag}</span>
                ) : (
                  <Icon name="arrow" size={16} />
                )}
              </Link>
            ))}
          </nav>

          <div data-drawer-item className="mt-8 grid grid-cols-2 gap-3">
            {[products[3], products[9]].map((p, i) => (
              <Link key={p.id} href="/shop" onClick={() => setMenuOpen(false)} className="group relative block overflow-hidden rounded-sm">
                <div className="relative aspect-[3/4]">
                  <Image src={p.images[0]} alt={p.name} fill sizes="45vw" className="object-cover" />
                </div>
                <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-3 left-3 text-sm font-semibold text-white">{i === 0 ? "Embroidered" : "Linen"}</span>
              </Link>
            ))}
          </div>
        </div>

        <div data-drawer-item className="border-t border-border p-5">
          <Link
            href={user ? "/account" : "/login"}
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 rounded-sm bg-surface-2 p-3"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
              {user ? user.name.slice(0, 2).toUpperCase() : <Icon name="user" size={18} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{user ? user.name : "Sign in / Join"}</span>
              <span className="block truncate text-xs text-muted-foreground">{user ? "View profile & orders" : "Track orders, save favourites"}</span>
            </span>
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      </aside>
    </>
  )
}

export default Header
