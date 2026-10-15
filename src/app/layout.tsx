import type { Metadata, Viewport } from "next"
import { Fraunces, Manrope } from "next/font/google"
import "./globals.css"
import ClientShell from "./ClientShell"
import { themeInitScript } from "@/lib/theme-script"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf9f7",
}

export const metadata: Metadata = {
  title: "AVYR by Gayatri | Haute Artisanal Hand-Embroidered Shirts & Luxury Linen Resortwear",
  description:
    "Discover AVYR by Gayatri: Haute artisanal menswear, hand-embroidered pure linen shirts, Cuban camp collar silhouettes, and luxury resortwear crafted in limited micro-batches in Gujarat, India.",
  keywords:
    "hand embroidered shirts, luxury linen shirts, artisanal menswear, cuban collar shirt, resortwear men, resort dressing, french linen shirts, slow fashion india, AVYR, gayatri clothes, artisanal shirts",
  authors: [{ name: "AVYR Atelier / Gayatri" }],
  metadataBase: new URL("https://gayatribhai.vercel.app"),
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "AVYR Haute Artisanal Shirts",
    title: "AVYR by Gayatri | Haute Artisanal Hand-Embroidered Shirts",
    description:
      "Sculpted for coastal breezes. Pure European flax linen shirts and generational needlecraft made in limited batches of 50.",
    images: [
      {
        url: "/assets/site_banners/slide1_desktop.jpg",
        width: 1200,
        height: 630,
        alt: "AVYR Haute Artisanal Hand-Embroidered Shirts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AVYR by Gayatri | Haute Artisanal Hand-Embroidered Shirts",
    description:
      "Sculpted for coastal breezes. Pure French linen and hand-guided needlework crafted in limited batches.",
    images: ["/assets/site_banners/slide1_desktop.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "ClothingStore",
                  "@id": "https://gayatribhai.vercel.app/#store",
                  name: "AVYR by Gayatri",
                  alternateName: "Gayatri Bhai Shop",
                  url: "https://gayatribhai.vercel.app/",
                  logo: "https://gayatribhai.vercel.app/favicon.svg",
                  image:
                    "https://gayatribhai.vercel.app/assets/site_banners/slide1_desktop.jpg",
                  description:
                    "Haute artisanal menswear and luxury hand-embroidered linen resortwear handcrafted in limited editions.",
                  priceRange: "₹₹ - ₹₹₹",
                  currenciesAccepted: "INR",
                  paymentAccepted:
                    "Cash, Credit Card, Debit Card, UPI, Net Banking",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Mumbai",
                    addressRegion: "Maharashtra",
                    postalCode: "400050",
                    addressCountry: "IN",
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://gayatribhai.vercel.app/#website",
                  url: "https://gayatribhai.vercel.app/",
                  name: "AVYR Haute Artisanal Shirts",
                  description:
                    "Destination Dressing · Resort Edit · Pure Linen Handcrafted Shirts",
                  publisher: {
                    "@id":
                      "https://gayatribhai.vercel.app/#store",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  )
}
