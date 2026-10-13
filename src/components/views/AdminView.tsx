"use client"

import React, { useState, useMemo } from "react"
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
} from "lucide-react"
import { products as initialProducts, Product } from "@/lib/products"

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

  // Modal states
  const [showAddShirtModal, setShowAddShirtModal] = useState(false)
  const [showAddCouponModal, setShowAddCouponModal] = useState(false)
  const [inspectOrderModal, setInspectOrderModal] = useState<AdminOrder | null>(null)
  const [assignCourierModal, setAssignCourierModal] = useState<AdminOrder | null>(null)
  const [selectedCourierName, setSelectedCourierName] = useState<string>("BlueDart Express Air")
  const [cancelOrderModal, setCancelOrderModal] = useState<AdminOrder | null>(null)
  const [cancelReasonText, setCancelReasonText] = useState<string>("Patron requested cancellation")

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

  // Low stock inventory calculation
  const lowStockCount = useMemo(() => {
    return productList.filter((p) => {
      const stocks = Object.values(p.stock || {}) as number[]
      return stocks.some((s) => s <= 2)
    }).length
  }, [productList])

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

  const handleStockAdjust = (productId: string, size: string, delta: number) => {
    setProductList((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const current = p.stock[size] || 0
          return {
            ...p,
            stock: {
              ...p.stock,
              [size]: Math.max(0, current + delta),
            },
          }
        }
        return p
      })
    )
    showToast(`Stock updated for size ${size}`)
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
                    return (
                      <div
                        key={p.id}
                        className="rounded-2xl border border-white/10 bg-[#14171d] p-4 shadow-xl flex flex-col justify-between group hover:border-[#d4af37]/40 transition duration-200"
                      >
                        <div>
                          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-black mb-3">
                            <Image
                              src={p.images[0]}
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
                        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                          <div>
                            <span className="font-serif text-lg font-bold text-white">{formatINR(p.price)}</span>
                            <span className="ml-2 text-xs text-zinc-500 line-through">{formatINR(p.mrp)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/product/${p.slug}`}
                              target="_blank"
                              className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white transition"
                              title="View on Store"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              onClick={() => showToast(`Price & details for "${p.name}" are synced with database.`)}
                              className="rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 px-3 py-1.5 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition"
                            >
                              Edit Shirt
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
              <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl space-y-6">
                <div>
                  <h4 className="font-serif text-lg font-bold text-white">Live Stock Management & Restock</h4>
                  <p className="text-xs text-zinc-400">Click (+) or (-) to update stock directly in realtime</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-400 font-semibold tracking-wider uppercase text-[11px]">
                        <th className="py-3 px-3">Shirt Name</th>
                        <th className="py-3 px-3">SKU</th>
                        <th className="py-3 px-3 text-center">S</th>
                        <th className="py-3 px-3 text-center">M</th>
                        <th className="py-3 px-3 text-center">L</th>
                        <th className="py-3 px-3 text-center">XL</th>
                        <th className="py-3 px-3 text-center">XXL</th>
                        <th className="py-3 px-3 text-right">Total Units</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {productList.map((p) => {
                        const totalUnits = Object.values(p.stock).reduce((a, b) => a + b, 0)
                        return (
                          <tr key={p.id} className="hover:bg-white/[0.02] transition">
                            <td className="py-3.5 px-3 font-semibold text-white max-w-[220px] truncate">
                              {p.name}
                            </td>
                            <td className="py-3.5 px-3 font-mono text-zinc-400">{p.sku}</td>

                            {["S", "M", "L", "XL", "XXL"].map((sz) => (
                              <td key={sz} className="py-3.5 px-2 text-center">
                                <div className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1">
                                  <button
                                    onClick={() => handleStockAdjust(p.id, sz, -1)}
                                    className="text-zinc-400 hover:text-rose-400 font-bold px-1"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono font-bold text-white w-4 text-center">
                                    {p.stock[sz] || 0}
                                  </span>
                                  <button
                                    onClick={() => handleStockAdjust(p.id, sz, 1)}
                                    className="text-zinc-400 hover:text-emerald-400 font-bold px-1"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                            ))}

                            <td className="py-3.5 px-3 text-right font-mono font-bold text-[#d4af37]">
                              {totalUnits}
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
              <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl space-y-4">
                <h4 className="font-serif text-lg font-bold text-white">Active Promotional Banners</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                    <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden">
                      <Image src="/assets/site_banners/slide1_desktop.jpg" alt="Summer Atelier" fill className="object-cover" />
                    </div>
                    <p className="font-bold text-white text-xs mt-2">Summer Atelier 2026 - Main Hero</p>
                    <p className="text-[11px] text-zinc-400">Position 1 • Link: /shop • Status: Active</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                    <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden">
                      <Image src="/assets/site_banners/slide2_desktop.jpg" alt="Resort Edit" fill className="object-cover" />
                    </div>
                    <p className="font-bold text-white text-xs mt-2">The Resort Edit - Seaside Coastal</p>
                    <p className="text-[11px] text-zinc-400">Position 2 • Link: /shop • Status: Active</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TAB 9: SETTINGS ══════════════ */}
          {activeTab === "Settings" && (
            <div className="space-y-6 max-w-3xl">
              <div className="rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-xl space-y-6">
                <div>
                  <h4 className="font-serif text-lg font-bold text-white">Store Identity & Live Credentials</h4>
                  <p className="text-xs text-zinc-400">Verified e-commerce platform configuration</p>
                </div>

                <div className="space-y-4 text-xs">
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

                  <button
                    onClick={() => showToast("Store settings are locked and safely stored in .env")}
                    className="rounded-xl bg-[#d4af37] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 transition"
                  >
                    Save Configuration
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
                          className={`flex items-center gap-2 rounded-xl p-1.5 pr-3 border text-[11px] font-medium shrink-0 transition ${
                            isSelected
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
    </div>
  )
}

export default AdminView
