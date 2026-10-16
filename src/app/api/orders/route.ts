export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { products } from "@/products";
import { cancelShiprocketOrder, cancelShiprocketShipmentAWBs } from "@/lib/shiprocket";
import {
  getDbPath,
  normalizeOrder,
  readStoredOrders,
  saveOrderRecord,
} from "@/lib/orders";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");
    const userId = searchParams.get("userId");
    const id = searchParams.get("id");
    const ids = searchParams.get("ids");

    const orders = readStoredOrders();

    // Sort newest first
    orders.sort((a: any, b: any) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    if (id) {
      const cleanId = id.trim().toLowerCase();
      const order = orders.find(
        (o: any) => (o.id && o.id.toLowerCase() === cleanId) ||
                    (o.orderNumber && o.orderNumber.toLowerCase() === cleanId)
      );
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      return NextResponse.json({ order });
    }

    if (ids) {
      const idList = ids.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      const matchedOrders = orders.filter((o: any) =>
        idList.includes((o.id || "").toLowerCase()) ||
        idList.includes((o.orderNumber || "").toLowerCase())
      );
      return NextResponse.json({ orders: matchedOrders, total: matchedOrders.length });
    }

    if (email || phone || userId) {
      const cleanEmail = email ? email.trim().toLowerCase() : null;
      const cleanPhoneDigits = phone ? phone.replace(/\D/g, "").slice(-10) : null;

      const userOrders = orders.filter((o: any) => {
        const orderEmail = (o.customerEmail || o.email || o.shippingAddress?.email || "").trim().toLowerCase();
        const isGenericFallback = orderEmail === "care@gayatribhai.com";
        const emailMatch = Boolean(cleanEmail && orderEmail && !isGenericFallback && orderEmail === cleanEmail);

        const rawPhone = (o.customerPhone || o.phone || o.shippingAddress?.phone || "").replace(/\D/g, "").slice(-10);
        const isGenericPhone = rawPhone === "9876543210";
        const phoneMatch = Boolean(cleanPhoneDigits && rawPhone.length >= 10 && !isGenericPhone && rawPhone === cleanPhoneDigits);

        const userIdMatch = Boolean(userId && o.userId && o.userId === userId);

        return emailMatch || phoneMatch || userIdMatch;
      });
      return NextResponse.json({ orders: userOrders, total: userOrders.length });
    }

    return NextResponse.json({ orders, total: orders.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.items || !body.items.length) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 });
    }

    const orderNumber = body.orderNumber || "GB-" + Date.now().toString().slice(-6);
    const order = {
      id: body.id || `ord_${Date.now()}`,
      orderNumber,
      customerName: body.address?.name || body.customerName || "Customer",
      customerEmail: body.customerEmail || body.address?.email || "care@gayatribhai.com",
      customerPhone: body.address?.phone || body.customerPhone || "+91 98765 43210",
      shippingAddress: body.address || {},
      items: body.items,
      total: body.total || 0,
      subtotal: body.subtotal || body.total || 0,
      paymentMethod: body.paymentMethod || "ONLINE_RAZORPAY",
      paymentStatus: body.paymentStatus || "PENDING",
      status: "PROCESSING",
      razorpayOrderId: body.razorpayOrderId || null,
      razorpayPaymentId: body.razorpayPaymentId || null,
      createdAt: new Date().toISOString(),
    };

    const saved = saveOrderRecord(order);

    return NextResponse.json({ success: true, order: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create order record" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, orderIds, status, courier, awb, cancelReason, verified, paymentStatus } = body;

    const orders = readStoredOrders();
    const targetIds = orderIds || (orderId ? [orderId] : []);

    if (!targetIds.length) {
      return NextResponse.json({ error: "Order ID(s) required" }, { status: 400 });
    }

    const targetIdStrs = targetIds.map((t: any) => String(t).trim().toUpperCase());

    // When status is Cancelled, cancel active Shiprocket shipment & order as well
    if (status === "Cancelled" || status === "CANCELLED") {
      const ordersToCancel = orders.filter((o: any) => {
        return (
          targetIdStrs.includes(String(o.id || "").trim().toUpperCase()) ||
          targetIdStrs.includes(String(o.orderNumber || "").trim().toUpperCase())
        );
      });

      for (const ord of ordersToCancel) {
        if (ord.awb && !String(ord.awb).startsWith("AWB-SR-")) {
          try {
            await cancelShiprocketShipmentAWBs([ord.awb]);
          } catch (e) {
            console.warn("Shiprocket AWB cancel note:", e);
          }
        }
        if (ord.shiprocket_order_id) {
          try {
            await cancelShiprocketOrder([ord.shiprocket_order_id]);
          } catch (e) {
            console.warn("Shiprocket order cancel note:", e);
          }
        }
      }
    }

    const updatedOrders = orders.map((o: any) => {
      const matches =
        targetIdStrs.includes(String(o.id || "").trim().toUpperCase()) ||
        targetIdStrs.includes(String(o.orderNumber || "").trim().toUpperCase());

      if (matches) {
        const isNowDelivered = status === "Delivered" || status === "delivered";
        const newPaymentStatus =
          paymentStatus ||
          (isNowDelivered && (o.paymentMethod === "Cash on Delivery" || o.paymentMethod === "COD") ? "Paid" : o.paymentStatus);

        return {
          ...o,
          ...(status && { status }),
          ...(courier && { courier, courierName: courier }),
          ...(awb && { awb }),
          ...(cancelReason && { cancelReason }),
          ...(verified !== undefined && { verified, verifiedAt: new Date().toISOString() }),
          ...(newPaymentStatus && { paymentStatus: newPaymentStatus }),
          updatedAt: new Date().toISOString(),
        };
      }
      return o;
    });

    try {
      const dbPath = getDbPath();
      if (fs.existsSync(dbPath)) {
        const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        data.orders = updatedOrders;
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
      }
    } catch (saveErr) {
      console.warn("Could not save updated orders to file:", saveErr);
    }

    return NextResponse.json({ success: true, updatedCount: targetIds.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update orders" }, { status: 500 });
  }
}
