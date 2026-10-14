import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/checkout", "/login", "/account"],
    },
    sitemap: "https://gayatribhai.vercel.app/sitemap.xml",
  }
}
