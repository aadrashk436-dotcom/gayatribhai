import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Order persistence helper
function getOrdersFilePath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

function readStoredOrders() {
  try {
    const filePath = getOrdersFilePath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return data.orders || [];
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
      const existingIdx = data.orders.findIndex((o: any) => o.id === newOrder.id || o.orderNumber === newOrder.orderNumber);
      if (existingIdx >= 0) {
        data.orders[existingIdx] = { ...data.orders[existingIdx], ...newOrder, updatedAt: new Date().toISOString() };
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
        const emailMatch = cleanEmail && o.customerEmail?.toLowerCase() === cleanEmail;
        const phoneMatch = cleanPhoneDigits && o.customerPhone?.replace(/\D/g, "") === cleanPhoneDigits;
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
