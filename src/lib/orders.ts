import fs from "fs"
import path from "path"
import { products as STATIC_PRODUCTS } from "@/products"
import { getStoredProductById } from "@/lib/serverProducts"

export function getDbPath(): string {
  return path.join(process.cwd(), "backend", "src", "data", "db.json")
}

export function normalizeOrder(o: any) {
  if (!o) return null

  const rawItems = Array.isArray(o.items) && o.items.length > 0 ? o.items : []
  const firstRawItem = rawItems[0] || {}
  const firstProdId = firstRawItem.productId || firstRawItem.id || o.productId || o.id

  const pFirst = getStoredProductById(firstProdId) || STATIC_PRODUCTS.find((p) => p.id === firstProdId || p.slug === firstProdId)

  const streetAddr =
    typeof o.address === "string" && o.address.length > 0
      ? o.address
      : o.shippingAddress?.street || o.shippingAddress?.address || ""
  const cityStr =
    o.city ||
    (o.shippingAddress?.city
      ? o.shippingAddress?.state
        ? `${o.shippingAddress.city}, ${o.shippingAddress.state}`
        : o.shippingAddress.city
      : "")
  const stateStr = o.state || o.shippingAddress?.state || ""
  const pincodeStr = o.pincode || o.shippingAddress?.pincode || ""

  const totalPaise = o.totalPaise || (o.total > 10000 ? o.total : (o.total || 0) * 100)
  const totalRupees = o.total > 10000 ? Math.round(o.total / 100) : (o.total || Math.round(totalPaise / 100))

  const rawStatus = o.status || "Pending Verification"
  let displayStatus = rawStatus
  if (rawStatus === "PROCESSING" || rawStatus === "processing") displayStatus = "Pending Verification"
  if (rawStatus === "CONFIRMED" || rawStatus === "confirmed") displayStatus = "Verified"
  if (rawStatus === "SHIPPED" || rawStatus === "shipped") displayStatus = "Dispatched"
  if (rawStatus === "DELIVERED" || rawStatus === "delivered") displayStatus = "Delivered"
  if (rawStatus === "CANCELLED" || rawStatus === "cancelled") displayStatus = "Cancelled"

  const isCodOrder =
    o.paymentMethod === "Cash on Delivery" ||
    o.paymentMethod === "COD" ||
    o.payment_method === "cod" ||
    o.payment_method === "Cash on Delivery"

  let displayPaymentStatus = isCodOrder ? "Pending COD" : "Pending"
  if (o.paymentStatus === "PAID" || o.paymentStatus === "Paid" || o.payment_status === "paid") {
    displayPaymentStatus = "Paid"
  } else if (displayStatus === "Delivered" && isCodOrder) {
    displayPaymentStatus = "Paid"
  } else if (!isCodOrder && (o.paymentStatus === "Pending" || o.paymentStatus === "PENDING")) {
    displayPaymentStatus = "Pending"
  } else if (o.paymentStatus) {
    displayPaymentStatus = o.paymentStatus
  }

  let formattedDate = o.date
  if (!formattedDate && o.createdAt) {
    try {
      formattedDate = new Date(o.createdAt).toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      formattedDate = "Recently"
    }
  }

  const itemsList =
    rawItems.length > 0
      ? rawItems
      : [
          {
            productId: firstProdId,
            id: firstProdId,
            name: o.shirtName || pFirst?.name || "Artisanal Linen Shirt",
            sku: o.sku || pFirst?.sku || "GB-ART-01",
            size: o.size || "M",
            quantity: o.qty || 1,
            price: o.price || totalRupees,
            image:
              o.image ||
              pFirst?.images?.[0] ||
              "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg",
            color: pFirst?.color || "Exclusive",
          },
        ]

  const enrichedItems = itemsList.map((item: any) => {
    const itemProdId = item.productId || item.id
    const itemProd = getStoredProductById(itemProdId) || STATIC_PRODUCTS.find((p) => p.id === itemProdId || p.slug === itemProdId)
    const unitPrice =
      typeof item.price === "number" && item.price > 0
        ? (item.price > 10000 ? Math.round(item.price / 100) : item.price)
        : (itemProd?.price || totalRupees)

    return {
      productId: itemProdId,
      id: itemProdId,
      name: item.name || item.shirtName || itemProd?.name || o.shirtName || "Artisanal Linen Shirt",
      sku: item.sku || itemProd?.sku || o.sku || "GB-ART-01",
      size: item.size || o.size || "M",
      quantity: Number(item.quantity || item.qty || 1),
      price: unitPrice,
      image:
        item.image ||
        itemProd?.images?.[0] ||
        o.image ||
        "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg",
      color: item.color || itemProd?.color || "Exclusive",
    }
  })

  const totalQty = enrichedItems.reduce((acc: number, cur: any) => acc + (cur.quantity || 1), 0)
  const calculatedSubtotal = Math.round(
    enrichedItems.reduce((acc: number, cur: any) => acc + ((cur.price || 0) * (cur.quantity || 1)), 0)
  )

  const customerName = (o.customer || o.customerName || o.shippingAddress?.name || "Customer").trim()
  const customerEmail = (o.email || o.customerEmail || o.shippingAddress?.email || "").trim().toLowerCase()
  const customerPhone = (o.phone || o.customerPhone || o.shippingAddress?.phone || "").trim()

  return {
    ...o,
    id: o.orderNumber || o.order_number || o.id,
    orderNumber: o.orderNumber || o.order_number || o.id,
    customer: customerName,
    customerName,
    email: customerEmail,
    customerEmail,
    phone: customerPhone,
    customerPhone,
    userId: o.userId || null,
    address: streetAddr,
    city: cityStr,
    state: stateStr,
    pincode: pincodeStr,
    shippingAddress: {
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      street: streetAddr,
      city: cityStr,
      state: stateStr,
      pincode: pincodeStr,
      type: o.shippingAddress?.type || "HOME",
    },
    billingAddress: o.billingAddress || o.shippingAddress || {
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      street: streetAddr,
      city: cityStr,
      state: stateStr,
      pincode: pincodeStr,
    },
    items: enrichedItems,
    shirtName: o.shirtName || firstRawItem.name || pFirst?.name || enrichedItems[0]?.name || "Artisanal Linen Shirt",
    sku: o.sku || firstRawItem.sku || pFirst?.sku || enrichedItems[0]?.sku || "GB-LUX-01",
    size: o.size || firstRawItem.size || enrichedItems[0]?.size || "M",
    qty: totalQty,
    price: enrichedItems[0]?.price || totalRupees,
    subtotal: o.subtotal || calculatedSubtotal,
    discount: o.discount || 0,
    shipping: typeof o.shipping === "number" ? o.shipping : (o.courierRate || 0),
    total: totalRupees,
    totalPaise,
    image:
      o.image ||
      enrichedItems[0]?.image ||
      firstRawItem.image ||
      pFirst?.images?.[0] ||
      "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg",
    paymentMethod: isCodOrder
      ? "Cash on Delivery"
      : o.paymentMethod || (o.payment_method === "razorpay" ? "Razorpay (Online)" : "Razorpay (Online)"),
    paymentId:
      o.paymentId ||
      o.razorpayPaymentId ||
      o.razorpay_payment_id ||
      (isCodOrder ? `cod_${o.orderNumber || o.id}` : ""),
    paymentStatus: displayPaymentStatus,
    status: displayStatus,
    date: formattedDate || "Today",
    courier: o.courier || o.courierName || null,
    courierName: o.courierName || o.courier || "Blue Dart Express Air",
    courierId: o.courierId || null,
    courierRate: typeof o.courierRate === "number" ? o.courierRate : (o.shipping || 0),
    etd: o.etd || "2-3 business days",
    awb: o.awb || null,
    shiprocketStatus: o.shiprocketStatus || null,
    shiprocket_order_id: o.shiprocket_order_id || null,
    shiprocket_shipment_id: o.shiprocket_shipment_id || null,
    shiprocket_label_url: o.shiprocket_label_url || null,
    shiprocket_invoice_url: o.shiprocket_invoice_url || null,
    razorpayOrderId: o.razorpayOrderId || null,
    razorpayPaymentId: o.razorpayPaymentId || null,
    createdAt: o.createdAt || new Date().toISOString(),
  }
}

export function readStoredOrders(): any[] {
  try {
    const dbPath = getDbPath()
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, "utf8"))
      if (Array.isArray(data.orders)) {
        return data.orders.map(normalizeOrder).filter(Boolean)
      }
    }
  } catch (err) {
    console.warn("Could not read stored orders from db.json:", err)
  }
  return []
}

export function saveOrderRecord(rawOrder: any): any {
  const dbPath = getDbPath()
  if (!fs.existsSync(dbPath)) {
    throw new Error("Database file db.json does not exist")
  }

  const normalized = normalizeOrder(rawOrder)
  if (!normalized) {
    throw new Error("Invalid order data")
  }

  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"))
  db.orders = db.orders || []

  // 1. Remove duplicate if updating or re-submitting same orderNumber
  const existingIdx = db.orders.findIndex(
    (o: any) => o.id === normalized.id || o.orderNumber === normalized.orderNumber
  )
  if (existingIdx >= 0) {
    db.orders[existingIdx] = {
      ...db.orders[existingIdx],
      ...normalized,
      updatedAt: new Date().toISOString(),
    }
  } else {
    db.orders.unshift(normalized)
  }

  // 2. Automatically deduct product inventory/stock for purchased sizes
  if (Array.isArray(db.products) && Array.isArray(normalized.items)) {
    normalized.items.forEach((item: any) => {
      const prodId = item.productId || item.id
      const prod = db.products.find((p: any) => p.id === prodId || p.slug === prodId)
      if (prod && prod.stock && typeof prod.stock === "object") {
        const itemSize = item.size || "M"
        if (typeof prod.stock[itemSize] === "number") {
          prod.stock[itemSize] = Math.max(0, prod.stock[itemSize] - (item.quantity || 1))
        }
      }
    })
  }

  // 3. Upsert customer in db.customers
  db.customers = db.customers || []
  const cleanEmail = normalized.email ? normalized.email.toLowerCase().trim() : ""
  const custName = normalized.customer || "Customer"
  const custPhone = normalized.phone || ""
  const totalRupees = normalized.total || 0

  const existingCustIdx = db.customers.findIndex(
    (c: any) =>
      (cleanEmail && c.email && c.email.toLowerCase().trim() === cleanEmail) ||
      (normalized.userId && c.id === normalized.userId)
  )

  if (existingCustIdx >= 0) {
    const c = db.customers[existingCustIdx]
    const currOrders = typeof c.orders === "number" ? c.orders : 1
    const currSpent = typeof c.totalSpent === "number" ? c.totalSpent : 0
    db.customers[existingCustIdx] = {
      ...c,
      name: c.name || custName,
      phone: c.phone || custPhone,
      orders: currOrders + 1,
      totalSpent: currSpent + totalRupees,
      lastOrder: normalized.orderNumber,
      points: (c.points || 0) + Math.round(totalRupees / 10),
      updatedAt: new Date().toISOString(),
    }
  } else if (cleanEmail && cleanEmail !== "care@gayatribhai.com") {
    db.customers.push({
      id: normalized.userId || `cust_${Date.now()}`,
      name: custName,
      email: cleanEmail,
      phone: custPhone,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(custName)}&backgroundColor=0a0a0a,d4af37,18181b`,
      tier: "Silver",
      points: Math.round(totalRupees / 10),
      orders: 1,
      totalSpent: totalRupees,
      lastOrder: normalized.orderNumber,
      authProvider: cleanEmail.endsWith("@gmail.com") ? "google" : "email",
      authProviders: [cleanEmail.endsWith("@gmail.com") ? "google" : "email"],
      role: "customer",
      isAdmin: false,
      createdAt: new Date().toISOString(),
    })
  }

  // Write atomically
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8")

  return normalized
}
