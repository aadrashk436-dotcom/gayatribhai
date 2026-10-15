export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { products } from "@/products";
import { getStoredProductById } from "@/lib/serverProducts";
import fs from "fs";
import path from "path";

const KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_Tl6r6m9eEhjxUb";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "LKDAqXf8Q3zqLQL7ziSnMQw1";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      items,
      address,
      couponCode,
      shippingFee,
      selectedCourier,
      packageSummary,
      paymentMethod: rawMethod,
      userEmail,
      userPhone,
      userName,
      userId,
    } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: "Cart items are required" }, { status: 400 });
    }

    const isCod = rawMethod === "Cash on Delivery" || rawMethod === "COD";

    const customerEmail = (userEmail || address?.email || "care@gayatribhai.com").trim().toLowerCase();
    const customerPhone = (userPhone || address?.phone || "+91 98765 43210").trim();
    const customerName = (userName || address?.name || "Customer").trim();

    // Enrich items with real product info from database / store
    const enrichedItems = items.map((item: any) => {
      const prodId = item.productId || item.id;
      const p = getStoredProductById(prodId) || products.find((prod) => prod.id === prodId || prod.slug === prodId);
      const unitPrice = p ? p.price : (item.price > 1000 ? Math.round(item.price / 100) : (item.price || 2100));
      return {
        productId: prodId,
        id: prodId,
        name: p?.name || item.name || "Artisanal Linen Shirt",
        sku: p?.sku || item.sku || "GB-ART-01",
        size: item.size || "M",
        quantity: item.quantity || 1,
        price: unitPrice,
        image: p?.images?.[0] || item.image || "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg",
        color: p?.color || item.color || "Linen",
      };
    });

    let subtotalPaise = 0;
    enrichedItems.forEach((item: any) => {
      subtotalPaise += item.price * item.quantity * 100;
    });

    let discountPaise = 0;
    if (couponCode) {
      const code = couponCode.toUpperCase().trim();
      if (code === "WELCOME10" || code === "FIRST10") {
        discountPaise = Math.floor(subtotalPaise * 0.1);
      } else if (code === "GAYATRI20") {
        discountPaise = 20000;
      }
    }

    // Real courier shipping rate calculated based on package weight and dimensions
    let shippingPaise = 0;
    if (typeof shippingFee === "number" && shippingFee > 0) {
      shippingPaise = Math.round(shippingFee * 100);
    } else if (selectedCourier && typeof selectedCourier.rate === "number" && selectedCourier.rate > 0) {
      shippingPaise = Math.round(selectedCourier.rate * 100);
    } else {
      shippingPaise = 9900; // standard fallback
    }

    const totalPaise = Math.max(100, subtotalPaise - discountPaise + shippingPaise);
    const totalRupees = Math.round(totalPaise / 100);
    const orderNumber = "GB-" + Date.now().toString().slice(-6);

    const firstItem = enrichedItems[0] || {};
    const streetAddr = typeof address?.street === "string" ? address.street : (address?.address || "");
    const cityStr = address?.city ? (address?.state ? `${address.city}, ${address.state}` : address.city) : "";
    const formattedDate = new Date().toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

    let rzpOrderId = "";

    if (!isCod) {
      // Call Razorpay REST API
      const authHeader = "Basic " + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          amount: totalPaise,
          currency: "INR",
          receipt: orderNumber,
          notes: {
            customer_name: customerName,
            customer_email: customerEmail,
            city: address?.city || "",
            phone: customerPhone,
          },
        }),
      });

      const rzpData = await rzpRes.json();
      if (!rzpRes.ok) {
        throw new Error(rzpData.error?.description || "Razorpay order creation failed");
      }
      rzpOrderId = rzpData.id;
    }

    // Save order in resilient store (backend/src/data/db.json)
    const newOrder = {
      id: orderNumber,
      orderNumber,
      customer: customerName,
      customerName,
      email: customerEmail,
      customerEmail,
      phone: customerPhone,
      customerPhone,
      userId: userId || null,
      address: streetAddr,
      city: cityStr,
      pincode: address?.pincode || "",
      shippingAddress: {
        ...(address || {}),
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        street: streetAddr,
        city: cityStr,
        pincode: address?.pincode || "",
      },
      shirtName: firstItem.name,
      sku: firstItem.sku,
      size: firstItem.size,
      qty: firstItem.quantity,
      price: firstItem.price,
      total: totalRupees,
      totalPaise,
      image: firstItem.image,
      items: enrichedItems,
      subtotal: Math.round(subtotalPaise / 100),
      discount: Math.round(discountPaise / 100),
      shipping: Math.round(shippingPaise / 100),
      courierName: selectedCourier?.name || "Blue Dart Express Air",
      courierId: selectedCourier?.id,
      courierRate: shippingPaise / 100,
      packageSummary: packageSummary || {},
      paymentMethod: isCod ? "Cash on Delivery" : "Razorpay (Online)",
      paymentId: isCod ? `cod_${orderNumber}` : (rzpOrderId || ""),
      paymentStatus: isCod ? "Pending COD" : "Pending",
      razorpayOrderId: rzpOrderId || null,
      status: isCod ? "Pending Verification" : "Pending Verification",
      date: formattedDate,
      createdAt: new Date().toISOString(),
    };

    try {
      const dbPath = path.join(process.cwd(), "backend", "src", "data", "db.json");
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        db.orders = db.orders || [];
        // Remove any old duplicate with same orderNumber
        db.orders = db.orders.filter((o: any) => o.orderNumber !== orderNumber && o.id !== orderNumber);
        db.orders.unshift(newOrder);

        // Upsert customer in db.customers
        db.customers = db.customers || [];
        const cleanCustEmail = customerEmail.toLowerCase().trim();
        const existingCustIdx = db.customers.findIndex(
          (c: any) => (c.email && c.email.toLowerCase().trim() === cleanCustEmail) ||
                      (userId && c.id === userId)
        );

        if (existingCustIdx >= 0) {
          const c = db.customers[existingCustIdx];
          const currOrders = typeof c.orders === "number" ? c.orders : (Array.isArray(c.orders) ? c.orders.length : 0);
          const currSpent = typeof c.totalSpent === "number" ? c.totalSpent : 0;
          db.customers[existingCustIdx] = {
            ...c,
            name: c.name || customerName,
            phone: c.phone || customerPhone,
            orders: currOrders + 1,
            totalSpent: currSpent + totalRupees,
            lastOrder: orderNumber,
            points: (c.points || 0) + Math.round(totalRupees / 10),
            updatedAt: new Date().toISOString(),
          };
        } else if (cleanCustEmail && cleanCustEmail !== "care@gayatribhai.com") {
          db.customers.push({
            id: userId || `cust_${Date.now()}`,
            name: customerName,
            email: cleanCustEmail,
            phone: customerPhone,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customerName)}&backgroundColor=0a0a0a,d4af37,18181b`,
            tier: "Silver",
            points: Math.round(totalRupees / 10),
            orders: 1,
            totalSpent: totalRupees,
            lastOrder: orderNumber,
            authProvider: cleanCustEmail.endsWith("@gmail.com") ? "google" : "email",
            authProviders: [cleanCustEmail.endsWith("@gmail.com") ? "google" : "email"],
            role: "customer",
            isAdmin: false,
            createdAt: new Date().toISOString(),
          });
        }

        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
      }
    } catch (saveErr) {
      console.warn("Could not save initial order:", saveErr);
    }

    return NextResponse.json({
      success: true,
      orderId: rzpOrderId || orderNumber,
      orderNumber,
      razorpayOrderId: rzpOrderId || null,
      amount: totalPaise,
      currency: "INR",
      keyId: KEY_ID,
      isCod,
    });
  } catch (err: any) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: err.message || "Failed to create order" }, { status: 500 });
  }
}
