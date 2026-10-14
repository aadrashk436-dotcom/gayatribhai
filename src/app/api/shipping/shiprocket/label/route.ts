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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, shipmentId } = body;

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

    const targetShipmentId = shipmentId || order?.shiprocket_shipment_id;

    if (!targetShipmentId) {
      return NextResponse.json(
        {
          error: "No Shiprocket shipment ID found for this order. Please re-assign to Shiprocket.",
          notAssigned: true,
        },
        { status: 400 }
      );
    }

    const result = await generateShiprocketLabel(targetShipmentId);

    if (result?.label_url) {
      return NextResponse.json({
        success: true,
        label_url: result.label_url,
        message: result.message || "Shipping label generated successfully!",
      });
    }

    return NextResponse.json(
      {
        error: result?.message || "Failed to generate label from Shiprocket.",
      },
      { status: 502 }
    );
  } catch (err: any) {
    console.error("Shiprocket label generation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process shipping label request." },
      { status: 500 }
    );
  }
}
