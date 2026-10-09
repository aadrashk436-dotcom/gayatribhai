import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { products } from "@/lib/products"
import ProductClient from "./ProductClient"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

const BASE_URL = "https://gayatribhaishop-zkde-eight.vercel.app"

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = products.find((p) => p.slug === slug)

  if (!product) {
    return {
      title: "Product Not Found | AVYR Haute Artisanal Shirts",
      description: "The requested artisanal shirt could not be found.",
    }
  }

  const title = `${product.name} | AVYR Haute Artisanal Shirts`
  const description = `${product.description} Handcrafted luxury 100% pure linen shirt with heirloom embroidery. Price: ₹${product.price.toLocaleString("en-IN")}.`
  const imageUrl = product.images[0]?.startsWith("http")
    ? product.images[0]
    : `${BASE_URL}${product.images[0]}`

  return {
    title,
    description,
    keywords: [
      product.name,
      product.category,
      product.fabric,
      "luxury linen shirts",
      "hand embroidered shirts",
      "AVYR resortwear",
      "artisanal men clothing",
    ],
    alternates: {
      canonical: `${BASE_URL}/product/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/product/${product.slug}`,
      siteName: "AVYR by Gayatri",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = products.find((p) => p.slug === slug)

  if (!product) {
    notFound()
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) =>
      img.startsWith("http") ? img : `${BASE_URL}${img}`
    ),
    description: product.description,
    sku: product.sku,
    mpn: product.id,
    brand: {
      "@type": "Brand",
      name: "AVYR by Gayatri",
    },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "AVYR by Gayatri",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviews,
      bestRating: 5,
      worstRating: 1,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClient slug={slug} />
    </>
  )
}
