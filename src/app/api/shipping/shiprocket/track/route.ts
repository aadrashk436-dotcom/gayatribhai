import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { trackShiprocketShipment, trackShiprocketAWB } from "@/lib/shiprocket";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const awb = searchParams.get("awb");
    const shipmentId = searchParams.get("shipmentId");

    const db = readDb();
    const orders: any[] = db.orders || [];

    let order = null;
    if (orderId) {
      order = orders.find(
        (o) =>
          String(o.id).toUpperCase() === orderId.toUpperCase() ||
          String(o.orderNumber).toUpperCase() === orderId.toUpperCase()
      );
    } else if (awb) {
      order = orders.find((o) => o.awb === awb);
    } else if (shipmentId) {
      order = orders.find((o) => String(o.shiprocket_shipment_id) === String(shipmentId));
    }

    const targetShipmentId = shipmentId || order?.shiprocket_shipment_id;
    const targetAwb = awb || order?.awb;

    if (!targetShipmentId && !targetAwb) {
      return NextResponse.json(
        { error: "No shipment ID or AWB found for this order." },
        { status: 400 }
      );
    }

    let trackRes: any = null;
    if (targetShipmentId) {
      try {
        trackRes = await trackShiprocketShipment(targetShipmentId);
      } catch (e) {
        console.warn("Track by shipment warning:", e);
      }
    }

    if (!trackRes?.tracking_data && targetAwb) {
      try {
        trackRes = await trackShiprocketAWB(targetAwb);
      } catch (e) {
        console.warn("Track by AWB warning:", e);
      }
    }

    const trackingData = trackRes?.tracking_data || {};
    const activities = trackingData.shipment_track_activities || [];
    const latestActivity = activities[0] || {};
    const trackUrl = trackingData.track_url || (targetAwb ? `https://shiprocket.co/tracking/${targetAwb}` : "");

    // Determine normalized status from Shiprocket
    const srStatusNum = Number(trackingData.shipment_status);
    const srStatusText = (latestActivity.activity || trackingData.current_status || "").toLowerCase();

    let newStatus = order?.status;
    if (srStatusNum === 7 || srStatusText.includes("delivered")) {
      newStatus = "Delivered";
    } else if (
      srStatusNum === 6 ||
      srStatusNum === 17 ||
      srStatusNum === 18 ||
      srStatusText.includes("out for delivery")
    ) {
      newStatus = "Dispatched";
    } else if (srStatusNum === 8 || srStatusText.includes("cancel")) {
      newStatus = "Cancelled";
    } else if (order?.awb && order?.status === "Verified") {
      newStatus = "Assigned to Courier";
    }

    // Auto-update order in database if status progressed
    if (order && newStatus && newStatus !== order.status) {
      order.status = newStatus;
      if (newStatus === "Delivered") {
        order.paymentStatus = "Paid";
      }
      order.updatedAt = new Date().toISOString();
      writeDb(db);
    }

    return NextResponse.json({
      success: true,
      orderId: order?.id || orderId,
      status: order?.status || newStatus,
      courier: order?.courier || "Blue Dart Express Air",
      awb: targetAwb,
      trackUrl,
      etd: trackingData.etd || "3-5 business days",
      currentStatusText: latestActivity.activity || trackingData.current_status || order?.status,
      activities,
      trackingData,
    });
  } catch (err: any) {
    console.error("Tracking route error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve live shipment tracking." },
      { status: 500 }
    );
  }
}
