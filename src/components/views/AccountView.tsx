"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { products } from "../../products"
import type { Address, IconName, User, View } from "../../types"
import { money } from "../../utils/format"
import { useStore } from "../../lib/store"
import Icon from "../common/Icon"
import ThemeToggle from "../providers/ThemeToggle"
import { downloadOrderInvoice } from "../../utils/invoice"

gsap.registerPlugin(useGSAP)

export interface AccountViewProps {
  user: User | null
  onUpdateUser: (updated: User) => void
  onLogout: () => void
  addresses: Address[]
  onSaveAddress: (addr: Address) => void
  onDeleteAddress: (id: string) => void
  onSetDefaultAddress: (id: string) => void
  go: (v: View) => void
  showToast: (msg: string) => void
}

type Tab = "Overview" | "Orders" | "Addresses" | "Settings"
const TABS: { id: Tab; icon: IconName }[] = [
  { id: "Overview", icon: "grid-1" },
  { id: "Orders", icon: "package" },
  { id: "Addresses", icon: "map-pin" },
  { id: "Settings", icon: "settings" },
]

const STEPS = ["Placed", "Packed", "Shipped", "On the way", "Delivered"]

function OrderCard({ order }: { order: any }) {
  const items = Array.isArray(order.items) ? order.items : []
  const firstItem = items[0]
  const product =
    order.product ||
    (firstItem ? products.find((p) => p.id === firstItem.productId) : null) ||
    products[0]
  const size = order.size || firstItem?.size || "M"
  const quantity = firstItem?.quantity || 1
  const dateStr =
    order.date ||
    (order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Recently placed")

  const rawStatus = (order.status || "Processing").toLowerCase()
  const isDelivered = rawStatus === "delivered"
  const isCancelled = rawStatus === "cancelled"
  const orderId = order.orderNumber || order.id || "ORD"

  const step =
    typeof order.step === "number"
      ? order.step
      : isDelivered
      ? 4
      : rawStatus === "shipped" || rawStatus === "dispatched" || rawStatus === "on the way"
      ? 2
      : rawStatus === "processing" || rawStatus === "verified" || rawStatus === "packed"
      ? 1
      : 0

  const statusLabel =
    order.status ||
    (step === 4 ? "Delivered" : step === 2 ? "Shipped" : "Processing")

  const totalPrice = order.total || (product ? product.price * quantity : 0)

  return (
    <article className="rounded-sm border border-border bg-surface p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">#{orderId}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{dateStr}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isDelivered
              ? "bg-[#1f7a4a]/12 text-[#1f7a4a]"
              : isCancelled
              ? "bg-[#b4321f]/12 text-[#b4321f]"
              : "bg-accent/15 text-accent"
          }`}
        >
          {statusLabel}
        </span>
      </div>
      <div className="mt-4 flex gap-4">
        <div className="relative h-24 w-[72px] shrink-0 overflow-hidden rounded-sm bg-surface-2">
          {product?.images?.[0] ? (
            <Image src={product.images[0]} alt={product.name} fill sizes="72px" className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-surface-2 text-muted-foreground">
              <Icon name="package" size={24} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground">
            {product?.name || "Artisanal Garment"}
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">
            {`${product?.color || "Exclusive"} · Size ${size}${quantity > 1 ? ` · Qty ${quantity}` : ""}`}
          </p>
          <p className="mt-2 text-[15px] font-bold text-foreground">{money(totalPrice)}</p>
        </div>
      </div>
      {!isCancelled && (
        <div className="mt-5">
          <div className="relative h-1 rounded-full bg-border">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-foreground"
              style={{ width: `${(Math.min(step, STEPS.length - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground md:text-[11px]">
            {STEPS.map((s, i) => (
              <span key={s} className={i <= step ? "text-foreground font-semibold" : ""}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5">
        <p className="text-xs text-muted-foreground">
          {order.courierName ? `Courier: ${order.courierName}` : "Artisanal Packing & Delivery"}
        </p>
        <button
          type="button"
          onClick={() => downloadOrderInvoice(order.orderNumber || order.id)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-foreground transition-all hover:border-foreground hover:bg-surface active:scale-98 shadow-sm"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download Invoice (PDF)
        </button>
      </div>
    </article>
  )
}

const emptyAddress: Address = { id: "", name: "", phone: "", street: "", area: "", city: "", state: "", pincode: "", type: "HOME", isDefault: false }

function AddressDialog({ initial, onClose, onSave }: { initial: Address; onClose: () => void; onSave: (a: Address) => void }) {
  const [form, setForm] = useState<Address>(initial)
  const [error, setError] = useState("")
  const set = (k: keyof Address, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const input = "h-12 w-full rounded-sm border border-border bg-surface px-4 text-[15px] text-foreground outline-none transition-colors focus:border-foreground"

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-dialog-title"
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90svh] w-full overflow-y-auto rounded-t-2xl bg-background p-5 text-foreground md:max-w-lg md:rounded-sm md:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="address-dialog-title" className="font-display text-3xl">
            {initial.id ? "Edit address" : "New address"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-10 items-center justify-center rounded-full hover:bg-foreground/5">
            <Icon name="close" size={18} />
          </button>
        </div>
        <form
          className="grid grid-cols-2 gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            const phoneDigits = form.phone.replace(/\D/g, "")
            if (!form.name.trim() || !form.street.trim() || !form.city.trim() || !/^\d{6}$/.test(form.pincode.trim()) || phoneDigits.length < 10) {
              setError("Please enter full name, mandatory 10-digit mobile number, street, city and a 6-digit pincode.")
              return
            }
            onSave({ ...form, id: form.id || `addr_${Date.now()}` })
          }}
        >
          <label className="col-span-2 text-sm font-medium">
            Full name
            <input className={`${input} mt-1.5`} value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
          </label>
          <label className="col-span-2 text-sm font-medium">
            Phone
            <input className={`${input} mt-1.5`} value={form.phone} onChange={(e) => set("phone", e.target.value)} inputMode="tel" autoComplete="tel" />
          </label>
          <label className="col-span-2 text-sm font-medium">
            House / street
            <input className={`${input} mt-1.5`} value={form.street} onChange={(e) => set("street", e.target.value)} autoComplete="address-line1" />
          </label>
          <label className="col-span-2 text-sm font-medium">
            Area / landmark
            <input className={`${input} mt-1.5`} value={form.area} onChange={(e) => set("area", e.target.value)} autoComplete="address-line2" />
          </label>
          <label className="text-sm font-medium">
            City
            <input className={`${input} mt-1.5`} value={form.city} onChange={(e) => set("city", e.target.value)} autoComplete="address-level2" />
          </label>
          <label className="text-sm font-medium">
            Pincode
            <input className={`${input} mt-1.5`} value={form.pincode} onChange={(e) => set("pincode", e.target.value)} inputMode="numeric" maxLength={6} autoComplete="postal-code" />
          </label>
          <label className="col-span-2 text-sm font-medium">
            State
            <input className={`${input} mt-1.5`} value={form.state} onChange={(e) => set("state", e.target.value)} autoComplete="address-level1" />
          </label>
          <fieldset className="col-span-2 mt-1">
            <legend className="mb-2 text-sm font-medium">Type</legend>
            <div className="flex gap-2">
              {(["HOME", "WORK", "OTHER"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("type", t)}
                  aria-pressed={form.type === t}
                  className={`h-10 rounded-full border px-5 text-xs font-semibold tracking-wider ${form.type === t ? "border-foreground bg-foreground text-background" : "border-border text-foreground"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="col-span-2 mt-1 flex items-center gap-3 text-sm">
            <input type="checkbox" checked={Boolean(form.isDefault)} onChange={(e) => set("isDefault", e.target.checked)} className="size-4" />
            Set as default address
          </label>
          {error && <p className="col-span-2 text-sm font-medium text-[#b4321f]">{error}</p>}
          <button type="submit" className="col-span-2 mt-3 h-13 rounded-full bg-foreground py-4 text-sm font-semibold uppercase tracking-[0.14em] text-background">
            Save address
          </button>
        </form>
      </div>
    </div>
  )
}

function GuestState() {
  return (
    <div className="grid min-h-[70svh] place-items-center px-5 py-16 text-center">
      <div className="max-w-sm">
        <div className="relative mx-auto mb-8 aspect-[4/5] w-48 overflow-hidden rounded-sm">
          <Image src="/assets/banners/auth-portrait.jpg" alt="" fill sizes="192px" className="object-cover" />
        </div>
        <h1 className="font-display text-4xl text-foreground">Your profile</h1>
        <p className="mt-3 text-muted-foreground">Sign in to see orders, addresses and saved shirts.</p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/login" className="flex h-13 items-center justify-center rounded-full bg-foreground py-4 text-sm font-semibold uppercase tracking-[0.14em] text-background">
            Sign in
          </Link>
          <Link href="/signup" className="flex items-center justify-center rounded-full border border-border py-4 text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}

export function AccountView({ user, onUpdateUser, onLogout, addresses, onSaveAddress, onDeleteAddress, onSetDefaultAddress, showToast }: AccountViewProps) {
  const root = useRef<HTMLDivElement>(null)
  const [tab, setTab] = useState<Tab>("Overview")
  const [dialog, setDialog] = useState<Address | null>(null)
  const [profile, setProfile] = useState({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" })
  const [prefs, setPrefs] = useState({ drops: true, orders: true, whatsapp: false })
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const wishlist = useStore((s) => s.wishlist)
  const saved = products.filter((p) => wishlist.includes(p.id))

  // Fetch real user orders from API
  useEffect(() => {
    if (!user) return
    let isMounted = true
    const fetchOrders = async () => {
      setLoadingOrders(true)
      try {
        const query = user.email
          ? `email=${encodeURIComponent(user.email)}`
          : user.phone
          ? `phone=${encodeURIComponent(user.phone)}`
          : ""
        if (!query) {
          setOrders([])
          setLoadingOrders(false)
          return
        }
        const res = await fetch(`/api/orders?${query}`)
        if (res.ok) {
          const data = await res.json()
          if (isMounted) {
            setOrders(Array.isArray(data.orders) ? data.orders : [])
          }
        } else {
          if (isMounted) setOrders([])
        }
      } catch (err) {
        console.warn("Could not load user orders:", err)
        if (isMounted) setOrders([])
      } finally {
        if (isMounted) setLoadingOrders(false)
      }
    }
    fetchOrders()
    return () => {
      isMounted = false
    }
  }, [user])

  useGSAP(
    () => {
      if (!user) return
      gsap
        .timeline()
        .fromTo(".profile-cover", { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "expo.inOut" })
        .from(".profile-avatar", { scale: 0.6, autoAlpha: 0, duration: 0.8, ease: "back.out(1.6)" }, 0.6)
        .from("[data-profile-item]", { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: "power3.out" }, 0.7)
    },
    { scope: root, dependencies: [Boolean(user)] },
  )

  useGSAP(
    () => {
      gsap.from(".tab-panel > *", { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.05, ease: "power3.out" })
    },
    { scope: root, dependencies: [tab], revertOnUpdate: true },
  )

  if (!user) return <GuestState />

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const points = user.points ?? 0
  const tier = user.membershipTier ?? "Silver"

  const stats = [
    { label: "Orders", value: orders.length },
    { label: "Saved", value: wishlist.length },
    { label: "Points", value: points.toLocaleString("en-IN") },
    { label: "Addresses", value: addresses.length },
  ]

  return (
    <div ref={root} className="bg-background pb-28 text-foreground md:pb-20">
      <div className="profile-cover relative h-40 overflow-hidden md:h-64">
        <Image src="/assets/banners/promo-linen-wide.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[60%_center]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50" />
      </div>

      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <div className="-mt-12 flex flex-col gap-5 md:-mt-16 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-4 md:gap-6">
            <div className="profile-avatar relative flex size-24 shrink-0 overflow-hidden items-center justify-center rounded-full border-4 border-background bg-foreground font-display text-3xl text-background md:size-32 md:text-4xl shadow-md">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.name} className="size-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="pb-1" data-profile-item>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                <Icon name="award" size={12} /> {tier} member
              </span>
              <h1 className="mt-2 font-display text-3xl leading-none md:text-5xl">{user.name}</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">{`${user.email}${user.joinedDate ? ` · Since ${user.joinedDate}` : ""}`}</p>
            </div>
          </div>
          <div data-profile-item className="flex gap-2">
            <button type="button" onClick={() => setTab("Settings")} className="flex h-11 items-center gap-2 rounded-full border border-border px-5 text-xs font-semibold uppercase tracking-[0.12em]">
              <Icon name="edit" size={15} /> Edit profile
            </button>
            <button type="button" onClick={onLogout} className="flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-xs font-semibold uppercase tracking-[0.12em] text-background">
              <Icon name="logout" size={15} /> Log out
            </button>
          </div>
        </div>

        <dl data-profile-item className="mt-8 grid grid-cols-4 divide-x divide-border rounded-sm border border-border bg-surface">
          {stats.map((s) => (
            <div key={s.label} className="px-2 py-4 text-center md:py-6">
              <dd className="font-display text-2xl leading-none md:text-4xl">{s.value}</dd>
              <dt className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground md:text-xs">{s.label}</dt>
            </div>
          ))}
        </dl>

        <div className="mt-8 grid gap-8 md:grid-cols-[220px_1fr] md:gap-12">
          <nav
            aria-label="Profile sections"
            className="sticky top-16 z-10 -mx-5 flex gap-2 overflow-x-auto bg-background/90 px-5 py-3 backdrop-blur-xl [scrollbar-width:none] md:static md:mx-0 md:flex-col md:gap-1 md:bg-transparent md:p-0 md:backdrop-blur-none [&::-webkit-scrollbar]:hidden"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id}
                className={`flex h-11 shrink-0 items-center gap-3 rounded-full px-5 text-sm font-semibold transition-colors md:rounded-sm md:px-4 ${
                  tab === t.id ? "bg-foreground text-background" : "border border-border text-foreground hover:bg-foreground/5 md:border-transparent"
                }`}
              >
                <Icon name={t.icon} size={17} />
                {t.id}
              </button>
            ))}
          </nav>

          <div className="tab-panel flex min-w-0 flex-col gap-6">
            {tab === "Overview" && (
              <>
                <div className="relative overflow-hidden rounded-sm bg-solid p-6 text-solid-foreground md:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] opacity-70">AVYR rewards</p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <p className="font-display text-5xl leading-none md:text-6xl">{points.toLocaleString("en-IN")}</p>
                    <p className="text-right text-sm opacity-80">
                      {points > 0 ? `= ${money(Math.floor(points / 10))} off` : "Start earning on orders"}
                    </p>
                  </div>
                  <div className="mt-6 h-1 rounded-full bg-current/20">
                    <div className="h-1 rounded-full bg-current" style={{ width: `${Math.min(100, (points / 2000) * 100)}%` }} />
                  </div>
                  <p className="mt-2 text-xs opacity-70">
                    {points >= 2000 ? "Artisan VIP Tier Unlocked" : `${Math.max(0, 2000 - points).toLocaleString("en-IN")} points to Artisan VIP`}
                  </p>
                </div>

                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-display text-2xl">Latest order</h2>
                    {orders.length > 0 && (
                      <button type="button" onClick={() => setTab("Orders")} className="text-sm font-semibold underline underline-offset-4">
                        All orders ({orders.length})
                      </button>
                    )}
                  </div>
                  {orders.length > 0 ? (
                    <OrderCard order={orders[0]} />
                  ) : (
                    <div className="rounded-sm border border-dashed border-border p-6 text-center">
                      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
                        <Icon name="package" size={20} />
                      </div>
                      <p className="font-display text-lg">No orders placed yet</p>
                      <p className="mt-1 text-sm text-muted-foreground">Your handcrafted bespoke orders will appear here once placed.</p>
                      <Link href="/shop" className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-background">
                        Explore collection <Icon name="arrow" size={14} />
                      </Link>
                    </div>
                  )}
                </section>

                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-display text-2xl">Saved shirts</h2>
                    <Link href="/wishlist" className="text-sm font-semibold underline underline-offset-4">
                      View all
                    </Link>
                  </div>
                  {saved.length ? (
                    <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                      {saved.slice(0, 4).map((p) => (
                        <Link key={p.id} href={`/product/${p.slug}`} className="group block">
                          <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-surface-2">
                            <Image src={p.images[0]} alt={p.name} fill sizes="25vw" className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                          </div>
                          <p className="mt-2 line-clamp-1 text-sm font-semibold">{p.name}</p>
                          <p className="text-sm text-muted-foreground">{money(p.price)}</p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link href="/shop" className="flex items-center justify-between rounded-sm border border-dashed border-border p-5 text-sm text-muted-foreground hover:text-foreground">
                      Nothing saved yet. Browse shirts <Icon name="arrow" size={16} />
                    </Link>
                  )}
                </section>
              </>
            )}

            {tab === "Orders" && (
              <>
                <h2 className="font-display text-3xl">Orders</h2>
                {loadingOrders ? (
                  <div className="rounded-sm border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
                    Loading your bespoke orders...
                  </div>
                ) : orders.length > 0 ? (
                  orders.map((o) => (
                    <OrderCard key={o.id || o.orderNumber} order={o} />
                  ))
                ) : (
                  <div className="rounded-sm border border-dashed border-border p-10 text-center">
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
                      <Icon name="package" size={24} />
                    </div>
                    <h3 className="font-display text-2xl">No orders yet</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                      You have not placed any orders yet. Discover our limited edition French linen shirts and bespoke resortwear.
                    </p>
                    <Link href="/shop" className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-background">
                      Discover collection <Icon name="arrow" size={14} />
                    </Link>
                  </div>
                )}
              </>
            )}

            {tab === "Addresses" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-3xl">Addresses</h2>
                  <button type="button" onClick={() => setDialog(emptyAddress)} className="flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-xs font-semibold uppercase tracking-[0.12em] text-background">
                    <Icon name="plus" size={15} /> Add
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {addresses.map((a) => (
                    <article key={a.id} className={`rounded-sm border bg-surface p-5 ${a.isDefault ? "border-foreground" : "border-border"}`}>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-bold tracking-wider">{a.type}</span>
                        {a.isDefault && <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">Default</span>}
                      </div>
                      <p className="mt-3 font-semibold">{a.name}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {[a.street, a.area, `${a.city}, ${a.state} ${a.pincode}`].filter(Boolean).join(", ")}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{a.phone}</p>
                      <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-4 text-sm font-semibold">
                        <button type="button" onClick={() => setDialog(a)} className="underline underline-offset-4">
                          Edit
                        </button>
                        {!a.isDefault && (
                          <button type="button" onClick={() => onSetDefaultAddress(a.id)} className="underline underline-offset-4">
                            Make default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteAddress(a.id)
                            showToast("Address removed")
                          }}
                          className="text-[#b4321f] underline underline-offset-4"
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
                  <button
                    type="button"
                    onClick={() => setDialog(emptyAddress)}
                    className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border text-sm font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <Icon name="plus" size={20} /> Add new address
                  </button>
                </div>
              </>
            )}

            {tab === "Settings" && (
              <>
                <h2 className="font-display text-3xl">Settings</h2>
                <form
                  className="grid gap-4 rounded-sm border border-border bg-surface p-5 md:grid-cols-2 md:p-6"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (profile.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(profile.email)) {
                      showToast("Please enter a valid name and email")
                      return
                    }
                    onUpdateUser({ ...user, ...profile })
                    showToast("Profile updated")
                  }}
                >
                  {(
                    [
                      ["name", "Full name", "name"],
                      ["email", "Email", "email"],
                      ["phone", "Phone", "tel"],
                    ] as const
                  ).map(([key, label, ac]) => (
                    <label key={key} className={`text-sm font-medium ${key === "name" ? "md:col-span-2" : ""}`}>
                      {label}
                      <input
                        value={profile[key]}
                        onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                        autoComplete={ac}
                        className="mt-1.5 h-12 w-full rounded-sm border border-border bg-background px-4 text-[15px] outline-none focus:border-foreground"
                      />
                    </label>
                  ))}
                  <button type="submit" className="h-12 rounded-full bg-foreground text-xs font-semibold uppercase tracking-[0.14em] text-background md:col-span-2 md:w-48">
                    Save changes
                  </button>
                </form>

                <div className="divide-y divide-border rounded-sm border border-border bg-surface">
                  <div className="flex items-center justify-between p-5">
                    <div>
                      <p className="font-semibold">Appearance</p>
                      <p className="text-sm text-muted-foreground">Switch between light and dark</p>
                    </div>
                    <ThemeToggle className="border border-border" />
                  </div>
                  {(
                    [
                      ["drops", "New drop alerts", "Be first to know about limited batches"],
                      ["orders", "Order updates", "Shipping and delivery notifications"],
                      ["whatsapp", "WhatsApp updates", "Get updates on WhatsApp"],
                    ] as const
                  ).map(([key, title, sub]) => (
                    <label key={key} className="flex cursor-pointer items-center justify-between gap-4 p-5">
                      <span>
                        <span className="block font-semibold">{title}</span>
                        <span className="block text-sm text-muted-foreground">{sub}</span>
                      </span>
                      <input
                        type="checkbox"
                        role="switch"
                        checked={prefs[key]}
                        onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                        className="peer sr-only"
                      />
                      <span aria-hidden="true" className="relative h-7 w-12 shrink-0 rounded-full bg-border transition-colors after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-foreground peer-checked:after:translate-x-5 peer-checked:after:bg-background peer-focus-visible:ring-2 peer-focus-visible:ring-accent" />
                    </label>
                  ))}
                </div>

                <button type="button" onClick={onLogout} className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#b4321f]/40 text-sm font-semibold text-[#b4321f] md:w-48">
                  <Icon name="logout" size={16} /> Log out
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {dialog && (
        <AddressDialog
          initial={dialog}
          onClose={() => setDialog(null)}
          onSave={(a) => {
            onSaveAddress(a)
            setDialog(null)
            showToast(dialog.id ? "Address updated" : "Address added")
          }}
        />
      )}
    </div>
  )
}

export default AccountView
