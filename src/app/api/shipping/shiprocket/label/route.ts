import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { generateShiprocketLabel } from "@/lib/shiprocket";

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

import { generateShippingLabelHTML } from "@/lib/shippingLabel";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const shipmentId = searchParams.get("shipmentId");

    if (!orderId && !shipmentId) {
      return new Response("Order ID or Shipment ID is required", { status: 400 });
    }

    const db = readDb();
    const orders: any[] = db.orders || [];

    const order = orders.find(
      (o) =>
        String(o.id).toUpperCase() === String(orderId).toUpperCase() ||
        String(o.orderNumber).toUpperCase() === String(orderId).toUpperCase() ||
        (shipmentId && String(o.shiprocket_shipment_id) === String(shipmentId))
    );

    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    const html = generateShippingLabelHTML(order, {
      awb_number: order.awb,
      courier_name: order.courierName || order.courier,
      shipment_id: order.shiprocket_shipment_id || shipmentId || undefined,
    });

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err: any) {
    console.error("GET shipping label error:", err);
    return new Response(`Error generating label: ${err.message}`, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, shipmentId, format } = body;

    if (!orderId && !shipmentId) {
      return NextResponse.json(
        { error: "Order ID or Shipment ID is required to generate shipping label." },
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

    // CRITICAL CONDITION: Only allow downloading label if shipment has been assigned with AWB
    const hasAwb = Boolean(order?.awb);
    const hasShipment = Boolean(order?.shiprocket_shipment_id || shipmentId);
    const isAssigned =
      order?.status === "Assigned to Courier" ||
      order?.status === "Dispatched" ||
      order?.status === "Delivered";

    if (!hasAwb && !isAssigned && !shipmentId) {
      return NextResponse.json(
        {
          error:
            "Shipment is not yet assigned. Shipping label can only be downloaded after courier & AWB are assigned.",
          notAssigned: true,
        },
        { status: 400 }
      );
    }

    const customLabelUrl = `/api/shipping/shiprocket/label?orderId=${encodeURIComponent(order?.id || orderId)}&format=html`;

    if (format === "html") {
      return NextResponse.json({
        success: true,
        label_url: customLabelUrl,
        custom_label_url: customLabelUrl,
      });
    }

    const targetShipmentId = shipmentId || order?.shiprocket_shipment_id;

    if (!targetShipmentId) {
      return NextResponse.json({
        success: true,
        label_url: customLabelUrl,
        custom_label_url: customLabelUrl,
        message: "Generated custom barcode shipping label.",
      });
    }

    const result = await generateShiprocketLabel(targetShipmentId);

    if (result?.label_url) {
      return NextResponse.json({
        success: true,
        label_url: result.label_url,
        custom_label_url: customLabelUrl,
        message: result.message || "Shipping label generated successfully!",
      });
    }

    // Graceful fallback to custom printable label with barcode if Shiprocket PDF is unavailable
    return NextResponse.json({
      success: true,
      label_url: customLabelUrl,
      custom_label_url: customLabelUrl,
      message: "Generated custom branded shipping label.",
    });
  } catch (err: any) {
    console.error("Shiprocket label generation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process shipping label request." },
      { status: 500 }
    );
  }
}
