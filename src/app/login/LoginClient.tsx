"use client"

import { useStore } from "@/lib/store"
import { useAppNavigation } from "@/lib/useAppNavigation"
import LoginView from "@/components/views/LoginView"

export default function LoginClient({ mode = "login" }: { mode?: "login" | "signup" }) {
  const { go } = useAppNavigation()
  const { setUser, setToast } = useStore()

  return (
    <LoginView
      mode={mode}
      onLogin={(user) => {
        setUser(user)
        go("account")
      }}
      go={go}
      showToast={setToast}
    />
  )
}
