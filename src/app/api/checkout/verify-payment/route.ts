import { NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "LKDAqXf8Q3zqLQL7ziSnMQw1";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required payment fields" }, { status: 400 });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Update order status in database
    try {
      const dbPath = path.join(process.cwd(), "backend", "src", "data", "db.json");
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        if (db.orders) {
          const order = db.orders.find((o: any) => o.razorpayOrderId === razorpay_order_id || o.id === razorpay_order_id);
          if (order) {
            order.paymentStatus = "Paid";
            order.status = "Verified";
            order.paymentId = razorpay_payment_id;
            order.razorpayPaymentId = razorpay_payment_id;
            order.paidAt = new Date().toISOString();
            order.updatedAt = new Date().toISOString();
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
          }
        }
      }
    } catch (saveErr) {
      console.warn("Could not update order status:", saveErr);
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
