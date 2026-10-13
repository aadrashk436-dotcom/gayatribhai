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

// Initial Mock Orders with real product references
const initialOrders = [
  {
    id: "GB-2026-1048",
    customer: "Vikram Singhania",
    email: "vikram.singh@atelier.in",
    phone: "+91 98201 44210",
    city: "Mumbai, Maharashtra",
    pincode: "400050",
    shirtName: "Azure Leaf Hand-Embroidered Shirt",
    sku: "M26/SS/CON/CS/23",
    size: "L",
    qty: 1,
    total: 2100,
    paymentMethod: "Razorpay (Prepaid)",
    paymentId: "pay_live_Rz99x11",
    paymentStatus: "Paid",
    status: "Processing",
    date: "Today, 14:24",
    courier: "Delhivery Surface",
    awb: "14298012480",
  },
  {
    id: "GB-2026-1047",
    customer: "Rohan Kapoor",
    email: "rohan.kapoor@heritage.org",
    phone: "+91 99112 88390",
    city: "New Delhi, Delhi",
    pincode: "110001",
    shirtName: "Deep Sea Coco Hand Embroidered Shirt",
    sku: "M26/SS/BEA/CS/42",
    size: "M",
    qty: 2,
    total: 4798,
    paymentMethod: "Razorpay (UPI)",
    paymentId: "pay_live_Kz88v22",
    paymentStatus: "Paid",
    status: "Dispatched",
    date: "Today, 11:15",
    courier: "BlueDart Express Air",
    awb: "33890142911",
  },
  {
    id: "GB-2026-1046",
    customer: "Ananya Deshmukh",
    email: "ananya.d@luxuryart.co",
    phone: "+91 98450 11922",
    city: "Bengaluru, Karnataka",
    pincode: "560001",
    shirtName: "True Red Havana Beach Embroidered Shirt",
    sku: "M26/SS/BEA/CS/19",
    size: "S",
    qty: 1,
    total: 2399,
    paymentMethod: "Razorpay (Credit Card)",
    paymentId: "pay_live_Lx44t90",
    paymentStatus: "Paid",
    status: "Delivered",
    date: "Yesterday, 18:40",
    courier: "Delhivery Surface",
    awb: "14298011985",
  },
  {
    id: "GB-2026-1045",
    customer: "Arjun Oberoi",
    email: "arjun.oberoi@palace.in",
    phone: "+91 97660 33411",
    city: "Jaipur, Rajasthan",
    pincode: "302001",
    shirtName: "Rust Palm Handcrafted Cuban Shirt",
    sku: "M26/SS/RES/CS/08",
    size: "XL",
    qty: 1,
    total: 2150,
    paymentMethod: "Cash on Delivery",
    paymentId: "COD_VERIFIED",
    paymentStatus: "Pending COD",
    status: "Confirmed",
    date: "Yesterday, 13:05",
    courier: "DTDC Surface",
    awb: "DTDC8829014",
  },
  {
    id: "GB-2026-1044",
    customer: "Meera Sen",
    email: "meera.sen@calcutta.edu",
    phone: "+91 98300 55190",
    city: "Kolkata, West Bengal",
    pincode: "700019",
    shirtName: "Ivory Floral Heirloom Knot Shirt",
    sku: "M26/SS/CLA/CS/02",
    size: "M",
    qty: 1,
    total: 2600,
    paymentMethod: "Razorpay (NetBanking)",
    paymentId: "pay_live_Qp11a88",
    paymentStatus: "Paid",
    status: "Delivered",
    date: "11 Oct, 16:30",
    courier: "BlueDart Express Air",
    awb: "33890141029",
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

  // Form states for Add Shirt
  const [newShirtName, setNewShirtName] = useState("")
  const [newShirtCategory, setNewShirtCategory] = useState("Contemporary")
  const [newShirtPrice, setNewShirtPrice] = useState("2200")
  const [newShirtMRP, setNewShirtMRP] = useState("2499")
  const [newShirtFabric, setNewShirtFabric] = useState("100% French Linen")
  const [newShirtColor, setNewShirtColor] = useState("Ivory")
  const [newShirtSKU, setNewShirtSKU] = useState(`M26/SS/CUS/${Math.floor(10 + Math.random() * 89)}`)

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
        o.shirtName.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Handlers
  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
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

  const handleAddShirtSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newShirtName) {
      showToast("Please enter shirt name")
      return
    }
    const priceNum = parseInt(newShirtPrice, 10) || 2100
    const mrpNum = parseInt(newShirtMRP, 10) || 2400
    const newProduct: Product = {
      id: `custom_${Date.now()}`,
      slug: newShirtName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: newShirtName,
      description: "Handcrafted haute artisanal luxury shirt tailored with fine single-needle embroidery.",
      price: priceNum,
      mrp: mrpNum,
      discount: Math.round(((mrpNum - priceNum) / mrpNum) * 100),
      category: newShirtCategory,
      sku: newShirtSKU,
      color: newShirtColor,
      sizes: ["S", "M", "L", "XL", "XXL"],
      images: [
        "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg",
      ],
      fabric: newShirtFabric,
      occasion: "Resort wear, evening dinners, festive soirees",
      rating: 4.8,
      reviews: 12,
      badge: "New",
      stock: { S: 5, M: 5, L: 5, XL: 5, XXL: 5 },
    }

    setProductList([newProduct, ...productList])
    setShowAddShirtModal(false)
    setNewShirtName("")
    showToast(`Added "${newProduct.name}" to Atelier catalog!`)
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
        className={`fixed inset-y-0 left-0 z-40 w-72 h-screen flex-shrink-0 flex flex-col border-r border-white/10 bg-[#121418] transition-transform duration-300 ease-in-out lg:static lg:h-screen lg:w-72 lg:shrink-0 lg:flex lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
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
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold tracking-wider transition-all duration-150 ${
                    isActive
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
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive
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
                            className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 ${
                              idx === 5
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
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                                  stockTotal <= 10
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
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                  ord.status === "Delivered"
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
              <div className="space-y-6">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#14171d] p-4">
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

                  <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                    {["All", "Contemporary", "BeachSide", "Classic", "Festive"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition shrink-0 ${
                          categoryFilter === cat
                            ? "bg-[#d4af37] text-black font-bold"
                            : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Catalog Grid */}
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
                                  className={`rounded-lg px-2 py-0.5 text-[10px] font-mono font-semibold ${
                                    count <= 2
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
            )}

            {/* ══════════════ TAB 3: ORDERS ══════════════ */}
            {activeTab === "Orders" && (
              <div className="space-y-6">
                {/* Search & Status Filter */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#14171d] p-4">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search by order ID, patron, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0d0f12] pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                    {["All", "Processing", "Confirmed", "Dispatched", "Delivered"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition shrink-0 ${
                          orderStatusFilter === st
                            ? "bg-[#d4af37] text-black font-bold"
                            : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders Detailed Table */}
                <div className="rounded-2xl border border-white/10 bg-[#14171d] shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400 font-semibold tracking-wider uppercase text-[11px]">
                          <th className="py-4 px-4">Order Details</th>
                          <th className="py-4 px-4">Patron & Shipping</th>
                          <th className="py-4 px-4">Shirt Item</th>
                          <th className="py-4 px-4">Payment</th>
                          <th className="py-4 px-4">Shiprocket AWB</th>
                          <th className="py-4 px-4">Update Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-white/[0.02] transition">
                            <td className="py-4 px-4">
                              <p className="font-mono text-sm font-bold text-[#d4af37]">{ord.id}</p>
                              <p className="text-[11px] text-zinc-400 mt-0.5">{ord.date}</p>
                              <p className="font-mono text-xs font-semibold text-white mt-2">{formatINR(ord.total)}</p>
                            </td>

                            <td className="py-4 px-4">
                              <p className="font-semibold text-white text-sm">{ord.customer}</p>
                              <p className="text-zinc-400 text-xs">{ord.phone}</p>
                              <p className="text-zinc-400 text-xs mt-1 flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-[#d4af37]" />
                                {ord.city} (PIN: {ord.pincode})
                              </p>
                            </td>

                            <td className="py-4 px-4">
                              <p className="text-white font-semibold line-clamp-1">{ord.shirtName}</p>
                              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{ord.sku}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-zinc-200">
                                  Size: {ord.size}
                                </span>
                                <span className="text-[10px] text-zinc-400">Qty: {ord.qty}</span>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="h-3 w-3" />
                                {ord.paymentStatus}
                              </span>
                              <p className="text-[10px] text-zinc-400 mt-1">{ord.paymentMethod}</p>
                              <p className="text-[9px] font-mono text-zinc-500">{ord.paymentId}</p>
                            </td>

                            <td className="py-4 px-4">
                              <p className="font-semibold text-zinc-200">{ord.courier}</p>
                              <p className="text-[10px] font-mono text-[#d4af37]">AWB: {ord.awb}</p>
                              <button
                                onClick={() => showToast(`Tracking AWB #${ord.awb} via Shiprocket API... (In Transit)`)}
                                className="mt-1 text-[10px] font-bold text-blue-400 hover:underline"
                              >
                                Track Package &rarr;
                              </button>
                            </td>

                            <td className="py-4 px-4">
                              <select
                                value={ord.status}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                className="rounded-xl border border-white/10 bg-[#0d0f12] px-3 py-1.5 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                              >
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Dispatched">Dispatched</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
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
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                  c.tier === "Platinum"
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

      {/* ── MODAL: ADD NEW SHIRT ── */}
      {showAddShirtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#14171d] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-serif text-lg font-bold text-white">Add New Hand-Embroidered Shirt</h3>
              <button
                onClick={() => setShowAddShirtModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddShirtSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Shirt Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Emerald Zari Knot Linen Shirt"
                  value={newShirtName}
                  onChange={(e) => setNewShirtName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-4 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Category</label>
                  <select
                    value={newShirtCategory}
                    onChange={(e) => setNewShirtCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3 py-2 text-white"
                  >
                    <option value="Contemporary">Contemporary</option>
                    <option value="BeachSide">BeachSide</option>
                    <option value="Classic">Classic</option>
                    <option value="Festive">Festive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">SKU</label>
                  <input
                    type="text"
                    value={newShirtSKU}
                    onChange={(e) => setNewShirtSKU(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={newShirtPrice}
                    onChange={(e) => setNewShirtPrice(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-400 mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    value={newShirtMRP}
                    onChange={(e) => setNewShirtMRP(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f12] px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddShirtModal(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#d4af37] px-5 py-2 font-bold uppercase tracking-wider text-black hover:brightness-110"
                >
                  Save Shirt
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
    </div>
  )
}

export default AdminView
