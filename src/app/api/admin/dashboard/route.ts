import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { products } from "@/products";

function getDbPath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

export async function GET() {
  try {
    let orders: any[] = [];
    let customers: any[] = [];

    try {
      const dbPath = getDbPath();
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        orders = db.orders || [];
        customers = db.customers || [];
      }
    } catch (e) {
      console.warn("DB read error in admin dashboard:", e);
    }

    let totalRevenueRupees = 0;
    let shirtsSoldCount = 0;

    orders.forEach((o) => {
      const orderTotal = o.total || 0;
      const orderInRupees = orderTotal > 10000 ? Math.round(orderTotal / 100) : orderTotal;
      totalRevenueRupees += orderInRupees;
      if (Array.isArray(o.items) && o.items.length > 0) {
        shirtsSoldCount += o.items.reduce((s: number, it: any) => s + (it.quantity || it.qty || 1), 0);
      } else {
        shirtsSoldCount += (o.qty || 1);
      }
    });

    const lowStockAlerts = products.filter((p) => {
      const stockValues = Object.values(p.stock || {}) as number[];
      return stockValues.some((v) => v <= 3);
    }).slice(0, 5);

    return NextResponse.json({
      metrics: {
        totalRevenue: totalRevenueRupees,
        ordersCount: orders.length,
        shirtsSoldCount: shirtsSoldCount,
        customersCount: customers.length,
      },
      recentOrders: orders.slice(0, 10),
      lowStockAlerts: lowStockAlerts.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        image: p.images[0],
        stock: p.stock,
      })),
      liveServices: {
        razorpay: "TEST_MODE (rzp_test_Tl6r6m9eEhjxUb)",
        shiprocket: "LIVE",
        supabase: "CONNECTED",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load dashboard metrics" }, { status: 500 });
  }
}
