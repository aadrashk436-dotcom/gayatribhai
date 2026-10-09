import type { Metadata } from "next"
import CheckoutClient from "./CheckoutClient"

export const metadata: Metadata = {
  title: "Secure Checkout | AVYR by Gayatri Atelier",
  description: "Complete your order with end-to-end encrypted payments and complimentary insured shipping across India.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function CheckoutPage() {
  return <CheckoutClient />
}
