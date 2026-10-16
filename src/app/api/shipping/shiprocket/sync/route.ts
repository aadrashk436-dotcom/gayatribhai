import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { trackShiprocketShipment, trackShiprocketAWB, extractShiprocketStatus } from "@/lib/shiprocket";

export const dynamic = "force-dynamic";

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
    const db = readDb();
    const orders: any[] = db.orders || [];

    // Filter active orders that have an assigned AWB and are not final (delivered or cancelled)
    const activeOrders = orders.filter(
      (o) =>
        Boolean(o.awb && o.awb !== "null" && String(o.awb).length > 3) &&
        o.status !== "Delivered" &&
        o.status !== "Cancelled"
    );

    let updatedCount = 0;
    const updateDetails: any[] = [];

    // Fetch tracking concurrently for active orders
    await Promise.allSettled(
      activeOrders.map(async (order) => {
        try {
          let trackRes: any = null;

          if (order.shiprocket_shipment_id) {
            try {
              trackRes = await trackShiprocketShipment(order.shiprocket_shipment_id);
            } catch (e) {
              // fallback to awb
            }
          }

          if (!trackRes?.tracking_data && order.awb && !String(order.awb).startsWith("AWB-SR-")) {
            try {
              trackRes = await trackShiprocketAWB(order.awb);
            } catch (e) {
              // ignore
            }
          }

          if (trackRes?.tracking_data) {
            const trackingData = trackRes.tracking_data || {};
            const activities = trackingData.shipment_track_activities || [];
            const latestActivity = activities[0] || {};
            const parsedSR = extractShiprocketStatus(trackRes);

            const srStatusNum = Number(trackingData.shipment_status);
            const srStatusText = (parsedSR.status || latestActivity.activity || trackingData.current_status || "").toLowerCase();

            let newStatus = order.status;
            if (srStatusNum === 7 || srStatusText.includes("delivered")) {
              newStatus = "Delivered";
            } else if (
              srStatusNum === 6 ||
              srStatusNum === 17 ||
              srStatusNum === 18 ||
              srStatusText.includes("out for delivery") ||
              srStatusText.includes("in transit")
            ) {
              newStatus = "Dispatched";
            } else if (srStatusNum === 8 || srStatusText.includes("cancel")) {
              newStatus = "Cancelled";
            }

            const currentStatusText = parsedSR.statusText || latestActivity.activity || order.currentStatusText;
            const shiprocketStatus = parsedSR.status || order.shiprocketStatus;
            const etd = parsedSR.edd || trackingData.etd || order.etd;

            let changed = false;
            if (newStatus !== order.status) {
              order.status = newStatus;
              if (newStatus === "Delivered") {
                order.paymentStatus = "Paid";
              }
              changed = true;
            }

            if (currentStatusText && order.currentStatusText !== currentStatusText) {
              order.currentStatusText = currentStatusText;
              changed = true;
            }

            if (shiprocketStatus && order.shiprocketStatus !== shiprocketStatus) {
              order.shiprocketStatus = shiprocketStatus;
              changed = true;
            }

            if (parsedSR.courierName && (!order.courier || order.courier === "Shiprocket Express Partner")) {
              order.courier = parsedSR.courierName;
              order.courierName = parsedSR.courierName;
              changed = true;
            }

            if (etd && order.etd !== etd) {
              order.etd = etd;
              changed = true;
            }

            if (changed) {
              order.updatedAt = new Date().toISOString();
              updatedCount++;
              updateDetails.push({
                orderId: order.id,
                awb: order.awb,
                status: order.status,
                shiprocketStatus: order.shiprocketStatus,
                currentStatusText: order.currentStatusText,
              });
            }
          }
        } catch (err) {
          console.warn(`Sync failed for order ${order.id}:`, err);
        }
      })
    );

    if (updatedCount > 0) {
      db.orders = orders;
      writeDb(db);
    }

    return NextResponse.json({
      success: true,
      totalActiveOrders: activeOrders.length,
      updatedCount,
      updates: updateDetails,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Shiprocket bulk sync error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to sync Shiprocket live status." },
      { status: 500 }
    );
  }
}
