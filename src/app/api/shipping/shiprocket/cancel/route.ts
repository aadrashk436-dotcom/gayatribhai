export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    const { orderId, orderIds, reason } = body;

    const targetIds: string[] = Array.isArray(orderIds)
      ? orderIds
      : orderId
      ? [String(orderId)]
      : [];

    if (!targetIds.length) {
      return NextResponse.json(
        { error: "Order ID or orderIds is required to cancel shipment." },
        { status: 400 }
      );
    }

    const db = readDb();
    const orders: any[] = db.orders || [];

    const targetIdStrs = targetIds.map((t: any) => String(t).trim().toUpperCase());
    const matchedOrders = orders.filter(
      (o) =>
        targetIdStrs.includes(String(o.id || "").trim().toUpperCase()) ||
        targetIdStrs.includes(String(o.orderNumber || "").trim().toUpperCase())
    );

    if (!matchedOrders.length) {
      return NextResponse.json({ error: "Order(s) not found." }, { status: 404 });
    }

    const cancelReason =
      reason || "Shipment and order cancelled by Store Admin via Shiprocket";

    const cancelledResults: any[] = [];

    for (const order of matchedOrders) {
      let srShipmentCancelled = false;
      let srOrderCancelled = false;

      // 1. Cancel on Shiprocket if AWB exists
      if (order.awb && !String(order.awb).startsWith("AWB-SR-")) {
        try {
          const awbRes = await cancelShiprocketShipmentAWBs([order.awb]);
          if (awbRes && !awbRes.error) {
            srShipmentCancelled = true;
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
            srOrderCancelled = true;
          }
        } catch (srErr) {
          console.warn("Shiprocket order cancel note:", srErr);
        }
      }

      // 3. Update order in database
      order.status = "Cancelled";
      order.cancelReason = cancelReason;
      order.cancelledAt = new Date().toISOString();
      order.updatedAt = new Date().toISOString();
      order.shiprocketCancelled = srShipmentCancelled || srOrderCancelled;

      cancelledResults.push({
        orderId: order.id,
        orderNumber: order.orderNumber || order.id,
        status: "Cancelled",
        awb: order.awb || null,
        shiprocketCancelled: order.shiprocketCancelled,
      });
    }

    writeDb(db);

    return NextResponse.json({
      success: true,
      message: `Successfully cancelled ${cancelledResults.length} order(s) & Shiprocket shipment(s)!`,
      cancelledOrders: cancelledResults,
      count: cancelledResults.length,
    });
  } catch (err: any) {
    console.error("Shiprocket shipment cancel error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to cancel shipment." },
      { status: 500 }
    );
  }
}
