import type { Metadata } from "next"
import WishlistClient from "./WishlistClient"

export const metadata: Metadata = {
  title: "Your Wishlist | AVYR by Gayatri",
  description: "View and manage your saved artisanal shirts and resortwear favorites.",
  robots: {
    index: false,
    follow: true,
  },
}

export default function WishlistPage() {
  return <WishlistClient />
}
