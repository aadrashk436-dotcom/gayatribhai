import type { Metadata } from "next"
import HomeClient from "./HomeClient"

export const metadata: Metadata = {
  title: "AVYR by Gayatri | Haute Artisanal Hand-Embroidered Shirts & Luxury Linen Resortwear",
  description:
    "India's premier atelier for hand-embroidered artisanal shirts and pure French linen resortwear. Masterfully tailored with mother-of-pearl accents and heirloom craftsmanship.",
  alternates: {
    canonical: "https://gayatribhaishop-zkde-eight.vercel.app",
  },
}

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://gayatribhaishop-zkde-eight.vercel.app/#organization",
        name: "AVYR by Gayatri",
        url: "https://gayatribhaishop-zkde-eight.vercel.app",
        logo: "https://gayatribhaishop-zkde-eight.vercel.app/favicon.ico",
        description:
          "Haute artisanal hand-embroidered shirts and pure French linen resortwear.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Mumbai",
          addressRegion: "Maharashtra",
          addressCountry: "IN",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+91-98765-43210",
          contactType: "customer service",
          areaServed: "IN",
          availableLanguage: ["English", "Hindi"],
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://gayatribhaishop-zkde-eight.vercel.app/#website",
        url: "https://gayatribhaishop-zkde-eight.vercel.app",
        name: "AVYR by Gayatri",
        publisher: {
          "@id": "https://gayatribhaishop-zkde-eight.vercel.app/#organization",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://gayatribhaishop-zkde-eight.vercel.app/shop?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  )
}
