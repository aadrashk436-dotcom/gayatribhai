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

export interface AdminOrder {
  id: string
  customer: string
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
  image: string
  paymentMethod: string
  paymentId: string
  paymentStatus: "Paid" | "Pending COD"
  status: "Pending Verification" | "Verified" | "Assigned to Courier" | "Dispatched" | "Delivered" | "Cancelled"
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

export const initialOrders: AdminOrder[] = [
  {
    id: "GB-2026-1048",
    customer: "Vikram Singhania",
    email: "vikram.singh@atelier.in",
    phone: "+91 98201 44210",
    address: "402, Sea Green Apartments, Bandra West, Near Carter Road",
    city: "Mumbai, Maharashtra",
    pincode: "400050",
    shirtName: "Azure Leaf Hand-Embroidered Shirt",
    sku: "M26/SS/CON/CS/23",
    size: "L",
    qty: 1,
    price: 2100,
    total: 2100,
    image: "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg",
    paymentMethod: "Razorpay (Prepaid UPI)",
    paymentId: "pay_live_Rz99x11",
    paymentStatus: "Paid",
    status: "Pending Verification",
    verifiedBy: null,
    verifiedAt: null,
    courier: null,
    awb: null,
    date: "Today, 14:24",
    cancelReason: null,
  },
  {
    id: "GB-2026-1047",
    customer: "Rohan Kapoor",
    email: "rohan.kapoor@heritage.org",
    phone: "+91 99112 88390",
    address: "B-14, Heritage Greens, Civil Lines, Near Raj Niwas",
    city: "New Delhi, Delhi",
    pincode: "110054",
    shirtName: "Deep Sea Coco Hand Embroidered Shirt",
    sku: "M26/SS/BEA/CS/42",
    size: "M",
    qty: 2,
    price: 2399,
    total: 4798,
    image: "/assets/products/Deep_Sea_COCO_Hand_Embroidered_Shirt/Deep_Sea_COCO_Hand_Embroidered_Shirt_main.jpg",
    paymentMethod: "Razorpay (Prepaid NetBanking)",
    paymentId: "pay_live_Kz88v22",
    paymentStatus: "Paid",
    status: "Verified",
    verifiedBy: "Gayatri Puri (Admin)",
    verifiedAt: "Today, 12:00",
    courier: null,
    awb: null,
    date: "Today, 11:15",
    cancelReason: null,
  },
  {
    id: "GB-2026-1046",
    customer: "Ananya Deshmukh",
    email: "ananya.d@luxuryart.co",
    phone: "+91 98450 11922",
    address: "Villa 9, Palm Meadows, Whitefield",
    city: "Bengaluru, Karnataka",
    pincode: "560066",
    shirtName: "True Red Havana Beach Embroidered Shirt",
    sku: "M26/SS/Beach/CS/19",
    size: "S",
    qty: 1,
    price: 1899,
    total: 1899,
    image: "/assets/products/True_Red_havana_Beach_Embroidered_Shirt/True_Red_havana_Beach_Embroidered_Shirt_main.jpg",
    paymentMethod: "Razorpay (Credit Card)",
    paymentId: "pay_live_Mm77c33",
    paymentStatus: "Paid",
    status: "Assigned to Courier",
    verifiedBy: "Gayatri Puri (Admin)",
    verifiedAt: "Yesterday, 16:40",
    courier: "BlueDart Express Air",
    awb: "AWB-SR-99382011921",
    date: "Yesterday, 15:30",
    cancelReason: null,
  },
  {
    id: "GB-2026-1045",
    customer: "Arjun Oberoi",
    email: "arjun.oberoi@palace.in",
    phone: "+91 97660 33411",
    address: "7, Circuit House Road, Civil Lines",
    city: "Jaipur, Rajasthan",
    pincode: "302006",
    shirtName: "The Solstice Hand Embroidered Artisan Shirt",
    sku: "M26/SS/CON/SF/09",
    size: "XL",
    qty: 1,
    price: 2199,
    total: 2199,
    image: "/assets/products/THE_SOLSTICE_HAND_EMBROIDERED_ARTISAN_SHIRT/THE_SOLSTICE_HAND_EMBROIDERED_ARTISAN_SHIRT_main.jpg",
    paymentMethod: "Cash on Delivery",
    paymentId: "cod_gb_1045",
    paymentStatus: "Pending COD",
    status: "Pending Verification",
    verifiedBy: null,
    verifiedAt: null,
    courier: null,
    awb: null,
    date: "Yesterday, 13:05",
    cancelReason: null,
  },
  {
    id: "GB-2026-1044",
    customer: "Meera Sen",
    email: "meera.sen@calcutta.edu",
    phone: "+91 98300 55190",
    address: "Flat 4A, Ballygunge Circular Road, Near Lake Club",
    city: "Kolkata, West Bengal",
    pincode: "700019",
    shirtName: "French Knotted Leaves Shirt",
    sku: "M26/SS/NATURE/CS/11",
    size: "M",
    qty: 1,
    price: 1699,
    total: 1699,
    image: "/assets/products/French_Knotted_Leaves_Shirt/French_Knotted_Leaves_Shirt_main.jpg",
    paymentMethod: "Razorpay (UPI)",
    paymentId: "pay_live_Qp11a88",
    paymentStatus: "Paid",
    status: "Dispatched",
    verifiedBy: "Gayatri Puri (Admin)",
    verifiedAt: "11 Oct, 17:00",
    courier: "Delhivery Surface",
    awb: "AWB-SR-14298011985",
    date: "11 Oct, 16:30",
    cancelReason: null,
  },
  {
    id: "GB-2026-1043",
    customer: "Siddharth Verma",
    email: "siddharth.v@vermaholdings.in",
    phone: "+91 98199 77210",
    address: "Tower 3, Penthouse 18B, Koregaon Park Annexe",
    city: "Pune, Maharashtra",
    pincode: "411001",
    shirtName: "Coco Flamingo Beach Shirt",
    sku: "M26/SS/Beach/CS/20",
    size: "XL",
    qty: 1,
    price: 2799,
    total: 2799,
    image: "/assets/products/COCO_Flamingo_Beach_Shirt/COCO_Flamingo_Beach_Shirt_main.jpg",
    paymentMethod: "Razorpay (Prepaid)",
    paymentId: "pay_live_M88v99",
    paymentStatus: "Paid",
    status: "Delivered",
    verifiedBy: "Gayatri Puri (Admin)",
    verifiedAt: "09 Oct, 11:20",
    courier: "BlueDart Express Air",
    awb: "AWB-SR-88492011933",
    date: "09 Oct, 10:45",
    cancelReason: null,
  },
  {
    id: "GB-2026-1042",
    customer: "Aditya Roy",
    email: "aditya.roy@zenith.co",
    phone: "+91 99200 44102",
    address: "Flat 101, Palm Grove, Juhu Tara Road",
    city: "Mumbai, Maharashtra",
    pincode: "400049",
    shirtName: "Costal King Hand Embroidered Shirt",
    sku: "M26/SS/Beach/SF/19",
    size: "L",
    qty: 1,
    price: 2199,
    total: 2199,
    image: "/assets/products/Costal_King_Hand_Embroidered_Shirt/Costal_King_Hand_Embroidered_Shirt_main.jpg",
    paymentMethod: "Razorpay (Prepaid)",
    paymentId: "pay_live_Cn22w10",
    paymentStatus: "Paid",
    status: "Cancelled",
    verifiedBy: null,
    verifiedAt: null,
    courier: null,
    awb: null,
    date: "08 Oct, 15:10",
    cancelReason: "Patron requested size exchange before dispatch",
  },
]

export const initialCustomers: Customer[] = [
  {
    id: "cust_1",
    name: "Vikram Singhania",
    email: "vikram.singh@atelier.in",
    phone: "+91 98201 44210",
    tier: "Platinum",
    ordersCount: 8,
    totalSpent: 18400,
    points: 1840,
    joined: "January 2026",
    avatar: "VS",
  },
  {
    id: "cust_2",
    name: "Rohan Kapoor",
    email: "rohan.kapoor@heritage.org",
    phone: "+91 99112 88390",
    tier: "Gold",
    ordersCount: 5,
    totalSpent: 11950,
    points: 1190,
    joined: "March 2026",
    avatar: "RK",
  },
  {
    id: "cust_3",
    name: "Ananya Deshmukh",
    email: "ananya.d@luxuryart.co",
    phone: "+91 98450 11922",
    tier: "Gold",
    ordersCount: 4,
    totalSpent: 9600,
    points: 960,
    joined: "April 2026",
    avatar: "AD",
  },
  {
    id: "cust_4",
    name: "Arjun Oberoi",
    email: "arjun.oberoi@palace.in",
    phone: "+91 97660 33411",
    tier: "Silver",
    ordersCount: 2,
    totalSpent: 4250,
    points: 420,
    joined: "July 2026",
    avatar: "AO",
  },
  {
    id: "cust_5",
    name: "Meera Sen",
    email: "meera.sen@calcutta.edu",
    phone: "+91 98300 55190",
    tier: "Silver",
    ordersCount: 1,
    totalSpent: 2600,
    points: 260,
    joined: "October 2026",
    avatar: "MS",
  },
]

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
