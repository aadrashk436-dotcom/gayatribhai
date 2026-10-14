import type { Product } from "../products"

export type View = "home" | "shop" | "product" | "wishlist" | "bag" | "checkout" | "account" | "admin" | "login" | "blog"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  joinedDate?: string
  membershipTier?: "Silver" | "Gold" | "Artisan VIP"
  points?: number
}

export interface Address {
  id: string
  name: string
  phone: string
  email?: string
  street: string
  area?: string
  city: string
  state: string
  pincode: string
  type: "HOME" | "WORK" | "OTHER"
  isDefault?: boolean
}

export type CartItem = {
  id: string
  size: string
  quantity: number
}

export interface BlogSEO {
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  canonicalUrl?: string
  ogImage?: string
  altText?: string
  noIndex?: boolean
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  subtitle?: string
  excerpt: string
  content: string[]
  keyTakeaways?: string[]
  author: {
    name: string
    role: string
    avatar: string
  }
  category: "Craft & Atelier" | "Style Guides" | "Fabric Science" | "Resort Life" | string
  coverImage: string
  readTime: string
  date: string
  tags: string[]
  featured?: boolean
  relatedProductIds?: string[]
  is_published?: boolean
  views_count?: number
  seo?: BlogSEO
}

export interface ReelItem {
  id: string
  title: string
  caption: string
  videoUrl?: string
  posterUrl: string
  views: string
  likes: number
  productId: string
  tag: string
  duration: string
  stylist: string
}

export type IconName = "search" | "heart" | "bag" | "user" | "menu" | "close" | "arrow" | "arrow-left" | "star" | "filter" | "sliders" | "chevron" | "truck" | "shield" | "refresh" | "plus" | "minus" | "trash" | "check" | "share" | "edit" | "map-pin" | "mail" | "phone" | "lock" | "eye" | "eye-off" | "play" | "pause" | "volume" | "volume-mute" | "book-open" | "calendar" | "clock" | "award" | "sparkles" | "grid-1" | "grid-2" | "home" | "logout" | "package" | "settings"

export const categories = [
  "Contemporary",
  "BeachSide",
  "Nature",
  "Floral",
  "Linen",
]

export const allSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]

export type { Product }
