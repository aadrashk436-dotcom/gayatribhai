import { products } from "@/products"

export interface InvoiceItem {
  productId: string
  name?: string
  size?: string
  color?: string
  quantity: number
  price?: number
}

export interface InvoiceOrder {
  id: string
  orderNumber: string
  createdAt?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  shippingAddress?: {
    name?: string
    phone?: string
    street?: string
    area?: string
    city?: string
    state?: string
    pincode?: string
    type?: string
  }
  items: InvoiceItem[]
  subtotal?: number
  discount?: number
  shipping?: number
  total?: number
  paymentMethod?: string
  paymentStatus?: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  courierName?: string
  status?: string
}

function escapePdfText(str?: string | number): string {
  if (str === undefined || str === null) return ""
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/₹/g, "Rs. ")
}

function sanitizeAscii(str?: string | number): string {
  if (!str) return ""
  return String(str)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/₹/g, "Rs. ")
    .replace(/[^\x20-\x7E]/g, "")
}

export function generateInvoicePdf(order: InvoiceOrder): Uint8Array {
  const chunks: string[] = []
  const op = (code: string) => chunks.push(code)

  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : []
  const orderNum = order.orderNumber || order.id || "GB-" + Date.now().toString().slice(-6)
  const invoiceNum = `INV-${orderNum.replace(/^GB-?/, "GB-")}`

  const dateObj = order.createdAt ? new Date(order.createdAt) : new Date()
  const dateFormatted = dateObj.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
  const timeFormatted = dateObj.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Customer & Shipping
  const custName = sanitizeAscii(order.customerName || order.shippingAddress?.name || "Patron")
  const custPhone = sanitizeAscii(order.customerPhone || order.shippingAddress?.phone || "+91 98765 43210")
  const custEmail = sanitizeAscii(order.customerEmail || "care@gayatribhai.com")
  const street = sanitizeAscii(order.shippingAddress?.street || "Atelier Delivery Address")
  const area = sanitizeAscii(order.shippingAddress?.area || "")
  const city = sanitizeAscii(order.shippingAddress?.city || "Indore")
  const state = sanitizeAscii(order.shippingAddress?.state || "Madhya Pradesh")
  const pincode = sanitizeAscii(order.shippingAddress?.pincode || "452001")

  // Financial calculations
  let calculatedSubtotal = 0
  const normalizedItems = items.map((it, idx) => {
    const prod = products.find((p) => p.id === it.productId)
    const name = sanitizeAscii(it.name || prod?.name || "Handcrafted French Linen Shirt")
    const color = sanitizeAscii(it.color || prod?.color || "French Linen")
    const size = sanitizeAscii(it.size || "M")
    const qty = Math.max(1, it.quantity || 1)
    const unitPrice = it.price || prod?.price || 2100
    const totalItemPrice = unitPrice * qty
    calculatedSubtotal += totalItemPrice
    return {
      index: idx + 1,
      name,
      color,
      size,
      qty,
      unitPrice,
      totalItemPrice,
    }
  })

  // Convert Paise to Rupees if needed
  let rawSubtotal = order.subtotal ?? calculatedSubtotal
  if (rawSubtotal > 100000) rawSubtotal = Math.round(rawSubtotal / 100)

  let rawDiscount = order.discount ?? 0
  if (rawDiscount > 10000) rawDiscount = Math.round(rawDiscount / 100)

  let rawShipping = order.shipping ?? (rawSubtotal >= 1999 ? 0 : 99)
  if (rawShipping > 10000) rawShipping = Math.round(rawShipping / 100)

  let rawTotal = order.total ?? (rawSubtotal - rawDiscount + rawShipping)
  if (rawTotal > 100000) rawTotal = Math.round(rawTotal / 100)

  const gstIncluded = Math.round((rawSubtotal * 5) / 105) // 5% apparel GST

  // ─────────────────────────────────────────────────────────────
  // 1. TOP HEADER BAND (Rich Obsidian Black with Atelier Gold)
  // ─────────────────────────────────────────────────────────────
  // Dark luxury background: x=0, y=755, w=595.28, h=86.89
  op("0.05 0.05 0.07 rg")
  op("0 755 595.28 87 re f")

  // Gold accent separator bar: y=750, h=4
  op("0.83 0.69 0.22 rg")
  op("0 750 595.28 4 re f")

  // Brand Name
  op("BT")
  op("/F2 22 Tf")
  op("1 1 1 rg")
  op("36 800 Td")
  op(`(${escapePdfText("GAYATRI BHAI")}) Tj`)
  op("ET")

  // Brand Sub-kicker
  op("BT")
  op("/F1 8.5 Tf")
  op("0.83 0.69 0.22 rg")
  op("36 784 Td")
  op(`(${escapePdfText("ATELIER DE LUXE • HANDCRAFTED FRENCH LINEN RESORTWEAR")}) Tj`)
  op("ET")

  // Brand location note
  op("BT")
  op("/F1 7.5 Tf")
  op("0.7 0.7 0.7 rg")
  op("36 771 Td")
  op(`(${escapePdfText("Master Karigar Craftsmanship • Indore Atelier • GSTIN: 23AABCG1234F1Z8")}) Tj`)
  op("ET")

  // Header Right: TAX INVOICE title
  op("BT")
  op("/F2 16 Tf")
  op("1 1 1 rg")
  op("420 802 Td")
  op(`(${escapePdfText("TAX INVOICE")}) Tj`)
  op("ET")

  op("BT")
  op("/F1 8 Tf")
  op("0.85 0.85 0.85 rg")
  op("400 786 Td")
  op(`(${escapePdfText("ORIGINAL FOR RECIPIENT")}) Tj`)
  op("ET")

  op("BT")
  op("/F1 7.5 Tf")
  op("0.83 0.69 0.22 rg")
  op("435 771 Td")
  op(`(${escapePdfText("PREPAID ORDER")}) Tj`)
  op("ET")

  // ─────────────────────────────────────────────────────────────
  // 2. INVOICE META CARD
  // ─────────────────────────────────────────────────────────────
  // Card background
  op("0.96 0.96 0.97 rg")
  op("36 688 523.28 50 re f")
  op("0.85 0.85 0.88 RG")
  op("0.5 w")
  op("36 688 523.28 50 re S")

  // Column 1: Invoice No & Date
  op("BT")
  op("/F2 8.5 Tf")
  op("0.15 0.15 0.15 rg")
  op("48 722 Td")
  op(`(${escapePdfText("INVOICE NUMBER")}) Tj`)
  op("ET")

  op("BT")
  op("/F1 9 Tf")
  op("0.1 0.1 0.1 rg")
  op("48 708 Td")
  op(`(${escapePdfText(invoiceNum)}) Tj`)
  op("ET")

  op("BT")
  op("/F1 7.5 Tf")
  op("0.45 0.45 0.45 rg")
  op("48 696 Td")
  op(`(${escapePdfText(`Date: ${dateFormatted} at ${timeFormatted}`)}) Tj`)
  op("ET")

  // Column 2: Order Ref & Status
  op("BT")
  op("/F2 8.5 Tf")
  op("0.15 0.15 0.15 rg")
  op("215 722 Td")
  op(`(${escapePdfText("ORDER REFERENCE")}) Tj`)
  op("ET")

  op("BT")
  op("/F1 9 Tf")
  op("0.1 0.1 0.1 rg")
  op("215 708 Td")
  op(`(${escapePdfText(`#${orderNum}`)}) Tj`)
  op("ET")

  op("BT")
  op("/F1 7.5 Tf")
  op("0.12 0.48 0.28 rg") // forest green
  op("215 696 Td")
  op(`(${escapePdfText(`Status: ${order.status || "CONFIRMED & PROCESSED"}`)}) Tj`)
  op("ET")

  // Column 3: Payment Method
  op("BT")
  op("/F2 8.5 Tf")
  op("0.15 0.15 0.15 rg")
  op("385 722 Td")
  op(`(${escapePdfText("PAYMENT METHOD")}) Tj`)
  op("ET")

  op("BT")
  op("/F1 9 Tf")
  op("0.1 0.1 0.1 rg")
  op("385 708 Td")
  op(`(${escapePdfText(order.paymentMethod || "Online (Razorpay)")}) Tj`)
  op("ET")

  op("BT")
  op("/F1 7.5 Tf")
  op("0.45 0.45 0.45 rg")
  op("385 696 Td")
  op(`(${escapePdfText(`Paid: INR Rs. ${rawTotal.toLocaleString("en-IN")}`)}) Tj`)
  op("ET")

  // ─────────────────────────────────────────────────────────────
  // 3. BILLING & SHIPPING DETAILS (Two Columns)
  // ─────────────────────────────────────────────────────────────
  // Left Box: Billed / Shipped To
  const boxY = 600
  const boxH = 76
  const boxW = 255

  // Left Card
  op("0.98 0.98 0.99 rg")
  op(`36 ${boxY} ${boxW} ${boxH} re f`)
  op("0.85 0.85 0.88 RG")
  op(`36 ${boxY} ${boxW} ${boxH} re S`)

  op("BT")
  op("/F2 8.5 Tf")
  op("0.83 0.69 0.22 rg")
  op(`46 ${boxY + boxH - 15} Td`)
  op(`(${escapePdfText("DELIVER TO (PATRON)")}) Tj`)
  op("ET")

  op("BT")
  op("/F2 9.5 Tf")
  op("0.1 0.1 0.1 rg")
  op(`46 ${boxY + boxH - 28} Td`)
  op(`(${escapePdfText(custName)}) Tj`)
  op("ET")

  op("BT")
  op("/F1 8 Tf")
  op("0.35 0.35 0.35 rg")
  op(`46 ${boxY + boxH - 41} Td`)
  op(`(${escapePdfText([street, area].filter(Boolean).join(", "))}) Tj`)
  op("ET")

  op("BT")
  op("/F1 8 Tf")
  op("0.35 0.35 0.35 rg")
  op(`46 ${boxY + boxH - 53} Td`)
  op(`(${escapePdfText(`${city}, ${state} - PIN ${pincode}`)}) Tj`)
  op("ET")

  op("BT")
  op("/F1 7.5 Tf")
  op("0.45 0.45 0.45 rg")
  op(`46 ${boxY + boxH - 66} Td`)
  op(`(${escapePdfText(`Phone: ${custPhone} | Email: ${custEmail}`)}) Tj`)
  op("ET")

  // Right Card: Atelier Dispatch
  const rightBoxX = 304
  op("0.98 0.98 0.99 rg")
  op(`${rightBoxX} ${boxY} ${boxW} ${boxH} re f`)
  op("0.85 0.85 0.88 RG")
  op(`${rightBoxX} ${boxY} ${boxW} ${boxH} re S`)

  op("BT")
  op("/F2 8.5 Tf")
  op("0.83 0.69 0.22 rg")
  op(`${rightBoxX + 10} ${boxY + boxH - 15} Td`)
  op(`(${escapePdfText("DISPATCH FROM (ATELIER)")}) Tj`)
  op("ET")

  op("BT")
  op("/F2 9.5 Tf")
  op("0.1 0.1 0.1 rg")
  op(`${rightBoxX + 10} ${boxY + boxH - 28} Td`)
  op(`(${escapePdfText("Gayatri Bhai Luxury Atelier Pvt. Ltd.")}) Tj`)
  op("ET")

  op("BT")
  op("/F1 8 Tf")
  op("0.35 0.35 0.35 rg")
  op(`${rightBoxX + 10} ${boxY + boxH - 41} Td`)
  op(`(${escapePdfText("102 Heritage Craft Court, Scheme 54")}) Tj`)
  op("ET")

  op("BT")
  op("/F1 8 Tf")
  op("0.35 0.35 0.35 rg")
  op(`${rightBoxX + 10} ${boxY + boxH - 53} Td`)
  op(`(${escapePdfText("Indore, Madhya Pradesh - 452001, India")}) Tj`)
  op("ET")

  op("BT")
  op("/F1 7.5 Tf")
  op("0.45 0.45 0.45 rg")
  op(`${rightBoxX + 10} ${boxY + boxH - 66} Td`)
  op(`(${escapePdfText(`Concierge: care@gayatribhai.com | +91 98765 43210`)}) Tj`)
  op("ET")

  // ─────────────────────────────────────────────────────────────
  // 4. ITEM DESCRIPTION TABLE
  // ─────────────────────────────────────────────────────────────
  const tableStartY = 582
  const tableHeaderH = 22

  // Table header fill
  op("0.1 0.1 0.12 rg")
  op(`36 ${tableStartY - tableHeaderH} 523.28 ${tableHeaderH} re f`)

  // Table header text
  op("BT")
  op("/F2 8 Tf")
  op("1 1 1 rg")
  op(`46 ${tableStartY - 15} Td`)
  op(`(${escapePdfText("#")}) Tj`)
  op("ET")

  op("BT")
  op("/F2 8 Tf")
  op("1 1 1 rg")
  op(`66 ${tableStartY - 15} Td`)
  op(`(${escapePdfText("GARMENT / ITEM DESCRIPTION")}) Tj`)
  op("ET")

  op("BT")
  op("/F2 8 Tf")
  op("1 1 1 rg")
  op(`310 ${tableStartY - 15} Td`)
  op(`(${escapePdfText("SIZE")}) Tj`)
  op("ET")

  op("BT")
  op("/F2 8 Tf")
  op("1 1 1 rg")
  op(`365 ${tableStartY - 15} Td`)
  op(`(${escapePdfText("QTY")}) Tj`)
  op("ET")

  op("BT")
  op("/F2 8 Tf")
  op("1 1 1 rg")
  op(`415 ${tableStartY - 15} Td`)
  op(`(${escapePdfText("RATE (INR)")}) Tj`)
  op("ET")

  op("BT")
  op("/F2 8 Tf")
  op("1 1 1 rg")
  op(`495 ${tableStartY - 15} Td`)
  op(`(${escapePdfText("AMOUNT (INR)")}) Tj`)
  op("ET")

  // Render Table Rows
  let currentY = tableStartY - tableHeaderH
  const rowHeight = 24

  normalizedItems.forEach((item, i) => {
    currentY -= rowHeight

    // Alternating row background
    if (i % 2 === 1) {
      op("0.97 0.97 0.98 rg")
      op(`36 ${currentY} 523.28 ${rowHeight} re f`)
    }

    // Row bottom border
    op("0.88 0.88 0.9 RG")
    op("0.5 w")
    op(`36 ${currentY} m 559.28 ${currentY} l S`)

    // Index
    op("BT")
    op("/F1 8 Tf")
    op("0.3 0.3 0.3 rg")
    op(`46 ${currentY + 8} Td`)
    op(`(${item.index}) Tj`)
    op("ET")

    // Name & Color
    op("BT")
    op("/F2 8.5 Tf")
    op("0.1 0.1 0.1 rg")
    op(`66 ${currentY + 8} Td`)
    const shortName = item.name.length > 38 ? item.name.slice(0, 35) + "..." : item.name
    op(`(${escapePdfText(shortName)}) Tj`)
    op("ET")

    // Size
    op("BT")
    op("/F1 8.5 Tf")
    op("0.2 0.2 0.2 rg")
    op(`315 ${currentY + 8} Td`)
    op(`(${escapePdfText(item.size)}) Tj`)
    op("ET")

    // Qty
    op("BT")
    op("/F1 8.5 Tf")
    op("0.2 0.2 0.2 rg")
    op(`370 ${currentY + 8} Td`)
    op(`(${item.qty}) Tj`)
    op("ET")

    // Unit Price
    op("BT")
    op("/F1 8.5 Tf")
    op("0.2 0.2 0.2 rg")
    op(`415 ${currentY + 8} Td`)
    op(`(${escapePdfText("Rs. " + item.unitPrice.toLocaleString("en-IN"))}) Tj`)
    op("ET")

    // Item Total
    op("BT")
    op("/F2 8.5 Tf")
    op("0.1 0.1 0.1 rg")
    op(`495 ${currentY + 8} Td`)
    op(`(${escapePdfText("Rs. " + item.totalItemPrice.toLocaleString("en-IN"))}) Tj`)
    op("ET")
  })

  // Table outer vertical border
  op("0.85 0.85 0.88 RG")
  op("0.5 w")
  const totalTableH = tableHeaderH + normalizedItems.length * rowHeight
  op(`36 ${tableStartY - totalTableH} 523.28 ${totalTableH} re S`)

  // ─────────────────────────────────────────────────────────────
  // 5. SUMMARY & TOTALS BREAKDOWN
  // ─────────────────────────────────────────────────────────────
  const summaryTopY = currentY - 14
  const summaryW = 220
  const summaryX = 339.28

  // Subtotal line
  op("BT")
  op("/F1 8.5 Tf")
  op("0.35 0.35 0.35 rg")
  op(`${summaryX} ${summaryTopY} Td`)
  op(`(${escapePdfText("Subtotal:")}) Tj`)
  op("ET")

  op("BT")
  op("/F1 8.5 Tf")
  op("0.1 0.1 0.1 rg")
  op(`490 ${summaryTopY} Td`)
  op(`(${escapePdfText("Rs. " + rawSubtotal.toLocaleString("en-IN"))}) Tj`)
  op("ET")

  // Courier shipping
  op("BT")
  op("/F1 8.5 Tf")
  op("0.35 0.35 0.35 rg")
  op(`${summaryX} ${summaryTopY - 16} Td`)
  op(`(${escapePdfText("Courier Shipping:")}) Tj`)
  op("ET")

  op("BT")
  op("/F2 8.5 Tf")
  op(rawShipping === 0 ? "0.12 0.52 0.28 rg" : "0.1 0.1 0.1 rg")
  op(`490 ${summaryTopY - 16} Td`)
  op(`(${escapePdfText(rawShipping === 0 ? "FREE" : "Rs. " + rawShipping.toLocaleString("en-IN"))}) Tj`)
  op("ET")

  // Discount (if any)
  if (rawDiscount > 0) {
    op("BT")
    op("/F1 8.5 Tf")
    op("0.7 0.2 0.15 rg")
    op(`${summaryX} ${summaryTopY - 32} Td`)
    op(`(${escapePdfText("Atelier Privilege Discount:")}) Tj`)
    op("ET")

    op("BT")
    op("/F2 8.5 Tf")
    op("0.7 0.2 0.15 rg")
    op(`490 ${summaryTopY - 32} Td`)
    op(`(${escapePdfText("- Rs. " + rawDiscount.toLocaleString("en-IN"))}) Tj`)
    op("ET")
  }

  // Tax breakdown
  const taxY = rawDiscount > 0 ? summaryTopY - 48 : summaryTopY - 32
  op("BT")
  op("/F1 7.5 Tf")
  op("0.5 0.5 0.5 rg")
  op(`${summaryX} ${taxY} Td`)
  op(`(${escapePdfText(`Includes GST @ 5% (CGST + SGST):`)}) Tj`)
  op("ET")

  op("BT")
  op("/F1 7.5 Tf")
  op("0.4 0.4 0.4 rg")
  op(`490 ${taxY} Td`)
  op(`(${escapePdfText(`Rs. ${gstIncluded.toLocaleString("en-IN")}`)}) Tj`)
  op("ET")

  // Grand Total Box
  const totalBoxY = taxY - 32
  op("0.05 0.05 0.07 rg")
  op(`${summaryX} ${totalBoxY} ${summaryW} 26 re f`)
  op("0.83 0.69 0.22 RG")
  op("1 w")
  op(`${summaryX} ${totalBoxY} ${summaryW} 26 re S`)

  op("BT")
  op("/F2 9.5 Tf")
  op("1 1 1 rg")
  op(`${summaryX + 10} ${totalBoxY + 8} Td`)
  op(`(${escapePdfText("TOTAL PAID (INR):")}) Tj`)
  op("ET")

  op("BT")
  op("/F2 10.5 Tf")
  op("0.83 0.69 0.22 rg")
  op(`468 ${totalBoxY + 8} Td`)
  op(`(${escapePdfText("Rs. " + rawTotal.toLocaleString("en-IN"))}) Tj`)
  op("ET")

  // ─────────────────────────────────────────────────────────────
  // 6. ATELIER DIGITAL SEAL & SIGNATURE (Left & Bottom)
  // ─────────────────────────────────────────────────────────────
  const noteBoxY = totalBoxY - 70

  // Left Note Box
  op("0.97 0.97 0.98 rg")
  op(`36 ${noteBoxY} 275 62 re f`)
  op("0.85 0.85 0.88 RG")
  op("0.5 w")
  op(`36 ${noteBoxY} 275 62 re S`)

  op("BT")
  op("/F2 8 Tf")
  op("0.83 0.69 0.22 rg")
  op(`46 ${noteBoxY + 48} Td`)
  op(`(${escapePdfText("ATELIER ASSURANCE & TERMS")}) Tj`)
  op("ET")

  op("BT")
  op("/F1 7.5 Tf")
  op("0.35 0.35 0.35 rg")
  op(`46 ${noteBoxY + 35} Td`)
  op(`(${escapePdfText("1. 100% Heirloom French Linen & Generational Craftsmanship.")}) Tj`)
  op("ET")

  op("BT")
  op("/F1 7.5 Tf")
  op("0.35 0.35 0.35 rg")
  op(`46 ${noteBoxY + 23} Td`)
  op(`(${escapePdfText("2. Complimentary 7-Day Hassle-Free Returns & Size Exchanges.")}) Tj`)
  op("ET")

  op("BT")
  op("/F1 7.5 Tf")
  op("0.35 0.35 0.35 rg")
  op(`46 ${noteBoxY + 11} Td`)
  op(`(${escapePdfText("3. Handcrafted in India. Computer generated official tax invoice.")}) Tj`)
  op("ET")

  // Right Signatory Box
  op("0.97 0.97 0.98 rg")
  op(`339.28 ${noteBoxY} ${summaryW} 62 re f`)
  op("0.85 0.85 0.88 RG")
  op("0.5 w")
  op(`339.28 ${noteBoxY} ${summaryW} 62 re S`)

  op("BT")
  op("/F2 7.5 Tf")
  op("0.12 0.48 0.28 rg")
  op(`349 ${noteBoxY + 48} Td`)
  op(`(${escapePdfText("[ VERIFIED & DIGITALLY AUTHENTICATED ]")}) Tj`)
  op("ET")

  op("BT")
  op("/F2 9 Tf")
  op("0.1 0.1 0.1 rg")
  op(`349 ${noteBoxY + 32} Td`)
  op(`(${escapePdfText("Gayatri Puri")}) Tj`)
  op("ET")

  op("BT")
  op("/F1 7.5 Tf")
  op("0.4 0.4 0.4 rg")
  op(`349 ${noteBoxY + 20} Td`)
  op(`(${escapePdfText("Authorized Signatory • Gayatri Bhai Atelier")}) Tj`)
  op("ET")

  op("BT")
  op("/F1 7 Tf")
  op("0.55 0.55 0.55 rg")
  op(`349 ${noteBoxY + 9} Td`)
  op(`(${escapePdfText(`Verified at: ${dateFormatted}`)}) Tj`)
  op("ET")

  // ─────────────────────────────────────────────────────────────
  // 7. FOOTER STRIP
  // ─────────────────────────────────────────────────────────────
  // Gold hairline divider at Y=45
  op("0.83 0.69 0.22 RG")
  op("0.75 w")
  op("36 45 m 559.28 45 l S")

  op("BT")
  op("/F1 7.5 Tf")
  op("0.35 0.35 0.35 rg")
  op("36 32 Td")
  op(`(${escapePdfText("Gayatri Bhai Atelier • 102 Heritage Craft Court, Scheme 54, Indore, MP 452001 • Helpline: +91 98765 43210")}) Tj`)
  op("ET")

  op("BT")
  op("/F1 7.5 Tf")
  op("0.83 0.69 0.22 rg")
  op("425 32 Td")
  op(`(${escapePdfText("www.gayatribhai.com")}) Tj`)
  op("ET")

  op("BT")
  op("/F1 6.5 Tf")
  op("0.6 0.6 0.6 rg")
  op("36 21 Td")
  op(`(${escapePdfText("Thank you for choosing Gayatri Bhai. For bespoke sizing inquiries, reach us at care@gayatribhai.com")}) Tj`)
  op("ET")

  // ─────────────────────────────────────────────────────────────
  // COMPILE VALID VECTOR PDF-1.4 BYTE STREAM
  // ─────────────────────────────────────────────────────────────
  const streamContent = chunks.join("\n")
  const streamLength = Buffer.byteLength(streamContent, "utf8")

  const objects: string[] = []
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>"
  objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>"
  objects[3] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>`
  objects[4] = `<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`
  objects[5] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`
  objects[6] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`

  let pdfOutput = "%PDF-1.4\n"
  const offsets: number[] = []

  for (let i = 1; i < objects.length; i++) {
    offsets[i] = Buffer.byteLength(pdfOutput, "utf8")
    pdfOutput += `${i} 0 obj\n${objects[i]}\nendobj\n`
  }

  const xrefOffset = Buffer.byteLength(pdfOutput, "utf8")
  pdfOutput += "xref\n"
  pdfOutput += `0 ${objects.length}\n`
  pdfOutput += "0000000000 65535 f \n"

  for (let i = 1; i < objects.length; i++) {
    const offStr = String(offsets[i]).padStart(10, "0")
    pdfOutput += `${offStr} 00000 n \n`
  }

  pdfOutput += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\n`
  pdfOutput += `startxref\n${xrefOffset}\n%%EOF\n`

  return Buffer.from(pdfOutput, "utf8")
}
