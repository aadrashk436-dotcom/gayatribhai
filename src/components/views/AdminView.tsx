"use client"

import React, { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Ticket,
  Truck,
  Image as ImageIcon,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  IndianRupee,
  RefreshCw,
  Menu,
  X,
  ExternalLink,
  Eye,
  Download,
  ShieldCheck,
  ChevronRight,
  Edit3,
  Trash2,
  Sparkles,
  MapPin,
  CheckSquare,
  Square,
  Phone,
  Mail,
  FileText,
  Ban,
  Send,
  Printer,
  Upload,
  EyeOff,
  Monitor,
  Smartphone,
  Globe,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Copy,
} from "lucide-react"
import { products as initialProducts, Product } from "@/lib/products"
import { BLOG_POSTS as initialBlogPosts } from "@/data/blogData"
import type { BlogPost } from "@/types"

// Format money in Indian currency notation
function formatINR(amount: number) {
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

// Initial Mock Orders with real product references and complete addresses
const initialOrders: AdminOrder[] = [
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
    address: "77, Indiranagar 100ft Road, 2nd Stage, Defence Colony",
    city: "Bengaluru, Karnataka",
    pincode: "560038",
    shirtName: "True Red Havana Beach Embroidered Shirt",
    sku: "M26/SS/BEA/CS/19",
    size: "S",
    qty: 1,
    price: 1899,
    total: 1899,
    image: "/assets/products/True_Red_havana_Beach_Embroidered_Shirt/True_Red_havana_Beach_Embroidered_Shirt_main.jpg",
    paymentMethod: "Razorpay (Credit Card)",
    paymentId: "pay_live_Lx44t90",
    paymentStatus: "Paid",
    status: "Assigned to Courier",
    verifiedBy: "Gayatri Puri (Admin)",
    verifiedAt: "Yesterday, 19:10",
    courier: "BlueDart Express Air",
    awb: "AWB-SR-33890142911",
    date: "Yesterday, 18:40",
    cancelReason: null,
  },
  {
    id: "GB-2026-1045",
    customer: "Arjun Oberoi",
    email: "arjun.oberoi@palace.in",
    phone: "+91 97660 33411",
    address: "Villa 12, C-Scheme, Ashok Nagar, Near Statue Circle",
    city: "Jaipur, Rajasthan",
    pincode: "302001",
    shirtName: "The Bract Hand Embroidered Rust Cotton Linen Shirt",
    sku: "M26/SS/NATURE/SF/13",
    size: "XL",
    qty: 1,
    price: 1699,
    total: 1699,
    image: "/assets/products/The_Bract_hand_Embroidered_Rust_Cotton_linen_Shirt/The_Bract_hand_Embroidered_Rust_Cotton_linen_Shirt_main.jpg",
    paymentMethod: "Cash on Delivery (COD)",
    paymentId: "COD_MANUAL_VERIFY",
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

// Initial Patrons / Customers
const initialCustomers = [
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

// Coupons Data
const initialCoupons = [
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

const ATELIER_PRESET_IMAGES = [
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

export function AdminView() {
  const [activeTab, setActiveTab] = useState("Dashboard")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // State collections
  const [productList, setProductList] = useState<Product[]>(initialProducts)
  const [orderList, setOrderList] = useState(initialOrders)
  const [customerList, setCustomerList] = useState(initialCustomers)
  const [couponList, setCouponList] = useState(initialCoupons)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [orderStatusFilter, setOrderStatusFilter] = useState("All")
  const [inventorySearch, setInventorySearch] = useState("")
  const [inventoryStockFilter, setInventoryStockFilter] = useState<"all" | "low" | "out">("all")

  // Modal states
  const [showAddShirtModal, setShowAddShirtModal] = useState(false)
  const [showAddCouponModal, setShowAddCouponModal] = useState(false)
  const [inspectOrderModal, setInspectOrderModal] = useState<AdminOrder | null>(null)
  const [assignCourierModal, setAssignCourierModal] = useState<AdminOrder | null>(null)
  const [selectedCourierName, setSelectedCourierName] = useState<string>("BlueDart Express Air")
  const [cancelOrderModal, setCancelOrderModal] = useState<AdminOrder | null>(null)
  const [cancelReasonText, setCancelReasonText] = useState<string>("Patron requested cancellation")

  // Product Edit & Delete states
  const [editProductModal, setEditProductModal] = useState<Product | null>(null)
  const [deleteProductModal, setDeleteProductModal] = useState<Product | null>(null)
  const [editPhotoCustomUrl, setEditPhotoCustomUrl] = useState("")

  // Homepage Hero Slider Banners state
  const [bannerList, setBannerList] = useState<any[]>([
    {
      id: "atelier",
      kicker: "Summer Atelier '26",
      lines: ["Woven", "by hand."],
      cta: "Shop linen",
      desktop: "/assets/site_banners/slide1_desktop.jpg",
      mobile: "/assets/site_banners/slide1_mobile.jpg",
      alt: "Ivory linen shirt on Aegean terrace",
      tone: "light",
      link: "/shop",
      is_active: true,
      sort_order: 1,
    },
    {
      id: "resort",
      kicker: "The Resort Edit",
      lines: ["Coastal", "state."],
      cta: "Shop resort",
      desktop: "/assets/site_banners/slide2_desktop.jpg",
      mobile: "/assets/site_banners/slide2_mobile.jpg",
      alt: "Sky-blue Cuban collar linen shirt",
      tone: "light",
      link: "/shop",
      is_active: true,
      sort_order: 2,
    },
    {
      id: "studio",
      kicker: "New Arrivals",
      lines: ["Rust &", "ease."],
      cta: "Shop new in",
      desktop: "/assets/banners/hero-terracotta-widescreen.jpg",
      mobile: "/assets/banners/hero-studio-mobile.jpg",
      alt: "Terracotta embroidered linen shirt",
      tone: "light",
      link: "/shop",
      is_active: true,
      sort_order: 3,
    },
    {
      id: "evening",
      kicker: "After Dark",
      lines: ["Evening", "tailoring."],
      cta: "Shop evening",
      desktop: "/assets/banners/hero-evening-desktop.jpg",
      mobile: "/assets/site_banners/slide3_mobile.jpg",
      alt: "Navy embroidered shirt",
      tone: "light",
      link: "/shop",
      is_active: true,
      sort_order: 4,
    },
  ])
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null)
  const [bannerKicker, setBannerKicker] = useState("Summer Atelier '26")
  const [bannerLine1, setBannerLine1] = useState("Woven")
  const [bannerLine2, setBannerLine2] = useState("by hand.")
  const [bannerCta, setBannerCta] = useState("Shop linen")
  const [bannerDesktopImg, setBannerDesktopImg] = useState("/assets/site_banners/slide1_desktop.jpg")
  const [bannerMobileImg, setMobileBannerImg] = useState("/assets/site_banners/slide1_mobile.jpg")
  const [bannerLink, setBannerLink] = useState("/shop")
  const [bannerTone, setBannerTone] = useState<"light" | "dark">("light")
  const [bannerActive, setBannerActive] = useState(true)
  const [bannerAlt, setBannerAlt] = useState("Ivory hand-embroidered French linen shirt on an Aegean terrace")
  const [bannerSeoHeading, setBannerSeoHeading] = useState("H1")
  const [bannerSeoKeywords, setBannerSeoKeywords] = useState("french linen shirts, luxury menswear, resortwear")
  const [zoomImageModal, setZoomImageModal] = useState<{
    url: string
    title: string
    isMobile?: boolean
  } | null>(null)
  const [bannerPreviewFit, setBannerPreviewFit] = useState<"cover" | "contain">("cover")

  // ── BLOG CMS & SEO STUDIO STATES ──
  const [blogList, setBlogList] = useState<BlogPost[]>(initialBlogPosts)
  const [blogSearchQuery, setBlogSearchQuery] = useState("")
  const [blogCategoryFilter, setBlogCategoryFilter] = useState("All")
  const [blogStatusFilter, setBlogStatusFilter] = useState<"All" | "Published" | "Draft">("All")
  const [showAddBlogModal, setShowAddBlogModal] = useState(false)
  const [editBlogModal, setEditBlogModal] = useState<BlogPost | null>(null)
  const [deleteBlogModal, setDeleteBlogModal] = useState<BlogPost | null>(null)
  const [blogActiveTab, setBlogActiveTab] = useState<"content" | "seo">("content")

  // Blog Form Fields
  const [blogTitle, setBlogTitle] = useState("")
  const [blogSubtitle, setBlogSubtitle] = useState("")
  const [blogSlug, setBlogSlug] = useState("")
  const [blogCategory, setBlogCategory] = useState("Craft & Atelier")
  const [blogAuthorName, setBlogAuthorName] = useState("Gayatri Puri")
  const [blogAuthorRole, setBlogAuthorRole] = useState("Founder & Master Curator")
  const [blogExcerpt, setBlogExcerpt] = useState("")
  const [blogContent, setBlogContent] = useState("")
  const [blogKeyTakeaways, setBlogKeyTakeaways] = useState("")
  const [blogCoverImage, setBlogCoverImage] = useState("/assets/site_banners/slide1_desktop.jpg")
  const [blogReadTime, setBlogReadTime] = useState("5 min read")
  const [blogTags, setBlogTags] = useState("French Linen, Heritage Craft, Summer Style")
  const [blogFeatured, setBlogFeatured] = useState(false)
  const [blogPublished, setBlogPublished] = useState(true)

  // Blog SEO Fields
  const [blogMetaTitle, setBlogMetaTitle] = useState("")
  const [blogMetaDescription, setBlogMetaDescription] = useState("")
  const [blogKeywords, setBlogKeywords] = useState("")
  const [blogCanonicalUrl, setBlogCanonicalUrl] = useState("")
  const [blogOgImage, setBlogOgImage] = useState("")
  const [blogAltText, setBlogAltText] = useState("")
  const [blogNoIndex, setBlogNoIndex] = useState(false)

  // Global Page-Level SEO Settings
  const [siteSeoSettings, setSiteSeoSettings] = useState({
    home: {
      metaTitle: "GAYATRI BHAI | Handcrafted Luxury French Linen Shirts",
      metaDescription: "Discover artisanal resortwear and heirloom hand-embroidered French linen shirts crafted with generational master Karigar perfection in India.",
      keywords: "luxury linen shirts, hand embroidered shirts, cuban collar linen, resortwear india",
    },
    shop: {
      metaTitle: "Shop Artisan Linen Shirts | Gayatri Bhai Collection",
      metaDescription: "Explore our limited drops of 100% pure organic French linen shirts with single-needle botanical and resort embroidery.",
      keywords: "buy linen shirts online, resort collection, handcrafted clothing",
    },
    blog: {
      metaTitle: "The AVYR Journal | Essays on Craft, Linen Science & Sartorial Art",
      metaDescription: "Delve into the stories behind our atelier. In-depth guides to French flax, embroidery techniques, resort styling, and conscious luxury living.",
      keywords: "linen care, fabric science, cuban collar styling, artisan craft",
    },
  })

  // Multi-select state for bulk order actions
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])

  // Form states for Add Shirt
  const [newShirtName, setNewShirtName] = useState("")
  const [newShirtCategory, setNewShirtCategory] = useState("Contemporary")
  const [newShirtPrice, setNewShirtPrice] = useState("2199")
  const [newShirtMRP, setNewShirtMRP] = useState("2499")
  const [newShirtFabric, setNewShirtFabric] = useState("100% Pure Organic French Linen")
  const [newShirtColor, setNewShirtColor] = useState("Ivory White")
  const [newShirtSKU, setNewShirtSKU] = useState(`M26/SS/CON/SF/${Math.floor(10 + Math.random() * 89)}`)
  const [newShirtDescription, setNewShirtDescription] = useState(
    "A handcrafted luxury shirt tailored from organic linen, adorned with intricate single-needle artisanal embroidery. Features a relaxed Cuban collar and natural wooden buttons for effortless sophistication."
  )
  const [newShirtOccasion, setNewShirtOccasion] = useState("Resort wear, sunset gatherings, festive soirees")
  const [newShirtBadge, setNewShirtBadge] = useState("New")
  const [newShirtImages, setNewShirtImages] = useState<string[]>([
    "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg",
  ])
  const [newShirtCustomImageUrl, setNewShirtCustomImageUrl] = useState("")
  const [newShirtStock, setNewShirtStock] = useState<Record<string, number>>({
    XS: 4,
    S: 5,
    M: 6,
    L: 6,
    XL: 5,
    XXL: 3,
    XXXL: 2,
  })
  const [quickStockValue, setQuickStockValue] = useState("5")

  // Package Weight & Dimensions (Amazon / Shiprocket Shipping Logistics)
  const [newShirtWeight, setNewShirtWeight] = useState("0.35") // Weight in kg (350g)
  const [newShirtLength, setNewShirtLength] = useState("30")   // Package length in cm
  const [newShirtBreadth, setNewShirtBreadth] = useState("25") // Package width/breadth in cm
  const [newShirtHeight, setNewShirtHeight] = useState("4")    // Package height in cm

  // Form states for Add Coupon
  const [newCouponCode, setNewCouponCode] = useState("")
  const [newCouponDiscount, setNewCouponDiscount] = useState("15")
  const [newCouponMinSpend, setNewCouponMinSpend] = useState("2000")

  // Shipping live rate checker state
  const [checkPincode, setCheckPincode] = useState("")
  const [pincodeResult, setPincodeResult] = useState<any>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return productList.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCat = categoryFilter === "All" || p.category === categoryFilter
      return matchSearch && matchCat
    })
  }, [productList, searchQuery, categoryFilter])

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orderList.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.phone.includes(searchQuery) ||
        o.shirtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.pincode.includes(searchQuery)
      const matchStatus = orderStatusFilter === "All" || o.status === orderStatusFilter
      return matchSearch && matchStatus
    })
  }, [orderList, searchQuery, orderStatusFilter])

  // Filtered Blog Posts for CMS
  const filteredBlogs = useMemo(() => {
    return blogList.filter((b) => {
      const q = blogSearchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
        b.slug.toLowerCase().includes(q) ||
        (b.author?.name && b.author.name.toLowerCase().includes(q)) ||
        (Array.isArray(b.tags) && b.tags.some((t) => t.toLowerCase().includes(q)))

      const matchesCat = blogCategoryFilter === "All" || b.category === blogCategoryFilter

      const isPub = b.is_published !== false
      const matchesStatus =
        blogStatusFilter === "All" ||
        (blogStatusFilter === "Published" && isPub) ||
        (blogStatusFilter === "Draft" && !isPub)

      return matchesSearch && matchesCat && matchesStatus
    })
  }, [blogList, blogSearchQuery, blogCategoryFilter, blogStatusFilter])

  // Initial live data synchronization
  useEffect(() => {
    // Live blogs
    fetch("/api/blogs?all=true")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBlogList(data)
        }
      })
      .catch((e) => console.warn("Could not load blogs:", e))

    // Live banners
    fetch("/api/banners")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBannerList(data)
        }
      })
      .catch((e) => console.warn("Could not load banners:", e))

    // Live SEO settings
    fetch("/api/seo")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.home) {
          setSiteSeoSettings(data)
        }
      })
      .catch((e) => console.warn("Could not load SEO settings:", e))
  }, [])

  // Low stock inventory calculation
  const lowStockCount = useMemo(() => {
    return productList.filter((p) => {
      const stocks = Object.values(p.stock || {}) as number[]
      return stocks.some((s) => s <= 2)
    }).length
  }, [productList])

  // Inventory stats & filtered list
  const inventoryStats = useMemo(() => {
    let totalUnits = 0
    let totalValuation = 0
    let lowStockItems = 0
    let outOfStockItems = 0

    productList.forEach((p) => {
      const units = Object.values(p.stock || {}).reduce((a, b) => a + (Number(b) || 0), 0)
      totalUnits += units
      totalValuation += units * p.price
      if (units === 0) outOfStockItems++
      else if (units < 10) lowStockItems++
    })

    return { totalUnits, totalValuation, lowStockItems, outOfStockItems }
  }, [productList])

  const inventoryFilteredList = useMemo(() => {
    return productList.filter((p) => {
      const q = inventorySearch.toLowerCase().trim()
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.fabric && p.fabric.toLowerCase().includes(q)) ||
        (p.color && p.color.toLowerCase().includes(q))

      const units = Object.values(p.stock || {}).reduce((a, b) => a + (Number(b) || 0), 0)

      if (!matchesSearch) return false

      if (inventoryStockFilter === "low") {
        return units > 0 && units < 10
      }
      if (inventoryStockFilter === "out") {
        return units === 0
      }
      return true
    })
  }, [productList, inventorySearch, inventoryStockFilter])

  // Order Handlers
  const handleVerifyOrder = async (orderId: string) => {
    setOrderList((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
            ...o,
            status: "Verified" as const,
            verifiedBy: "Gayatri Puri (Admin)",
            verifiedAt: "Just now",
          }
          : o
      )
    )
    if (inspectOrderModal && inspectOrderModal.id === orderId) {
      setInspectOrderModal((prev) =>
        prev
          ? {
            ...prev,
            status: "Verified",
            verifiedBy: "Gayatri Puri (Admin)",
            verifiedAt: "Just now",
          }
          : null
      )
    }
    showToast(`Order #${orderId} verified & approved! Ready for Shiprocket courier.`)
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: "Verified", verified: true }),
      })
    } catch (e) {
      console.warn("Could not sync with API", e)
    }
  }

  const handleConfirmAssignCourier = async () => {
    if (!assignCourierModal) return
    const orderId = assignCourierModal.id
    const newAwb = `AWB-SR-${Math.floor(1000000000 + Math.random() * 9000000000)}`
    const courier = selectedCourierName || "BlueDart Express Air"

    setOrderList((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
            ...o,
            status: "Assigned to Courier" as const,
            courier,
            awb: newAwb,
          }
          : o
      )
    )

    if (inspectOrderModal && inspectOrderModal.id === orderId) {
      setInspectOrderModal((prev) =>
        prev
          ? {
            ...prev,
            status: "Assigned to Courier",
            courier,
            awb: newAwb,
          }
          : null
      )
    }

    setAssignCourierModal(null)
    showToast(`Shipment Booked! ${courier} AWB: #${newAwb}`)

    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: "Assigned to Courier", courier, awb: newAwb }),
      })
    } catch (e) {
      console.warn("Could not sync with API", e)
    }
  }

  const handleConfirmCancelOrder = async () => {
    if (!cancelOrderModal) return
    const orderId = cancelOrderModal.id
    const order = orderList.find((o) => o.id === orderId)

    if (
      order?.status === "Assigned to Courier" ||
      order?.status === "Dispatched" ||
      order?.status === "Delivered"
    ) {
      showToast("Cannot cancel: Order is already handed over to courier partner. Initiate Return/RTO instead.")
      setCancelOrderModal(null)
      return
    }

    setOrderList((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
            ...o,
            status: "Cancelled" as const,
            cancelReason: cancelReasonText || "Cancelled by Store Admin",
          }
          : o
      )
    )

    if (inspectOrderModal && inspectOrderModal.id === orderId) {
      setInspectOrderModal((prev) =>
        prev
          ? {
            ...prev,
            status: "Cancelled",
            cancelReason: cancelReasonText || "Cancelled by Store Admin",
          }
          : null
      )
    }

    setCancelOrderModal(null)
    showToast(`Order #${orderId} has been cancelled.`)

    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "Cancelled",
          cancelReason: cancelReasonText,
        }),
      })
    } catch (e) {
      console.warn("Could not sync with API", e)
    }
  }

  // Multi-select handlers
  const handleSelectAllOrders = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(filteredOrders.map((o) => o.id))
    } else {
      setSelectedOrderIds([])
    }
  }

  const handleToggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleBulkVerify = async () => {
    if (!selectedOrderIds.length) return
    const eligible = orderList.filter(
      (o) => selectedOrderIds.includes(o.id) && o.status === "Pending Verification"
    )
    if (!eligible.length) {
      showToast("Selected orders are already verified or cannot be verified.")
      return
    }
    const eligibleIds = eligible.map((o) => o.id)
    setOrderList((prev) =>
      prev.map((o) =>
        eligibleIds.includes(o.id)
          ? { ...o, status: "Verified" as const, verifiedBy: "Gayatri Puri (Admin)", verifiedAt: "Just now" }
          : o
      )
    )
    showToast(`Verified & approved ${eligible.length} orders for shipping!`)
    setSelectedOrderIds([])
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: eligibleIds, status: "Verified", verified: true }),
      })
    } catch (e) {
      console.warn("Could not sync with API", e)
    }
  }

  const handleBulkAssignShiprocket = async () => {
    if (!selectedOrderIds.length) return
    const eligible = orderList.filter(
      (o) => selectedOrderIds.includes(o.id) && o.status === "Verified"
    )
    if (!eligible.length) {
      showToast("Selected orders must be 'Verified' before assigning to courier.")
      return
    }

    const eligibleIds = eligible.map((o) => o.id)
    setOrderList((prev) =>
      prev.map((o) => {
        if (eligibleIds.includes(o.id)) {
          return {
            ...o,
            status: "Assigned to Courier" as const,
            courier: "BlueDart Express Air",
            awb: `AWB-SR-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          }
        }
        return o
      })
    )
    showToast(`Generated Shiprocket AWBs for ${eligible.length} orders!`)
    setSelectedOrderIds([])
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: eligibleIds,
          status: "Assigned to Courier",
          courier: "BlueDart Express Air",
          awb: `AWB-SR-BULK-${Date.now().toString().slice(-6)}`,
        }),
      })
    } catch (e) {
      console.warn("Could not sync with API", e)
    }
  }

  const handleBulkCancel = async () => {
    if (!selectedOrderIds.length) return
    const eligible = orderList.filter(
      (o) =>
        selectedOrderIds.includes(o.id) &&
        o.status !== "Assigned to Courier" &&
        o.status !== "Dispatched" &&
        o.status !== "Delivered" &&
        o.status !== "Cancelled"
    )
    if (!eligible.length) {
      showToast("Cannot cancel: Selected orders are already in courier custody or already cancelled.")
      return
    }
    const eligibleIds = eligible.map((o) => o.id)
    setOrderList((prev) =>
      prev.map((o) =>
        eligibleIds.includes(o.id)
          ? { ...o, status: "Cancelled" as const, cancelReason: "Bulk cancelled by Store Admin" }
          : o
      )
    )
    showToast(`Cancelled ${eligible.length} orders successfully.`)
    setSelectedOrderIds([])
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: eligibleIds,
          status: "Cancelled",
          cancelReason: "Bulk cancelled by Store Admin",
        }),
      })
    } catch (e) {
      console.warn("Could not sync with API", e)
    }
  }

  const handleUpdateOrderStatus = (orderId: string, newStatus: any) => {
    setOrderList((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    )
    showToast(`Order #${orderId} marked as ${newStatus}`)
  }

  const handleStockAdjust = async (productId: string, size: string, delta: number) => {
    let updatedStock: Record<string, number> = {}
    setProductList((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const current = p.stock[size] || 0
          updatedStock = {
            ...p.stock,
            [size]: Math.max(0, current + delta),
          }
          return {
            ...p,
            stock: updatedStock,
          }
        }
        return p
      })
    )
    showToast(`Stock updated for size ${size}`)

    try {
      await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, stock: updatedStock }),
      })
    } catch (e) {
      console.warn("Could not sync stock adjust:", e)
    }
  }

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !files.length) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const dataUrl = ev.target.result as string
          setNewShirtImages((prev) => [...prev, dataUrl])
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ""
  }

  const handleAddImageUrl = () => {
    if (!newShirtCustomImageUrl.trim()) return
    setNewShirtImages((prev) => [...prev, newShirtCustomImageUrl.trim()])
    setNewShirtCustomImageUrl("")
  }

  const handleRemoveImage = (index: number) => {
    setNewShirtImages((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleTogglePresetImage = (url: string) => {
    setNewShirtImages((prev) => {
      if (prev.includes(url)) {
        return prev.filter((u) => u !== url)
      }
      return [...prev, url]
    })
  }

  const handleStockChange = (size: string, val: number) => {
    setNewShirtStock((prev) => ({
      ...prev,
      [size]: Math.max(0, val),
    }))
  }

  const handleApplyQuickStock = () => {
    const qty = parseInt(quickStockValue, 10) || 0
    setNewShirtStock({
      XS: qty,
      S: qty,
      M: qty,
      L: qty,
      XL: qty,
      XXL: qty,
      XXXL: qty,
    })
    showToast(`Updated all sizes to ${qty} units!`)
  }

  const handleAddShirtSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newShirtName.trim()) {
      showToast("Please enter shirt name")
      return
    }
    const priceNum = parseInt(newShirtPrice, 10) || 1999
    const mrpNum = parseInt(newShirtMRP, 10) || priceNum

    const finalImages =
      newShirtImages.length > 0
        ? newShirtImages
        : [
          "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg",
        ]

    const activeSizes = Object.entries(newShirtStock)
      .filter(([_, qty]) => qty > 0)
      .map(([size]) => size)

    const finalSizes = activeSizes.length > 0 ? activeSizes : ["S", "M", "L", "XL", "XXL"]

    const slug = newShirtName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const discountPct = mrpNum > priceNum ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0

    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      slug,
      name: newShirtName.trim(),
      description:
        newShirtDescription.trim() ||
        `Handcrafted ${newShirtCategory} shirt adorned with fine single-needle embroidery on pure ${newShirtFabric}.`,
      price: priceNum,
      mrp: mrpNum,
      discount: discountPct,
      category: newShirtCategory,
      sku: newShirtSKU.trim() || `M26/SS/ART/${Math.floor(10 + Math.random() * 89)}`,
      color: newShirtColor.trim() || "Ivory",
      sizes: finalSizes,
      images: finalImages,
      fabric: newShirtFabric.trim() || "Pure Linen",
      occasion: newShirtOccasion.trim() || "Resort wear, casual events",
      rating: 5.0,
      reviews: 1,
      badge: newShirtBadge || "New",
      stock: newShirtStock,
      weight: parseFloat(newShirtWeight) || 0.35,
      length: parseFloat(newShirtLength) || 30,
      breadth: parseFloat(newShirtBreadth) || 25,
      height: parseFloat(newShirtHeight) || 4,
      is_visible: true,
    }

    setProductList([newProduct, ...productList])
    setShowAddShirtModal(false)
    showToast(`"${newShirtName}" successfully added to Atelier catalog!`)

    // Reset form
    setNewShirtName("")
    setNewShirtDescription(
      "A handcrafted luxury shirt tailored from organic linen, adorned with intricate single-needle artisanal embroidery. Features a relaxed Cuban collar and natural wooden buttons for effortless sophistication."
    )
    setNewShirtImages([
      "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg",
    ])
    setNewShirtSKU(`M26/SS/CON/SF/${Math.floor(10 + Math.random() * 89)}`)

    // Sync to API & local database
    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      })
    } catch (err) {
      console.warn("Could not sync product with API:", err)
    }
  }

  // ── PRODUCT EDIT, HIDE & DELETE HANDLERS ──
  const handleToggleProductVisibility = async (product: Product) => {
    const newVisibility = product.is_visible === false ? true : false
    setProductList((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_visible: newVisibility } : p))
    )
    showToast(
      newVisibility
        ? `"${product.name}" is now visible on storefront!`
        : `"${product.name}" hidden from customer storefront (Draft)`
    )
    try {
      await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, is_visible: newVisibility }),
      })
    } catch (e) {
      console.warn("Could not sync visibility to API:", e)
    }
  }

  const handleOpenEditProduct = (product: Product) => {
    setEditProductModal({ ...product, images: [...product.images], stock: { ...product.stock } })
    setEditPhotoCustomUrl("")
  }

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editProductModal) return
    const updated = { ...editProductModal }
    setProductList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setEditProductModal(null)
    showToast(`"${updated.name}" details updated successfully!`)

    try {
      await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })
    } catch (e) {
      console.warn("Could not sync edit to API:", e)
    }
  }

  const handleDeleteProductPhoto = (index: number) => {
    if (!editProductModal) return
    if (editProductModal.images.length <= 1) {
      showToast("A shirt must keep at least 1 photo.")
      return
    }
    const updatedImages = editProductModal.images.filter((_, idx) => idx !== index)
    setEditProductModal({ ...editProductModal, images: updatedImages })
    showToast("Photo deleted from shirt.")
  }

  const handleSetCoverPhoto = (index: number) => {
    if (!editProductModal || index === 0) return
    const target = editProductModal.images[index]
    const rest = editProductModal.images.filter((_, idx) => idx !== index)
    const reordered = [target, ...rest]
    setEditProductModal({ ...editProductModal, images: reordered })
    showToast("Cover photo updated! This image is now the main store showcase.")
  }

  const handleUploadEditPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editProductModal) return
    const files = e.target.files
    if (!files || !files.length) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const dataUrl = ev.target.result as string
          setEditProductModal((prev) =>
            prev ? { ...prev, images: [...prev.images, dataUrl] } : null
          )
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ""
  }

  const handleAddEditPhotoUrl = () => {
    if (!editProductModal || !editPhotoCustomUrl.trim()) return
    setEditProductModal({
      ...editProductModal,
      images: [...editProductModal.images, editPhotoCustomUrl.trim()],
    })
    setEditPhotoCustomUrl("")
    showToast("Photo added to gallery.")
  }

  const handleOpenDeleteProduct = (product: Product) => {
    setDeleteProductModal(product)
  }

  const handleConfirmDeleteProduct = async () => {
    if (!deleteProductModal) return
    const idToDelete = deleteProductModal.id
    setProductList((prev) => prev.filter((p) => p.id !== idToDelete))
    setDeleteProductModal(null)
    showToast(`"${deleteProductModal.name}" deleted from catalog.`)

    try {
      await fetch(`/api/products?id=${encodeURIComponent(idToDelete)}`, {
        method: "DELETE",
      })
    } catch (e) {
      console.warn("Could not sync deletion to API:", e)
    }
  }

  // ── HOMEPAGE HERO SLIDER BANNER HANDLERS ──
  const handleOpenAddBanner = () => {
    setEditingBannerId(null)
    setBannerKicker("Summer Atelier '26")
    setBannerLine1("Woven")
    setBannerLine2("by hand.")
    setBannerCta("Shop collection")
    setBannerDesktopImg("/assets/site_banners/slide1_desktop.jpg")
    setMobileBannerImg("/assets/site_banners/slide1_mobile.jpg")
    setBannerLink("/shop")
    setBannerTone("light")
    setBannerActive(true)
    setBannerAlt("Ivory hand-embroidered French linen shirt on an Aegean seaside stone terrace")
    setBannerSeoHeading("H1")
    setBannerSeoKeywords("french linen shirts, luxury menswear, resortwear")
    setShowBannerModal(true)
  }

  const handleOpenEditBanner = (banner: any) => {
    setEditingBannerId(banner.id)
    setBannerKicker(banner.kicker || banner.title || "")
    setBannerLine1(banner.lines?.[0] || banner.title || "")
    setBannerLine2(banner.lines?.[1] || banner.subtitle || "")
    setBannerCta(banner.cta || "Shop collection")
    setBannerDesktopImg(banner.desktop || banner.image_desktop || "")
    setMobileBannerImg(banner.mobile || banner.image_mobile || "")
    setBannerLink(banner.link || "/shop")
    setBannerTone(banner.tone || "light")
    setBannerActive(banner.is_active !== false)
    setBannerAlt(banner.alt || `${banner.kicker || "Hero"} - ${banner.lines?.[0] || ""}`)
    setBannerSeoHeading(banner.seo_heading || "H1")
    setBannerSeoKeywords(
      Array.isArray(banner.seo_keywords)
        ? banner.seo_keywords.join(", ")
        : banner.seo_keywords || ""
    )
    setShowBannerModal(true)
  }

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    const bannerObj = {
      id: editingBannerId || `slide_${Date.now()}`,
      kicker: bannerKicker,
      lines: [bannerLine1, bannerLine2] as [string, string],
      cta: bannerCta,
      desktop: bannerDesktopImg,
      mobile: bannerMobileImg,
      alt: bannerAlt || `${bannerKicker} - ${bannerLine1} ${bannerLine2}`,
      tone: bannerTone,
      link: bannerLink,
      is_active: bannerActive,
      seo_heading: bannerSeoHeading,
      seo_keywords: bannerSeoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      sort_order: editingBannerId
        ? bannerList.find((b) => b.id === editingBannerId)?.sort_order || 1
        : bannerList.length + 1,
    }

    let updatedList: any[]
    if (editingBannerId) {
      updatedList = bannerList.map((b) => (b.id === editingBannerId ? bannerObj : b))
    } else {
      updatedList = [bannerObj, ...bannerList]
    }

    setBannerList(updatedList)
    setShowBannerModal(false)
    showToast("Homepage Hero Banner & SEO settings saved!")

    try {
      await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList),
      })
    } catch (e) {
      console.warn("Could not sync banners to API:", e)
    }
  }

  const handleToggleBannerActive = async (bannerId: string) => {
    const updatedList = bannerList.map((b) =>
      b.id === bannerId ? { ...b, is_active: !b.is_active } : b
    )
    setBannerList(updatedList)
    showToast("Banner visibility toggled!")
    try {
      await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList),
      })
    } catch (e) {
      console.warn("Could not sync banners to API:", e)
    }
  }

  const handleDeleteBanner = async (bannerId: string) => {
    const updatedList = bannerList.filter((b) => b.id !== bannerId)
    setBannerList(updatedList)
    showToast("Banner removed from homepage slider.")
    try {
      await fetch(`/api/banners?id=${encodeURIComponent(bannerId)}`, {
        method: "DELETE",
      })
    } catch (e) {
      console.warn("Could not sync delete banner to API:", e)
    }
  }

  const handleMoveBanner = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= bannerList.length) return
    const updated = [...bannerList]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    updated.forEach((b, i) => {
      b.sort_order = i + 1
    })
    setBannerList(updated)
    showToast(`Banner slide moved ${direction}!`)
    try {
      await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })
    } catch (e) {
      console.warn("Could not sync banners to API:", e)
    }
  }

  const handleDuplicateBanner = async (banner: any) => {
    const newSlide = {
      ...banner,
      id: `slide_${Date.now()}`,
      kicker: `${banner.kicker || "Featured"} (Copy)`,
      sort_order: bannerList.length + 1,
    }
    const updated = [...bannerList, newSlide]
    setBannerList(updated)
    showToast("Banner slide duplicated successfully!")
    try {
      await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })
    } catch (e) {
      console.warn("Could not sync banners to API:", e)
    }
  }

  const handleUploadBannerDesktop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ev.target?.result) setBannerDesktopImg(ev.target.result as string)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleUploadBannerMobile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ev.target?.result) setMobileBannerImg(ev.target.result as string)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  // ── BLOG CMS & SEO HANDLERS ──
  const handleOpenAddBlog = () => {
    setEditBlogModal(null)
    setBlogTitle("")
    setBlogSubtitle("")
    setBlogSlug("")
    setBlogCategory("Craft & Atelier")
    setBlogAuthorName("Gayatri Puri")
    setBlogAuthorRole("Founder & Master Curator")
    setBlogExcerpt("")
    setBlogContent("")
    setBlogKeyTakeaways("")
    setBlogCoverImage("/assets/site_banners/slide1_desktop.jpg")
    setBlogReadTime("5 min read")
    setBlogTags("French Linen, Heritage Craft, Summer Style")
    setBlogFeatured(false)
    setBlogPublished(true)
    setBlogMetaTitle("")
    setBlogMetaDescription("")
    setBlogKeywords("luxury linen shirts, artisan embroidery, gayatri bhai atelier")
    setBlogCanonicalUrl("")
    setBlogOgImage("")
    setBlogAltText("")
    setBlogNoIndex(false)
    setBlogActiveTab("content")
    setShowAddBlogModal(true)
  }

  const handleOpenEditBlog = (blog: BlogPost) => {
    setEditBlogModal(blog)
    setBlogTitle(blog.title || "")
    setBlogSubtitle(blog.subtitle || "")
    setBlogSlug(blog.slug || "")
    setBlogCategory(blog.category || "Craft & Atelier")
    setBlogAuthorName(blog.author?.name || "Gayatri Puri")
    setBlogAuthorRole(blog.author?.role || "Founder & Master Curator")
    setBlogExcerpt(blog.excerpt || "")
    setBlogContent(
      Array.isArray(blog.content) ? blog.content.join("\n\n") : (blog.content as any) || ""
    )
    setBlogKeyTakeaways(
      Array.isArray(blog.keyTakeaways) ? blog.keyTakeaways.join("\n") : ""
    )
    setBlogCoverImage(blog.coverImage || "/assets/site_banners/slide1_desktop.jpg")
    setBlogReadTime(blog.readTime || "5 min read")
    setBlogTags(Array.isArray(blog.tags) ? blog.tags.join(", ") : "")
    setBlogFeatured(Boolean(blog.featured))
    setBlogPublished(blog.is_published !== false)
    setBlogMetaTitle(blog.seo?.metaTitle || `${blog.title} | Gayatri Bhai Journal`)
    setBlogMetaDescription(blog.seo?.metaDescription || blog.excerpt || "")
    setBlogKeywords(
      Array.isArray(blog.seo?.keywords) ? blog.seo.keywords.join(", ") : ""
    )
    setBlogCanonicalUrl(blog.seo?.canonicalUrl || "")
    setBlogOgImage(blog.seo?.ogImage || blog.coverImage || "")
    setBlogAltText(blog.seo?.altText || blog.title || "")
    setBlogNoIndex(Boolean(blog.seo?.noIndex))
    setBlogActiveTab("content")
    setShowAddBlogModal(true)
  }

  const handleToggleBlogPublish = async (blogId: string) => {
    const blog = blogList.find((b) => b.id === blogId)
    if (!blog) return
    const newStatus = !(blog.is_published !== false)

    setBlogList((prev) =>
      prev.map((b) => (b.id === blogId ? { ...b, is_published: newStatus } : b))
    )
    showToast(
      newStatus
        ? `"${blog.title}" is now LIVE on store!`
        : `"${blog.title}" is now HIDDEN (Draft).`
    )

    try {
      await fetch("/api/blogs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: blogId, is_published: newStatus }),
      })
    } catch (e) {
      console.warn("Could not sync blog visibility to API:", e)
    }
  }

  const handleOpenDeleteBlog = (blog: BlogPost) => {
    setDeleteBlogModal(blog)
  }

  const handleConfirmDeleteBlog = async () => {
    if (!deleteBlogModal) return
    const idToDelete = deleteBlogModal.id
    const titleToDelete = deleteBlogModal.title
    setBlogList((prev) => prev.filter((b) => b.id !== idToDelete))
    setDeleteBlogModal(null)
    showToast(`"${titleToDelete}" removed from journal.`)

    try {
      await fetch(`/api/blogs?id=${encodeURIComponent(idToDelete)}`, {
        method: "DELETE",
      })
    } catch (e) {
      console.warn("Could not sync delete blog to API:", e)
    }
  }

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blogTitle.trim()) {
      showToast("Please enter a blog article title.")
      return
    }

    const contentParagraphs = blogContent
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean)

    const keyTakeawaysArray = blogKeyTakeaways
      .split("\n")
      .map((k) => k.trim())
      .filter(Boolean)

    const tagsArray = blogTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const keywordsArray = blogKeywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)

    const slugToUse = (blogSlug.trim() || blogTitle.trim())
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const blogPayload: Partial<BlogPost> = {
      id: editBlogModal ? editBlogModal.id : `blog-${Date.now()}`,
      title: blogTitle.trim(),
      subtitle: blogSubtitle.trim(),
      slug: slugToUse,
      category: blogCategory,
      excerpt: blogExcerpt.trim() || blogContent.slice(0, 150) + "...",
      content: contentParagraphs.length > 0 ? contentParagraphs : [blogExcerpt],
      keyTakeaways: keyTakeawaysArray,
      author: {
        name: blogAuthorName.trim() || "Gayatri Puri",
        role: blogAuthorRole.trim() || "Master Curator",
        avatar: (blogAuthorName.trim() || "GP").slice(0, 2).toUpperCase(),
      },
      coverImage: blogCoverImage.trim() || "/assets/site_banners/slide1_desktop.jpg",
      readTime: blogReadTime.trim() || "5 min read",
      date:
        editBlogModal?.date ||
        new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      tags: tagsArray,
      featured: blogFeatured,
      is_published: blogPublished,
      seo: {
        metaTitle: blogMetaTitle.trim() || `${blogTitle.trim()} | Gayatri Bhai Journal`,
        metaDescription: blogMetaDescription.trim() || blogExcerpt.slice(0, 155),
        keywords: keywordsArray,
        canonicalUrl:
          blogCanonicalUrl.trim() ||
          `https://gayatribhaishop-zkde-eight.vercel.app/blog/${slugToUse}`,
        ogImage: blogOgImage.trim() || blogCoverImage.trim(),
        altText: blogAltText.trim() || blogTitle.trim(),
        noIndex: blogNoIndex,
      },
    }

    if (editBlogModal) {
      setBlogList((prev) =>
        prev.map((b) =>
          b.id === editBlogModal.id ? ({ ...b, ...blogPayload } as BlogPost) : b
        )
      )
      showToast(`Article "${blogTitle}" updated successfully!`)
      try {
        await fetch("/api/blogs", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blogPayload),
        })
      } catch (err) {
        console.warn("Could not sync edit blog to API:", err)
      }
    } else {
      setBlogList((prev) => [blogPayload as BlogPost, ...prev])
      showToast(`Article "${blogTitle}" created & published to CMS!`)
      try {
        await fetch("/api/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blogPayload),
        })
      } catch (err) {
        console.warn("Could not sync new blog to API:", err)
      }
    }

    setShowAddBlogModal(false)
    setEditBlogModal(null)
  }

  const handleSaveSeoSettings = async () => {
    showToast("Global Page SEO settings saved & synced with search engines!")
    try {
      await fetch("/api/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteSeoSettings),
      })
    } catch (e) {
      console.warn("Could not sync SEO settings:", e)
    }
  }

  const handleAddCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCouponCode) return
    const newCpn = {
      id: `cpn_${Date.now()}`,
      code: newCouponCode.toUpperCase().trim(),
      discount: `${newCouponDiscount}% Off`,
      type: "Percentage",
      minSpend: parseInt(newCouponMinSpend, 10) || 1500,
      usedCount: 0,
      maxUses: 200,
      active: true,
    }
    setCouponList([newCpn, ...couponList])
    setShowAddCouponModal(false)
    setNewCouponCode("")
    showToast(`Coupon ${newCpn.code} created successfully!`)
  }

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(checkPincode.trim())) {
      showToast("Please enter a valid 6-digit Indian PIN code")
      return
    }
    const pin = checkPincode.trim()
    setPincodeResult({
      pincode: pin,
      serviceable: true,
      city: pin.startsWith("11") ? "New Delhi" : pin.startsWith("40") ? "Mumbai" : pin.startsWith("39") ? "Surat (Local)" : pin.startsWith("56") ? "Bengaluru" : "Pan India Metro",
      delhivery: "₹49 (2-3 Business Days)",
      blueDart: "₹95 (Next Day Air Express)",
      dtdc: "₹55 (3-4 Business Days)",
      codAvailable: true,
    })
    showToast(`Pincode ${pin} is fully serviceable via Shiprocket!`)
  }

  const exportOrdersCSV = () => {
    const headers = "Order ID,Customer,Phone,City,Pincode,Shirt,Size,Total,Payment,Status\n"
    const rows = orderList
      .map(
        (o) =>
          `"${o.id}","${o.customer}","${o.phone}","${o.city}","${o.pincode}","${o.shirtName}","${o.size}","₹${o.total}","${o.paymentMethod}","${o.status}"`
      )
      .join("\n")
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `GayatriBhai_Orders_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast("Orders exported to CSV successfully!")
  }

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, badge: null },
    { name: "Products", icon: ShoppingBag, badge: productList.length },
    { name: "Orders", icon: Package, badge: orderList.length },
    { name: "Customers", icon: Users, badge: customerList.length },
    { name: "Inventory", icon: AlertTriangle, badge: lowStockCount > 0 ? `${lowStockCount} Alert` : null },
    { name: "Coupons", icon: Ticket, badge: couponList.length },
    { name: "Shiprocket", icon: Truck, badge: "Live" },
    { name: "Marketing", icon: ImageIcon, badge: null },
    { name: "Blog CMS", icon: BookOpen, badge: `${blogList.length}` },
    { name: "Settings", icon: Settings, badge: null },
  ]

  return (
    <div className="h-screen w-full bg-[#0d0f12] text-zinc-100 flex overflow-hidden antialiased selection:bg-[#d4af37] selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-[#d4af37]/40 bg-[#14171d]/95 px-5 py-3.5 shadow-2xl backdrop-blur-xl text-sm font-semibold text-white animate-in slide-in-from-top-4 duration-300">
          <Sparkles className="h-4 w-4 text-[#d4af37]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── DESKTOP & MOBILE SIDEBAR (STICKY / FIXED) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 h-screen flex-shrink-0 flex flex-col border-r border-white/10 bg-[#121418] transition-transform duration-300 ease-in-out lg:static lg:h-screen lg:w-72 lg:shrink-0 lg:flex lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Sidebar Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/15 text-[#d4af37] shadow-inner">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-[0.16em] text-[#d4af37]">GAYATRI BHAI</span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Atelier Admin Suite</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Admin User Profile Capsule */}
        <div className="m-4 rounded-xl border border-white/10 bg-white/5 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#d4af37] to-[#f3e5ab] font-bold text-black text-sm">
              GP
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">Gayatri Puri</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Store Owner (Live)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2 admin-scroll">
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Management</p>
          {navItems.map((item) => {
            const IconComp = item.icon
            const isActive = activeTab === item.name
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name)
                  setMobileMenuOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold tracking-wider transition-all duration-150 ${isActive
                  ? "bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20 font-bold"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <IconComp className={`h-4 w-4 ${isActive ? "text-black" : "text-zinc-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive
                      ? "bg-black/20 text-black"
                      : item.badge === "Live"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : String(item.badge).includes("Alert")
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-white/10 text-zinc-300"
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-white/10 p-4 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold tracking-wider text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>View Customer Storefront</span>
          </Link>
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Switch / Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ── RIGHT MAIN CONTENT AREA (INDEPENDENTLY SCROLLABLE) ── */}
      <main
        data-lenis-prevent
        className="flex-1 h-screen overflow-y-auto min-w-0 flex flex-col admin-scroll scroll-smooth focus:outline-none"
      >
        {/* Top Bar Header */}
        <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center justify-between border-b border-white/10 bg-[#0d0f12]/95 px-4 sm:px-8 backdrop-blur-xl gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:text-white lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                <span>Gayatri Bhai</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-[#d4af37] font-semibold">{activeTab}</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                {activeTab} Management
              </h2>
            </div>
          </div>

          {/* Quick Actions & Live Status Bar */}
          <div className="flex items-center gap-3">
            {/* Live Status Indicators */}
            <div className="hidden md:flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold text-zinc-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Razorpay Live</span>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1 text-[#d4af37]">
                <Truck className="h-3 w-3" />
                <span>Shiprocket AWB</span>
              </span>
            </div>

            {/* Action Buttons based on tab */}
            {activeTab === "Products" && (
              <button
                onClick={() => setShowAddShirtModal(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-md hover:brightness-110 active:scale-95 transition"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add New Shirt</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}

            {activeTab === "Coupons" && (
              <button
                onClick={() => setShowAddCouponModal(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-md hover:brightness-110 active:scale-95 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Create Coupon</span>
              </button>
            )}

            {activeTab === "Orders" && (
              <button
                onClick={exportOrdersCSV}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}

            {activeTab === "Blog CMS" && (
              <button
                onClick={handleOpenAddBlog}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-md hover:brightness-110 active:scale-95 transition"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Write New Article</span>
                <span className="sm:hidden">New Blog</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Content View Container */}
        <div className="p-4 sm:p-8 space-y-8 flex-1 pb-24">
          {/* ══════════════ TAB 1: DASHBOARD ══════════════ */}
          {activeTab === "Dashboard" && (
            <div className="space-y-8">
              {/* 4 Hero KPI Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#16191f] to-[#121418] p-5 shadow-lg relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">Total Revenue</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37]">
                      <IndianRupee className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">₹8,42,590</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-semibold">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>+18.2% vs last month</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#16191f] to-[#121418] p-5 shadow-lg relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">Total Orders</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">{orderList.length + 1243}</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-semibold">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>+12.5% fulfillment rate</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#16191f] to-[#121418] p-5 shadow-lg relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">Artisanal Shirts Sold</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                      <Package className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">1,614 Units</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-semibold">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>+16.8% volume</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#16191f] to-[#121418] p-5 shadow-lg relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">Registered Patrons</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">{customerList.length + 407}</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-400 font-semibold">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>94% Repeat Loyalty</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Chart & Fulfillment Watch */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Sales Trajectory */}
                <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-white">Revenue Performance (FY 2026)</h4>
                      <p className="text-xs text-zinc-400">Artisanal single-needle embroidery & pure linen shipments</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-xs text-[#d4af37] font-semibold">
                        Avg Order Value: ₹2,450
                      </span>
                    </div>
                  </div>

                  {/* CSS Bar Chart */}
                  <div className="h-52 flex items-end justify-between gap-2 pt-6 border-b border-white/10">
                    {[
                      { m: "May", h: 42, v: "₹4.2L" },
                      { m: "Jun", h: 58, v: "₹5.8L" },
                      { m: "Jul", h: 49, v: "₹4.9L" },
                      { m: "Aug", h: 74, v: "₹7.4L" },
                      { m: "Sep", h: 68, v: "₹6.8L" },
                      { m: "Oct", h: 95, v: "₹8.4L" },
                    ].map((item, idx) => (
                      <div key={item.m} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                          {item.v}
                        </span>
                        <div
                          style={{ height: `${item.h}%` }}
                          className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 ${idx === 5
                            ? "bg-gradient-to-t from-[#d4af37] to-[#f3e5ab] shadow-lg shadow-[#d4af37]/20"
                            : "bg-white/10 hover:bg-white/20"
                            }`}
                        />
                        <span className="text-[11px] font-semibold text-zinc-400 mt-2">{item.m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Stock Watchlist */}
                <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div className="flex items-center gap-2 text-amber-400">
                        <AlertTriangle className="h-4 w-4" />
                        <h4 className="font-serif text-base font-bold text-white">Low Stock Watchlist</h4>
                      </div>
                      <button
                        onClick={() => setActiveTab("Inventory")}
                        className="text-xs font-semibold text-[#d4af37] hover:underline"
                      >
                        Manage All &rarr;
                      </button>
                    </div>

                    <div className="mt-4 space-y-3.5">
                      {productList.slice(0, 4).map((p) => {
                        const stockTotal = Object.values(p.stock).reduce((a, b) => a + b, 0)
                        return (
                          <div key={p.id} className="flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-white/10">
                                <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-white">{p.name}</p>
                                <p className="text-[10px] text-zinc-400">{p.sku}</p>
                              </div>
                            </div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${stockTotal <= 10
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                }`}
                            >
                              {stockTotal} units left
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("Inventory")}
                    className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition"
                  >
                    Audit Full Inventory &rarr;
                  </button>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-white">Recent Atelier Orders</h4>
                    <p className="text-xs text-zinc-400">Real-time payment verification and dispatch tracking</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("Orders")}
                    className="text-xs font-semibold text-[#d4af37] hover:underline"
                  >
                    View All {orderList.length} Orders &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-400 font-semibold tracking-wider uppercase text-[11px]">
                        <th className="py-3 px-3">Order ID</th>
                        <th className="py-3 px-3">Patron</th>
                        <th className="py-3 px-3">Shirt Item</th>
                        <th className="py-3 px-3">Total</th>
                        <th className="py-3 px-3">Payment</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orderList.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3.5 px-3 font-mono font-bold text-[#d4af37]">{ord.id}</td>
                          <td className="py-3.5 px-3">
                            <p className="font-semibold text-white">{ord.customer}</p>
                            <p className="text-[10px] text-zinc-400">{ord.city}</p>
                          </td>
                          <td className="py-3.5 px-3">
                            <p className="text-white truncate max-w-[200px]">{ord.shirtName}</p>
                            <span className="text-[10px] text-zinc-400">Size: {ord.size} • Qty: {ord.qty}</span>
                          </td>
                          <td className="py-3.5 px-3 font-mono font-semibold text-white">{formatINR(ord.total)}</td>
                          <td className="py-3.5 px-3">
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3" />
                              {ord.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${ord.status === "Delivered"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : ord.status === "Dispatched"
                                  ? "bg-blue-500/20 text-blue-300"
                                  : "bg-amber-500/20 text-amber-300"
                                }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              onClick={() => setActiveTab("Orders")}
                              className="text-zinc-400 hover:text-white font-semibold text-[11px]"
                            >
                              Details &rarr;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TAB 2: PRODUCTS ══════════════ */}
          {activeTab === "Products" && (
            <div className="flex flex-col h-[calc(100vh-8.5rem)] space-y-4">
              {/* Search & Filter Bar (STICKY & FIXED AT TOP) */}
              <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#14171d]/95 p-4 backdrop-blur-xl shadow-xl">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search shirts by name, SKU, or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  {["All", "Contemporary", "BeachSide", "Classic", "Festive"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition shrink-0 ${categoryFilter === cat
                        ? "bg-[#d4af37] text-black font-bold shadow-md shadow-[#d4af37]/20"
                        : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Counter & Status Strip */}
              <div className="shrink-0 flex items-center justify-between px-1 text-xs text-zinc-400">
                <span>Displaying <strong className="text-white">{filteredProducts.length}</strong> haute shirts in catalog</span>
                <span className="text-[11px] text-[#d4af37] font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Database Synced
                </span>
              </div>

              {/* Product Catalog Grid (INDEPENDENTLY SCROLLABLE) */}
              <div className="flex-1 overflow-y-auto admin-scroll pr-1 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredProducts.map((p) => {
                    const totalUnits = Object.values(p.stock).reduce((a, b) => a + b, 0)
                    const isHidden = p.is_visible === false
                    return (
                      <div
                        key={p.id}
                        className={`rounded-2xl border bg-[#14171d] p-4 shadow-xl flex flex-col justify-between group transition duration-200 ${isHidden
                            ? "border-amber-500/30 opacity-90"
                            : "border-white/10 hover:border-[#d4af37]/40"
                          }`}
                      >
                        <div>
                          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-black mb-3">
                            <Image
                              src={p.images[0] || "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg"}
                              alt={p.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-2.5 left-2.5 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-[#d4af37] border border-white/10">
                              {p.category}
                            </span>
                            <span className="absolute top-2.5 right-2.5 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white border border-white/10">
                              {totalUnits} Units in Stock
                            </span>

                            {/* Photo Count Pill */}
                            <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/80 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono text-zinc-300 border border-white/10 flex items-center gap-1">
                              <ImageIcon className="h-3 w-3 text-[#d4af37]" />
                              {p.images?.length || 1} Photos
                            </span>

                            {/* Hidden from Store Overlay */}
                            {isHidden && (
                              <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center">
                                <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 text-[11px] font-bold flex items-center gap-1.5 shadow">
                                  <EyeOff className="h-3.5 w-3.5" /> Hidden from Store (Draft)
                                </span>
                                <p className="text-[10px] text-zinc-400 mt-1">Patrons cannot see or purchase this item</p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-zinc-400">{p.sku}</span>
                              <span className="text-[10px] font-semibold text-emerald-400">{p.discount}% Off</span>
                            </div>
                            <h4 className="font-serif text-base font-bold text-white line-clamp-1">{p.name}</h4>
                            <p className="text-xs text-zinc-400 line-clamp-2">{p.description}</p>
                          </div>

                          {/* Size Stock Badges */}
                          <div className="mt-4 pt-3 border-t border-white/10">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                              Stock by Size
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(p.stock).map(([size, count]) => (
                                <span
                                  key={size}
                                  className={`rounded-lg px-2 py-0.5 text-[10px] font-mono font-semibold ${count <= 2
                                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                      : "bg-white/5 text-zinc-300 border border-white/10"
                                    }`}
                                >
                                  {size}: {count}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                          <div>
                            <span className="font-serif text-lg font-bold text-white">{formatINR(p.price)}</span>
                            <span className="ml-2 text-xs text-zinc-500 line-through">{formatINR(p.mrp)}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/product/${p.slug}`}
                              target="_blank"
                              className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white transition"
                              title="View on Storefront"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>

                            {/* Visibility Toggle Button */}
                            <button
                              onClick={() => handleToggleProductVisibility(p)}
                              className={`rounded-lg border p-2 transition ${isHidden
                                  ? "border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/30"
                                  : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                                }`}
                              title={isHidden ? "Unhide and publish to store" : "Hide from customer storefront"}
                            >
                              {isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                            </button>

                            {/* Edit Shirt Button */}
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 px-2.5 py-1.5 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition"
                            >
                              Edit
                            </button>

                            {/* Delete Shirt Button */}
                            <button
                              onClick={() => handleOpenDeleteProduct(p)}
                              className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500 hover:text-white transition"
                              title="Delete shirt from catalog"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TAB 3: ORDERS ══════════════ */}
          {activeTab === "Orders" && (
            <div className="flex flex-col h-[calc(100vh-8.5rem)] space-y-4">
              {/* Search & Status Filter Bar (STICKY / FIXED AT TOP) */}
              <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#14171d]/95 p-4 backdrop-blur-xl shadow-xl">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search by order ID, patron, phone, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { name: "All", count: orderList.length },
                    { name: "Pending Verification", count: orderList.filter((o) => o.status === "Pending Verification").length },
                    { name: "Verified", count: orderList.filter((o) => o.status === "Verified").length },
                    { name: "Assigned to Courier", count: orderList.filter((o) => o.status === "Assigned to Courier").length },
                    { name: "Dispatched", count: orderList.filter((o) => o.status === "Dispatched").length },
                    { name: "Delivered", count: orderList.filter((o) => o.status === "Delivered").length },
                    { name: "Cancelled", count: orderList.filter((o) => o.status === "Cancelled").length },
                  ].map((st) => (
                    <button
                      key={st.name}
                      onClick={() => setOrderStatusFilter(st.name)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition shrink-0 ${orderStatusFilter === st.name
                        ? "bg-[#d4af37] text-black font-bold shadow-md shadow-[#d4af37]/20"
                        : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                        }`}
                    >
                      <span>{st.name}</span>
                      <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${orderStatusFilter === st.name ? "bg-black/20 text-black" : "bg-white/10 text-zinc-300"
                        }`}>
                        {st.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bulk Actions Floating Toolbar (When orders are selected) */}
              {selectedOrderIds.length > 0 && (
                <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d4af37]/40 bg-[#161a22] p-3.5 shadow-2xl animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d4af37] font-bold text-black text-xs">
                      {selectedOrderIds.length}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {selectedOrderIds.length} {selectedOrderIds.length === 1 ? "order" : "orders"} selected for action
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleBulkVerify}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition"
                      title="Approve all selected pending orders"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Verify & Approve</span>
                    </button>

                    <button
                      onClick={handleBulkAssignShiprocket}
                      className="flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-1.5 text-xs font-bold text-black hover:brightness-110 transition shadow"
                      title="Generate Shiprocket AWBs for all selected orders"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      <span>Assign Shiprocket</span>
                    </button>

                    <button
                      onClick={handleBulkCancel}
                      className="flex items-center gap-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500 hover:text-white transition"
                      title="Cancel selected undispatched orders"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      <span>Bulk Cancel</span>
                    </button>

                    <button
                      onClick={() => setSelectedOrderIds([])}
                      className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
                    >
                      Deselect
                    </button>
                  </div>
                </div>
              )}

              {/* Orders Detailed Table (SCROLLABLE CONTAINER) */}
              <div className="flex-1 rounded-2xl border border-white/10 bg-[#14171d] shadow-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto overflow-y-auto flex-1 admin-scroll">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-[#121418] border-b border-white/10 text-zinc-400 font-semibold tracking-wider uppercase text-[11px]">
                      <tr>
                        <th className="py-3.5 px-3 w-10">
                          <input
                            type="checkbox"
                            checked={
                              filteredOrders.length > 0 &&
                              filteredOrders.every((o) => selectedOrderIds.includes(o.id))
                            }
                            onChange={(e) => handleSelectAllOrders(e.target.checked)}
                            className="h-4 w-4 rounded accent-[#d4af37] cursor-pointer"
                            title="Select all visible orders"
                          />
                        </th>
                        <th className="py-3.5 px-3">Order Details</th>
                        <th className="py-3.5 px-3">Patron & Shipping</th>
                        <th className="py-3.5 px-3">Shirt Item</th>
                        <th className="py-3.5 px-3">Payment</th>
                        <th className="py-3.5 px-3">Logistics Status</th>
                        <th className="py-3.5 px-3 text-right">Fulfillment Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredOrders.map((ord) => {
                        const isSelected = selectedOrderIds.includes(ord.id)
                        return (
                          <tr
                            key={ord.id}
                            className={`transition ${isSelected ? "bg-[#d4af37]/5" : "hover:bg-white/[0.02]"
                              }`}
                          >
                            {/* Checkbox */}
                            <td className="py-3.5 px-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectOrder(ord.id)}
                                className="h-4 w-4 rounded accent-[#d4af37] cursor-pointer"
                              />
                            </td>

                            {/* Order & Date */}
                            <td className="py-3.5 px-3">
                              <button
                                onClick={() => setInspectOrderModal(ord)}
                                className="font-mono text-sm font-bold text-[#d4af37] hover:underline flex items-center gap-1"
                              >
                                {ord.id}
                              </button>
                              <p className="text-[11px] text-zinc-400 mt-0.5">{ord.date}</p>
                              <p className="font-mono text-xs font-semibold text-white mt-1.5">{formatINR(ord.total)}</p>
                            </td>

                            {/* Customer & Address */}
                            <td className="py-3.5 px-3 max-w-[220px]">
                              <p className="font-semibold text-white text-xs">{ord.customer}</p>
                              <p className="text-zinc-400 text-[11px]">{ord.phone}</p>
                              <p className="text-zinc-300 text-[11px] mt-1 line-clamp-1" title={ord.address}>
                                {ord.address}
                              </p>
                              <p className="text-zinc-400 text-[10px] flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 text-[#d4af37] shrink-0" />
                                <span>{ord.city} (PIN {ord.pincode})</span>
                              </p>
                            </td>

                            {/* Product Item with Thumbnail */}
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-black border border-white/10">
                                  <Image
                                    src={ord.image || "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg"}
                                    alt={ord.shirtName}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-white font-semibold text-xs truncate max-w-[170px]" title={ord.shirtName}>
                                    {ord.shirtName}
                                  </p>
                                  <p className="text-[10px] text-zinc-400 font-mono">{ord.sku}</p>
                                  <div className="mt-0.5 flex items-center gap-1.5">
                                    <span className="rounded bg-white/10 px-1.5 py-0.2 text-[9px] font-mono text-zinc-200">
                                      Size: {ord.size}
                                    </span>
                                    <span className="text-[9px] text-zinc-400">Qty: {ord.qty}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Payment */}
                            <td className="py-3.5 px-3">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${ord.paymentStatus === "Paid"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  }`}
                              >
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                {ord.paymentStatus}
                              </span>
                              <p className="text-[10px] text-zinc-400 mt-1">{ord.paymentMethod}</p>
                              <p className="text-[9px] font-mono text-zinc-500">{ord.paymentId}</p>
                            </td>

                            {/* Status & Logistics */}
                            <td className="py-3.5 px-3">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${ord.status === "Delivered"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : ord.status === "Assigned to Courier" || ord.status === "Dispatched"
                                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                    : ord.status === "Verified"
                                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                      : ord.status === "Cancelled"
                                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  }`}
                              >
                                {ord.status}
                              </span>

                              {ord.awb && (
                                <div className="mt-1.5 space-y-0.5">
                                  <p className="text-[10px] font-semibold text-zinc-300">{ord.courier}</p>
                                  <p className="text-[9px] font-mono text-[#d4af37]">AWB: {ord.awb}</p>
                                </div>
                              )}

                              {ord.cancelReason && (
                                <p className="text-[10px] text-rose-400 mt-1 line-clamp-1 italic">
                                  {ord.cancelReason}
                                </p>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Step 1: Admin Verification Button */}
                                {ord.status === "Pending Verification" && (
                                  <button
                                    onClick={() => handleVerifyOrder(ord.id)}
                                    className="rounded-lg bg-[#d4af37] px-2.5 py-1 text-[11px] font-bold text-black hover:brightness-110 shadow transition"
                                    title="Verify patron details and approve order"
                                  >
                                    Verify
                                  </button>
                                )}

                                {/* Step 2: Assign to Shiprocket Button */}
                                {(ord.status === "Verified" || ord.status === "Pending Verification") && (
                                  <button
                                    onClick={() => setAssignCourierModal(ord)}
                                    className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-500 shadow transition flex items-center gap-1"
                                    title="Assign Shiprocket Courier and generate AWB"
                                  >
                                    <Truck className="h-3 w-3" />
                                    <span>Ship</span>
                                  </button>
                                )}

                                {/* Cancellation button (allowed ONLY before courier handover) */}
                                {ord.status !== "Assigned to Courier" &&
                                  ord.status !== "Dispatched" &&
                                  ord.status !== "Delivered" &&
                                  ord.status !== "Cancelled" && (
                                    <button
                                      onClick={() => setCancelOrderModal(ord)}
                                      className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition"
                                      title="Cancel order before courier pickup"
                                    >
                                      Cancel
                                    </button>
                                  )}

                                {/* Tracking button if assigned */}
                                {ord.awb && (
                                  <button
                                    onClick={() => showToast(`Tracking AWB #${ord.awb} via Shiprocket API (In Transit)`)}
                                    className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-[11px] font-semibold text-blue-400 hover:bg-blue-500 hover:text-white transition"
                                    title="Track shipment"
                                  >
                                    Track
                                  </button>
                                )}

                                {/* Inspect Order Details */}
                                <button
                                  onClick={() => setInspectOrderModal(ord)}
                                  className="rounded-lg border border-white/10 bg-white/5 p-1 text-zinc-400 hover:text-white hover:bg-white/10 transition"
                                  title="View complete address and product items"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TAB 4: CUSTOMERS ══════════════ */}
          {activeTab === "Customers" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-[#14171d] shadow-xl overflow-hidden">
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-white">Patrons & VIP Loyalty Circle</h4>
                    <p className="text-xs text-zinc-400">Total {customerList.length} registered customers with reward point balances</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400 font-semibold tracking-wider uppercase text-[11px]">
                        <th className="py-4 px-4">Patron Name</th>
                        <th className="py-4 px-4">Contact Details</th>
                        <th className="py-4 px-4">Loyalty Tier</th>
                        <th className="py-4 px-4">Total Orders</th>
                        <th className="py-4 px-4">Lifetime Spend</th>
                        <th className="py-4 px-4">Reward Points</th>
                        <th className="py-4 px-4">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {customerList.map((c) => (
                        <tr key={c.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#d4af37] to-[#e6c86e] font-bold text-black text-xs">
                                {c.avatar}
                              </div>
                              <span className="font-semibold text-white text-sm">{c.name}</span>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <p className="text-white">{c.email}</p>
                            <p className="text-zinc-400 text-[11px]">{c.phone}</p>
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${c.tier === "Platinum"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : c.tier === "Gold"
                                  ? "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30"
                                  : "bg-zinc-500/20 text-zinc-300"
                                }`}
                            >
                              {c.tier} Member
                            </span>
                          </td>

                          <td className="py-4 px-4 font-mono font-bold text-white">{c.ordersCount} orders</td>
                          <td className="py-4 px-4 font-mono font-bold text-white">{formatINR(c.totalSpent)}</td>
                          <td className="py-4 px-4 font-mono text-[#d4af37] font-semibold">{c.points} pts</td>
                          <td className="py-4 px-4 text-zinc-400">{c.joined}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TAB 5: INVENTORY ══════════════ */}
          {activeTab === "Inventory" && (
            <div className="space-y-6">
              {/* Top Inventory KPI Valuation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-white/10 bg-[#14171d] p-5 shadow-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tracked Shirts</span>
                    <h4 className="font-serif text-2xl font-bold text-white mt-1">{productList.length} Styles</h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Active catalog SKUs</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-[#d4af37]">
                    <Package className="h-6 w-6" />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#14171d] p-5 shadow-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Stock</span>
                    <h4 className="font-serif text-2xl font-bold text-white mt-1">
                      {inventoryStats.totalUnits.toLocaleString("en-IN")} Pcs
                    </h4>
                    <p className="text-[11px] text-emerald-400 mt-0.5">Physical items ready to ship</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d4af37]/30 bg-[#14171d] p-5 shadow-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">Total Valuation</span>
                    <h4 className="font-serif text-2xl font-bold text-[#d4af37] mt-1">
                      {formatINR(inventoryStats.totalValuation)}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">At current selling prices</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37]">
                    <IndianRupee className="h-6 w-6" />
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-500/30 bg-[#14171d] p-5 shadow-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Stock Alerts</span>
                    <div className="flex items-center gap-2 mt-1">
                      <h4 className="font-serif text-2xl font-bold text-white">
                        {inventoryStats.lowStockItems + inventoryStats.outOfStockItems}
                      </h4>
                      <span className="text-[11px] text-zinc-400">
                        ({inventoryStats.lowStockItems} low, {inventoryStats.outOfStockItems} out)
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-400/80 mt-0.5">Restock recommended</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Main Inventory Card */}
              <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl space-y-6">
                {/* Search & Filter Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                      <span>Live Stock Management & Price Ledger</span>
                      <span className="rounded-full bg-[#d4af37]/20 border border-[#d4af37]/30 px-2.5 py-0.5 text-xs font-mono font-bold text-[#d4af37]">
                        {inventoryFilteredList.length} Shirts
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      View product photo, unit price, size-wise stock steppers, and total inventory value
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search Input */}
                    <div className="relative min-w-[220px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                      <input
                        type="text"
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        placeholder="Search by shirt name, SKU..."
                        className="w-full rounded-xl border border-white/10 bg-[#0d0f12] pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>

                    {/* Stock Filter Pills */}
                    <div className="inline-flex rounded-xl border border-white/10 bg-[#0d0f12] p-1 text-xs">
                      <button
                        onClick={() => setInventoryStockFilter("all")}
                        className={`rounded-lg px-3 py-1 font-semibold transition ${inventoryStockFilter === "all"
                            ? "bg-[#d4af37] text-black shadow font-bold"
                            : "text-zinc-400 hover:text-white"
                          }`}
                      >
                        All ({productList.length})
                      </button>
                      <button
                        onClick={() => setInventoryStockFilter("low")}
                        className={`rounded-lg px-3 py-1 font-semibold transition flex items-center gap-1 ${inventoryStockFilter === "low"
                            ? "bg-amber-500 text-black shadow font-bold"
                            : "text-zinc-400 hover:text-amber-400"
                          }`}
                      >
                        <span>Low Stock</span>
                        <span className="text-[10px] font-mono font-bold">({inventoryStats.lowStockItems})</span>
                      </button>
                      <button
                        onClick={() => setInventoryStockFilter("out")}
                        className={`rounded-lg px-3 py-1 font-semibold transition flex items-center gap-1 ${inventoryStockFilter === "out"
                            ? "bg-rose-500 text-white shadow font-bold"
                            : "text-zinc-400 hover:text-rose-400"
                          }`}
                      >
                        <span>Out of Stock</span>
                        <span className="text-[10px] font-mono font-bold">({inventoryStats.outOfStockItems})</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inventory Table with Photos, Prices & Size Steppers */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[960px]">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-400 font-semibold tracking-wider uppercase text-[11px]">
                        <th className="py-3 px-3">Product / Shirt</th>
                        <th className="py-3 px-3">Unit Price (₹)</th>
                        <th className="py-3 px-2 text-center">XS</th>
                        <th className="py-3 px-2 text-center">S</th>
                        <th className="py-3 px-2 text-center">M</th>
                        <th className="py-3 px-2 text-center">L</th>
                        <th className="py-3 px-2 text-center">XL</th>
                        <th className="py-3 px-2 text-center">XXL</th>
                        <th className="py-3 px-3 text-center">Total Stock</th>
                        <th className="py-3 px-3 text-right">Inventory Value</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {inventoryFilteredList.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="py-12 text-center text-zinc-500">
                            No shirts found matching your search or filter.
                          </td>
                        </tr>
                      ) : (
                        inventoryFilteredList.map((p) => {
                          const totalUnits = Object.values(p.stock || {}).reduce(
                            (a, b) => a + (Number(b) || 0),
                            0
                          )
                          const itemValuation = totalUnits * p.price
                          const isHidden = p.is_visible === false

                          return (
                            <tr
                              key={p.id}
                              className={`hover:bg-white/[0.02] transition group ${isHidden ? "opacity-75 bg-amber-500/[0.02]" : ""
                                }`}
                            >
                              {/* Product Photo & Details */}
                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-3">
                                  {/* Shirt Image Thumbnail */}
                                  <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0 group-hover:border-[#d4af37]/60 transition shadow">
                                    <Image
                                      src={p.images?.[0] || "/placeholder.jpg"}
                                      alt={p.name}
                                      fill
                                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {isHidden && (
                                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                        <EyeOff className="h-4 w-4 text-amber-400" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Name & Metadata */}
                                  <div className="min-w-0 max-w-[240px]">
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-semibold text-white truncate group-hover:text-[#d4af37] transition">
                                        {p.name}
                                      </h5>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                      <span className="font-mono text-[10px] text-zinc-400">{p.sku}</span>
                                      <span className="text-zinc-600">•</span>
                                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-zinc-300 border border-white/5">
                                        {p.category}
                                      </span>
                                      {isHidden && (
                                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/30">
                                          Draft
                                        </span>
                                      )}
                                    </div>
                                    {p.fabric && (
                                      <p className="text-[10px] text-zinc-500 truncate mt-0.5">{p.fabric}</p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Unit Price & MRP */}
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className="font-serif text-sm font-bold text-[#d4af37]">
                                    ₹{p.price.toLocaleString("en-IN")}
                                  </span>
                                  {p.mrp && p.mrp > p.price && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <span className="text-[10px] text-zinc-500 line-through">
                                        ₹{p.mrp.toLocaleString("en-IN")}
                                      </span>
                                      <span className="text-[9px] font-bold text-emerald-400">
                                        {Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Size Stock Steppers: XS to XXL */}
                              {(["XS", "S", "M", "L", "XL", "XXL"] as const).map((sz) => {
                                const qty = p.stock?.[sz] ?? 0
                                return (
                                  <td key={sz} className="py-3.5 px-1.5 text-center">
                                    <div className="inline-flex flex-col items-center">
                                      <span className="text-[9px] font-bold text-zinc-400 mb-0.5">{sz}</span>
                                      <div
                                        className={`inline-flex items-center rounded-lg border px-1 py-0.5 shadow-sm transition ${qty === 0
                                            ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                                            : qty < 5
                                              ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                                              : "border-white/10 bg-[#0d0f12] text-white"
                                          }`}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => handleStockAdjust(p.id, sz, -1)}
                                          disabled={qty <= 0}
                                          className="h-5 w-5 rounded flex items-center justify-center text-zinc-400 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed font-bold transition hover:bg-white/5"
                                          title={`Decrease ${sz} stock`}
                                        >
                                          -
                                        </button>
                                        <span className="font-mono text-xs font-bold w-5 text-center">
                                          {qty}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleStockAdjust(p.id, sz, 1)}
                                          className="h-5 w-5 rounded flex items-center justify-center text-zinc-400 hover:text-emerald-400 font-bold transition hover:bg-white/5"
                                          title={`Increase ${sz} stock`}
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                )
                              })}

                              {/* Total Units & Health Status */}
                              <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                <div className="inline-flex flex-col items-center">
                                  <span className="font-mono text-sm font-bold text-white">
                                    {totalUnits} <span className="text-[10px] text-zinc-400 font-normal">pcs</span>
                                  </span>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold mt-1 ${totalUnits === 0
                                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                        : totalUnits < 10
                                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                      }`}
                                  >
                                    {totalUnits === 0
                                      ? "Out of Stock"
                                      : totalUnits < 10
                                        ? "Low Stock"
                                        : "Healthy"}
                                  </span>
                                </div>
                              </td>

                              {/* Inventory Valuation */}
                              <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                <span className="font-mono font-bold text-[#d4af37] text-xs">
                                  ₹{itemValuation.toLocaleString("en-IN")}
                                </span>
                              </td>

                              {/* Quick Actions (Edit, Eye, Storefront link) */}
                              <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditProduct(p)}
                                    className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-300 hover:text-[#d4af37] hover:border-[#d4af37]/40 hover:bg-[#d4af37]/10 transition"
                                    title="Edit shirt & photos"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleProductVisibility(p)}
                                    className={`rounded-lg border p-1.5 transition ${isHidden
                                        ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                                        : "border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10"
                                      }`}
                                    title={isHidden ? "Unhide product on store" : "Hide product from store"}
                                  >
                                    {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                  </button>
                                  <Link
                                    href={`/product/${p.slug}`}
                                    target="_blank"
                                    className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition"
                                    title="Open product page in store"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TAB 6: COUPONS ══════════════ */}
          {activeTab === "Coupons" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {couponList.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-white/10 bg-[#14171d] p-5 shadow-xl space-y-4 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 px-3 py-1 font-mono text-sm font-bold text-[#d4af37]">
                        {c.code}
                      </span>
                      <span className="rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5">
                        Active
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-serif text-2xl font-bold text-white">{c.discount}</h4>
                      <p className="text-xs text-zinc-400">Min Order Requirement: {formatINR(c.minSpend)}</p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
                      <span>Used: {c.usedCount} / {c.maxUses} times</span>
                      <button
                        onClick={() => showToast(`Coupon ${c.code} is active and valid for customers.`)}
                        className="text-[#d4af37] font-semibold hover:underline"
                      >
                        Details &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════ TAB 7: SHIPROCKET & LOGISTICS ══════════════ */}
          {activeTab === "Shiprocket" && (
            <div className="space-y-6">
              {/* Integration Details Card */}
              <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-white">Shiprocket Direct Logistics</h4>
                    <p className="text-xs text-zinc-400">Live shipping calculation and automated courier assignment</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-400">
                    🟢 Connected: gayatripuri634@gmail.com
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Surat Atelier Warehouse</p>
                    <p className="font-semibold text-white text-xs mt-1">Ring Road Textile Market, Surat, Gujarat 395002</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Default Package Standard</p>
                    <p className="font-semibold text-white text-xs mt-1">0.35 kg • 30cm × 25cm × 4cm</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Partner Carriers</p>
                    <p className="font-semibold text-white text-xs mt-1">Delhivery Surface, BlueDart Air, DTDC</p>
                  </div>
                </div>
              </div>

              {/* Live Pincode Serviceability Tester */}
              <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl space-y-4">
                <h4 className="font-serif text-base font-bold text-white">Live PIN Code Serviceability Checker</h4>
                <form onSubmit={handlePincodeCheck} className="flex flex-col sm:flex-row gap-3 max-w-md">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit PIN code (e.g. 110001)"
                    value={checkPincode}
                    onChange={(e) => setCheckPincode(e.target.value)}
                    className="flex-1 rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#d4af37] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 transition"
                  >
                    Check PIN
                  </button>
                </form>

                {pincodeResult && (
                  <div className="mt-4 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 p-4 text-xs space-y-2">
                    <p className="font-bold text-white">
                      Destination: {pincodeResult.city} (PIN: {pincodeResult.pincode}) - Serviceable ✅
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-zinc-300">
                      <p><strong>Delhivery:</strong> {pincodeResult.delhivery}</p>
                      <p><strong>BlueDart:</strong> {pincodeResult.blueDart}</p>
                      <p><strong>DTDC:</strong> {pincodeResult.dtdc}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════ TAB 8: MARKETING & BANNERS ══════════════ */}
          {activeTab === "Marketing" && (
            <div className="space-y-6">
              {/* Studio Header Card */}
              <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 px-3 py-0.5 text-[10px] font-bold text-[#d4af37]">
                      <Sparkles className="h-3 w-3" /> Storefront Hero Studio
                    </span>
                    <span className="text-[11px] text-zinc-400">• {bannerList.length} Slides ({bannerList.filter(b => b.is_active !== false).length} Live)</span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-white mt-1">Homepage Hero Slider & Banners</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Customize high-resolution full-screen hero slides with tailored images for PC (Desktop 16:9) and Mobile Phones (Vertical 9:16).
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleOpenAddBanner}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New Slide</span>
                  </button>
                </div>
              </div>

              {/* Quick Preset Templates Bar */}
              <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5 mr-1">
                  <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
                  Quick Inspiration Templates:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenAddBanner()
                    setBannerKicker("Summer Atelier '26")
                    setBannerLine1("Woven")
                    setBannerLine2("by hand.")
                    setBannerCta("Shop linen")
                    setBannerDesktopImg("/assets/site_banners/slide1_desktop.jpg")
                    setMobileBannerImg("/assets/site_banners/slide1_mobile.jpg")
                    setBannerAlt("Ivory French linen shirt on an Aegean seaside stone terrace")
                    setBannerTone("light")
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300 hover:border-[#d4af37]/50 hover:text-white transition"
                >
                  + Summer Atelier (Ivory)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenAddBanner()
                    setBannerKicker("The Resort Edit")
                    setBannerLine1("Coastal")
                    setBannerLine2("state.")
                    setBannerCta("Shop resort")
                    setBannerDesktopImg("/assets/site_banners/slide2_desktop.jpg")
                    setMobileBannerImg("/assets/site_banners/slide2_mobile.jpg")
                    setBannerAlt("Sky-blue Cuban collar linen shirt in a coastal villa")
                    setBannerTone("light")
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300 hover:border-[#d4af37]/50 hover:text-white transition"
                >
                  + The Resort Edit (Blue)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenAddBanner()
                    setBannerKicker("New Arrivals")
                    setBannerLine1("Rust &")
                    setBannerLine2("ease.")
                    setBannerCta("Shop new in")
                    setBannerDesktopImg("/assets/banners/hero-terracotta-widescreen.jpg")
                    setMobileBannerImg("/assets/banners/hero-studio-mobile.jpg")
                    setBannerAlt("Terracotta embroidered linen shirt in sandstone courtyard")
                    setBannerTone("light")
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300 hover:border-[#d4af37]/50 hover:text-white transition"
                >
                  + Terracotta Studio (Rust)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenAddBanner()
                    setBannerKicker("After Dark")
                    setBannerLine1("Evening")
                    setBannerLine2("tailoring.")
                    setBannerCta("Shop evening")
                    setBannerDesktopImg("/assets/banners/hero-evening-desktop.jpg")
                    setMobileBannerImg("/assets/site_banners/slide3_mobile.jpg")
                    setBannerAlt("Navy embroidered linen shirt on an evening rooftop")
                    setBannerTone("light")
                  }}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300 hover:border-[#d4af37]/50 hover:text-white transition"
                >
                  + After Dark (Navy)
                </button>
              </div>

              {/* Banners List */}
              <div className="space-y-4">
                {bannerList.map((banner, index) => {
                  const isActive = banner.is_active !== false
                  return (
                    <div
                      key={banner.id || index}
                      className={`rounded-2xl border bg-[#14171d] p-5 shadow-xl transition space-y-4 ${
                        isActive ? "border-white/10 hover:border-[#d4af37]/40" : "border-white/5 opacity-75"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          {/* Slide index & Reorder Controls */}
                          <div className="flex items-center gap-1">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 font-mono text-xs font-bold text-[#d4af37]">
                              #{index + 1}
                            </span>
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                onClick={() => handleMoveBanner(index, "up")}
                                disabled={index === 0}
                                title="Move Slide Up"
                                className="flex h-4 w-5 items-center justify-center rounded bg-white/5 text-zinc-400 hover:bg-[#d4af37] hover:text-black disabled:opacity-30 disabled:pointer-events-none transition text-[9px]"
                              >
                                <ArrowUp className="h-2.5 w-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveBanner(index, "down")}
                                disabled={index === bannerList.length - 1}
                                title="Move Slide Down"
                                className="flex h-4 w-5 items-center justify-center rounded bg-white/5 text-zinc-400 hover:bg-[#d4af37] hover:text-black disabled:opacity-30 disabled:pointer-events-none transition text-[9px]"
                              >
                                <ArrowDown className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                                {banner.kicker || "Featured Slide"}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  isActive
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-white/10 text-zinc-400"
                                }`}
                              >
                                {isActive ? "● Live on Store" : "○ Draft / Paused"}
                              </span>
                            </div>
                            <h5 className="font-serif text-base font-bold text-white mt-0.5">
                              {Array.isArray(banner.lines) ? banner.lines.join(" ") : banner.lines || banner.title || "Hero Banner"}
                            </h5>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleBannerActive(banner.id)}
                            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                              isActive
                                ? "border-white/10 bg-white/5 text-zinc-300 hover:text-white"
                                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                          >
                            {isActive ? "Pause Slide" : "Make Live"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateBanner(banner)}
                            className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition flex items-center gap-1.5"
                            title="Duplicate this slide"
                          >
                            <Copy className="h-3 w-3" />
                            <span>Clone</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditBanner(banner)}
                            className="rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/15 px-3 py-1.5 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition flex items-center gap-1.5"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Edit Slide</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500 hover:text-white transition"
                            title="Delete banner"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Responsive Imagery Preview: Desktop (16:9) vs Phone Mockup (9:16) */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1 items-start">
                        {/* PC Desktop Image (16:9 ratio) */}
                        <div className="lg:col-span-7 space-y-2">
                          <div className="flex items-center justify-between text-xs text-zinc-400">
                            <span className="flex items-center gap-1.5 font-semibold text-white">
                              <Monitor className="h-3.5 w-3.5 text-[#d4af37]" />
                              Desktop (PC Widescreen 16:9)
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-zinc-400">1920 × 1080</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setZoomImageModal({
                                    url: banner.desktop || banner.image_desktop || "/assets/site_banners/slide1_desktop.jpg",
                                    title: `Desktop View: ${banner.kicker || "Hero Slide"}`,
                                    isMobile: false,
                                  })
                                }
                                className="text-[11px] text-[#d4af37] hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" /> Pura Dekho
                              </button>
                            </div>
                          </div>

                          {/* Desktop Browser Window Mockup */}
                          <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0d0f12] shadow-2xl">
                            <div className="bg-[#181b22] px-3 py-1.5 border-b border-white/10 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                              </div>
                              <div className="text-[10px] font-mono text-zinc-400 bg-black/50 rounded px-2.5 py-0.5 max-w-[240px] truncate border border-white/5">
                                gayatribhai.com{banner.link || "/shop"}
                              </div>
                              <div className="w-8" />
                            </div>
                            <div className="relative aspect-[16/9] w-full bg-black group">
                              <Image
                                src={banner.desktop || banner.image_desktop || "/assets/site_banners/slide1_desktop.jpg"}
                                alt={banner.kicker || "Desktop Slide"}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex items-end p-4">
                                <div className="text-white">
                                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37]">
                                    {banner.kicker}
                                  </p>
                                  <p className="font-serif text-base font-bold">
                                    {Array.isArray(banner.lines) ? banner.lines.join(" ") : banner.lines}
                                  </p>
                                  <span className="inline-block mt-2 rounded-full bg-white text-black px-3 py-0.5 text-[10px] font-bold shadow">
                                    {banner.cta || "Shop Linen"} →
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Mobile Phone Mockup (9:16 portrait ratio) */}
                        <div className="lg:col-span-5 space-y-2 flex flex-col items-center">
                          <div className="flex items-center justify-between text-xs text-zinc-400 w-full max-w-[210px]">
                            <span className="flex items-center gap-1.5 font-semibold text-white">
                              <Smartphone className="h-3.5 w-3.5 text-[#d4af37]" />
                              Mobile Phone (9:16)
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setZoomImageModal({
                                  url: banner.mobile || banner.image_mobile || "/assets/site_banners/slide1_mobile.jpg",
                                  title: `Mobile Phone View: ${banner.kicker || "Hero Slide"}`,
                                  isMobile: true,
                                })
                              }
                              className="text-[11px] text-[#d4af37] hover:underline flex items-center gap-1"
                              title="Inspect full uncropped mobile image"
                            >
                              <ExternalLink className="h-3 w-3" /> Pura Dikhe
                            </button>
                          </div>

                          {/* Authentic Luxury Smartphone Mockup */}
                          <div className="relative w-[170px] sm:w-[180px] aspect-[9/16] rounded-[34px] border-[5px] border-[#252831] bg-black shadow-2xl overflow-hidden ring-1 ring-white/10 group">
                            {/* Dynamic Island Pill Notch */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 h-3.5 w-16 rounded-full bg-black/95 flex items-center justify-between px-2 pointer-events-none ring-1 ring-white/10">
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/70" />
                            </div>

                            {/* Phone Top Status Bar */}
                            <div className="absolute top-1 inset-x-3 z-20 flex justify-between items-center text-[7.5px] text-white/80 font-mono pointer-events-none">
                              <span>9:41</span>
                              <span>●● 100%</span>
                            </div>

                            {/* Mobile Image */}
                            <Image
                              src={banner.mobile || banner.image_mobile || "/assets/site_banners/slide1_mobile.jpg"}
                              alt={banner.kicker || "Mobile Slide"}
                              fill
                              className="object-cover transition duration-300 group-hover:scale-105"
                            />

                            {/* Storefront Mobile Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-3 pointer-events-none">
                              <div className="text-white space-y-0.5">
                                <p className="text-[8px] uppercase tracking-wider font-bold text-[#d4af37]">
                                  {banner.kicker}
                                </p>
                                <p className="font-serif text-[11px] font-bold leading-tight line-clamp-2">
                                  {Array.isArray(banner.lines) ? banner.lines.join(" ") : banner.lines}
                                </p>
                                <span className="inline-block rounded-full bg-white text-black px-2.5 py-0.5 text-[8px] font-bold mt-1 shadow">
                                  {banner.cta || "Shop"} →
                                </span>
                              </div>
                            </div>

                            {/* Bottom Home Indicator Bar */}
                            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 h-1 w-12 rounded-full bg-white/50 pointer-events-none" />

                            {/* Hover Overlay: Zoom / Pura Dikhe */}
                            <button
                              type="button"
                              onClick={() =>
                                setZoomImageModal({
                                  url: banner.mobile || banner.image_mobile || "/assets/site_banners/slide1_mobile.jpg",
                                  title: `Mobile Phone View: ${banner.kicker || "Hero Slide"}`,
                                  isMobile: true,
                                })
                              }
                              className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-semibold backdrop-blur-xs cursor-pointer z-40"
                            >
                              <Eye className="h-5 w-5 text-[#d4af37]" />
                              <span>Pura Dikhe (Zoom)</span>
                              <span className="text-[9px] text-zinc-300 font-normal">Click for Full Photo</span>
                            </button>
                          </div>

                          <span className="font-mono text-[9px] text-zinc-400">768 × 1376 Vertical Full-Bleed</span>
                        </div>
                      </div>

                      {/* Footer Info Strip */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10 text-xs text-zinc-400">
                        <div className="flex flex-wrap items-center gap-3">
                          <span>Button: <strong className="text-white">{banner.cta || "Shop Linen"}</strong></span>
                          <span>•</span>
                          <span>Target Link: <code className="text-[#d4af37] font-mono">{banner.link || "/shop"}</code></span>
                          {banner.alt && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3 text-[#d4af37]" />
                                Alt: <em className="text-zinc-300 italic truncate max-w-[200px]">"{banner.alt}"</em>
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-[#d4af37]">
                            SEO {banner.seo_heading || "H1"}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            Tone: <strong className="text-zinc-200 capitalize">{banner.tone || "light"}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ══════════════ TAB 9: BLOG CMS & EDITORIAL JOURNAL STUDIO ══════════════ */}
          {activeTab === "Blog CMS" && (
            <div className="space-y-6">
              {/* Studio Header Card */}
              <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 px-3 py-0.5 text-[10px] font-bold text-[#d4af37]">
                      <Sparkles className="h-3 w-3" /> Editorial CMS & SEO Studio
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      • {blogList.filter((b) => b.is_published !== false).length} Live on Store
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-white mt-1">
                    Atelier Journal Articles & SEO Content Manager
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5 max-w-2xl">
                    Publish new stories, edit craft essays, hide/unhide articles, manage Google SERP snippet previews, focus keywords, and social share OpenGraph metadata.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/blog"
                    target="_blank"
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Live Journal</span>
                  </Link>
                  <button
                    onClick={handleOpenAddBlog}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Write New Article</span>
                  </button>
                </div>
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-white/10 bg-[#14171d] p-4">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span>Total Essays</span>
                    <BookOpen className="h-4 w-4 text-[#d4af37]" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-serif text-white mt-1">{blogList.length}</p>
                  <span className="text-[10px] text-zinc-400">In atelier database</span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#14171d] p-4">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span>Published (Live)</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-serif text-emerald-400 mt-1">
                    {blogList.filter((b) => b.is_published !== false).length}
                  </p>
                  <span className="text-[10px] text-emerald-400/80">Visible to search & patrons</span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#14171d] p-4">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span>Drafts / Hidden</span>
                    <EyeOff className="h-4 w-4 text-amber-400" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-serif text-amber-400 mt-1">
                    {blogList.filter((b) => b.is_published === false).length}
                  </p>
                  <span className="text-[10px] text-zinc-400">Hidden from storefront</span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#14171d] p-4">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span>Total Read Views</span>
                    <TrendingUp className="h-4 w-4 text-cyan-400" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-serif text-white mt-1">
                    {blogList.reduce((acc, b) => acc + (b.views_count || 350), 0).toLocaleString()}
                  </p>
                  <span className="text-[10px] text-zinc-400">Patron readership</span>
                </div>
              </div>

              {/* Search, Category & Status Filter Bar */}
              <div className="rounded-2xl border border-white/10 bg-[#14171d] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={blogSearchQuery}
                    onChange={(e) => setBlogSearchQuery(e.target.value)}
                    placeholder="Search articles by title, keywords, tag, author..."
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
                  />
                  {blogSearchQuery && (
                    <button
                      onClick={() => setBlogSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Dropdown */}
                  <select
                    value={blogCategoryFilter}
                    onChange={(e) => setBlogCategoryFilter(e.target.value)}
                    className="rounded-xl border border-white/10 bg-[#0d0f12] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Fabric Science">Fabric Science</option>
                    <option value="Style Guides">Style Guides</option>
                    <option value="Craft & Atelier">Craft & Atelier</option>
                    <option value="Resort Life">Resort Life</option>
                  </select>

                  {/* Status Pills */}
                  <div className="flex rounded-xl border border-white/10 bg-[#0d0f12] p-1">
                    {(["All", "Published", "Draft"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setBlogStatusFilter(status)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          blogStatusFilter === status
                            ? "bg-[#d4af37] text-black font-bold shadow"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {status === "All" ? "All" : status === "Published" ? "Live" : "Drafts"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Articles List */}
              {filteredBlogs.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[#14171d] p-12 text-center space-y-4">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-zinc-400">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="font-serif text-lg font-bold text-white">No Blog Articles Found</h5>
                    <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                      No journal essays match your search or filter criteria. Clear filters or create a new article to get started.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddBlog}
                    className="rounded-xl bg-[#d4af37] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 transition"
                  >
                    Write First Article
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredBlogs.map((blog, index) => {
                    const isPublished = blog.is_published !== false
                    const hasSeo = Boolean(blog.seo?.metaTitle && blog.seo?.metaDescription)
                    return (
                      <div
                        key={blog.id || index}
                        className={`rounded-2xl border bg-[#14171d] p-5 shadow-xl transition space-y-4 ${
                          isPublished
                            ? "border-white/10 hover:border-[#d4af37]/40"
                            : "border-amber-500/20 bg-[#14171d]/80 opacity-80"
                        }`}
                      >
                        {/* Top Row: Meta & Actions */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
                          <div className="flex items-start sm:items-center gap-3">
                            <div className="relative h-16 w-24 sm:h-20 sm:w-32 rounded-xl overflow-hidden border border-white/10 bg-black shrink-0">
                              <Image
                                src={blog.coverImage || "/assets/site_banners/slide1_desktop.jpg"}
                                alt={blog.title}
                                fill
                                className="object-cover"
                              />
                              {blog.featured && (
                                <span className="absolute top-1.5 left-1.5 rounded-full bg-[#d4af37] text-black px-1.5 py-0.5 text-[8px] font-extrabold uppercase">
                                  Featured
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#d4af37]">
                                  {blog.category || "Craft & Atelier"}
                                </span>
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                    isPublished
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  }`}
                                >
                                  {isPublished ? "● Live on Store" : "○ Draft / Hidden"}
                                </span>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[9px] font-mono ${
                                    hasSeo
                                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                      : "bg-zinc-800 text-zinc-400"
                                  }`}
                                >
                                  {hasSeo ? "✓ SEO Ready" : "SEO Basic"}
                                </span>
                              </div>

                              <h5 className="font-serif text-base font-bold text-white mt-1 line-clamp-1 hover:text-[#d4af37] transition">
                                {blog.title}
                              </h5>
                              <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                                {blog.subtitle || blog.excerpt}
                              </p>

                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 mt-1">
                                <span>By <strong className="text-zinc-300">{blog.author?.name || "Gayatri Puri"}</strong></span>
                                <span>•</span>
                                <span>{blog.date}</span>
                                <span>•</span>
                                <span>{blog.readTime || "5 min read"}</span>
                                <span>•</span>
                                <span className="font-mono text-zinc-400">/blog/{blog.slug}</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-center">
                            {/* Live View Button */}
                            <Link
                              href={`/blog/${blog.slug}`}
                              target="_blank"
                              className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition"
                              title="Preview article on live storefront"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>

                            {/* Visibility Toggle Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleBlogPublish(blog.id)}
                              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                                isPublished
                                  ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              }`}
                              title={isPublished ? "Hide from customer view" : "Publish live to journal"}
                            >
                              {isPublished ? (
                                <>
                                  <EyeOff className="h-3.5 w-3.5" />
                                  <span>Hide / Draft</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>Make Live</span>
                                </>
                              )}
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditBlog(blog)}
                              className="flex items-center gap-1.5 rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/15 px-3 py-1.5 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>Edit Article</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteBlog(blog)}
                              className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500 hover:text-white transition"
                              title="Delete article"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Article SEO & Tags Snapshot */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1 text-zinc-400">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                              Google Search Meta Title
                            </span>
                            <p className="text-xs font-medium text-zinc-200 truncate">
                              {blog.seo?.metaTitle || `${blog.title} | Gayatri Bhai Journal`}
                            </p>
                            <p className="text-[11px] text-zinc-400 line-clamp-1">
                              {blog.seo?.metaDescription || blog.excerpt}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                              Focus Keywords & Topics
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {Array.isArray(blog.seo?.keywords) && blog.seo.keywords.length > 0 ? (
                                blog.seo.keywords.slice(0, 4).map((kw, i) => (
                                  <span
                                    key={i}
                                    className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-zinc-300"
                                  >
                                    #{kw}
                                  </span>
                                ))
                              ) : Array.isArray(blog.tags) && blog.tags.length > 0 ? (
                                blog.tags.slice(0, 4).map((tag, i) => (
                                  <span
                                    key={i}
                                    className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-zinc-300"
                                  >
                                    #{tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[11px] text-zinc-400 italic">No focus keywords set</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ TAB 10: SETTINGS & GLOBAL SEO STUDIO ══════════════ */}
          {activeTab === "Settings" && (
            <div className="space-y-8 max-w-4xl">
              {/* Store Identity Card */}
              <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl space-y-6">
                <div>
                  <h4 className="font-serif text-lg font-bold text-white">Store Identity & Live Credentials</h4>
                  <p className="text-xs text-zinc-400">Verified e-commerce platform configuration</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-zinc-400 mb-1">Brand Name</label>
                    <input
                      type="text"
                      disabled
                      value="Gayatri Bhai Atelier (AVYR)"
                      className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-400 mb-1">Owner Email & Admin Account</label>
                    <input
                      type="text"
                      disabled
                      value="gayatripuri634@gmail.com"
                      className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-400 mb-1">Razorpay Live Key ID</label>
                    <input
                      type="text"
                      disabled
                      value="rzp_live_Tl6lD0OL5uKch9"
                      className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-400 mb-1">Supabase Database URL</label>
                    <input
                      type="text"
                      disabled
                      value="https://qnhtnbzeyqbrzjguhgsy.supabase.co"
                      className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 🌟 PAGE-LEVEL SEO & SEARCH ENGINE CONFIGURATION */}
              <div className="rounded-2xl border border-[#d4af37]/30 bg-[#14171d] p-6 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 px-3 py-0.5 text-[10px] font-bold text-[#d4af37]">
                        <Globe className="h-3 w-3" /> Search Engine Optimization
                      </span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-white mt-1">
                      Global & Page-Level SEO Manager
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Configure meta titles, meta descriptions, and search keywords for Homepage, Shop, and Blog pages.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveSeoSettings}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition shrink-0"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Save All SEO Settings</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Homepage SEO */}
                  <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">
                        1. Homepage SEO (/)
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">Primary Domain Landing</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">Homepage Meta Title</label>
                        <input
                          type="text"
                          value={siteSeoSettings.home.metaTitle}
                          onChange={(e) =>
                            setSiteSeoSettings((prev) => ({
                              ...prev,
                              home: { ...prev.home, metaTitle: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">Homepage Meta Description</label>
                        <textarea
                          rows={2}
                          value={siteSeoSettings.home.metaDescription}
                          onChange={(e) =>
                            setSiteSeoSettings((prev) => ({
                              ...prev,
                              home: { ...prev.home, metaDescription: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">Focus Keywords (Comma-separated)</label>
                        <input
                          type="text"
                          value={siteSeoSettings.home.keywords}
                          onChange={(e) =>
                            setSiteSeoSettings((prev) => ({
                              ...prev,
                              home: { ...prev.home, keywords: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shop Page SEO */}
                  <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">
                        2. Shop & Catalog SEO (/shop)
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">Products Listing Page</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">Shop Meta Title</label>
                        <input
                          type="text"
                          value={siteSeoSettings.shop.metaTitle}
                          onChange={(e) =>
                            setSiteSeoSettings((prev) => ({
                              ...prev,
                              shop: { ...prev.shop, metaTitle: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">Shop Meta Description</label>
                        <textarea
                          rows={2}
                          value={siteSeoSettings.shop.metaDescription}
                          onChange={(e) =>
                            setSiteSeoSettings((prev) => ({
                              ...prev,
                              shop: { ...prev.shop, metaDescription: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">Shop Focus Keywords</label>
                        <input
                          type="text"
                          value={siteSeoSettings.shop.keywords}
                          onChange={(e) =>
                            setSiteSeoSettings((prev) => ({
                              ...prev,
                              shop: { ...prev.shop, keywords: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Blog Page SEO */}
                  <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">
                        3. Editorial Blog & Journal SEO (/blog)
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">Content Marketing Hub</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">Blog Hub Meta Title</label>
                        <input
                          type="text"
                          value={siteSeoSettings.blog.metaTitle}
                          onChange={(e) =>
                            setSiteSeoSettings((prev) => ({
                              ...prev,
                              blog: { ...prev.blog, metaTitle: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">Blog Hub Meta Description</label>
                        <textarea
                          rows={2}
                          value={siteSeoSettings.blog.metaDescription}
                          onChange={(e) =>
                            setSiteSeoSettings((prev) => ({
                              ...prev,
                              blog: { ...prev.blog, metaDescription: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">Blog Hub Focus Keywords</label>
                        <input
                          type="text"
                          value={siteSeoSettings.blog.keywords}
                          onChange={(e) =>
                            setSiteSeoSettings((prev) => ({
                              ...prev,
                              blog: { ...prev.blog, keywords: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveSeoSettings}
                    className="rounded-xl bg-[#d4af37] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 transition shadow-lg"
                  >
                    Save All SEO Configurations
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── MODAL: ADD NEW SHIRT (COMPREHENSIVE STUDIO ATELIER) ── */}
      {showAddShirtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#14171d] shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-white/10 shrink-0">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 px-3 py-0.5 text-[10px] font-bold text-[#d4af37]">
                  <Sparkles className="h-3 w-3" /> Haute Craftsmanship Studio
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1.5">
                  Craft & List New Handcrafted Shirt
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Upload photography, define artisan embroidery details, and allocate size inventory.
                </p>
              </div>
              <button
                onClick={() => setShowAddShirtModal(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleAddShirtSubmit} className="flex-1 overflow-y-auto admin-scroll p-5 sm:p-6 space-y-6 text-xs">
              {/* ── SECTION 1: PHOTOGRAPHY & IMAGERY ── */}
              <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-[#d4af37]" />
                      Garment Photography ({newShirtImages.length} Photos Selected)
                    </h4>
                    <p className="text-[11px] text-zinc-400">Photo #1 will be showcased as the storefront cover.</p>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
                    High-Res Ready
                  </span>
                </div>

                {/* Selected Images Preview Grid */}
                {newShirtImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {newShirtImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-white/15 bg-black"
                      >
                        <Image src={imgUrl} alt={`Shirt Photo ${idx + 1}`} fill className="object-cover" />
                        <span className="absolute top-2 left-2 rounded-full bg-black/80 px-2 py-0.5 text-[9px] font-bold text-[#d4af37] border border-white/10">
                          {idx === 0 ? "★ Main Cover" : `Angle #${idx + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-2 right-2 rounded-lg bg-rose-600/90 p-1 text-white opacity-0 group-hover:opacity-100 transition shadow"
                          title="Remove photo"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/20 p-6 text-center text-zinc-400">
                    <p>No photos added yet. Upload from device or choose from the studio library below.</p>
                  </div>
                )}

                {/* Photo Add Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                  {/* File Upload from Device */}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                      Upload from Computer / Phone
                    </label>
                    <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#d4af37]/40 bg-[#d4af37]/10 p-3 text-xs font-semibold text-[#d4af37] hover:bg-[#d4af37]/20 cursor-pointer transition">
                      <Upload className="h-4 w-4" />
                      <span>Choose Photos (JPG, PNG, WebP)</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Add Image via URL */}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                      Or Add via Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://... or /assets/..."
                        value={newShirtCustomImageUrl}
                        onChange={(e) => setNewShirtCustomImageUrl(e.target.value)}
                        className="flex-1 rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="rounded-xl border border-white/10 bg-white/10 px-3.5 py-2 font-semibold text-zinc-200 hover:bg-white/20 hover:text-white"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Atelier Preset Studio Library */}
                <div className="pt-2 border-t border-white/10">
                  <p className="text-[11px] font-semibold text-zinc-400 mb-2">
                    Studio Library (Click to toggle atelier shoot assets):
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1 admin-scroll">
                    {ATELIER_PRESET_IMAGES.map((preset) => {
                      const isSelected = newShirtImages.includes(preset.url)
                      return (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => handleTogglePresetImage(preset.url)}
                          className={`flex items-center gap-2 rounded-xl p-1.5 pr-3 border text-[11px] font-medium shrink-0 transition ${isSelected
                              ? "border-[#d4af37] bg-[#d4af37]/20 text-white font-semibold"
                              : "border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-white/20"
                            }`}
                        >
                          <div className="relative h-7 w-7 rounded-lg overflow-hidden shrink-0 border border-white/10">
                            <Image src={preset.url} alt={preset.label} fill className="object-cover" />
                          </div>
                          <span>{preset.label}</span>
                          {isSelected && <span className="text-[#d4af37] font-bold">✓</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* ── SECTION 2: GARMENT IDENTITY & DETAILS ── */}
              <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-4 space-y-4">
                <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#d4af37]" />
                  Garment Specifications
                </h4>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Shirt Name <span className="text-[#d4af37]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Azure Kantha Silk Linen Shirt"
                    value={newShirtName}
                    onChange={(e) => setNewShirtName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#14171d] px-4 py-2.5 text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none text-sm font-medium"
                  />
                  {newShirtName && (
                    <p className="mt-1 text-[10px] text-zinc-400 font-mono">
                      Live URL: /product/{newShirtName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-400 mb-1">Category</label>
                    <select
                      value={newShirtCategory}
                      onChange={(e) => setNewShirtCategory(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                    >
                      <option value="Contemporary">Contemporary</option>
                      <option value="BeachSide">BeachSide</option>
                      <option value="Floral">Floral</option>
                      <option value="Nature">Nature</option>
                      <option value="Classic">Classic</option>
                      <option value="Festive">Festive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-400 mb-1">Collection Badge</label>
                    <select
                      value={newShirtBadge}
                      onChange={(e) => setNewShirtBadge(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                    >
                      <option value="New">New Arrival</option>
                      <option value="Bestseller">Bestseller</option>
                      <option value="Signature">Signature Edition</option>
                      <option value="Limited Edition">Limited Edition</option>
                      <option value="Festive Edit">Festive Edit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-400 mb-1">SKU Code</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newShirtSKU}
                        onChange={(e) => setNewShirtSKU(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white font-mono text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => setNewShirtSKU(`M26/SS/ART/${Math.floor(10 + Math.random() * 89)}`)}
                        className="rounded-xl border border-white/10 bg-white/5 px-2.5 text-zinc-400 hover:text-white"
                        title="Randomize SKU"
                      >
                        ⚡
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-400 mb-1">Primary Color</label>
                    <input
                      type="text"
                      placeholder="e.g. Sky Blue, Ivory, Rust"
                      value={newShirtColor}
                      onChange={(e) => setNewShirtColor(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-400 mb-1">Fabric & Thread</label>
                    <input
                      type="text"
                      placeholder="e.g. 100% French Linen"
                      value={newShirtFabric}
                      onChange={(e) => setNewShirtFabric(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-400 mb-1">Occasion / Styling</label>
                    <input
                      type="text"
                      placeholder="e.g. Resort wear, evening dinners"
                      value={newShirtOccasion}
                      onChange={(e) => setNewShirtOccasion(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">
                    Artisanal Story & Hand-Embroidery Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the single-needle motifs, Cuban collar, pick stitching, and natural wooden buttons..."
                    value={newShirtDescription}
                    onChange={(e) => setNewShirtDescription(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#14171d] p-3 text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none leading-relaxed text-xs"
                  />
                </div>
              </div>

              {/* ── SECTION 3: PRICING & DISCOUNTS ── */}
              <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-4 space-y-3">
                <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-[#d4af37]" />
                  Pricing & Commercial Value
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div>
                    <label className="block font-semibold text-zinc-400 mb-1">
                      Selling Price (₹) <span className="text-[#d4af37]">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={newShirtPrice}
                      onChange={(e) => setNewShirtPrice(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white font-mono text-sm font-bold focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-400 mb-1">
                      Original MRP Price (₹)
                    </label>
                    <input
                      type="number"
                      min={100}
                      value={newShirtMRP}
                      onChange={(e) => setNewShirtMRP(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white font-mono text-sm focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  <div className="pt-4 sm:pt-0">
                    <span className="block text-[11px] font-semibold text-zinc-400 mb-1">Patron Discount</span>
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-center">
                      <span className="text-sm font-bold text-emerald-400 font-mono">
                        {Number(newShirtMRP) > Number(newShirtPrice)
                          ? `${Math.round(((Number(newShirtMRP) - Number(newShirtPrice)) / Number(newShirtMRP)) * 100)}% Off`
                          : "Regular MRP"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION: PACKAGE WEIGHT & DIMENSIONS (AMAZON / SHIPROCKET LOGISTICS) ── */}
              <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                      <Truck className="h-4 w-4 text-[#d4af37]" />
                      Package Weight & Shipping Dimensions
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Amazon & Shiprocket courier standard: shipping rates calculate from Dead Weight vs Volumetric Weight
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#d4af37]">
                      Divisor: 5000
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1 text-xs">
                      Weight (kg) <span className="text-[#d4af37]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0.05"
                        required
                        value={newShirtWeight}
                        onChange={(e) => setNewShirtWeight(e.target.value)}
                        placeholder="0.35"
                        className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white font-mono text-xs focus:border-[#d4af37] focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">kg</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      = {(Number(newShirtWeight || 0) * 1000).toFixed(0)} grams
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1 text-xs">
                      Length (L in cm) <span className="text-[#d4af37]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        required
                        value={newShirtLength}
                        onChange={(e) => setNewShirtLength(e.target.value)}
                        placeholder="30"
                        className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white font-mono text-xs focus:border-[#d4af37] focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">cm</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 block">Garment fold length</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1 text-xs">
                      Breadth / Width (B in cm) <span className="text-[#d4af37]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        required
                        value={newShirtBreadth}
                        onChange={(e) => setNewShirtBreadth(e.target.value)}
                        placeholder="25"
                        className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white font-mono text-xs focus:border-[#d4af37] focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">cm</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 block">Box / satchel width</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1 text-xs">
                      Height (H in cm) <span className="text-[#d4af37]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        required
                        value={newShirtHeight}
                        onChange={(e) => setNewShirtHeight(e.target.value)}
                        placeholder="4"
                        className="w-full rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-white font-mono text-xs focus:border-[#d4af37] focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">cm</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 block">Folded box thickness</span>
                  </div>
                </div>

                {/* Volumetric vs Dead Weight Comparison Box */}
                <div className="rounded-xl border border-white/5 bg-[#14171d] p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Dead Weight:</span>
                      <p className="font-mono font-bold text-white">{Number(newShirtWeight || 0).toFixed(2)} kg</p>
                    </div>
                    <span className="text-zinc-600">vs</span>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Volumetric Weight:</span>
                      <p className="font-mono font-bold text-[#d4af37]">
                        {((Number(newShirtLength || 30) * Number(newShirtBreadth || 25) * Number(newShirtHeight || 4)) / 5000).toFixed(2)} kg
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-right">
                    <span className="text-[10px] font-bold uppercase text-emerald-400">Billable Courier Weight</span>
                    <p className="font-mono font-bold text-white text-sm">
                      {Math.max(
                        Number(newShirtWeight || 0.35),
                        (Number(newShirtLength || 30) * Number(newShirtBreadth || 25) * Number(newShirtHeight || 4)) / 5000
                      ).toFixed(2)} kg
                    </p>
                  </div>
                </div>
              </div>

              {/* ── SECTION 4: SIZE MATRIX & STOCK ALLOCATION ── */}
              <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                      <Package className="h-4 w-4 text-[#d4af37]" />
                      Warehouse Ready Stock by Size
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Total Inventory: <strong className="text-white">{Object.values(newShirtStock).reduce((a, b) => a + (Number(b) || 0), 0)} Units</strong> ready to ship.
                    </p>
                  </div>

                  {/* Quick Fill Toolbar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-400">Quick set:</span>
                    <input
                      type="number"
                      min={0}
                      value={quickStockValue}
                      onChange={(e) => setQuickStockValue(e.target.value)}
                      className="w-16 rounded-lg border border-white/10 bg-[#14171d] px-2 py-1 text-center text-white font-mono text-xs focus:border-[#d4af37] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyQuickStock}
                      className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 font-semibold text-zinc-200 hover:bg-white/20 hover:text-white"
                    >
                      Fill All
                    </button>
                  </div>
                </div>

                {/* 7 Size Inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                  {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((sz) => {
                    const currentVal = newShirtStock[sz] ?? 0
                    return (
                      <div
                        key={sz}
                        className="rounded-xl border border-white/10 bg-[#14171d] p-3 text-center space-y-2 hover:border-[#d4af37]/40 transition"
                      >
                        <span className="text-xs font-mono font-bold text-[#d4af37] block">{sz}</span>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStockChange(sz, currentVal - 1)}
                            className="h-6 w-6 rounded-md bg-white/5 text-zinc-300 hover:bg-white/15 hover:text-white font-bold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={currentVal}
                            onChange={(e) => handleStockChange(sz, parseInt(e.target.value, 10) || 0)}
                            className="w-12 rounded-md border border-white/10 bg-[#0d0f12] py-1 text-center text-white font-mono text-xs focus:border-[#d4af37] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleStockChange(sz, currentVal + 1)}
                            className="h-6 w-6 rounded-md bg-white/5 text-zinc-300 hover:bg-white/15 hover:text-white font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddShirtModal(false)}
                  className="rounded-xl border border-white/10 px-5 py-2.5 font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-6 py-2.5 font-bold uppercase tracking-wider text-black shadow-lg shadow-[#d4af37]/25 hover:brightness-110 active:scale-95 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Publish Shirt to Store</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD COUPON ── */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-serif text-lg font-bold text-white">Create New Coupon</h3>
              <button
                onClick={() => setShowAddCouponModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCouponSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2 text-white uppercase font-mono focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Discount %</label>
                <input
                  type="number"
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Min Spend (₹)</label>
                <input
                  type="number"
                  value={newCouponMinSpend}
                  onChange={(e) => setNewCouponMinSpend(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddCouponModal(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#d4af37] px-5 py-2 font-bold uppercase tracking-wider text-black hover:brightness-110"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: INSPECT FULL ORDER DETAILS ── */}
      {inspectOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-serif text-xl font-bold text-white">Order #{inspectOrderModal.id}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${inspectOrderModal.status === "Delivered"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : inspectOrderModal.status === "Assigned to Courier" || inspectOrderModal.status === "Dispatched"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : inspectOrderModal.status === "Verified"
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : inspectOrderModal.status === "Cancelled"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                  >
                    {inspectOrderModal.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">Placed on {inspectOrderModal.date} • Luxury Micro-Batch Fulfillment</p>
              </div>
              <button
                onClick={() => setInspectOrderModal(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer & Complete Shipping Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Patron Details</p>
                <p className="text-sm font-bold text-white">{inspectOrderModal.customer}</p>
                <p className="text-xs text-zinc-300 flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-[#d4af37]" />
                  <a href={`tel:${inspectOrderModal.phone}`} className="hover:underline">{inspectOrderModal.phone}</a>
                </p>
                <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-zinc-400" />
                  <a href={`mailto:${inspectOrderModal.email}`} className="hover:underline">{inspectOrderModal.email}</a>
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Delivery Address</p>
                <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                  {inspectOrderModal.address}
                </p>
                <p className="text-xs text-white font-semibold flex items-center gap-1.5 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-[#d4af37]" />
                  {inspectOrderModal.city} — PIN {inspectOrderModal.pincode}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Shiprocket Serviceable PIN
                </span>
              </div>
            </div>

            {/* Product Items Breakdown */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Ordered Shirt Item</p>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-black border border-white/10">
                    <Image
                      src={inspectOrderModal.image || "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg"}
                      alt={inspectOrderModal.shirtName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-serif text-sm font-bold text-white">{inspectOrderModal.shirtName}</p>
                    <p className="text-[10px] font-mono text-zinc-400">SKU: {inspectOrderModal.sku}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-200">
                        Size: {inspectOrderModal.size}
                      </span>
                      <span className="text-[10px] text-zinc-400">Qty: {inspectOrderModal.qty}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-serif text-base font-bold text-white">{formatINR(inspectOrderModal.total)}</p>
                  <p className="text-[10px] text-zinc-400">{inspectOrderModal.qty} × {formatINR(inspectOrderModal.price)}</p>
                </div>
              </div>
            </div>

            {/* Payment & Shiprocket Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Payment Information</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300">{inspectOrderModal.paymentMethod}</span>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    {inspectOrderModal.paymentStatus}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-zinc-500 mt-1">ID: {inspectOrderModal.paymentId}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Shiprocket Logistics</p>
                {inspectOrderModal.awb ? (
                  <div>
                    <p className="text-xs font-bold text-white">{inspectOrderModal.courier}</p>
                    <p className="text-[10px] font-mono text-[#d4af37]">AWB: {inspectOrderModal.awb}</p>
                    <p className="text-[10px] text-emerald-400 font-semibold mt-1">Pickup Scheduled & Tracking Active</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      No Courier Assigned Yet
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      {inspectOrderModal.status === "Pending Verification"
                        ? "Requires Admin verification before shipping."
                        : "Verified & ready to assign courier."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                {inspectOrderModal.status === "Pending Verification" && (
                  <button
                    onClick={() => handleVerifyOrder(inspectOrderModal.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 shadow-lg"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Verify & Approve</span>
                  </button>
                )}

                {(inspectOrderModal.status === "Verified" || inspectOrderModal.status === "Pending Verification") && (
                  <button
                    onClick={() => {
                      setAssignCourierModal(inspectOrderModal)
                      setInspectOrderModal(null)
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-500 shadow-lg"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    <span>Assign Shiprocket</span>
                  </button>
                )}

                {inspectOrderModal.status !== "Assigned to Courier" &&
                  inspectOrderModal.status !== "Dispatched" &&
                  inspectOrderModal.status !== "Delivered" &&
                  inspectOrderModal.status !== "Cancelled" && (
                    <button
                      onClick={() => {
                        setCancelOrderModal(inspectOrderModal)
                        setInspectOrderModal(null)
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      <span>Cancel Order</span>
                    </button>
                  )}
              </div>

              <button
                onClick={() => {
                  showToast(`Generating packing slip for Order #${inspectOrderModal.id}...`)
                  window.print()
                }}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ASSIGN SHIPROCKET COURIER ── */}
      {assignCourierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Assign Shiprocket Courier</h3>
                <p className="text-xs text-zinc-400">Order #{assignCourierModal.id} • {assignCourierModal.customer}</p>
              </div>
              <button
                onClick={() => setAssignCourierModal(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-zinc-300">
                Select courier service for destination PIN <strong className="text-[#d4af37]">{assignCourierModal.pincode}</strong> ({assignCourierModal.city}):
              </p>

              {[
                { name: "BlueDart Express Air", sla: "Next Day Air (24-48 hrs)", rate: "₹95", rec: true },
                { name: "Delhivery Surface Express", sla: "2-3 Business Days", rate: "₹49", rec: false },
                { name: "DTDC Pan-India Air", sla: "3-4 Business Days", rate: "₹55", rec: false },
              ].map((c) => (
                <label
                  key={c.name}
                  onClick={() => setSelectedCourierName(c.name)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${selectedCourierName === c.name
                    ? "border-[#d4af37] bg-[#d4af37]/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="courier"
                      checked={selectedCourierName === c.name}
                      onChange={() => setSelectedCourierName(c.name)}
                      className="accent-[#d4af37]"
                    />
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        {c.name}
                        {c.rec && <span className="rounded-full bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 text-[9px] font-bold">Recommended</span>}
                      </p>
                      <p className="text-[10px] text-zinc-400">{c.sla}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-400">{c.rate}</span>
                </label>
              ))}
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0d0f12] p-3 text-[11px] text-zinc-400 space-y-1">
              <p className="font-semibold text-zinc-300">Origin Warehouse:</p>
              <p>Gayatri Bhai Atelier Hub #1, Surat/Mumbai Central Warehouse</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setAssignCourierModal(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssignCourier}
                className="rounded-xl bg-[#d4af37] px-5 py-2 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 shadow-lg"
              >
                Generate AWB & Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CANCEL ORDER ── */}
      {cancelOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#14171d] p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-rose-400">
                <Ban className="h-5 w-5" />
                <h3 className="font-serif text-lg font-bold text-white">Cancel Order #{cancelOrderModal.id}</h3>
              </div>
              <button
                onClick={() => setCancelOrderModal(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              Are you sure you want to cancel order for <strong className="text-white">{cancelOrderModal.customer}</strong>?
              This order has not been dispatched yet and will be safely marked as Cancelled.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">Reason for Cancellation</label>
              <select
                value={cancelReasonText}
                onChange={(e) => setCancelReasonText(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
              >
                <option value="Patron requested cancellation">Patron requested cancellation</option>
                <option value="Delivery address incomplete / undeliverable">Delivery address incomplete / undeliverable</option>
                <option value="Patron requested size/color change before dispatch">Patron requested size/color change before dispatch</option>
                <option value="Item failed pre-dispatch quality audit">Item failed pre-dispatch quality audit</option>
                <option value="Suspected fraudulent order / unverified COD">Suspected fraudulent order / unverified COD</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setCancelOrderModal(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Keep Order
              </button>
              <button
                onClick={handleConfirmCancelOrder}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-rose-500 shadow-lg"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PRODUCT & PHOTO MANAGER MODAL ── */}
      {editProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#12141a] p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">Edit Shirt & Photo Gallery</h3>
                  <p className="text-xs text-zinc-400">SKU: {editProductModal.sku} • ID: {editProductModal.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditProductModal(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-6">
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Product Title / Name</label>
                  <input
                    type="text"
                    value={editProductModal.name}
                    onChange={(e) => setEditProductModal({ ...editProductModal, name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Category</label>
                  <select
                    value={editProductModal.category}
                    onChange={(e) => setEditProductModal({ ...editProductModal, category: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value="Casual Shirts">Casual Shirts</option>
                    <option value="Formal Shirts">Formal Shirts</option>
                    <option value="Resort Wear">Resort Wear</option>
                    <option value="Evening Wear">Evening Wear</option>
                    <option value="Hand-Embroidered">Hand-Embroidered</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Price (₹ INR Selling Price)</label>
                  <input
                    type="number"
                    value={editProductModal.price}
                    onChange={(e) => setEditProductModal({ ...editProductModal, price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Original MRP (₹ Strike-through)</label>
                  <input
                    type="number"
                    value={editProductModal.mrp || editProductModal.price}
                    onChange={(e) => setEditProductModal({ ...editProductModal, mrp: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Fabric</label>
                  <input
                    type="text"
                    value={editProductModal.fabric}
                    onChange={(e) => setEditProductModal({ ...editProductModal, fabric: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Color</label>
                  <input
                    type="text"
                    value={editProductModal.color}
                    onChange={(e) => setEditProductModal({ ...editProductModal, color: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Story / Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Product Story & Craftsmanship</label>
                <textarea
                  value={editProductModal.description || ""}
                  onChange={(e) => setEditProductModal({ ...editProductModal, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  placeholder="Detailing the yarn, weave, drape and artisan touch..."
                />
              </div>

              {/* ── PHOTO MANAGER SECTION (Cover image, Delete photo, Add photo) ── */}
              <div className="rounded-2xl border border-[#d4af37]/30 bg-[#0d0f12] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <h4 className="font-serif text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#d4af37]" />
                      <span>Product Photos ({editProductModal.images?.length || 0})</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      First photo is the <strong className="text-[#d4af37]">Cover Image</strong>. Click &ldquo;Make Cover&rdquo; to set any photo as main thumbnail.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition flex items-center gap-1.5">
                      <Upload className="h-3.5 w-3.5 text-[#d4af37]" />
                      <span>Upload Photos</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUploadEditPhoto}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Add Photo by URL */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editPhotoCustomUrl}
                    onChange={(e) => setEditPhotoCustomUrl(e.target.value)}
                    placeholder="Or paste image URL (e.g. /assets/products/... or https://...)"
                    className="flex-1 rounded-xl border border-white/10 bg-[#14171d] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddEditPhotoUrl}
                    className="rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/20 px-4 py-2 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition"
                  >
                    + Add Image
                  </button>
                </div>

                {/* Photo Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                  {editProductModal.images?.map((imgSrc, idx) => {
                    const isCover = idx === 0
                    return (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border ${isCover ? "border-[#d4af37] ring-2 ring-[#d4af37]/30 shadow-lg" : "border-white/10 bg-black/40"
                          } group flex flex-col justify-between`}
                      >
                        <div className="relative aspect-square w-full bg-black">
                          <Image
                            src={imgSrc}
                            alt={`Photo ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                          {isCover && (
                            <span className="absolute top-2 left-2 rounded-full bg-[#d4af37] text-black px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow">
                              ★ Cover Photo
                            </span>
                          )}
                          <span className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-mono text-zinc-300">
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Action Toolbar on card */}
                        <div className="p-2 bg-[#12141a] flex items-center justify-between gap-1 border-t border-white/10">
                          {!isCover ? (
                            <button
                              type="button"
                              onClick={() => handleSetCoverPhoto(idx)}
                              className="rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 px-2 py-1 text-[10px] font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition flex-1 text-center"
                            >
                              Make Cover
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-400 px-1 py-0.5 flex-1 text-center">
                              Primary Showcase
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteProductPhoto(idx)}
                            className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-1 text-rose-400 hover:bg-rose-500 hover:text-white transition"
                            title="Delete this photo"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Size Inventory Steppers */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Inventory Stock by Size</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(["XS", "S", "M", "L", "XL", "XXL"] as const).map((size) => (
                    <div key={size} className="rounded-xl border border-white/10 bg-[#0d0f12] p-2.5 text-center">
                      <span className="text-xs font-bold text-zinc-400">{size}</span>
                      <input
                        type="number"
                        min="0"
                        value={editProductModal.stock[size] ?? 0}
                        onChange={(e) =>
                          setEditProductModal({
                            ...editProductModal,
                            stock: {
                              ...editProductModal.stock,
                              [size]: Math.max(0, parseInt(e.target.value) || 0),
                            },
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-[#161922] py-1 text-center text-xs font-bold text-white focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── SHIPPING PACKAGE WEIGHT & DIMENSIONS (AMAZON / SHIPROCKET) ── */}
              <div className="rounded-2xl border border-white/10 bg-[#0d0f12] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                      <Truck className="h-4 w-4 text-[#d4af37]" />
                      <span>Shipping Package Weight & Dimensions</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Used to calculate live courier delivery rates (Shiprocket, BlueDart, Delhivery)
                    </p>
                  </div>
                  <span className="rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#d4af37]">
                    Divisor: 5000
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Weight (kg) <span className="text-[#d4af37]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0.05"
                        value={editProductModal.weight ?? 0.35}
                        onChange={(e) =>
                          setEditProductModal({
                            ...editProductModal,
                            weight: Number(e.target.value) || 0.35,
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#161922] px-3 py-2 text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">kg</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      = {((editProductModal.weight ?? 0.35) * 1000).toFixed(0)} grams
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Length (L in cm) <span className="text-[#d4af37]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        value={editProductModal.length ?? 30}
                        onChange={(e) =>
                          setEditProductModal({
                            ...editProductModal,
                            length: Number(e.target.value) || 30,
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#161922] px-3 py-2 text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">cm</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 block">Garment fold length</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Breadth (B in cm) <span className="text-[#d4af37]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        value={editProductModal.breadth ?? 25}
                        onChange={(e) =>
                          setEditProductModal({
                            ...editProductModal,
                            breadth: Number(e.target.value) || 25,
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#161922] px-3 py-2 text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">cm</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 block">Box / satchel width</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Height (H in cm) <span className="text-[#d4af37]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={editProductModal.height ?? 4}
                        onChange={(e) =>
                          setEditProductModal({
                            ...editProductModal,
                            height: Number(e.target.value) || 4,
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#161922] px-3 py-2 text-xs text-white font-mono focus:border-[#d4af37] focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">cm</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 block">Package thickness</span>
                  </div>
                </div>

                {/* Volumetric comparison pill */}
                <div className="rounded-xl border border-white/5 bg-[#14171d] p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Dead Weight:</span>
                      <p className="font-mono font-bold text-white">{(editProductModal.weight ?? 0.35).toFixed(2)} kg</p>
                    </div>
                    <span className="text-zinc-600">vs</span>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Volumetric Weight:</span>
                      <p className="font-mono font-bold text-[#d4af37]">
                        {(((editProductModal.length ?? 30) * (editProductModal.breadth ?? 25) * (editProductModal.height ?? 4)) / 5000).toFixed(2)} kg
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-right">
                    <span className="text-[10px] font-bold uppercase text-emerald-400">Billable Courier Weight</span>
                    <p className="font-mono font-bold text-white text-sm">
                      {Math.max(
                        editProductModal.weight ?? 0.35,
                        ((editProductModal.length ?? 30) * (editProductModal.breadth ?? 25) * (editProductModal.height ?? 4)) / 5000
                      ).toFixed(2)} kg
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditProductModal(null)}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#d4af37] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-[#b8972e] transition shadow-lg"
                >
                  Save Shirt Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE PRODUCT CONFIRMATION MODAL ── */}
      {deleteProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#16181f] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 border border-rose-500/30">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Delete Product?</h3>
                <p className="text-[11px] text-zinc-400">This action cannot be undone</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-[#0d0f12]">
              <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-black shrink-0">
                <Image
                  src={deleteProductModal.images?.[0] || "/placeholder.jpg"}
                  alt={deleteProductModal.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{deleteProductModal.name}</h4>
                <p className="text-[11px] text-zinc-400">SKU: {deleteProductModal.sku} • ₹{deleteProductModal.price}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300">
              Are you sure you want to delete <strong className="text-white">{deleteProductModal.name}</strong> from your catalog? It will be permanently removed from the website and database.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeleteProductModal(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Keep Product
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-rose-500 shadow-lg"
              >
                Delete Shirt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HOMEPAGE HERO BANNER SLIDER MODAL (PC & MOBILE IMAGERY) ── */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[94vh] overflow-y-auto rounded-3xl border border-[#d4af37]/40 bg-[#12141a] p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">
                    {editingBannerId ? "Edit Hero Slider Slide & Imagery" : "Create New Homepage Hero Slide"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Dual responsive imagery: configure crisp horizontal for PC (16:9) and vertical touch mockup for Phones (9:16)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBannerModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-6">
              {/* ── INTERACTIVE LIVE PREVIEW STUDIO (DESKTOP & MOBILE PHONE) ── */}
              <div className="rounded-2xl border border-white/10 bg-[#0d0f12] p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                      <Eye className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-serif text-sm font-bold text-white">
                      Live Storefront Simulator Preview
                    </span>
                    <span className="text-[11px] text-zinc-400 hidden sm:inline">• Live real-time typography & crop</span>
                  </div>

                  {/* Preview fit toggle */}
                  <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setBannerPreviewFit("cover")}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        bannerPreviewFit === "cover"
                          ? "bg-[#d4af37] text-black font-bold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      📱 Screen Fill (9:16)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerPreviewFit("contain")}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                        bannerPreviewFit === "contain"
                          ? "bg-[#d4af37] text-black font-bold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                      title="Inspect full uncropped image without cropping"
                    >
                      🖼️ Full Photo (Pura Dikhe)
                    </button>
                  </div>
                </div>

                {/* Dual Screen Simulator */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1 items-start">
                  {/* Desktop Preview */}
                  <div className="md:col-span-7 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1 font-semibold text-white">
                        <Monitor className="h-3 w-3 text-[#d4af37]" /> Desktop PC (16:9)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setZoomImageModal({
                            url: bannerDesktopImg || "/assets/site_banners/slide1_desktop.jpg",
                            title: `Desktop View: ${bannerKicker || "Hero Slide"}`,
                            isMobile: false,
                          })
                        }
                        className="text-[#d4af37] hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-2.5 w-2.5" /> Pura Dekho
                      </button>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-white/10 bg-[#161922] shadow-xl">
                      <div className="bg-[#1e222b] px-3 py-1 border-b border-white/10 flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-rose-500/80" />
                        <div className="w-2 h-2 rounded-full bg-amber-500/80" />
                        <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                        <span className="text-[9px] font-mono text-zinc-400 ml-2 truncate">
                          gayatribhai.com{bannerLink || "/shop"}
                        </span>
                      </div>
                      <div className="relative aspect-[16/9] w-full bg-black">
                        {bannerDesktopImg ? (
                          <Image
                            src={bannerDesktopImg}
                            alt="Desktop preview"
                            fill
                            className={bannerPreviewFit === "contain" ? "object-contain bg-zinc-950" : "object-cover"}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                            No Desktop Image Selected
                          </div>
                        )}
                        {/* Live Overlay */}
                        <div
                          className={`absolute inset-0 flex items-end p-4 ${
                            bannerTone === "dark"
                              ? "bg-gradient-to-t from-white/90 via-transparent to-transparent text-black"
                              : "bg-gradient-to-t from-black/85 via-black/20 to-transparent text-white"
                          }`}
                        >
                          <div>
                            <p className="text-[9px] uppercase font-bold tracking-widest text-[#d4af37]">
                              {bannerKicker || "Featured Atelier"}
                            </p>
                            <p className="font-serif text-sm sm:text-base font-bold leading-tight">
                              {bannerLine1 || "Headline Line 1"} {bannerLine2 || "Line 2"}
                            </p>
                            <span className="inline-block mt-2 rounded-full bg-white text-black px-3 py-0.5 text-[9px] font-bold shadow">
                              {bannerCta || "Shop Now"} →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Phone Mockup */}
                  <div className="md:col-span-5 space-y-1.5 flex flex-col items-center">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 w-full max-w-[170px]">
                      <span className="flex items-center gap-1 font-semibold text-white">
                        <Smartphone className="h-3 w-3 text-[#d4af37]" /> Phone (9:16)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setZoomImageModal({
                            url: bannerMobileImg || "/assets/site_banners/slide1_mobile.jpg",
                            title: `Mobile View: ${bannerKicker || "Hero Slide"}`,
                            isMobile: true,
                          })
                        }
                        className="text-[#d4af37] hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-2.5 w-2.5" /> Pura Dikhe
                      </button>
                    </div>

                    {/* Smartphone Frame */}
                    <div className="relative w-[160px] aspect-[9/16] rounded-[30px] border-[5px] border-[#252831] bg-black shadow-2xl overflow-hidden ring-1 ring-white/10 group">
                      {/* Dynamic Island */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 h-3.5 w-14 rounded-full bg-black/95 flex items-center justify-between px-2 pointer-events-none ring-1 ring-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/70" />
                      </div>

                      {/* Phone Status */}
                      <div className="absolute top-1 inset-x-3 z-20 flex justify-between items-center text-[7.5px] text-white/80 font-mono pointer-events-none">
                        <span>9:41</span>
                        <span>●● 100%</span>
                      </div>

                      {/* Mobile Image */}
                      {bannerMobileImg ? (
                        <Image
                          src={bannerMobileImg}
                          alt="Mobile preview"
                          fill
                          className={bannerPreviewFit === "contain" ? "object-contain bg-zinc-950" : "object-cover"}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                          No Mobile Image
                        </div>
                      )}

                      {/* Live Mobile Text Overlay */}
                      <div
                        className={`absolute inset-0 flex items-end p-2.5 pointer-events-none ${
                          bannerTone === "dark"
                            ? "bg-gradient-to-t from-white/95 via-white/30 to-transparent text-black"
                            : "bg-gradient-to-t from-black/90 via-black/30 to-transparent text-white"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-[7.5px] uppercase tracking-wider font-bold text-[#d4af37]">
                            {bannerKicker || "Featured"}
                          </p>
                          <p className="font-serif text-[10px] font-bold leading-tight line-clamp-2">
                            {bannerLine1 || "Line 1"} {bannerLine2 || ""}
                          </p>
                          <span className="inline-block rounded-full bg-white text-black px-2 py-0.5 text-[7px] font-bold mt-0.5 shadow">
                            {bannerCta || "Shop"} →
                          </span>
                        </div>
                      </div>

                      {/* Bottom Home Indicator */}
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 h-1 w-10 rounded-full bg-white/50 pointer-events-none" />

                      {/* Hover action to zoom */}
                      <button
                        type="button"
                        onClick={() =>
                          setZoomImageModal({
                            url: bannerMobileImg || "/assets/site_banners/slide1_mobile.jpg",
                            title: `Mobile View: ${bannerKicker || "Hero Slide"}`,
                            isMobile: true,
                          })
                        }
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-semibold backdrop-blur-xs cursor-pointer z-40"
                      >
                        <Eye className="h-4 w-4 text-[#d4af37]" />
                        <span>Pura Dikhe</span>
                      </button>
                    </div>

                    <span className="font-mono text-[9px] text-zinc-400">768 × 1376 Vertical Full-Bleed</span>
                  </div>
                </div>
              </div>

              {/* ── COPY, HEADLINES & CTA SETTINGS ── */}
              <div className="rounded-2xl border border-white/10 bg-[#0d0f12] p-5 space-y-4">
                <div className="border-b border-white/10 pb-2 flex items-center justify-between">
                  <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#d4af37]" />
                    <span>Slide Typography, Headlines & Button Links</span>
                  </h4>
                  <span className="text-[11px] text-zinc-400">Live on Storefront Hero</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Kicker with quick chips */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Kicker / Top Subtitle <span className="text-[#d4af37]">*</span>
                    </label>
                    <input
                      type="text"
                      value={bannerKicker}
                      onChange={(e) => setBannerKicker(e.target.value)}
                      placeholder="e.g. Summer Atelier '26"
                      className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                      required
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {["Summer Atelier '26", "The Resort Edit", "New Arrivals", "Limited Edition", "After Dark"].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setBannerKicker(tag)}
                          className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400 hover:text-[#d4af37] hover:bg-white/10 transition"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button Text with quick chips */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      CTA Button Text <span className="text-[#d4af37]">*</span>
                    </label>
                    <input
                      type="text"
                      value={bannerCta}
                      onChange={(e) => setBannerCta(e.target.value)}
                      placeholder="e.g. Shop linen"
                      className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                      required
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {["Shop linen", "Shop resort", "Shop new in", "Explore collection", "Shop evening"].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setBannerCta(tag)}
                          className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400 hover:text-[#d4af37] hover:bg-white/10 transition"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Headline Line 1 */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Hero Headline Line 1 <span className="text-[#d4af37]">*</span>
                    </label>
                    <input
                      type="text"
                      value={bannerLine1}
                      onChange={(e) => setBannerLine1(e.target.value)}
                      placeholder="e.g. Woven"
                      className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                      required
                    />
                  </div>

                  {/* Headline Line 2 */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Hero Headline Line 2 (Italic Accent)
                    </label>
                    <input
                      type="text"
                      value={bannerLine2}
                      onChange={(e) => setBannerLine2(e.target.value)}
                      placeholder="e.g. by hand."
                      className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  {/* Target Link with quick chips */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Target Link <span className="text-[#d4af37]">*</span>
                    </label>
                    <input
                      type="text"
                      value={bannerLink}
                      onChange={(e) => setBannerLink(e.target.value)}
                      placeholder="/shop or /category/contemporary"
                      className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none font-mono"
                      required
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {[
                        { label: "/shop", path: "/shop" },
                        { label: "Contemporary", path: "/category/contemporary" },
                        { label: "Beachside", path: "/category/beachside" },
                        { label: "Heritage", path: "/category/heritage" },
                        { label: "About", path: "/about" },
                      ].map((item) => (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => setBannerLink(item.path)}
                          className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400 hover:text-[#d4af37] hover:bg-white/10 transition"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Tone */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Text Contrast Tone
                    </label>
                    <select
                      value={bannerTone}
                      onChange={(e) => setBannerTone(e.target.value as "light" | "dark")}
                      className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                    >
                      <option value="light">Light (White text with dark gradient — recommended for photos)</option>
                      <option value="dark">Dark (Dark text with bright/ivory background)</option>
                    </select>
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      Controls whether white or dark text overlays the banner imagery.
                    </span>
                  </div>
                </div>
              </div>

              {/* ── RESPONSIVE IMAGES: SEPARATE PC & PHONE UPLOADS & PRESETS ── */}
              <div className="rounded-2xl border border-white/10 bg-[#0d0f12] p-5 space-y-5">
                <div className="border-b border-white/10 pb-2">
                  <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#d4af37]" />
                    <span>Responsive Images (Tailored for PC & Mobile Devices)</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Desktop screens require wide landscape (16:9), while smartphones show vertical portrait (9:16). Select or upload both for crystal-clear store presentation.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Desktop PC Image Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-white">
                        <Monitor className="h-4 w-4 text-[#d4af37]" />
                        Desktop (PC / Laptop 16:9)
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">1920 × 1080</span>
                    </div>

                    <div className="space-y-2">
                      <label className="cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition">
                        <Upload className="h-3.5 w-3.5 text-[#d4af37]" />
                        <span>Upload Desktop Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadBannerDesktop}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={bannerDesktopImg}
                        onChange={(e) => setBannerDesktopImg(e.target.value)}
                        placeholder="Or enter desktop image URL"
                        className="w-full rounded-xl border border-white/10 bg-[#161922] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none font-mono"
                        required
                      />
                    </div>

                    {/* Desktop Presets */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                        Desktop Image Presets:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setBannerDesktopImg("/assets/site_banners/slide1_desktop.jpg")}
                          className="rounded-lg border border-white/5 bg-[#161922] p-1.5 text-left text-zinc-300 hover:border-[#d4af37]/40 hover:text-white transition truncate"
                        >
                          Atelier Slide 1
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerDesktopImg("/assets/site_banners/slide2_desktop.jpg")}
                          className="rounded-lg border border-white/5 bg-[#161922] p-1.5 text-left text-zinc-300 hover:border-[#d4af37]/40 hover:text-white transition truncate"
                        >
                          Resort Slide 2
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerDesktopImg("/assets/banners/hero-terracotta-widescreen.jpg")}
                          className="rounded-lg border border-white/5 bg-[#161922] p-1.5 text-left text-zinc-300 hover:border-[#d4af37]/40 hover:text-white transition truncate"
                        >
                          Terracotta Widescreen
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerDesktopImg("/assets/banners/hero-evening-desktop.jpg")}
                          className="rounded-lg border border-white/5 bg-[#161922] p-1.5 text-left text-zinc-300 hover:border-[#d4af37]/40 hover:text-white transition truncate"
                        >
                          Evening Dusk Desktop
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerDesktopImg("/assets/banners/hero-atelier-widescreen.jpg")}
                          className="rounded-lg border border-white/5 bg-[#161922] p-1.5 text-left text-zinc-300 hover:border-[#d4af37]/40 hover:text-white transition truncate"
                        >
                          Atelier Ultra Wide
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerDesktopImg("/assets/site_banners/slide3_desktop.jpg")}
                          className="rounded-lg border border-white/5 bg-[#161922] p-1.5 text-left text-zinc-300 hover:border-[#d4af37]/40 hover:text-white transition truncate"
                        >
                          Slide 3 Desktop
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Phone Image Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-white">
                        <Smartphone className="h-4 w-4 text-[#d4af37]" />
                        Mobile (Phone Screen 9:16)
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">768 × 1376</span>
                    </div>

                    <div className="space-y-2">
                      <label className="cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition">
                        <Upload className="h-3.5 w-3.5 text-[#d4af37]" />
                        <span>Upload Mobile Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadBannerMobile}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={bannerMobileImg}
                        onChange={(e) => setMobileBannerImg(e.target.value)}
                        placeholder="Or enter mobile image URL"
                        className="w-full rounded-xl border border-white/10 bg-[#161922] px-3 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none font-mono"
                        required
                      />
                    </div>

                    {/* Mobile Presets */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                        Mobile Phone Image Presets:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setMobileBannerImg("/assets/site_banners/slide1_mobile.jpg")}
                          className="rounded-lg border border-white/5 bg-[#161922] p-1.5 text-left text-zinc-300 hover:border-[#d4af37]/40 hover:text-white transition truncate"
                        >
                          Slide 1 Mobile
                        </button>
                        <button
                          type="button"
                          onClick={() => setMobileBannerImg("/assets/site_banners/slide2_mobile.jpg")}
                          className="rounded-lg border border-white/5 bg-[#161922] p-1.5 text-left text-zinc-300 hover:border-[#d4af37]/40 hover:text-white transition truncate"
                        >
                          Slide 2 Mobile
                        </button>
                        <button
                          type="button"
                          onClick={() => setMobileBannerImg("/assets/site_banners/slide3_mobile.jpg")}
                          className="rounded-lg border border-white/5 bg-[#161922] p-1.5 text-left text-zinc-300 hover:border-[#d4af37]/40 hover:text-white transition truncate"
                        >
                          Slide 3 Mobile
                        </button>
                        <button
                          type="button"
                          onClick={() => setMobileBannerImg("/assets/banners/hero-studio-mobile.jpg")}
                          className="rounded-lg border border-white/5 bg-[#161922] p-1.5 text-left text-zinc-300 hover:border-[#d4af37]/40 hover:text-white transition truncate"
                        >
                          Studio Mobile
                        </button>
                        <button
                          type="button"
                          onClick={() => setMobileBannerImg("/assets/banners/after-dark-portrait.jpg")}
                          className="rounded-lg border border-white/5 bg-[#161922] p-1.5 text-left text-zinc-300 hover:border-[#d4af37]/40 hover:text-white transition truncate"
                        >
                          After Dark Portrait
                        </button>
                        <button
                          type="button"
                          onClick={() => setMobileBannerImg("/assets/site_banners/hero_model_photo.jpeg")}
                          className="rounded-lg border border-white/5 bg-[#161922] p-1.5 text-left text-zinc-300 hover:border-[#d4af37]/40 hover:text-white transition truncate"
                        >
                          Hero Model Portrait
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── BANNER SEO & ACCESSIBILITY SETTINGS ── */}
              <div className="rounded-2xl border border-white/10 bg-[#0d0f12] p-5 space-y-4">
                <div className="border-b border-white/10 pb-2">
                  <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#d4af37]" />
                    <span>Banner Image SEO & Semantic Headings</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Configure alt text for Google Image indexing and semantic heading levels for screen readers and SEO spiders.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Image Alt Text (Crucial for Image Search)
                    </label>
                    <input
                      type="text"
                      value={bannerAlt}
                      onChange={(e) => setBannerAlt(e.target.value)}
                      placeholder="e.g. Model in ivory French linen shirt on an Aegean terrace"
                      className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      SEO Heading Level
                    </label>
                    <select
                      value={bannerSeoHeading}
                      onChange={(e) => setBannerSeoHeading(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    >
                      <option value="H1">H1 (Hero Main Heading)</option>
                      <option value="H2">H2 (Secondary Campaign)</option>
                      <option value="H3">H3 (Subordinate Banner)</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Banner Focus Keywords (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={bannerSeoKeywords}
                      onChange={(e) => setBannerSeoKeywords(e.target.value)}
                      placeholder="e.g. french linen shirts, cuban collar, summer menswear"
                      className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Status active checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="bannerActiveCheckbox"
                  checked={bannerActive}
                  onChange={(e) => setBannerActive(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#d4af37]"
                />
                <label htmlFor="bannerActiveCheckbox" className="text-xs font-semibold text-zinc-300 cursor-pointer">
                  Publish Slide Live on Storefront (Uncheck to keep as draft / paused)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#d4af37] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-[#b8972e] transition shadow-lg"
                >
                  {editingBannerId ? "Update Slider Slide & SEO" : "Add Slide to Homepage"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: HIGH-RES BANNER IMAGE FULL PREVIEW (PURA DIKHE) ── */}
      {zoomImageModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/92 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl max-h-[95vh] w-full flex flex-col items-center">
            {/* Header */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                  {zoomImageModal.isMobile ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                </span>
                <div>
                  <h4 className="font-serif text-sm font-bold">{zoomImageModal.title}</h4>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    {zoomImageModal.isMobile
                      ? "Full Mobile Ratio: 768 × 1376 (9:16 portrait)"
                      : "Full Desktop Ratio: 1920 × 1080 (16:9 widescreen)"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={zoomImageModal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Open Full Image</span>
                </a>
                <button
                  type="button"
                  onClick={() => setZoomImageModal(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Uncropped Image Display (Pura Dikhe) */}
            <div
              className={`relative w-full flex items-center justify-center rounded-2xl overflow-hidden border border-white/15 bg-zinc-950 p-2 shadow-2xl ${
                zoomImageModal.isMobile ? "max-w-[380px] aspect-[9/16]" : "max-w-4xl aspect-[16/9]"
              }`}
            >
              <Image
                src={zoomImageModal.url}
                alt={zoomImageModal.title}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 text-center">
              100% Uncropped Original View ("Pura Dikhe") • Press ✕ or click outside to close
            </p>
          </div>
        </div>
      )}

      {/* ── MODAL: BLOG ARTICLE CMS & SEO STUDIO ── */}
      {showAddBlogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[94vh] overflow-y-auto rounded-3xl border border-[#d4af37]/40 bg-[#12141a] p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 px-3 py-0.5 text-[10px] font-bold text-[#d4af37]">
                    <BookOpen className="h-3 w-3" /> Atelier Journal CMS
                  </span>
                  <span className="text-[11px] text-zinc-400">• Rich SEO & Social Metadata</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1">
                  {editBlogModal ? `Edit Article: "${editBlogModal.title}"` : "Compose & Publish New Journal Article"}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Write thoughtful menswear essays, manage live storefront visibility, and customize Google search previews.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddBlogModal(false)
                  setEditBlogModal(null)
                }}
                className="rounded-xl p-2 text-zinc-400 hover:text-white hover:bg-white/5 transition"
              >
                ✕
              </button>
            </div>

            {/* Subtabs: Content & Details vs Google Search SEO Studio */}
            <div className="flex border-b border-white/10 mb-6">
              <button
                type="button"
                onClick={() => setBlogActiveTab("content")}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                  blogActiveTab === "content"
                    ? "border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>1. Article Content & Story</span>
              </button>
              <button
                type="button"
                onClick={() => setBlogActiveTab("seo")}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                  blogActiveTab === "seo"
                    ? "border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                <Globe className="h-4 w-4" />
                <span>2. Google Search & Social SEO Studio</span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[9px] font-mono">
                  SERP
                </span>
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-6">
              {/* TAB 1: CONTENT & DETAILS */}
              {blogActiveTab === "content" && (
                <div className="space-y-5 animate-in fade-in-50 duration-150">
                  {/* Basic Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Article Title <span className="text-[#d4af37]">*</span>
                      </label>
                      <input
                        type="text"
                        value={blogTitle}
                        onChange={(e) => {
                          setBlogTitle(e.target.value)
                          if (!editBlogModal && !blogSlug) {
                            setBlogSlug(
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/(^-|-$)/g, "")
                            )
                          }
                        }}
                        placeholder="e.g. The Connoisseur’s Guide to French Linen"
                        className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-sm text-white focus:border-[#d4af37] focus:outline-none"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Article Subtitle / Hook
                      </label>
                      <input
                        type="text"
                        value={blogSubtitle}
                        onChange={(e) => setBlogSubtitle(e.target.value)}
                        placeholder="e.g. Understanding natural flax fibers, breathability, and artisanal slub..."
                        className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-zinc-300">
                          URL Handle / Slug <span className="text-[#d4af37]">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setBlogSlug(
                              blogTitle
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/(^-|-$)/g, "")
                            )
                          }
                          className="text-[10px] text-[#d4af37] hover:underline"
                        >
                          Auto Generate from Title
                        </button>
                      </div>
                      <div className="flex items-center rounded-xl border border-white/10 bg-[#0d0f12] px-3 py-2 text-xs text-zinc-400">
                        <span className="font-mono text-zinc-500 mr-1">/blog/</span>
                        <input
                          type="text"
                          value={blogSlug}
                          onChange={(e) => setBlogSlug(e.target.value)}
                          placeholder="guide-to-french-linen"
                          className="w-full bg-transparent text-white font-mono focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Editorial Category
                      </label>
                      <select
                        value={blogCategory}
                        onChange={(e) => setBlogCategory(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                      >
                        <option value="Craft & Atelier">Craft & Atelier</option>
                        <option value="Fabric Science">Fabric Science</option>
                        <option value="Style Guides">Style Guides</option>
                        <option value="Resort Life">Resort Life</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Author Name</label>
                      <input
                        type="text"
                        value={blogAuthorName}
                        onChange={(e) => setBlogAuthorName(e.target.value)}
                        placeholder="e.g. Gayatri Puri"
                        className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Author Role / Title</label>
                      <input
                        type="text"
                        value={blogAuthorRole}
                        onChange={(e) => setBlogAuthorRole(e.target.value)}
                        placeholder="e.g. Founder & Master Curator"
                        className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Cover Photography Picker */}
                  <div className="rounded-2xl border border-white/10 bg-[#0d0f12] p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4 text-[#d4af37]" />
                        Cover Photography
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">1920 × 1080 Landscape</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="relative h-24 w-40 rounded-xl overflow-hidden border border-white/10 bg-black shrink-0">
                        {blogCoverImage ? (
                          <Image src={blogCoverImage} alt="Cover preview" fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-zinc-500">
                            No Cover Image
                          </div>
                        )}
                      </div>

                      <div className="w-full space-y-2">
                        <input
                          type="text"
                          value={blogCoverImage}
                          onChange={(e) => setBlogCoverImage(e.target.value)}
                          placeholder="Enter image URL or select from presets below"
                          className="w-full rounded-xl border border-white/10 bg-[#161922] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none font-mono"
                          required
                        />

                        {/* Presets */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {[
                            { label: "Atelier Slide 1", url: "/assets/site_banners/slide1_desktop.jpg" },
                            { label: "Resort Slide 2", url: "/assets/site_banners/slide2_desktop.jpg" },
                            { label: "Terracotta Courtyard", url: "/assets/banners/hero-terracotta-widescreen.jpg" },
                            { label: "Surat Craft Detail", url: "/assets/banners/craft-detail.jpg" },
                            { label: "Evening Portrait", url: "/assets/banners/after-dark-portrait.jpg" },
                            { label: "Folded Linens", url: "/assets/banners/folded-shirts.jpg" },
                          ].map((p) => (
                            <button
                              key={p.url}
                              type="button"
                              onClick={() => setBlogCoverImage(p.url)}
                              className={`rounded-lg px-2.5 py-1 text-[10px] font-medium border transition ${
                                blogCoverImage === p.url
                                  ? "border-[#d4af37] bg-[#d4af37]/20 text-white font-bold"
                                  : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Excerpt / Summary (Card description & search snippet default)
                    </label>
                    <textarea
                      rows={2}
                      value={blogExcerpt}
                      onChange={(e) => setBlogExcerpt(e.target.value)}
                      placeholder="A short, evocative 2-3 sentence overview that intrigues the reader to read the full essay..."
                      className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  {/* Full Article Content */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-zinc-300">
                        Full Article Body Paragraphs <span className="text-[#d4af37]">*</span>
                      </label>
                      <span className="text-[10px] text-zinc-400">Separate paragraphs with double Enter / blank line</span>
                    </div>
                    <textarea
                      rows={7}
                      value={blogContent}
                      onChange={(e) => setBlogContent(e.target.value)}
                      placeholder="Paragraph 1: Introduce the heritage, the fabric philosophy, or the styling narrative...&#10;&#10;Paragraph 2: Deep dive into the craftsman's technique, yarn counts, and summer comfort...&#10;&#10;Paragraph 3: Concluding styling suggestions and mindful fashion notes."
                      className="w-full rounded-xl border border-white/10 bg-[#0d0f12] p-4 text-xs text-white leading-relaxed focus:border-[#d4af37] focus:outline-none font-sans"
                      required
                    />
                  </div>

                  {/* Key Takeaways & Tags */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Key Takeaways / Highlights (One point per line)
                      </label>
                      <textarea
                        rows={3}
                        value={blogKeyTakeaways}
                        onChange={(e) => setBlogKeyTakeaways(e.target.value)}
                        placeholder="Natural flax fibers wick 20% moisture before dampness.&#10;Organic slub variations are genuine artisan marks.&#10;140-165 GSM strikes perfect drape."
                        className="w-full rounded-xl border border-white/10 bg-[#0d0f12] p-3 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Article Tags (Comma-separated)
                        </label>
                        <input
                          type="text"
                          value={blogTags}
                          onChange={(e) => setBlogTags(e.target.value)}
                          placeholder="French Linen, Hand Embroidery, Summer Style, Slow Living"
                          className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Read Time</label>
                        <input
                          type="text"
                          value={blogReadTime}
                          onChange={(e) => setBlogReadTime(e.target.value)}
                          placeholder="e.g. 5 min read"
                          className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Visibility & Featured Checkboxes */}
                  <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-white/10">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={blogPublished}
                        onChange={(e) => setBlogPublished(e.target.checked)}
                        className="h-4 w-4 rounded accent-[#d4af37]"
                      />
                      <span className="text-xs font-semibold text-zinc-200">
                        Publish Live on Storefront (Uncheck to save as draft / hidden)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={blogFeatured}
                        onChange={(e) => setBlogFeatured(e.target.checked)}
                        className="h-4 w-4 rounded accent-[#d4af37]"
                      />
                      <span className="text-xs font-semibold text-zinc-200">
                        Feature in Top Journal Hero Slot
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: GOOGLE SEARCH & SOCIAL SEO STUDIO */}
              {blogActiveTab === "seo" && (
                <div className="space-y-6 animate-in fade-in-50 duration-150">
                  {/* 🌟 LIVE GOOGLE SEARCH RESULT SNIPPET PREVIEW (SERP PREVIEW CARD) */}
                  <div className="rounded-2xl border border-white/15 bg-[#090b0e] p-5 shadow-inner space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                        <Globe className="h-4 w-4 text-[#d4af37]" />
                        Live Google Search Result Preview
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">Desktop & Mobile Snippet</span>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-[#16181d] p-4 font-sans space-y-1.5 shadow">
                      {/* Breadcrumb URL */}
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#d4af37]/20 text-[#d4af37] text-[9px] font-bold">
                          G
                        </span>
                        <span className="text-zinc-300">gayatribhai.com</span>
                        <span>›</span>
                        <span className="text-zinc-400">blog</span>
                        <span>›</span>
                        <span className="text-zinc-400 truncate max-w-[200px]">
                          {blogSlug || "article-slug"}
                        </span>
                      </div>

                      {/* Clickable Blue Google Search Title */}
                      <h4 className="text-base sm:text-lg font-medium text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-1">
                        {blogMetaTitle || `${blogTitle || "Article Title"} | Gayatri Bhai Journal`}
                      </h4>

                      {/* Grey Snippet Description */}
                      <p className="text-xs text-[#bdc1c6] leading-relaxed line-clamp-2">
                        {blogMetaDescription ||
                          blogExcerpt ||
                          "Read this insightful artisanal guide on luxury linen craftsmanship, weave density, and summer resort style..."}
                      </p>
                    </div>
                  </div>

                  {/* SEO Form Inputs */}
                  <div className="space-y-4">
                    {/* Meta Title */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-zinc-300">
                          Google Search Meta Title (50–60 characters recommended)
                        </label>
                        <span
                          className={`text-[10px] font-mono ${
                            (blogMetaTitle || blogTitle).length >= 40 &&
                            (blogMetaTitle || blogTitle).length <= 60
                              ? "text-emerald-400"
                              : "text-zinc-400"
                          }`}
                        >
                          {(blogMetaTitle || blogTitle).length}/60 chars
                        </span>
                      </div>
                      <input
                        type="text"
                        value={blogMetaTitle}
                        onChange={(e) => setBlogMetaTitle(e.target.value)}
                        placeholder={blogTitle ? `${blogTitle} | Gayatri Bhai Journal` : "Enter SEO title"}
                        className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>

                    {/* Meta Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-zinc-300">
                          Search Snippet Meta Description (140–160 characters recommended)
                        </label>
                        <span
                          className={`text-[10px] font-mono ${
                            (blogMetaDescription || blogExcerpt).length >= 120 &&
                            (blogMetaDescription || blogExcerpt).length <= 160
                              ? "text-emerald-400"
                              : "text-zinc-400"
                          }`}
                        >
                          {(blogMetaDescription || blogExcerpt).length}/160 chars
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={blogMetaDescription}
                        onChange={(e) => setBlogMetaDescription(e.target.value)}
                        placeholder="Write a high-converting search snippet summarizing the value for patrons searching on Google..."
                        className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>

                    {/* Focus Keywords */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Primary Focus Keywords & Search Queries (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={blogKeywords}
                        onChange={(e) => setBlogKeywords(e.target.value)}
                        placeholder="e.g. french linen shirts, mens resortwear, cuban collar styling"
                        className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>

                    {/* Cover Alt & OpenGraph Image */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Cover Photo Alt Text (Google Image SEO & Accessibility)
                        </label>
                        <input
                          type="text"
                          value={blogAltText}
                          onChange={(e) => setBlogAltText(e.target.value)}
                          placeholder="Describe the image content for search spiders"
                          className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Social Share OG Image Override
                        </label>
                        <input
                          type="text"
                          value={blogOgImage}
                          onChange={(e) => setBlogOgImage(e.target.value)}
                          placeholder="Defaults to cover photography"
                          className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none font-mono"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Canonical URL Override (Optional)
                        </label>
                        <input
                          type="text"
                          value={blogCanonicalUrl}
                          onChange={(e) => setBlogCanonicalUrl(e.target.value)}
                          placeholder={`https://gayatribhaishop-zkde-eight.vercel.app/blog/${blogSlug || "article"}`}
                          className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* NoIndex check */}
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="blogNoIndexCheck"
                        checked={blogNoIndex}
                        onChange={(e) => setBlogNoIndex(e.target.checked)}
                        className="h-4 w-4 rounded accent-rose-500"
                      />
                      <label htmlFor="blogNoIndexCheck" className="text-xs text-zinc-400 cursor-pointer">
                        Instruct search engines not to index this article (<code>noindex, nofollow</code>)
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-5 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      blogPublished
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    Status: {blogPublished ? "Will Publish Live" : "Will Save as Draft / Hidden"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddBlogModal(false)
                      setEditBlogModal(null)
                    }}
                    className="rounded-xl border border-white/10 px-5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59d28] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 transition shadow-lg shadow-[#d4af37]/20"
                  >
                    {editBlogModal ? "Update Article & SEO" : "Publish Article to Store"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: DELETE BLOG CONFIRMATION ── */}
      {deleteBlogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#14171d] p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Delete Journal Article?</h3>
                <p className="text-[11px] text-zinc-400">This action cannot be undone</p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-white/10 bg-[#0d0f12] space-y-1">
              <span className="text-[10px] text-[#d4af37] font-semibold uppercase">
                {deleteBlogModal.category}
              </span>
              <h5 className="text-xs font-bold text-white">{deleteBlogModal.title}</h5>
              <p className="text-[11px] text-zinc-400">Slug: /blog/{deleteBlogModal.slug}</p>
            </div>

            <p className="text-xs text-zinc-300">
              Are you sure you want to delete <strong className="text-white">"{deleteBlogModal.title}"</strong>? It will be removed from the journal, sitemap, and customer view.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeleteBlogModal(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Keep Article
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBlog}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-rose-500 shadow-lg"
              >
                Delete Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminView
