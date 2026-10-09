import type { Metadata } from "next"
import AccountClient from "./AccountClient"

export const metadata: Metadata = {
  title: "My Account | Patron Club Profile | AVYR by Gayatri",
  description: "Manage your artisanal wardrobe, track orders, and view delivery addresses.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AccountPage() {
  return <AccountClient />
}
