import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getDbPath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

export async function GET() {
  try {
    const dbPath = getDbPath();
    let customers: any[] = [];
    let orders: any[] = [];

    if (fs.existsSync(dbPath)) {
      try {
        const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        customers = db.customers || [];
        orders = db.orders || [];
      } catch (err) {
        console.warn("DB read error in admin customers:", err);
      }
    }

    // Format customers dynamically with orders calculation
    const formattedCustomers = customers.map((c: any) => {
      const cleanEmail = c.email?.toLowerCase().trim();
      const cleanPhone = c.phone?.replace(/\D/g, "");

      const userOrders = orders.filter((o: any) => {
        const emailMatch = cleanEmail && (o.customerEmail?.toLowerCase() === cleanEmail || o.email?.toLowerCase() === cleanEmail);
        const phoneMatch = cleanPhone && (o.customerPhone?.replace(/\D/g, "") === cleanPhone || o.phone?.replace(/\D/g, "") === cleanPhone);
        return Boolean(emailMatch || phoneMatch);
      });

      const ordersCount = userOrders.length;
      const totalSpent = userOrders.reduce((sum: number, o: any) => {
        const orderTotal = o.total || 0;
        return sum + (orderTotal > 10000 ? Math.round(orderTotal / 100) : orderTotal);
      }, 0);

      let tier = c.tier || "Silver";
      if (totalSpent >= 15000) tier = "Platinum";
      else if (totalSpent >= 5000) tier = "Gold";

      const name = c.name || (cleanEmail ? cleanEmail.split("@")[0] : "Patron");
      const initials = name
        .split(" ")
        .map((w: string) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "GB";

      let joined = "Recently";
      if (c.createdAt) {
        try {
          joined = new Date(c.createdAt).toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          });
        } catch {}
      }

      return {
        id: c.id || `cust_${Date.now()}`,
        name,
        email: c.email || "",
        phone: c.phone || "",
        tier,
        ordersCount,
        totalSpent,
        points: c.points || Math.round(totalSpent * 0.1),
        joined,
        avatar: initials,
      };
    });

    return NextResponse.json({
      customers: formattedCustomers,
      total: formattedCustomers.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load customers" }, { status: 500 });
  }
}
