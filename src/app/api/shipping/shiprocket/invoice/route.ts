import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { generateShiprocketInvoice } from "@/lib/shiprocket";

function getDbPath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

function readDb() {
  const dbPath = getDbPath();
  if (!fs.existsSync(dbPath)) return { orders: [] };
  try {
    return JSON.parse(fs.readFileSync(dbPath, "utf8"));
  } catch {
    return { orders: [] };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, shiprocketOrderId } = body;

    if (!orderId && !shiprocketOrderId) {
      return NextResponse.json(
        { error: "Order ID or Shiprocket Order ID is required to generate invoice." },
        { status: 400 }
      );
    }

    const db = readDb();
    const orders: any[] = db.orders || [];

    const order = orders.find(
      (o) =>
        String(o.id).toUpperCase() === String(orderId).toUpperCase() ||
        String(o.orderNumber).toUpperCase() === String(orderId).toUpperCase()
    );

    // CRITICAL CONDITION: Only allow downloading invoice if shipment has been assigned with AWB
    const hasAwb = Boolean(order?.awb);
    const hasShiprocketOrder = Boolean(order?.shiprocket_order_id || shiprocketOrderId);
    const isAssigned =
      order?.status === "Assigned to Courier" ||
      order?.status === "Dispatched" ||
      order?.status === "Delivered";

    if (!hasAwb && !isAssigned && !shiprocketOrderId) {
      return NextResponse.json(
        {
          error:
            "Shipment is not yet assigned. Shiprocket invoice can only be generated after courier & AWB are assigned.",
          notAssigned: true,
        },
        { status: 400 }
      );
    }

    const targetOrderId = shiprocketOrderId || order?.shiprocket_order_id;

    if (targetOrderId) {
      try {
        const result = await generateShiprocketInvoice(targetOrderId);
        if (result?.invoice_url) {
          return NextResponse.json({
            success: true,
            invoice_url: result.invoice_url,
            is_shiprocket: true,
            message: "Shiprocket tax invoice generated successfully!",
          });
        }
      } catch (srErr) {
        console.warn("Shiprocket invoice fetch warning:", srErr);
      }
    }

    // Fallback to internal atelier tax invoice if Shiprocket invoice endpoint is pending
    const cleanId = order?.orderNumber || order?.id || orderId;
    return NextResponse.json({
      success: true,
      invoice_url: `/api/orders/invoice?id=${encodeURIComponent(cleanId)}`,
      is_shiprocket: false,
      message: "Atelier tax invoice generated successfully!",
    });
  } catch (err: any) {
    console.error("Invoice generation route error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate invoice." },
      { status: 500 }
    );
  }
}
