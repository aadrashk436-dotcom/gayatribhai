"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Address, CartItem, User } from "@/types"
import type { Product } from "@/lib/products"

export function isDummyAddress(addr: Address | null | undefined): boolean {
  if (!addr) return true
  const name = (addr.name || "").toLowerCase().trim()
  const street = (addr.street || "").toLowerCase().trim()
  const phone = (addr.phone || "").replace(/\D/g, "")
  const id = addr.id || ""

  // Purge legacy demo/mock addresses
  if (name.includes("arjun mehta") || name.includes("arjun singhania")) return true
  if (street.includes("sea view apartments") || street.includes("altamount road")) return true
  if (phone === "9876543210" || phone === "9820123456" || phone === "9820144210") return true
  if (id === "addr_1" || id === "addr_2") {
    if (street.includes("bandra") || street.includes("lower parel") || addr.pincode === "400050" || addr.pincode === "400013") {
      return true
    }
  }
  return false
}

interface AppState {
  // Cart
  cart: CartItem[]
  addToCart: (product: Product, size?: string) => void
  updateQuantity: (productId: string, delta: number, size?: string) => void
  removeFromCart: (productId: string, size?: string) => void
  clearCart: () => void
  setCart: (updater: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void

  // Wishlist
  wishlist: string[]
  toggleWish: (id: string) => string

  // User
  user: User | null
  setUser: (user: User | null) => void

  // Addresses
  addresses: Address[]
  saveAddress: (addr: Address) => void
  deleteAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
  clearAddresses: () => void

  // Toast
  toast: string
  setToast: (msg: string) => void

  // UI
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  query: string
  setQuery: (q: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Cart ──────────────────────────────────────────────
      cart: [],
      addToCart: (product, size = "M") => {
        let chosenSize = size
        if (!product.stock[chosenSize]) {
          chosenSize =
            Object.keys(product.stock).find((s) => product.stock[s] > 0) || "M"
        }
        set((state) => {
          const existing = state.cart.find(
            (x) => x.id === product.id && x.size === chosenSize,
          )
          return {
            cart: existing
              ? state.cart.map((x) =>
                x === existing ? { ...x, quantity: x.quantity + 1 } : x,
              )
              : [...state.cart, { id: product.id, size: chosenSize, quantity: 1 }],
            toast: `${product.name} added to bag`,
          }
        })
      },
      setCart: (updater) =>
        set((state) => ({
          cart: typeof updater === "function" ? updater(state.cart) : updater,
        })),
      updateQuantity: (productId, delta, size) => {
        set((state) => {
          const targetIndex = state.cart.findIndex(
            (x) => x.id === productId && (!size || !x.size || x.size === size),
          )
          if (targetIndex === -1) {
            return state
          }
          const item = state.cart[targetIndex]
          const newQty = item.quantity + delta
          if (newQty <= 0) {
            const nextCart = state.cart.filter((_, idx) => idx !== targetIndex)
            return {
              cart: nextCart,
              toast: "Removed from your bag",
            }
          }
          const nextCart = [...state.cart]
          nextCart[targetIndex] = { ...item, quantity: newQty }
          return {
            cart: nextCart,
            toast: delta > 0 ? "Added 1 more to bag" : "Reduced quantity by 1",
          }
        })
      },
      removeFromCart: (productId, size) => {
        set((state) => ({
          cart: state.cart.filter(
            (x) => !(x.id === productId && (!size || !x.size || x.size === size)),
          ),
          toast: "Removed from your bag",
        }))
      },
      clearCart: () => {
        set({
          cart: [],
          toast: "Shopping bag cleared",
        })
      },

      // ── Wishlist ──────────────────────────────────────────
      wishlist: [],
      toggleWish: (id) => {
        const has = get().wishlist.includes(id)
        set((state) => ({
          wishlist: has
            ? state.wishlist.filter((item) => item !== id)
            : [...state.wishlist, id],
          toast: has ? "Removed from your wishlist" : "Saved to your wishlist",
        }))
        return has ? "removed" : "added"
      },

      // ── User ──────────────────────────────────────────────
      user: null,
      setUser: (user) =>
        set((state) => {
          const cleanAddresses = state.addresses.filter((a) => !isDummyAddress(a))
          return {
            user,
            addresses: cleanAddresses,
          }
        }),

      // ── Addresses ─────────────────────────────────────────
      addresses: [],
      saveAddress: (addr) =>
        set((state) => {
          if (isDummyAddress(addr)) return state
          let next = state.addresses.filter((a) => !isDummyAddress(a))
          if (addr.isDefault || next.length === 0) {
            next = next.map((a) => ({ ...a, isDefault: false }))
            addr = { ...addr, isDefault: true }
          }
          const existingIdx = next.findIndex((a) => a.id === addr.id)
          if (existingIdx >= 0) {
            next[existingIdx] = addr
          } else {
            next.push(addr)
          }
          return { addresses: next }
        }),
      deleteAddress: (id) =>
        set((state) => {
          const remaining = state.addresses.filter((a) => a.id !== id && !isDummyAddress(a))
          if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
            remaining[0].isDefault = true
          }
          return { addresses: remaining }
        }),
      setDefaultAddress: (id) =>
        set((state) => ({
          addresses: state.addresses
            .filter((a) => !isDummyAddress(a))
            .map((a) => ({
              ...a,
              isDefault: a.id === id,
            })),
        })),
      clearAddresses: () => set({ addresses: [] }),

      // ── Toast ─────────────────────────────────────────────
      toast: "",
      setToast: (msg) => set({ toast: msg }),

      // ── UI ────────────────────────────────────────────────
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),
      menuOpen: false,
      setMenuOpen: (open) => set({ menuOpen: open }),
      query: "",
      setQuery: (q) => set({ query: q }),
    }),
    {
      name: "avyr-store",
      version: 2,
      migrate: (persistedState: any) => {
        if (!persistedState) return persistedState
        if (Array.isArray(persistedState.addresses)) {
          persistedState.addresses = persistedState.addresses.filter((a: any) => !isDummyAddress(a))
        }
        return persistedState
      },
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.addresses)) {
          const cleaned = state.addresses.filter((a) => !isDummyAddress(a))
          if (cleaned.length !== state.addresses.length) {
            state.addresses = cleaned
          }
        }
      },
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        user: state.user,
        addresses: state.addresses.filter((a) => !isDummyAddress(a)),
      }),
    },
  ),
)
