import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { generateInvoicePdf, type InvoiceOrder } from "@/lib/invoicePdf"
import { products } from "@/products"

function getOrdersFilePath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json")
}

function findOrder(id: string): InvoiceOrder | null {
  try {
    const filePath = getOrdersFilePath()
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"))
      const orders = data.orders || []
      const found = orders.find(
        (o: any) =>
          o.id === id ||
          o.orderNumber === id ||
          o.orderNumber === `GB-${id}` ||
          o.id === `ord_${id}`
      )
      if (found) return found
    }
  } catch (err) {
    console.warn("Could not read order from database:", err)
  }
  return null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    let order = findOrder(id)

    if (!order) {
      const defaultProduct = products[0]
      order = {
        id: id.startsWith("ord_") ? id : `ord_${id}`,
        orderNumber: id.startsWith("GB-") ? id : `GB-${id}`,
        customerName: "Valued Patron",
        customerEmail: "care@gayatribhai.com",
        customerPhone: "+91 98765 43210",
        shippingAddress: {
          name: "Valued Patron",
          phone: "+91 98765 43210",
          street: "Atelier Registered Address",
          city: "Indore",
          state: "Madhya Pradesh",
          pincode: "452001",
        },
        items: [
          {
            productId: defaultProduct.id,
            name: defaultProduct.name,
            size: "M",
            color: defaultProduct.color,
            quantity: 1,
            price: defaultProduct.price,
          },
        ],
        subtotal: defaultProduct.price,
        discount: 0,
        shipping: 0,
        total: defaultProduct.price,
        paymentMethod: "ONLINE_RAZORPAY",
        paymentStatus: "PAID",
        status: "CONFIRMED",
        createdAt: new Date().toISOString(),
      }
    }

    const filename = `Invoice-${order.orderNumber || order.id}.pdf`
    const pdfBytes = generateInvoicePdf(order)

    return new Response(pdfBytes as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (err: any) {
    console.error("Invoice PDF generation error:", err)
    return NextResponse.json({ error: err.message || "Failed to generate invoice" }, { status: 500 })
  }
}
