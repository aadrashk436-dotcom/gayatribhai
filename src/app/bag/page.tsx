import type { Metadata } from "next"
import BagClient from "./BagClient"

export const metadata: Metadata = {
  title: "Shopping Bag | AVYR by Gayatri",
  description: "Review your selected artisanal shirts and proceed to secure checkout.",
  robots: {
    index: false,
    follow: true,
  },
}

export default function BagPage() {
  return <BagClient />
}
