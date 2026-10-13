import { NextResponse } from "next/server";
import { products } from "@/products";

const KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_Tl6lD0OL5uKch9";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "bCNz3b7Dumt4cNUaHsq3dF7A";

export async function POST(request: Request) {
  try {
    const { items, address, couponCode } = await request.json();
    if (!items || !items.length) {
      return NextResponse.json({ error: "Cart items are required" }, { status: 400 });
    }

    let subtotal = 0;
    items.forEach((item: any) => {
      const p = products.find((prod) => prod.id === (item.productId || item.id));
      if (p) {
        subtotal += (p.price || 0) * (item.quantity || 1) * 100; // in paise
      }
    });

    let discount = 0;
    if (couponCode) {
      const code = couponCode.toUpperCase().trim();
      if (code === "WELCOME10" || code === "FIRST10") {
        discount = Math.floor(subtotal * 0.1);
      } else if (code === "GAYATRI20") {
        discount = 20000;
      }
    }

    const shipping = subtotal >= 199900 ? 0 : 9900;
    const total = Math.max(100, subtotal - discount + shipping); // in paise
    const orderNumber = "GB-" + Date.now().toString().slice(-6);

    // Call Razorpay REST API
    const authHeader = "Basic " + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: total,
        currency: "INR",
        receipt: orderNumber,
        notes: {
          customer_name: address?.name || "Customer",
          city: address?.city || "",
        },
      }),
    });

    const rzpData = await rzpRes.json();
    if (!rzpRes.ok) {
      throw new Error(rzpData.error?.description || "Razorpay order creation failed");
    }

    return NextResponse.json({
      orderId: rzpData.id,
      orderNumber,
      razorpayOrderId: rzpData.id,
      amount: total,
      currency: "INR",
      keyId: KEY_ID,
    });
  } catch (err: any) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: err.message || "Failed to create order" }, { status: 500 });
  }
}
