"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"
import { useAppNavigation } from "@/lib/useAppNavigation"
import AccountView from "@/components/views/AccountView"

export default function AccountClient() {
  const { go } = useAppNavigation()
  const {
    user,
    setUser,
    addresses,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
    setToast,
  } = useStore()

  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })
    if (useStore.persist.hasHydrated()) {
      setHasHydrated(true)
    }
    return () => unsub()
  }, [])

  // Auto-restore customer user session if stored in localStorage
  useEffect(() => {
    if (hasHydrated && !user) {
      try {
        const storedUser = localStorage.getItem("gb_customer_user")
        if (storedUser) {
          const parsed = JSON.parse(storedUser)
          if (parsed && (parsed.email || parsed.name)) {
            setUser(parsed)
          }
        }
      } catch (e) {
        console.warn("Could not restore user from localStorage:", e)
      }
    }
  }, [hasHydrated, user, setUser])

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center bg-background text-foreground">
        <div className="size-8 animate-spin rounded-full border-2 border-foreground border-t-transparent mb-4" />
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Loading your atelier account...</p>
      </div>
    )
  }

  return (
    <AccountView
      user={user}
      onUpdateUser={setUser}
      onLogout={() => {
        setUser(null)
        if (typeof window !== "undefined") {
          localStorage.removeItem("gb_customer_user")
          localStorage.removeItem("gb_customer_token")
        }
        go("login")
      }}
      addresses={addresses}
      onSaveAddress={saveAddress}
      onDeleteAddress={deleteAddress}
      onSetDefaultAddress={setDefaultAddress}
      go={go}
      showToast={setToast}
    />
  )
}

