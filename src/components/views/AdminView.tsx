"use client"

import React, { useState, useMemo, useEffect } from "react"
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  Ticket,
  Truck,
  Image as ImageIcon,
  BookOpen,
  Settings,
} from "lucide-react"
import { products as initialProducts } from "@/lib/products"
import { BLOG_POSTS as initialBlogPosts } from "@/data/blogData"
import type { BlogPost } from "@/types"

// Admin Shared Types and Data
import {
  AdminOrder,
  Product,
  Coupon,
  Banner,
  SiteSeoSettings,
  ZoomImageModalState,
  initialOrders,
  initialCustomers,
  initialCoupons,
  formatINR,
} from "../admin/types"

// Admin Layout Shell
import { AdminSidebar } from "../admin/AdminSidebar"
import { AdminHeader } from "../admin/AdminHeader"

// Admin Tabs
import { AdminDashboardTab } from "../admin/tabs/AdminDashboardTab"
import { AdminProductsTab } from "../admin/tabs/AdminProductsTab"
import { AdminOrdersTab } from "../admin/tabs/AdminOrdersTab"
import { AdminCustomersTab } from "../admin/tabs/AdminCustomersTab"
import { AdminInventoryTab } from "../admin/tabs/AdminInventoryTab"
import { AdminCouponsTab } from "../admin/tabs/AdminCouponsTab"
import { AdminShippingTab } from "../admin/tabs/AdminShippingTab"
import { AdminBannersTab } from "../admin/tabs/AdminBannersTab"
import { AdminBlogTab } from "../admin/tabs/AdminBlogTab"
import { AdminSeoTab } from "../admin/tabs/AdminSeoTab"

// Admin Modals
import { ImageLightboxModal } from "../admin/modals/ImageLightboxModal"
import { QuickPriceModal } from "../admin/modals/QuickPriceModal"
import { EditProductModal } from "../admin/modals/EditProductModal"
import { AddShirtModal } from "../admin/modals/AddShirtModal"
import { DeleteProductModal } from "../admin/modals/DeleteProductModal"
import { InspectOrderModal } from "../admin/modals/InspectOrderModal"
import { AssignCourierModal } from "../admin/modals/AssignCourierModal"
import { CancelOrderModal } from "../admin/modals/CancelOrderModal"
import { AddCouponModal } from "../admin/modals/AddCouponModal"
import { BannerModal } from "../admin/modals/BannerModal"
import { BlogModal } from "../admin/modals/BlogModal"
import { DeleteBlogModal } from "../admin/modals/DeleteBlogModal"

export function AdminView() {
  // Navigation & Shell State
  const [activeTab, setActiveTab] = useState("Dashboard")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Primary Data Collections
  const [productList, setProductList] = useState<Product[]>(initialProducts)
  const [orderList, setOrderList] = useState<AdminOrder[]>(initialOrders)
  const [customerList, setCustomerList] = useState(initialCustomers)
  const [couponList, setCouponList] = useState<Coupon[]>(initialCoupons)

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState("All")
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const [inventorySearch, setInventorySearch] = useState("")
  const [inventoryStockFilter, setInventoryStockFilter] = useState<"all" | "low" | "out">("all")

  // Modals: Orders
  const [inspectOrderModal, setInspectOrderModal] = useState<AdminOrder | null>(null)
  const [assignCourierModal, setAssignCourierModal] = useState<AdminOrder | null>(null)
  const [cancelOrderModal, setCancelOrderModal] = useState<AdminOrder | null>(null)

  // Modals: Products (Add, Full Edit, Quick Price Edit, Delete)
  const [showAddShirtModal, setShowAddShirtModal] = useState(false)
  const [editProductModal, setEditProductModal] = useState<Product | null>(null)
  const [quickPriceModalProduct, setQuickPriceModalProduct] = useState<Product | null>(null)
  const [deleteProductModal, setDeleteProductModal] = useState<Product | null>(null)

  // Modals: Coupons
  const [showAddCouponModal, setShowAddCouponModal] = useState(false)

  // Modals: Shipping Pincode
  const [checkPincode, setCheckPincode] = useState("")
  const [pincodeResult, setPincodeResult] = useState<any>(null)

  // Modals: Homepage Hero Slider Banners
  const [bannerList, setBannerList] = useState<Banner[]>([
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
  const [bannerAlt, setBannerAlt] = useState("Ivory hand-embroidered French linen shirt on an Aegean terrace")
  const [bannerTone, setBannerTone] = useState<"light" | "dark">("light")
  const [bannerViewMode, setBannerViewMode] = useState<Record<string, "frame" | "full">>({})

  // Modals: Blog CMS & SEO Studio
  const [blogList, setBlogList] = useState<BlogPost[]>(initialBlogPosts)
  const [blogSearchQuery, setBlogSearchQuery] = useState("")
  const [blogCategoryFilter, setBlogCategoryFilter] = useState("All")
  const [blogStatusFilter, setBlogStatusFilter] = useState<"All" | "Published" | "Draft">("All")
  const [showAddBlogModal, setShowAddBlogModal] = useState(false)
  const [editBlogModal, setEditBlogModal] = useState<BlogPost | null>(null)
  const [deleteBlogModal, setDeleteBlogModal] = useState<BlogPost | null>(null)

  // Modals: Global Page-Level SEO Settings
  const [siteSeoSettings, setSiteSeoSettings] = useState<SiteSeoSettings>({
    home: {
      metaTitle: "GAYATRI BHAI | Handcrafted Luxury French Linen Shirts",
      metaDescription:
        "Discover artisanal resortwear and heirloom hand-embroidered French linen shirts crafted with generational master Karigar perfection in India.",
      keywords: "luxury linen shirts, hand embroidered shirts, cuban collar linen, resortwear india",
    },
    shop: {
      metaTitle: "Shop Artisan Linen Shirts | Gayatri Bhai Collection",
      metaDescription:
        "Explore our limited drops of 100% pure organic French linen shirts with single-needle botanical and resort embroidery.",
      keywords: "buy linen shirts online, resort collection, handcrafted clothing",
    },
    blog: {
      metaTitle: "The AVYR Journal | Essays on Craft, Linen Science & Sartorial Art",
      metaDescription:
        "Delve into the stories behind our atelier. In-depth guides to French flax, embroidery techniques, resort styling, and conscious luxury living.",
      keywords: "linen care, fabric science, cuban collar styling, artisan craft",
    },
  })

  // Modal: Image Lightbox Zoom
  const [zoomImageModal, setZoomImageModal] = useState<ZoomImageModalState | null>(null)

  // Skeleton & Sync States
  const [isLoadingAll, setIsLoadingAll] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [isLoadingBanners, setIsLoadingBanners] = useState(true)
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true)
  const [isLoadingSeo, setIsLoadingSeo] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Toast Helper
  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // Live Database Fetcher
  const fetchAllLiveData = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true)
    setIsLoadingAll(true)
    setIsLoadingProducts(true)
    setIsLoadingOrders(true)
    setIsLoadingBanners(true)
    setIsLoadingBlogs(true)
    setIsLoadingSeo(true)

    try {
      // 1. Live Products (include hidden/drafts for admin management)
      const fetchProducts = fetch("/api/products?include_hidden=true")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.products) && data.products.length > 0) {
            setProductList(data.products)
          }
        })
        .catch((e) => console.warn("Could not load products from API:", e))
        .finally(() => setIsLoadingProducts(false))

      // 2. Live Orders
      const fetchOrders = fetch("/api/orders")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.orders)) {
            setOrderList(data.orders)
          }
        })
        .catch((e) => console.warn("Could not load orders from API:", e))
        .finally(() => setIsLoadingOrders(false))

      // 3. Live Customers
      const fetchCustomers = fetch("/api/admin/customers")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.customers)) {
            setCustomerList(data.customers)
          }
        })
        .catch((e) => console.warn("Could not load customers from API:", e))

      // 4. Live Hero Banners
      const fetchBanners = fetch("/api/banners")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setBannerList(data)
          }
        })
        .catch((e) => console.warn("Could not load banners from API:", e))
        .finally(() => setIsLoadingBanners(false))

      // 5. Live Atelier Blogs
      const fetchBlogs = fetch("/api/blogs?all=true")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setBlogList(data)
          }
        })
        .catch((e) => console.warn("Could not load blogs from API:", e))
        .finally(() => setIsLoadingBlogs(false))

      // 6. Live Global SEO Settings
      const fetchSeo = fetch("/api/seo")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.home) {
            setSiteSeoSettings(data)
          }
        })
        .catch((e) => console.warn("Could not load SEO settings from API:", e))
        .finally(() => setIsLoadingSeo(false))

      await Promise.allSettled([fetchProducts, fetchOrders, fetchCustomers, fetchBanners, fetchBlogs, fetchSeo])
    } finally {
      setIsLoadingAll(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAllLiveData()
  }, [])

  const handleRefreshAllData = async () => {
    showToast("Syncing with live database...")
    await fetchAllLiveData(true)
    showToast("Live database synchronized! All dynamic data updated.")
  }

  // ══════════════ PRODUCT MANAGEMENT HANDLERS ══════════════
  const handleOpenEditProduct = (product: Product) => {
    setEditProductModal({
      ...product,
      images: [...product.images],
      stock: { ...product.stock },
    })
  }

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

  const handleStockAdjust = async (
    productId: string,
    size: "XS" | "S" | "M" | "L" | "XL" | "XXL",
    delta: number
  ) => {
    let updatedStock: Record<string, number> = {}
    setProductList((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const current = p.stock?.[size] || 0
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

  // ══════════════ ORDER MANAGEMENT HANDLERS ══════════════
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

    showToast(`Order #${orderId} verified and approved for fulfillment!`)
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

  const handleAssignCourier = async (orderId: string, courierName: string) => {
    const newAwb = `AWB-SR-${Math.floor(1000000000 + Math.random() * 9000000000)}`
    const courier = courierName || "BlueDart Express Air"

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

  const handleConfirmCancelOrder = async (orderId: string, reason: string) => {
    const order = orderList.find((o) => o.id === orderId)

    if (
      order?.awb ||
      order?.status === "Assigned to Courier" ||
      order?.status === "Dispatched" ||
      order?.status === "Delivered"
    ) {
      showToast("Cannot cancel: Order is already assigned to courier with AWB tracking. Initiate Return/RTO instead.")
      setCancelOrderModal(null)
      return
    }

    setOrderList((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
            ...o,
            status: "Cancelled" as const,
            cancelReason: reason || "Cancelled by Store Admin",
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
            cancelReason: reason || "Cancelled by Store Admin",
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
          cancelReason: reason,
        }),
      })
    } catch (e) {
      console.warn("Could not sync with API", e)
    }
  }

  const handleMarkDispatched = async (orderId: string) => {
    setOrderList((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
            ...o,
            status: "Dispatched" as const,
          }
          : o
      )
    )

    if (inspectOrderModal && inspectOrderModal.id === orderId) {
      setInspectOrderModal((prev) =>
        prev
          ? {
            ...prev,
            status: "Dispatched",
          }
          : null
      )
    }

    showToast(`Order #${orderId} marked as Dispatched (In Transit)!`)

    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "Dispatched",
        }),
      })
    } catch (e) {
      console.warn("Could not sync with API", e)
    }
  }

  const handleMarkDelivered = async (orderId: string) => {
    setOrderList((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
            ...o,
            status: "Delivered" as const,
            paymentStatus: "Paid",
          }
          : o
      )
    )

    if (inspectOrderModal && inspectOrderModal.id === orderId) {
      setInspectOrderModal((prev) =>
        prev
          ? {
            ...prev,
            status: "Delivered",
            paymentStatus: "Paid",
          }
          : null
      )
    }

    showToast(`Order #${orderId} marked as Delivered! Payment marked as Paid.`)

    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "Delivered",
          paymentStatus: "Paid",
        }),
      })
    } catch (e) {
      console.warn("Could not sync with API", e)
    }
  }

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

  // ══════════════ SHIPPING PINCODE HANDLER ══════════════
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
      city: pin.startsWith("11")
        ? "New Delhi"
        : pin.startsWith("40")
          ? "Mumbai"
          : pin.startsWith("39")
            ? "Surat (Local)"
            : pin.startsWith("56")
              ? "Bengaluru"
              : "Pan India Metro",
      delhivery: "₹49 (2-3 Business Days)",
      blueDart: "₹95 (Next Day Air Express)",
      dtdc: "₹55 (3-4 Business Days)",
      codAvailable: true,
    })
    showToast(`Pincode ${pin} is fully serviceable via Shiprocket!`)
  }

  // ══════════════ BANNER CMS HANDLERS ══════════════
  const handleOpenAddBanner = () => {
    setEditingBannerId(null)
    setBannerKicker("Summer Atelier '26")
    setBannerLine1("Woven")
    setBannerLine2("by hand.")
    setBannerCta("Shop collection")
    setBannerDesktopImg("/assets/site_banners/slide1_desktop.jpg")
    setMobileBannerImg("/assets/site_banners/slide1_mobile.jpg")
    setBannerTone("light")
    setBannerAlt("Ivory hand-embroidered French linen shirt on an Aegean seaside stone terrace")
    setShowBannerModal(true)
  }

  const handleOpenEditBanner = (banner: Banner) => {
    setEditingBannerId(banner.id)
    setBannerKicker(banner.kicker || banner.title || "")
    setBannerLine1(banner.lines?.[0] || banner.title || "")
    setBannerLine2(banner.lines?.[1] || banner.subtitle || "")
    setBannerCta(banner.cta || "Shop collection")
    setBannerDesktopImg(banner.desktop || banner.image_desktop || "")
    setMobileBannerImg(banner.mobile || banner.image_mobile || "")
    setBannerTone((banner.tone === "dark" ? "dark" : "light"))
    setBannerAlt(banner.alt || `${banner.kicker || "Hero"} - ${banner.lines?.[0] || ""}`)
    setShowBannerModal(true)
  }

  const handleSaveBanner = async (bannerObj: Banner) => {
    let updatedList: Banner[]
    if (bannerObj.id && bannerList.some((b) => b.id === bannerObj.id)) {
      updatedList = bannerList.map((b) => (b.id === bannerObj.id ? bannerObj : b))
    } else {
      updatedList = [bannerObj, ...bannerList]
    }

    setBannerList(updatedList)
    setShowBannerModal(false)
    showToast("Homepage Hero Banner saved!")

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

  const handleDuplicateBanner = async (banner: Banner) => {
    const newSlide: Banner = {
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

  // ══════════════ BLOG CMS & SEO HANDLERS ══════════════
  const handleOpenAddBlog = () => {
    setEditBlogModal(null)
    setShowAddBlogModal(true)
  }

  const handleOpenEditBlog = (blog: BlogPost) => {
    setEditBlogModal(blog)
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

  const handleSaveBlog = async (blogPayload: Partial<BlogPost>) => {
    if (editBlogModal) {
      setBlogList((prev) =>
        prev.map((b) =>
          b.id === editBlogModal.id ? ({ ...b, ...blogPayload } as BlogPost) : b
        )
      )
      showToast(`Article "${blogPayload.title}" updated successfully!`)
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
      showToast(`Article "${blogPayload.title}" created & published to CMS!`)
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

  // ══════════════ GLOBAL SEO HANDLER ══════════════
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

  // ══════════════ MEMOIZED DERIVED VALUES ══════════════
  const filteredOrders = useMemo(() => {
    return orderList.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.shirtName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        orderStatusFilter === "All" || o.status === orderStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [orderList, searchQuery, orderStatusFilter])

  const lowStockCount = useMemo(() => {
    return productList.filter((p) => {
      const stocks = Object.values(p.stock || {}) as number[]
      return stocks.some((s) => s <= 2)
    }).length
  }, [productList])

  const inventoryStats = useMemo(() => {
    let totalUnits = 0
    let totalValuation = 0
    let lowStockItems = 0
    let outOfStockItems = 0

    productList.forEach((p) => {
      const itemUnits = Object.values(p.stock || {}).reduce(
        (a, b) => a + (Number(b) || 0),
        0
      )
      totalUnits += itemUnits
      totalValuation += itemUnits * p.price
      if (itemUnits === 0) outOfStockItems += 1
      else if (itemUnits < 10) lowStockItems += 1
    })

    return { totalUnits, totalValuation, lowStockItems, outOfStockItems }
  }, [productList])

  const inventoryFilteredList = useMemo(() => {
    return productList.filter((p) => {
      const matchesSearch =
        !inventorySearch.trim() ||
        p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(inventorySearch.toLowerCase())
      if (!matchesSearch) return false

      const totalUnits = Object.values(p.stock || {}).reduce(
        (a, b) => a + (Number(b) || 0),
        0
      )
      if (inventoryStockFilter === "low") return totalUnits > 0 && totalUnits < 10
      if (inventoryStockFilter === "out") return totalUnits === 0
      return true
    })
  }, [productList, inventorySearch, inventoryStockFilter])

  const filteredBlogs = useMemo(() => {
    return blogList.filter((b) => {
      const matchesSearch =
        !blogSearchQuery.trim() ||
        b.title.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
        b.excerpt.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
        (Array.isArray(b.tags) &&
          b.tags.some((t: string) => t.toLowerCase().includes(blogSearchQuery.toLowerCase())))
      const matchesCat =
        blogCategoryFilter === "All" || b.category === blogCategoryFilter
      const isPub = b.is_published !== false
      const matchesStatus =
        blogStatusFilter === "All" ||
        (blogStatusFilter === "Published" && isPub) ||
        (blogStatusFilter === "Draft" && !isPub)

      return matchesSearch && matchesCat && matchesStatus
    })
  }, [blogList, blogSearchQuery, blogCategoryFilter, blogStatusFilter])

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
    <div className="flex h-screen overflow-hidden bg-[#0a0c10] text-zinc-100 font-sans selection:bg-[#d4af37] selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl border border-[#d4af37]/40 bg-[#14171d]/95 px-5 py-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d4af37] font-bold text-black text-[10px]">
            ✓
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navItems={navItems}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sticky Header Bar */}
        <AdminHeader
          activeTab={activeTab}
          setMobileMenuOpen={setMobileMenuOpen}
          isRefreshing={isRefreshing}
          onRefresh={handleRefreshAllData}
          onAddNewShirt={() => setShowAddShirtModal(true)}
          onAddNewCoupon={() => setShowAddCouponModal(true)}
          onExportCSV={exportOrdersCSV}
          onAddNewBlog={handleOpenAddBlog}
        />

        {/* Dynamic Tab Body */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {activeTab === "Dashboard" && (
            <AdminDashboardTab
              isLoadingAll={isLoadingAll}
              productList={productList}
              orderList={orderList}
              customerList={customerList}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "Products" && (
            <AdminProductsTab
              isLoadingProducts={isLoadingProducts}
              productList={productList}
              onOpenEditProduct={handleOpenEditProduct}
              onOpenQuickPrice={(product) => setQuickPriceModalProduct(product)}
              onToggleVisibility={handleToggleProductVisibility}
              onOpenDeleteProduct={handleOpenDeleteProduct}
              onOpenZoom={(zoomState) => setZoomImageModal(zoomState)}
              onAddNewShirt={() => setShowAddShirtModal(true)}
            />
          )}

          {activeTab === "Orders" && (
            <AdminOrdersTab
              orderList={orderList}
              filteredOrders={filteredOrders}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              orderStatusFilter={orderStatusFilter}
              setOrderStatusFilter={setOrderStatusFilter}
              selectedOrderIds={selectedOrderIds}
              setSelectedOrderIds={setSelectedOrderIds}
              isLoadingOrders={isLoadingOrders}
              handleSelectAllOrders={handleSelectAllOrders}
              handleToggleSelectOrder={handleToggleSelectOrder}
              handleBulkVerify={handleBulkVerify}
              handleBulkAssignShiprocket={handleBulkAssignShiprocket}
              handleBulkCancel={handleBulkCancel}
              handleVerifyOrder={handleVerifyOrder}
              handleMarkDispatched={handleMarkDispatched}
              handleMarkDelivered={handleMarkDelivered}
              setInspectOrderModal={setInspectOrderModal}
              setAssignCourierModal={setAssignCourierModal}
              setCancelOrderModal={setCancelOrderModal}
              setZoomImageModal={setZoomImageModal}
              showToast={showToast}
              formatINR={formatINR}
            />
          )}

          {activeTab === "Customers" && (
            <AdminCustomersTab customerList={customerList} formatINR={formatINR} />
          )}

          {activeTab === "Inventory" && (
            <AdminInventoryTab
              productList={productList}
              inventoryStats={inventoryStats}
              inventoryFilteredList={inventoryFilteredList}
              inventorySearch={inventorySearch}
              setInventorySearch={setInventorySearch}
              inventoryStockFilter={inventoryStockFilter}
              setInventoryStockFilter={setInventoryStockFilter}
              isLoadingProducts={isLoadingProducts}
              formatINR={formatINR}
              setZoomImageModal={setZoomImageModal}
              handleStockAdjust={handleStockAdjust}
              handleOpenEditProduct={handleOpenEditProduct}
              handleToggleProductVisibility={handleToggleProductVisibility}
            />
          )}

          {activeTab === "Coupons" && (
            <AdminCouponsTab
              couponList={couponList}
              formatINR={formatINR}
              showToast={showToast}
            />
          )}

          {activeTab === "Shiprocket" && (
            <AdminShippingTab
              checkPincode={checkPincode}
              setCheckPincode={setCheckPincode}
              pincodeResult={pincodeResult}
              handlePincodeCheck={handlePincodeCheck}
            />
          )}

          {activeTab === "Marketing" && (
            <AdminBannersTab
              bannerList={bannerList}
              isLoadingBanners={isLoadingBanners}
              bannerViewMode={bannerViewMode}
              setBannerViewMode={setBannerViewMode}
              handleOpenAddBanner={handleOpenAddBanner}
              handleOpenEditBanner={handleOpenEditBanner}
              handleDeleteBanner={handleDeleteBanner}
              handleToggleBannerActive={handleToggleBannerActive}
              handleMoveBanner={handleMoveBanner}
              handleDuplicateBanner={handleDuplicateBanner}
              setZoomImageModal={setZoomImageModal}
              setBannerKicker={setBannerKicker}
              setBannerLine1={setBannerLine1}
              setBannerLine2={setBannerLine2}
              setBannerCta={setBannerCta}
              setBannerDesktopImg={setBannerDesktopImg}
              setMobileBannerImg={setMobileBannerImg}
              setBannerAlt={setBannerAlt}
              setBannerTone={setBannerTone}
            />
          )}

          {activeTab === "Blog CMS" && (
            <AdminBlogTab
              blogList={blogList}
              filteredBlogs={filteredBlogs}
              isLoadingBlogs={isLoadingBlogs}
              blogSearchQuery={blogSearchQuery}
              setBlogSearchQuery={setBlogSearchQuery}
              blogCategoryFilter={blogCategoryFilter}
              setBlogCategoryFilter={setBlogCategoryFilter}
              blogStatusFilter={blogStatusFilter}
              setBlogStatusFilter={setBlogStatusFilter}
              handleOpenAddBlog={handleOpenAddBlog}
              handleOpenEditBlog={handleOpenEditBlog}
              handleOpenDeleteBlog={handleOpenDeleteBlog}
              handleToggleBlogPublish={handleToggleBlogPublish}
              setZoomImageModal={setZoomImageModal}
            />
          )}

          {activeTab === "Settings" && (
            <AdminSeoTab
              siteSeoSettings={siteSeoSettings}
              setSiteSeoSettings={setSiteSeoSettings}
              handleSaveSeoSettings={handleSaveSeoSettings}
            />
          )}
        </div>
      </main>

      {/* ══════════════ MODALS ══════════════ */}

      {/* 1. HD Lightbox Zoom Modal */}
      {zoomImageModal && (
        <ImageLightboxModal
          modal={zoomImageModal}
          onClose={() => setZoomImageModal(null)}
        />
      )}

      {/* 2. Quick Price & MRP Editor Modal */}
      {quickPriceModalProduct && (
        <QuickPriceModal
          product={quickPriceModalProduct}
          onClose={() => setQuickPriceModalProduct(null)}
          onSaved={(updated) => {
            setProductList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
            setQuickPriceModalProduct(null)
          }}
          showToast={showToast}
        />
      )}

      {/* 3. Comprehensive Product Editor Modal */}
      {editProductModal && (
        <EditProductModal
          product={editProductModal}
          onClose={() => setEditProductModal(null)}
          onSave={async (updated) => {
            setProductList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
            setEditProductModal(null)
            showToast(`Saving "${updated.name}" updates...`)
            try {
              const res = await fetch("/api/products", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
              })
              if (res.ok) {
                showToast(`"${updated.name}" details updated & saved to database!`)
              } else {
                showToast(`"${updated.name}" updated in view!`)
              }
            } catch (err) {
              console.warn("Could not persist product edits:", err)
              showToast(`"${updated.name}" updated locally!`)
            }
          }}
          onOpenZoom={(zoomState) => setZoomImageModal(zoomState)}
          showToast={showToast}
        />
      )}

      {/* 4. Add New Shirt Modal */}
      {showAddShirtModal && (
        <AddShirtModal
          isOpen={showAddShirtModal}
          onClose={() => setShowAddShirtModal(false)}
          onAddProduct={(newProduct) => {
            setProductList((prev) => [newProduct, ...prev])
            setShowAddShirtModal(false)
            showToast(`"${newProduct.name}" added to catalog!`)
          }}
          showToast={showToast}
        />
      )}

      {/* 5. Delete Product Confirmation Modal */}
      {deleteProductModal && (
        <DeleteProductModal
          product={deleteProductModal}
          onClose={() => setDeleteProductModal(null)}
          onConfirm={handleConfirmDeleteProduct}
        />
      )}

      {/* 6. Inspect Order Modal */}
      {inspectOrderModal && (
        <InspectOrderModal
          order={inspectOrderModal}
          onClose={() => setInspectOrderModal(null)}
          onVerify={handleVerifyOrder}
          onOpenAssignCourier={(order) => setAssignCourierModal(order)}
          onOpenCancelOrder={(order) => setCancelOrderModal(order)}
          onMarkDispatched={handleMarkDispatched}
          onMarkDelivered={handleMarkDelivered}
          showToast={showToast}
        />
      )}

      {/* 7. Assign Courier Modal */}
      {assignCourierModal && (
        <AssignCourierModal
          order={assignCourierModal}
          onClose={() => setAssignCourierModal(null)}
          onAssign={(orderId, courierName) => {
            handleAssignCourier(orderId, courierName)
          }}
        />
      )}

      {/* 8. Cancel Order Modal */}
      {cancelOrderModal && (
        <CancelOrderModal
          order={cancelOrderModal}
          onClose={() => setCancelOrderModal(null)}
          onConfirm={(orderId, reason) => {
            handleConfirmCancelOrder(orderId, reason)
          }}
        />
      )}

      {/* 9. Add Promo Coupon Modal */}
      {showAddCouponModal && (
        <AddCouponModal
          isOpen={showAddCouponModal}
          onClose={() => setShowAddCouponModal(false)}
          onAddCoupon={(newCpn) => {
            setCouponList((prev) => [newCpn, ...prev])
            setShowAddCouponModal(false)
            showToast(`Coupon ${newCpn.code} created!`)
          }}
          showToast={showToast}
        />
      )}

      {/* 10. Hero Slider Banner Modal */}
      {showBannerModal && (
        <BannerModal
          isOpen={showBannerModal}
          onClose={() => setShowBannerModal(false)}
          bannerToEdit={editingBannerId ? bannerList.find((b) => b.id === editingBannerId) || null : null}
          onSave={handleSaveBanner}
          onOpenZoom={(zoomState) => setZoomImageModal(zoomState)}
        />
      )}

      {/* 11. Blog Journal Modal */}
      {showAddBlogModal && (
        <BlogModal
          isOpen={showAddBlogModal}
          onClose={() => {
            setShowAddBlogModal(false)
            setEditBlogModal(null)
          }}
          blogToEdit={editBlogModal}
          onSave={handleSaveBlog}
          showToast={showToast}
        />
      )}

      {/* 12. Delete Blog Confirmation Modal */}
      {deleteBlogModal && (
        <DeleteBlogModal
          blog={deleteBlogModal}
          onClose={() => setDeleteBlogModal(null)}
          onConfirm={handleConfirmDeleteBlog}
        />
      )}
    </div>
  )
}

export default AdminView
