"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Address, CartItem, User } from "@/types"
import type { Product } from "@/lib/products"

interface AppState {
  // Cart
  cart: CartItem[]
  addToCart: (product: Product, size?: string) => void
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
      user: {
        id: "usr_1",
        name: "Arjun Mehta",
        email: "arjun@example.com",
        phone: "+91 98765 43210",
        joinedDate: "April 2026",
      },
      setUser: (user) => set({ user }),

      // ── Addresses ─────────────────────────────────────────
      addresses: [
        {
          id: "addr_1",
          name: "Arjun Mehta",
          phone: "+91 98765 43210",
          street: "14, Sea View Apartments, Bandra West",
          area: "Near Pali Hill",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400050",
          type: "HOME",
          isDefault: true,
        },
        {
          id: "addr_2",
          name: "Arjun Mehta",
          phone: "+91 98765 43210",
          street: "Floor 4, Peninsula Business Park, Tower B",
          area: "Lower Parel",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400013",
          type: "WORK",
          isDefault: false,
        },
      ],
      saveAddress: (addr) =>
        set((state) => {
          let next = [...state.addresses]
          if (addr.isDefault) {
            next = next.map((a) => ({ ...a, isDefault: false }))
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
          const remaining = state.addresses.filter((a) => a.id !== id)
          if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
            remaining[0].isDefault = true
          }
          return { addresses: remaining }
        }),
      setDefaultAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        })),

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
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        user: state.user,
        addresses: state.addresses,
      }),
    },
  ),
)
