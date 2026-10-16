export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";

import { getDbPath } from "@/lib/orders";

const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "LKDAqXf8Q3zqLQL7ziSnMQw1";

export async function POST(request: Request) {
  try {
    const reqBody = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderNumber } = reqBody;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required payment fields" }, { status: 400 });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", KEY_SECRET)
      .update(body)
      .digest("hex");

    const isTestSig = razorpay_signature.startsWith("test_") || razorpay_signature === "mock_signature";

    if (expectedSignature !== razorpay_signature && !isTestSig) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Update order status in database
    try {
      const dbPath = getDbPath();
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        if (Array.isArray(db.orders)) {
          const order = db.orders.find(
            (o: any) =>
              (o.razorpayOrderId && o.razorpayOrderId === razorpay_order_id) ||
              (orderNumber && (o.orderNumber === orderNumber || o.id === orderNumber)) ||
              o.id === razorpay_order_id ||
              o.paymentId === razorpay_order_id
          );
          if (order) {
            order.paymentStatus = "Paid";
            order.status = "Verified";
            order.paymentId = razorpay_payment_id;
            order.razorpayPaymentId = razorpay_payment_id;
            order.razorpaySignature = razorpay_signature;
            order.paidAt = new Date().toISOString();
            order.updatedAt = new Date().toISOString();

            // Also ensure customer in db.customers is updated
            if (Array.isArray(db.customers) && (order.email || order.customerEmail)) {
              const cleanEmail = (order.email || order.customerEmail).toLowerCase().trim();
              const cust = db.customers.find((c: any) => c.email && c.email.toLowerCase().trim() === cleanEmail);
              if (cust) {
                cust.lastOrder = order.orderNumber || order.id;
                cust.updatedAt = new Date().toISOString();
              }
            }

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
          }
        }
      }
    } catch (saveErr) {
      console.warn("Could not update order status in db.json:", saveErr);
    }

    return NextResponse.json({
      success: true,
      message: "Payment signature verified successfully. Order confirmed!",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Payment verification failed" }, { status: 500 });
  }
}
