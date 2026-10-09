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
  return <LoginClient />
}
