import type { Metadata } from "next"
import LoginClient from "../login/LoginClient"

export const metadata: Metadata = {
  title: "Create Account | AVYR by Gayatri",
  description: "Join AVYR for early access to limited drops, order tracking and 10% off your first order.",
  robots: { index: false, follow: false },
}

export default function SignupPage() {
  return <LoginClient mode="signup" />
}
