"use client"

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

  return (
    <AccountView
      user={user}
      onUpdateUser={setUser}
      onLogout={() => {
        setUser(null)
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
