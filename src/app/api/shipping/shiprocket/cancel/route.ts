import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { cancelShiprocketOrder, cancelShiprocketShipmentAWBs } from "@/lib/shiprocket";

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

function writeDb(data: any) {
  const dbPath = getDbPath();
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing db.json:", err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, reason } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required to cancel shipment." },
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

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    let srCancelled = false;

    // 1. Cancel on Shiprocket if AWB exists
    if (order.awb) {
      try {
        const awbRes = await cancelShiprocketShipmentAWBs([order.awb]);
        if (awbRes && !awbRes.error) {
          srCancelled = true;
        }
      } catch (srErr) {
        console.warn("Shiprocket AWB cancel note:", srErr);
      }
    }

    // 2. Cancel on Shiprocket by Order ID if present
    if (order.shiprocket_order_id) {
      try {
        const orderRes = await cancelShiprocketOrder([order.shiprocket_order_id]);
        if (orderRes && !orderRes.error) {
          srCancelled = true;
        }
      } catch (srErr) {
        console.warn("Shiprocket order cancel note:", srErr);
      }
    }

    // 3. Update order in database
    order.status = "Cancelled";
    order.cancelReason = reason || "Shipment cancelled by Store Admin via Shiprocket";
    order.cancelledAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    writeDb(db);

    return NextResponse.json({
      success: true,
      message: `Order #${order.orderNumber || order.id} and Shiprocket shipment have been cancelled.`,
      shiprocketCancelled: srCancelled,
      order,
    });
  } catch (err: any) {
    console.error("Shiprocket shipment cancel error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to cancel shipment." },
      { status: 500 }
    );
  }
}
