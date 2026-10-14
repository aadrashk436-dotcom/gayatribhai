import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { products } from "@/products";

// Order persistence helper
function getOrdersFilePath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

function normalizeOrder(o: any) {
  const firstItem = (o.items && o.items[0]) || {};
  const prodId = firstItem.productId || firstItem.id;
  const p = products.find((prod) => prod.id === prodId || prod.slug === prodId);

  const streetAddr =
    typeof o.address === "string" && o.address.length > 0
      ? o.address
      : o.shippingAddress?.street || o.shippingAddress?.address || "";
  const cityStr =
    o.city ||
    (o.shippingAddress?.city
      ? o.shippingAddress?.state
        ? `${o.shippingAddress.city}, ${o.shippingAddress.state}`
        : o.shippingAddress.city
      : "");
  const pincodeStr = o.pincode || o.shippingAddress?.pincode || "";

  const totalPaise = o.totalPaise || (o.total > 10000 ? o.total : (o.total || 0) * 100);
  const totalRupees = o.total > 10000 ? Math.round(o.total / 100) : (o.total || Math.round(totalPaise / 100));

  const rawStatus = o.status || "Pending Verification";
  let displayStatus = rawStatus;
  if (rawStatus === "PROCESSING" || rawStatus === "processing") displayStatus = "Pending Verification";
  if (rawStatus === "CONFIRMED" || rawStatus === "confirmed") displayStatus = "Verified";
  if (rawStatus === "SHIPPED" || rawStatus === "shipped") displayStatus = "Dispatched";
  if (rawStatus === "DELIVERED" || rawStatus === "delivered") displayStatus = "Delivered";
  if (rawStatus === "CANCELLED" || rawStatus === "cancelled") displayStatus = "Cancelled";

  let displayPaymentStatus: "Paid" | "Pending COD" = "Pending COD";
  if (o.paymentStatus === "PAID" || o.paymentStatus === "Paid" || o.payment_status === "paid") {
    displayPaymentStatus = "Paid";
  }

  let formattedDate = o.date;
  if (!formattedDate && o.createdAt) {
    try {
      formattedDate = new Date(o.createdAt).toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      formattedDate = "Recently";
    }
  }

  return {
    ...o,
    id: o.orderNumber || o.order_number || o.id,
    orderNumber: o.orderNumber || o.order_number || o.id,
    customer: o.customer || o.customerName || o.shippingAddress?.name || "Customer",
    customerName: o.customerName || o.customer || o.shippingAddress?.name || "Customer",
    email: o.email || o.customerEmail || o.shippingAddress?.email || "",
    customerEmail: o.customerEmail || o.email || o.shippingAddress?.email || "",
    phone: o.phone || o.customerPhone || o.shippingAddress?.phone || "",
    customerPhone: o.customerPhone || o.phone || o.shippingAddress?.phone || "",
    address: streetAddr,
    city: cityStr,
    pincode: pincodeStr,
    shippingAddress: o.shippingAddress || {
      name: o.customer,
      street: streetAddr,
      city: cityStr,
      pincode: pincodeStr,
      phone: o.phone,
    },
    shirtName: o.shirtName || firstItem.name || p?.name || "Artisanal Linen Shirt",
    sku: o.sku || firstItem.sku || p?.sku || "GB-LUX-01",
    size: o.size || firstItem.size || "M",
    qty: o.qty || firstItem.quantity || 1,
    price: o.price || firstItem.price || p?.price || totalRupees,
    total: totalRupees,
    totalPaise,
    image:
      o.image ||
      firstItem.image ||
      p?.images?.[0] ||
      "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg",
    paymentMethod: o.paymentMethod || (o.payment_method === "razorpay" ? "Razorpay (Online)" : "Razorpay (Online)"),
    paymentId: o.paymentId || o.razorpayPaymentId || o.razorpay_payment_id || "",
    paymentStatus: displayPaymentStatus,
    status: displayStatus,
    date: formattedDate || "Today",
    courier: o.courier || o.courierName || null,
    awb: o.awb || null,
  };
}

function readStoredOrders() {
  try {
    const filePath = getOrdersFilePath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return (data.orders || []).map(normalizeOrder);
    }
  } catch (err) {
    console.warn("Could not read stored orders:", err);
  }
  return [];
}

function saveOrder(newOrder: any) {
  try {
    const filePath = getOrdersFilePath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      data.orders = data.orders || [];
      const existingIdx = data.orders.findIndex(
        (o: any) => o.id === newOrder.id || o.orderNumber === newOrder.orderNumber
      );
      if (existingIdx >= 0) {
        data.orders[existingIdx] = {
          ...data.orders[existingIdx],
          ...newOrder,
          updatedAt: new Date().toISOString(),
        };
      } else {
        data.orders.unshift(newOrder);
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    }
  } catch (err) {
    console.warn("Could not save order to file:", err);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");
    const id = searchParams.get("id");

    const orders = readStoredOrders();

    if (id) {
      const order = orders.find((o: any) => o.id === id || o.orderNumber === id);
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      return NextResponse.json({ order });
    }

    if (email || phone) {
      const cleanEmail = email ? email.trim().toLowerCase() : null;
      const cleanPhoneDigits = phone ? phone.replace(/\D/g, "") : null;

      const userOrders = orders.filter((o: any) => {
        const emailMatch =
          cleanEmail &&
          (o.customerEmail?.toLowerCase() === cleanEmail || o.email?.toLowerCase() === cleanEmail);
        const phoneMatch =
          cleanPhoneDigits &&
          (o.customerPhone?.replace(/\D/g, "") === cleanPhoneDigits ||
            o.phone?.replace(/\D/g, "") === cleanPhoneDigits);
        return Boolean(emailMatch || phoneMatch);
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

    saveOrder(order);

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create order record" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, orderIds, status, courier, awb, cancelReason, verified } = body;

    const orders = readStoredOrders();
    const targetIds = orderIds || (orderId ? [orderId] : []);

    if (!targetIds.length) {
      return NextResponse.json({ error: "Order ID(s) required" }, { status: 400 });
    }

    const updatedOrders = orders.map((o: any) => {
      if (targetIds.includes(o.id) || targetIds.includes(o.orderNumber)) {
        return {
          ...o,
          ...(status && { status }),
          ...(courier && { courier }),
          ...(awb && { awb }),
          ...(cancelReason && { cancelReason }),
          ...(verified !== undefined && { verified, verifiedAt: new Date().toISOString() }),
          updatedAt: new Date().toISOString(),
        };
      }
      return o;
    });

    try {
      const filePath = getOrdersFilePath();
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        data.orders = updatedOrders;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
      }
    } catch (saveErr) {
      console.warn("Could not save updated orders to file:", saveErr);
    }

    return NextResponse.json({ success: true, updatedCount: targetIds.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update orders" }, { status: 500 });
  }
}
