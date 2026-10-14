import { Product } from "@/lib/products"
import type { BlogPost } from "@/types"

export type { Product, BlogPost }

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export interface OrderItem {
  productId?: string
  id?: string
  name: string
  sku?: string
  size: string
  quantity: number
  price: number
  image?: string
  color?: string
}

export interface AdminOrder {
  id: string
  orderNumber?: string
  customer: string
  customerName?: string
  email: string
  phone: string
  address: string
  city: string
  pincode: string
  shirtName: string
  sku: string
  size: string
  qty: number
  price: number
  total: number
  subtotal?: number
  discount?: number
  shipping?: number
  image: string
  items?: OrderItem[]
  courierName?: string
  paymentMethod: string
  paymentId: string
  paymentStatus: "Paid" | "Pending COD" | "Pending" | string
  status: "Pending Verification" | "Verified" | "Assigned to Courier" | "Dispatched" | "Delivered" | "Cancelled" | string
  verifiedBy?: string | null
  verifiedAt?: string | null
  courier?: string | null
  awb?: string | null
  date: string
  cancelReason?: string | null
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  tier: string
  ordersCount: number
  totalSpent: number
  points: number
  joined: string
  avatar: string
}

export interface Coupon {
  id: string
  code: string
  discount: string
  type: string
  minSpend: number
  usedCount: number
  maxUses: number
  active: boolean
}

export interface Banner {
  id: string
  kicker: string
  lines: [string, string] | string[]
  title?: string
  subtitle?: string
  cta: string
  desktop?: string
  image_desktop?: string
  mobile?: string
  image_mobile?: string
  alt: string
  tone: "light" | "dark" | string
  link: string
  is_active?: boolean
  sort_order?: number
  seo_heading?: string
  seo_keywords?: string[] | string
}

export interface SiteSeoSettings {
  home: { metaTitle: string; metaDescription: string; keywords: string }
  shop: { metaTitle: string; metaDescription: string; keywords: string }
  blog: { metaTitle: string; metaDescription: string; keywords: string }
}

export type ZoomImageModalState = {
  url: string
  title: string
  isMobile?: boolean
} | null

export const initialOrders: AdminOrder[] = []

export const initialCustomers: Customer[] = []

export const initialCoupons: Coupon[] = [
  {
    id: "cpn_1",
    code: "WELCOME10",
    discount: "10% Off",
    type: "Percentage",
    minSpend: 1500,
    usedCount: 84,
    maxUses: 500,
    active: true,
  },
  {
    id: "cpn_2",
    code: "GAYATRI20",
    discount: "₹200 Off",
    type: "Flat",
    minSpend: 2000,
    usedCount: 42,
    maxUses: 200,
    active: true,
  },
  {
    id: "cpn_3",
    code: "ROYAL25",
    discount: "25% Off",
    type: "Percentage",
    minSpend: 5000,
    usedCount: 19,
    maxUses: 100,
    active: true,
  },
]

export const ATELIER_PRESET_IMAGES = [
  { label: "Azure Leaf", url: "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg" },
  { label: "Deep Sea Coco", url: "/assets/products/Deep_Sea_COCO_Hand_Embroidered_Shirt/Deep_Sea_COCO_Hand_Embroidered_Shirt_main.jpg" },
  { label: "Havana Beach Red", url: "/assets/products/True_Red_havana_Beach_Embroidered_Shirt/True_Red_havana_Beach_Embroidered_Shirt_main.jpg" },
  { label: "Coco Flamingo", url: "/assets/products/COCO_Flamingo_Beach_Shirt/COCO_Flamingo_Beach_Shirt_main.jpg" },
  { label: "Coastal King", url: "/assets/products/Costal_King_Hand_Embroidered_Shirt/Costal_King_Hand_Embroidered_Shirt_main.jpg" },
  { label: "Pearl White Spotted", url: "/assets/products/Pearl_White_Red_Spotted_Shirt/Pearl_White_Red_Spotted_Shirt_main.jpg" },
  { label: "Matcha Green", url: "/assets/products/Matcha_Green_Artistic_Shirt/Matcha_Green_Artistic_Shirt_main.jpg" },
  { label: "Salmon Pink", url: "/assets/products/Salmon_Pink_Hand_Embroidered_Shirt/Salmon_Pink_Hand_Embroidered_Shirt_main.jpg" },
  { label: "Maroon Arro", url: "/assets/products/Maroon_Handcrafted_Arro_Shirt/Maroon_Handcrafted_Arro_Shirt_main.jpg" },
  { label: "The Solstice", url: "/assets/products/THE_SOLSTICE_HAND_EMBROIDERED_ARTISAN_SHIRT/THE_SOLSTICE_HAND_EMBROIDERED_ARTISAN_SHIRT_main.jpg" },
  { label: "Solar Sol", url: "/assets/products/THE_SOLAR_SOL_SHIRT/THE_SOLAR_SOL_SHIRT_main.jpg" },
  { label: "Floral Pocket", url: "/assets/products/FLORAL_POCKET_SHIRT/FLORAL_POCKET_SHIRT_main.jpg" },
]
