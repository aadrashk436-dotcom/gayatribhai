import type { View } from "@/types"
import type { Product } from "@/lib/products"

export const viewToPath: Record<View, string> = {
  home: "/",
  shop: "/shop",
  product: "/product",
  blog: "/blog",
  wishlist: "/wishlist",
  bag: "/bag",
  checkout: "/checkout",
  account: "/account",
  login: "/login",
  admin: "/admin",
}

export const pathToView = (pathname: string): View => {
  if (pathname === "/") return "home"
  if (pathname.startsWith("/product")) return "product"
  if (pathname.startsWith("/blog")) return "blog"
  if (pathname.startsWith("/shop")) return "shop"
  if (pathname.startsWith("/wishlist")) return "wishlist"
  if (pathname.startsWith("/bag")) return "bag"
  if (pathname.startsWith("/checkout")) return "checkout"
  if (pathname.startsWith("/account")) return "account"
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) return "login"
  if (pathname.startsWith("/admin")) return "admin"
  return "home"
}

export function getProductUrl(product: Product): string {
  return `/product/${product.slug}`
}

export function getBlogUrl(slug: string): string {
  return `/blog/${slug}`
}
