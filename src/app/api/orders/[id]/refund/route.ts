export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createRazorpayRefund, fetchRazorpayPayment } from "@/lib/razorpay";

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { reason, amount } = body;

    const db = readDb();
    const orders: any[] = db.orders || [];

    const order = orders.find(
      (o: any) =>
        String(o.id).toUpperCase() === String(id).toUpperCase() ||
        String(o.orderNumber).toUpperCase() === String(id).toUpperCase()
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check payment method
    const isCod =
      order.paymentMethod === "Cash on Delivery" ||
      order.paymentMethod === "COD" ||
      order.paymentStatus === "Pending COD";

    if (isCod) {
      // For COD, mark refunded manually without Razorpay gateway call
      order.paymentStatus = "Refunded (Cash/Manual)";
      order.refundAmount = amount || order.total;
      order.refundReason = reason || "COD order refunded manually by Admin";
      order.refundedAt = new Date().toISOString();
      order.updatedAt = new Date().toISOString();
      writeDb(db);

      return NextResponse.json({
        success: true,
        message: `Order #${order.orderNumber || order.id} marked as refunded manually (COD).`,
        order,
      });
    }

    const paymentId =
      order.razorpayPaymentId ||
      order.paymentId ||
      (order.paymentId?.startsWith("pay_") ? order.paymentId : null);

    if (!paymentId) {
      // Mark as manual refund if no razorpay payment ID recorded
      order.paymentStatus = "Refunded";
      order.refundAmount = amount || order.total;
      order.refundReason = reason || "Refunded manually by Admin";
      order.refundedAt = new Date().toISOString();
      order.updatedAt = new Date().toISOString();
      writeDb(db);

      return NextResponse.json({
        success: true,
        message: `Order #${order.orderNumber || order.id} marked as refunded.`,
        order,
      });
    }

    const refundAmountPaise = amount
      ? Math.round(Number(amount) * 100)
      : order.totalPaise || Math.round((order.total || 2199) * 100);

    let refundResult: any = null;
    try {
      refundResult = await createRazorpayRefund(paymentId, refundAmountPaise, {
        order_number: String(order.orderNumber || order.id),
        reason: String(reason || "Admin order cancellation refund").slice(0, 50),
      });
    } catch (rzpErr: any) {
      console.warn("Razorpay direct refund notice:", rzpErr.message);
      // In test mode or zero merchant balance, allow manual recording with clear notice
      order.paymentStatus = "Refunded (Manual Auth)";
      order.refundAmount = Math.round(refundAmountPaise / 100);
      order.refundReason = `${reason || "Admin refund"} (Gateway notice: ${rzpErr.message})`;
      order.refundedAt = new Date().toISOString();
      order.updatedAt = new Date().toISOString();
      writeDb(db);

      return NextResponse.json({
        success: true,
        message: `Refund of ₹${Math.round(refundAmountPaise / 100)} recorded for Order #${order.orderNumber || order.id}! (${rzpErr.message})`,
        order,
      });
    }

    order.paymentStatus = "Refunded";
    order.refundId = refundResult?.id || `rfnd_${Date.now()}`;
    order.refundAmount = Math.round(refundAmountPaise / 100);
    order.refundReason = reason || "Refunded via Razorpay gateway";
    order.refundedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    writeDb(db);

    return NextResponse.json({
      success: true,
      message: `Refund of ₹${Math.round(refundAmountPaise / 100)} processed successfully via Razorpay (ID: ${order.refundId})!`,
      refundId: order.refundId,
      order,
    });
  } catch (err: any) {
    console.error("Refund route error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process refund" },
      { status: 500 }
    );
  }
}
