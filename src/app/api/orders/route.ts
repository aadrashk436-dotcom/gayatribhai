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

  const isCodOrder =
    o.paymentMethod === "Cash on Delivery" ||
    o.paymentMethod === "COD" ||
    o.payment_method === "cod" ||
    o.payment_method === "Cash on Delivery";

  let displayPaymentStatus = isCodOrder ? "Pending COD" : "Pending";
  if (o.paymentStatus === "PAID" || o.paymentStatus === "Paid" || o.payment_status === "paid") {
    displayPaymentStatus = "Paid";
  } else if (displayStatus === "Delivered" && isCodOrder) {
    displayPaymentStatus = "Paid";
  } else if (!isCodOrder && (o.paymentStatus === "Pending" || o.paymentStatus === "PENDING")) {
    displayPaymentStatus = "Pending";
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

  const rawItems = Array.isArray(o.items) && o.items.length > 0
    ? o.items
    : [
        {
          productId: prodId,
          id: prodId,
          name: o.shirtName || p?.name || "Artisanal Linen Shirt",
          sku: o.sku || p?.sku || "GB-ART-01",
          size: o.size || "M",
          quantity: o.qty || 1,
          price: o.price || totalRupees,
          image:
            o.image ||
            p?.images?.[0] ||
            "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg",
          color: p?.color || "Exclusive",
        },
      ];

  const enrichedItems = rawItems.map((item: any) => {
    const itemProdId = item.productId || item.id;
    const itemProd = products.find((prod) => prod.id === itemProdId || prod.slug === itemProdId);
    return {
      productId: itemProdId,
      id: itemProdId,
      name: item.name || item.shirtName || itemProd?.name || o.shirtName || "Artisanal Linen Shirt",
      sku: item.sku || itemProd?.sku || o.sku || "GB-ART-01",
      size: item.size || o.size || "M",
      quantity: item.quantity || item.qty || 1,
      price: item.price || itemProd?.price || o.price || totalRupees,
      image:
        item.image ||
        itemProd?.images?.[0] ||
        o.image ||
        "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg",
      color: item.color || itemProd?.color || "Exclusive",
    };
  });

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
    items: enrichedItems,
    shirtName: o.shirtName || firstItem.name || p?.name || "Artisanal Linen Shirt",
    sku: o.sku || firstItem.sku || p?.sku || "GB-LUX-01",
    size: o.size || firstItem.size || "M",
    qty: o.qty || enrichedItems.reduce((acc: number, cur: any) => acc + (cur.quantity || 1), 0),
    price: o.price || firstItem.price || p?.price || totalRupees,
    subtotal: o.subtotal || Math.round(enrichedItems.reduce((acc: number, cur: any) => acc + ((cur.price || 0) * (cur.quantity || 1)), 0)),
    discount: o.discount || 0,
    shipping: typeof o.shipping === "number" ? o.shipping : (o.courierRate || 0),
    total: totalRupees,
    totalPaise,
    image:
      o.image ||
      firstItem.image ||
      p?.images?.[0] ||
      "/assets/products/Azure_Leaf_Hand-Embroidered_Shirt/Azure_Leaf_Hand-Embroidered_Shirt_main.jpg",
    paymentMethod: isCodOrder
      ? "Cash on Delivery"
      : o.paymentMethod || (o.payment_method === "razorpay" ? "Razorpay (Online)" : "Razorpay (Online)"),
    paymentId: o.paymentId || o.razorpayPaymentId || o.razorpay_payment_id || (isCodOrder ? `cod_${o.orderNumber || o.id}` : ""),
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
    const userId = searchParams.get("userId");
    const id = searchParams.get("id");

    const orders = readStoredOrders();

    if (id) {
      const order = orders.find((o: any) => o.id === id || o.orderNumber === id);
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      return NextResponse.json({ order });
    }

    if (email || phone || userId) {
      const cleanEmail = email ? email.trim().toLowerCase() : null;
      const cleanPhoneDigits = phone ? phone.replace(/\D/g, "").slice(-10) : null;

      const userOrders = orders.filter((o: any) => {
        const orderEmail = (o.customerEmail || o.email || o.shippingAddress?.email || "").trim().toLowerCase();
        const emailMatch = cleanEmail && orderEmail === cleanEmail;

        const rawPhone = (o.customerPhone || o.phone || o.shippingAddress?.phone || "").replace(/\D/g, "").slice(-10);
        const phoneMatch = cleanPhoneDigits && rawPhone.length >= 10 && rawPhone === cleanPhoneDigits;

        const userIdMatch = userId && o.userId === userId;

        return Boolean(emailMatch || phoneMatch || userIdMatch);
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
    const { orderId, orderIds, status, courier, awb, cancelReason, verified, paymentStatus } = body;

    const orders = readStoredOrders();
    const targetIds = orderIds || (orderId ? [orderId] : []);

    if (!targetIds.length) {
      return NextResponse.json({ error: "Order ID(s) required" }, { status: 400 });
    }

    const targetIdStrs = targetIds.map((t: any) => String(t).trim().toUpperCase());

    // Strict Cancellation Rule (applies equally to COD and Online orders):
    // Orders CANNOT be cancelled if shipment has already been assigned with courier/AWB or already dispatched/delivered.
    if (status === "Cancelled" || status === "CANCELLED") {
      const lockedOrders = orders
        .filter((o: any) => {
          const m =
            targetIdStrs.includes(String(o.id || "").trim().toUpperCase()) ||
            targetIdStrs.includes(String(o.orderNumber || "").trim().toUpperCase());
          return m;
        })
        .filter((o: any) => {
          const hasAwb = Boolean(o.awb);
          const s = (o.status || "").toLowerCase();
          const isDispatched = s === "dispatched" || s === "shipped" || s === "assigned to courier" || s === "delivered";
          return hasAwb || isDispatched;
        });

      if (lockedOrders.length > 0) {
        return NextResponse.json(
          {
            error: "Order cannot be cancelled because courier shipment / AWB has already been assigned.",
            lockedOrderIds: lockedOrders.map((o: any) => o.id || o.orderNumber),
          },
          { status: 400 }
        );
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
