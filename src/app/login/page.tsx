import { Suspense } from "react"
import type { Metadata } from "next"
import LoginClient from "./LoginClient"

export const metadata: Metadata = {
  title: "Sign In / Join Patron Atelier | AVYR by Gayatri",
  description: "Sign in to access exclusive early drops, patron privileges, and your order history.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center bg-background">
          <div className="size-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  )
}
