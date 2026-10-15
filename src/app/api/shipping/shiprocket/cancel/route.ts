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
    const { orderId, orderIds, reason, shipmentOnly } = body;

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
      reason || (shipmentOnly ? "Shipment cancelled by Admin (order retained for re-shipping)" : "Shipment and order cancelled by Store Admin via Shiprocket");

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

      // 2. If full order cancellation, cancel on Shiprocket by Order ID
      if (!shipmentOnly && order.shiprocket_order_id) {
        try {
          const orderRes = await cancelShiprocketOrder([order.shiprocket_order_id]);
          if (orderRes && !orderRes.error) {
            srOrderCancelled = true;
          }
        } catch (srErr) {
          console.warn("Shiprocket order cancel note:", srErr);
        }
      }

      if (shipmentOnly) {
        // Reset shipment details but keep order active for re-assignment
        order.status = "Verified";
        order.previousAwb = order.awb;
        order.awb = null;
        order.courier = null;
        order.courierName = null;
        order.shipmentCancelledAt = new Date().toISOString();
        order.shipmentCancelReason = cancelReason;
        order.updatedAt = new Date().toISOString();

        cancelledResults.push({
          orderId: order.id,
          orderNumber: order.orderNumber || order.id,
          status: "Verified",
          shipmentCancelled: true,
          message: "Shipment cancelled. Order reverted to Verified status.",
        });
      } else {
        // Full order cancellation
        order.status = "Cancelled";
        order.cancelReason = cancelReason;
        order.cancelledAt = new Date().toISOString();
        order.updatedAt = new Date().toISOString();
        order.shiprocketCancelled = srShipmentCancelled || srOrderCancelled;

        // If online order was paid, mark as Refund Pending for admin action
        const isOnlinePaid =
          order.paymentStatus === "Paid" &&
          (order.paymentMethod?.includes("Razorpay") || order.paymentMethod?.includes("Online") || order.razorpayPaymentId);
        if (isOnlinePaid && order.paymentStatus !== "Refunded") {
          order.paymentStatus = "Refund Pending";
        }

        cancelledResults.push({
          orderId: order.id,
          orderNumber: order.orderNumber || order.id,
          status: "Cancelled",
          paymentStatus: order.paymentStatus,
          awb: order.awb || null,
          shiprocketCancelled: order.shiprocketCancelled,
        });
      }
    }

    writeDb(db);

    return NextResponse.json({
      success: true,
      message: shipmentOnly
        ? `Successfully cancelled shipment on Shiprocket for ${cancelledResults.length} order(s). Ready to re-assign!`
        : `Successfully cancelled ${cancelledResults.length} order(s) & Shiprocket shipment(s)!`,
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
