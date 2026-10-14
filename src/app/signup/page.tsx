import { Suspense } from "react"
import type { Metadata } from "next"
import LoginClient from "../login/LoginClient"

export const metadata: Metadata = {
  title: "Create Account | AVYR by Gayatri",
  description: "Join AVYR for early access to limited drops, order tracking and 10% off your first order.",
  robots: { index: false, follow: false },
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center bg-background">
          <div className="size-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      }
    >
      <LoginClient mode="signup" />
    </Suspense>
  )
}
