"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useStore } from "@/lib/store"
import { useAppNavigation } from "@/lib/useAppNavigation"
import LoginView from "@/components/views/LoginView"

function LoginClientContent({ mode = "login" }: { mode?: "login" | "signup" }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")
  const { go } = useAppNavigation()
  const { setUser, setToast } = useStore()

  return (
    <LoginView
      mode={mode}
      onLogin={(user) => {
        setUser(user)
        if (redirect && redirect.startsWith("/")) {
          router.push(redirect)
        } else {
          go("account")
        }
      }}
      go={go}
      showToast={setToast}
    />
  )
}

export default function LoginClient({ mode = "login" }: { mode?: "login" | "signup" }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center bg-background">
          <div className="size-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      }
    >
      <LoginClientContent mode={mode} />
    </Suspense>
  )
}
