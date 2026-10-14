"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { products } from "../../products"
import type { Address, IconName, User, View } from "../../types"
import { money } from "../../utils/format"
import { useStore, isDummyAddress } from "../../lib/store"
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

const STEPS = ["Placed", "Verified", "Assigned", "In Transit", "Delivered"]

function CancelOrderDialog({
  order,
  onClose,
  onConfirm,
  isCancelling,
}: {
  order: any
  onClose: () => void
  onConfirm: () => void
  isCancelling: boolean
}) {
  const orderId = order.orderNumber || order.id || "ORD"

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-2 text-[#b4321f]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            <h3 className="font-display text-lg font-bold text-foreground">Cancel Order #{orderId}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {order.paymentMethod === "Cash on Delivery"
            ? "Are you sure you wish to cancel this Cash on Delivery order? Since shipment has not yet been assigned to our courier partner, we will cancel the order immediately. No payment was collected."
            : "Are you sure you wish to cancel this order? Since shipment has not yet been assigned to our courier partner, we will cancel the order immediately and refund any amount charged to your original payment method."}
        </p>

        <div className="rounded-lg border border-border bg-surface-2 p-3 text-xs space-y-1">
          <p className="font-semibold text-foreground">Order Item: {order.shirtName || order.items?.[0]?.name || "Artisanal Garment"}</p>
          <p className="text-muted-foreground">Order Total: {money(order.total || 0)}</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isCancelling}
            onClick={onClose}
            className="rounded-full border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-foreground hover:bg-surface-2 transition"
          >
            Keep My Order
          </button>
          <button
            type="button"
            disabled={isCancelling}
            onClick={onConfirm}
            className="rounded-full bg-[#b4321f] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:brightness-110 shadow transition disabled:opacity-50"
          >
            {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
          </button>
        </div>
      </div>
    </div>
  )
}

function OrderCard({
  order,
  onOpenCancel,
}: {
  order: any
  onOpenCancel?: (order: any) => void
}) {
  const items: any[] = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [
        {
          productId: order.productId,
          name: order.shirtName || "Artisanal Garment",
          sku: order.sku,
          size: order.size || "M",
          quantity: order.qty || 1,
          price: order.price || order.total || 2100,
          image: order.image,
          color: order.color || "Exclusive",
        },
      ]

  const totalItemsCount = items.reduce((acc: number, cur: any) => acc + (cur.quantity || cur.qty || 1), 0)
  const totalPrice = order.total || items.reduce((acc: number, cur: any) => acc + ((cur.price || 0) * (cur.quantity || cur.qty || 1)), 0)

  const dateStr =
    order.date ||
    (order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Recently placed")

  const rawStatus = (order.status || "Pending Verification").toLowerCase()
  const isDelivered = rawStatus === "delivered"
  const isCancelled = rawStatus === "cancelled"
  const isDispatched = rawStatus === "dispatched" || rawStatus === "shipped" || rawStatus === "in transit" || rawStatus === "on the way"
  const isAssigned = Boolean(order.awb) || rawStatus === "assigned to courier" || rawStatus === "assigned"
  const isVerified = rawStatus === "verified" || rawStatus === "packed" || rawStatus === "confirmed"
  const orderId = order.orderNumber || order.id || "ORD"

  const step =
    typeof order.step === "number"
      ? order.step
      : isDelivered
      ? 4
      : isDispatched
      ? 3
      : isAssigned
      ? 2
      : isVerified
      ? 1
      : 0

  let statusLabel = order.status || "Pending Verification"
  if (isCancelled) statusLabel = "Cancelled"
  else if (isDelivered) statusLabel = "Delivered"
  else if (isDispatched) statusLabel = "In Transit (Out for Delivery)"
  else if (isAssigned) statusLabel = "Courier Assigned"
  else if (isVerified) statusLabel = "Order Verified & Packed"
  else statusLabel = "Order Placed"

  // Cancellation rule: ONLY allowed while shipping is NOT assigned yet (no AWB and not assigned/dispatched/delivered)
  const canCancel = !order.awb && !isAssigned && !isDispatched && !isDelivered && !isCancelled

  return (
    <article className="rounded-sm border border-border bg-surface p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">#{orderId}</p>
            {order.paymentMethod === "Cash on Delivery" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                💵 Cash on Delivery {isDelivered ? "(Paid)" : "(Pay at Doorstep)"}
              </span>
            ) : order.paymentStatus === "Paid" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                💳 Online (Paid)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                💳 Online Payment ({order.paymentStatus || "Pending"})
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{dateStr}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isDelivered
              ? "bg-[#1f7a4a]/12 text-[#1f7a4a]"
              : isCancelled
              ? "bg-[#b4321f]/12 text-[#b4321f]"
              : isDispatched || isAssigned
              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
              : isVerified
              ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
              : "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Ordered Items Breakdown */}
      <div className="mt-4 divide-y divide-border/60 rounded-lg border border-border/50 bg-background/50 p-3">
        {items.map((it: any, idx: number) => {
          const itemProd = products.find((p) => p.id === (it.productId || it.id) || p.slug === (it.productId || it.id))
          const itemImage = it.image || itemProd?.images?.[0] || "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg"
          const itemSize = it.size || "M"
          const itemQty = it.quantity || it.qty || 1
          const itemPrice = it.price || (itemProd ? itemProd.price : 0)
          const itemName = it.name || it.shirtName || itemProd?.name || "Artisanal Shirt"
          const itemColor = it.color || itemProd?.color || "Exclusive"

          return (
            <div key={`${it.id || it.productId || idx}-${idx}`} className="flex items-center gap-3.5 py-2.5 first:pt-0 last:pb-0">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-sm bg-surface-2 border border-border/50">
                <Image src={itemImage} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-1 text-sm font-semibold text-foreground">
                  {itemName}
                </h4>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                    Size: {itemSize}
                  </span>
                  <span>Qty: {itemQty}</span>
                  {itemColor && <span>• {itemColor}</span>}
                  {it.sku && <span className="font-mono text-[10px] text-muted-foreground/60">({it.sku})</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-foreground">{money(itemPrice * itemQty)}</p>
                {itemQty > 1 && (
                  <p className="text-[10px] text-muted-foreground">{itemQty} × {money(itemPrice)}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Financial Summary */}
      <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>{totalItemsCount} {totalItemsCount === 1 ? "shirt item" : "shirt items"} ordered</span>
        <div className="text-right">
          <span className="text-[11px] text-muted-foreground mr-1.5">Order Total:</span>
          <span className="text-sm font-bold text-foreground">{money(totalPrice)}</span>
        </div>
      </div>

      {/* Delivery Address Details */}
      {(order.shippingAddress?.street || order.address) && (
        <div className="mt-3.5 flex items-start gap-2.5 rounded-lg border border-border/50 bg-surface-2/40 p-3 text-xs text-muted-foreground">
          <span className="text-sm shrink-0 mt-0.5">📍</span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">
              Delivery to: {order.shippingAddress?.name || order.customer || "Valued Patron"}
              {order.phone && <span className="ml-2 font-normal text-muted-foreground">• {order.phone}</span>}
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
              {[order.shippingAddress?.street || order.address, order.shippingAddress?.area, `${order.shippingAddress?.city || order.city || ""}${order.pincode ? ` — PIN ${order.pincode}` : ""}`].filter(Boolean).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Progress Track Bar */}
      {!isCancelled && (
        <div className="mt-5">
          <div className="relative h-1 rounded-full bg-border">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-foreground transition-all duration-500"
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

      {/* Courier & AWB Tracking Block (Visible once AWB is assigned) */}
      {order.awb && !isCancelled && (
        <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-base">🚚</span>
            <div>
              <p className="text-xs font-semibold text-foreground">
                {order.courier || order.courierName || "Shiprocket / Blue Dart Express"}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                AWB Tracking: <span className="font-semibold text-foreground">{order.awb}</span>
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 self-start sm:self-auto">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            Courier Dispatched
          </span>
        </div>
      )}

      {/* Cancelled State Notice */}
      {isCancelled && (
        <div className="mt-4 rounded-xl border border-[#b4321f]/20 bg-[#b4321f]/5 p-3 flex items-center justify-between text-xs text-[#b4321f]">
          <span>Order cancelled {order.cancelReason ? `(${order.cancelReason})` : "upon request"}</span>
          <span className="font-semibold uppercase tracking-wider text-[10px]">
            {order.paymentMethod === "Cash on Delivery" ? "Order Voided (No Charge)" : "Payment Refunded"}
          </span>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5">
        <p className="text-xs text-muted-foreground">
          {order.awb
            ? `Tracking #${order.awb}`
            : order.courier || order.courierName
            ? `Courier: ${order.courier || order.courierName}`
            : "Artisanal Packing & Delivery"}
        </p>

        <div className="flex items-center gap-2">
          {/* Cancel Button (Visible ONLY until shipping/AWB is assigned) */}
          {canCancel && onOpenCancel && (
            <button
              type="button"
              onClick={() => onOpenCancel(order)}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-rose-600 dark:text-rose-400 transition-all hover:bg-rose-100 dark:hover:bg-rose-900/50 active:scale-98"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
              Cancel Order
            </button>
          )}

          {/* Download Invoice (PDF) Button */}
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
    setForm(initial)
    setError("")
  }, [initial])

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

  const defaultPhone = user?.phone || addresses.find((a) => a.isDefault)?.phone || addresses[0]?.phone || ""
  const defaultName = user?.name || addresses.find((a) => a.isDefault)?.name || addresses[0]?.name || ""
  const defaultEmail = user?.email || ""

  const [profile, setProfile] = useState({
    name: defaultName,
    email: defaultEmail,
    phone: defaultPhone,
  })

  // Synchronize profile state when user hydrates or updates
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || addresses.find((a) => a.isDefault)?.name || addresses[0]?.name || "",
        email: user.email || "",
        phone: user.phone || addresses.find((a) => a.isDefault)?.phone || addresses[0]?.phone || "",
      })
    }
  }, [user, addresses])

  const [prefs, setPrefs] = useState({ drops: true, orders: true, whatsapp: false })
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [cancelDialogOrder, setCancelDialogOrder] = useState<any | null>(null)
  const [isCancellingOrder, setIsCancellingOrder] = useState(false)
  const wishlist = useStore((s) => s.wishlist)
  const saved = products.filter((p) => wishlist.includes(p.id))

  const handleConfirmCancelPatronOrder = async () => {
    if (!cancelDialogOrder) return
    const targetId = cancelDialogOrder.orderNumber || cancelDialogOrder.id
    setIsCancellingOrder(true)
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: targetId,
          status: "Cancelled",
          cancelReason: "Cancelled by patron from account portal",
        }),
      })
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.orderNumber === targetId || o.id === targetId
              ? { ...o, status: "Cancelled", cancelReason: "Cancelled by patron" }
              : o
          )
        )
        showToast(`Order #${targetId} cancelled successfully.`)
      } else {
        showToast("Unable to cancel order. Please contact atelier concierge.")
      }
    } catch {
      showToast("Error processing cancellation. Please try again.")
    } finally {
      setIsCancellingOrder(false)
      setCancelDialogOrder(null)
    }
  }

  // Fetch real user orders from API
  useEffect(() => {
    let isMounted = true
    const fetchOrders = async () => {
      setLoadingOrders(true)
      try {
        const params = new URLSearchParams()
        if (user?.email) params.set("email", user.email)
        if (user?.phone) params.set("phone", user.phone)
        if (user?.id) params.set("userId", user.id)

        let localOrderIds: string[] = []
        try {
          localOrderIds = JSON.parse(localStorage.getItem("gb_patron_order_ids") || "[]")
        } catch {}

        let fetchedList: any[] = []
        if (params.toString()) {
          const res = await fetch(`/api/orders?${params.toString()}`)
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data.orders)) {
              fetchedList = data.orders
            }
          }
        }

        // Fetch any orders from localOrderIds that were placed on this device but not returned yet
        const missingIds = localOrderIds.filter(
          (oid) => !fetchedList.some((o) => o.id === oid || o.orderNumber === oid)
        )
        if (missingIds.length > 0) {
          const extraOrders = await Promise.all(
            missingIds.map(async (oid) => {
              try {
                const r = await fetch(`/api/orders?id=${oid}`)
                if (r.ok) {
                  const d = await r.json()
                  return d.order
                }
              } catch {}
              return null
            })
          )
          const validExtras = extraOrders.filter(Boolean)
          fetchedList = [...validExtras, ...fetchedList]
        }

        if (isMounted) {
          setOrders(fetchedList)
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

  const displayName = user.name || (user.email ? user.email.split("@")[0].replace(/[._]/g, " ") : "Valued Patron")
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "GB"
  const points = user.points ?? 0
  const tier = user.membershipTier ?? "Silver"

  const validAddresses = addresses.filter((a) => !isDummyAddress(a))
  const stats = [
    { label: "Orders", value: orders.length },
    { label: "Saved", value: wishlist.length },
    { label: "Points", value: points.toLocaleString("en-IN") },
    { label: "Addresses", value: validAddresses.length },
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
              <h1 className="mt-2 font-display text-3xl leading-none md:text-5xl">{displayName}</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">{`${user.email || ""}${user.joinedDate ? ` · Since ${user.joinedDate}` : ""}`}</p>
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
                    <OrderCard order={orders[0]} onOpenCancel={(ord) => setCancelDialogOrder(ord)} />
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
                    <OrderCard
                      key={o.id || o.orderNumber}
                      order={o}
                      onOpenCancel={(ord) => setCancelDialogOrder(ord)}
                    />
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
                  <button
                    type="button"
                    onClick={() =>
                      setDialog({
                        ...emptyAddress,
                        name: user?.name || "",
                        phone: user?.phone || "",
                        isDefault: validAddresses.length === 0,
                      })
                    }
                    className="flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-xs font-semibold uppercase tracking-[0.12em] text-background cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <Icon name="plus" size={15} /> Add
                  </button>
                </div>

                {validAddresses.length === 0 ? (
                  <div className="rounded-sm border border-dashed border-border p-8 sm:p-12 text-center">
                    <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
                      <Icon name="map-pin" size={22} />
                    </div>
                    <p className="font-display text-xl sm:text-2xl">No saved addresses yet</p>
                    <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
                      Add your primary home or office delivery address for fast and effortless checkout.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setDialog({
                          ...emptyAddress,
                          name: user?.name || "",
                          phone: user?.phone || "",
                          isDefault: true,
                        })
                      }
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-background hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                    >
                      <Icon name="plus" size={15} /> Add Delivery Address
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {validAddresses.map((a) => (
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
                          <button
                            type="button"
                            onClick={() => setDialog(a)}
                            className="underline underline-offset-4 cursor-pointer text-foreground hover:opacity-80"
                          >
                            Edit
                          </button>
                          {!a.isDefault && (
                            <button
                              type="button"
                              onClick={async () => {
                                onSetDefaultAddress(a.id)
                                showToast(`"${a.name}" set as default address`)
                                if (user?.id || user?.email) {
                                  const updated = addresses.map((x) => ({ ...x, isDefault: x.id === a.id }))
                                  try {
                                    await fetch("/api/auth/profile", {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        id: user.id,
                                        email: user.email,
                                        addresses: updated,
                                      }),
                                    })
                                  } catch {}
                                }
                              }}
                              className="underline underline-offset-4 cursor-pointer text-[#d4af37] hover:brightness-110"
                            >
                              Make default
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={async () => {
                              onDeleteAddress(a.id)
                              showToast("Address removed")
                              if (user?.id || user?.email) {
                                const updated = addresses.filter((x) => x.id !== a.id)
                                try {
                                  await fetch("/api/auth/profile", {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      id: user.id,
                                      email: user.email,
                                      addresses: updated,
                                    }),
                                  })
                                } catch {}
                              }
                            }}
                            className="text-[#b4321f] underline underline-offset-4 cursor-pointer hover:opacity-80"
                          >
                            Remove
                          </button>
                        </div>
                      </article>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setDialog({
                          ...emptyAddress,
                          name: user?.name || "",
                          phone: user?.phone || "",
                          isDefault: false,
                        })
                      }
                      className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    >
                      <Icon name="plus" size={20} /> Add new address
                    </button>
                  </div>
                )}
              </>
            )}

            {tab === "Settings" && (
              <>
                <h2 className="font-display text-3xl">Settings</h2>
                <form
                  className="grid gap-4 rounded-sm border border-border bg-surface p-5 md:grid-cols-2 md:p-6"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const cleanName = profile.name.trim()
                    const cleanEmail = profile.email.trim()
                    const cleanPhone = profile.phone.trim()

                    if (cleanName.length < 2) {
                      showToast("Please enter a valid full name (minimum 2 characters)")
                      return
                    }
                    if (cleanEmail && !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
                      showToast("Please enter a valid email address")
                      return
                    }

                    const updatedUser = {
                      ...user,
                      name: cleanName,
                      email: cleanEmail || user.email,
                      phone: cleanPhone,
                    }
                    onUpdateUser(updatedUser)
                    showToast("Profile details updated successfully")

                    try {
                      await fetch("/api/auth/profile", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          id: user.id,
                          email: user.email,
                          name: cleanName,
                          newEmail: cleanEmail,
                          phone: cleanPhone,
                        }),
                      })
                    } catch (err) {
                      console.warn("Could not sync profile to backend:", err)
                    }
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
                        value={profile[key] ?? ""}
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
          onSave={async (a) => {
            onSaveAddress(a)
            const wasEditing = Boolean(dialog.id)
            setDialog(null)
            showToast(wasEditing ? "Address updated successfully" : "New address added")
            if (user?.id || user?.email) {
              const existingIdx = addresses.findIndex((x) => x.id === a.id)
              let nextList = [...addresses]
              if (a.isDefault || nextList.length === 0) {
                nextList = nextList.map((x) => ({ ...x, isDefault: false }))
                a = { ...a, isDefault: true }
              }
              if (existingIdx >= 0) {
                nextList[existingIdx] = a
              } else {
                nextList.push(a)
              }
              try {
                await fetch("/api/auth/profile", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id: user.id,
                    email: user.email,
                    addresses: nextList,
                  }),
                })
              } catch {}
            }
          }}
        />
      )}

      {cancelDialogOrder && (
        <CancelOrderDialog
          order={cancelDialogOrder}
          onClose={() => setCancelDialogOrder(null)}
          onConfirm={handleConfirmCancelPatronOrder}
          isCancelling={isCancellingOrder}
        />
      )}
    </div>
  )
}

export default AccountView
