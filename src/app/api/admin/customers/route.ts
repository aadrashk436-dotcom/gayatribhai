export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getDbPath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

export async function GET() {
  try {
    const dbPath = getDbPath();
    let db: any = { customers: [], orders: [] };
    let customers: any[] = [];
    let orders: any[] = [];

    if (fs.existsSync(dbPath)) {
      try {
        db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        customers = db.customers || [];
        orders = db.orders || [];
      } catch (err) {
        console.warn("DB read error in admin customers:", err);
      }
    }

    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Optional Supabase Customer Fetch & Sync
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/customers?select=*`, {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          cache: "no-store",
        });
        if (sbRes.ok) {
          const sbCustomers = await sbRes.json();
          if (Array.isArray(sbCustomers)) {
            for (const sbCust of sbCustomers) {
              const cleanSbEmail = sbCust.email?.toLowerCase().trim();
              if (cleanSbEmail && !customers.some((c: any) => c.email?.toLowerCase().trim() === cleanSbEmail)) {
                customers.push({
                  id: sbCust.id || `cust_${Date.now()}`,
                  name: sbCust.name || cleanSbEmail.split("@")[0],
                  email: cleanSbEmail,
                  phone: sbCust.phone || "",
                  avatar: sbCust.avatar || "",
                  tier: sbCust.tier || "Silver",
                  points: sbCust.points || 250,
                  authProvider: sbCust.auth_provider || "google",
                  authProviders: [sbCust.auth_provider || "google"],
                  createdAt: sbCust.created_at || new Date().toISOString(),
                });
              }
            }
          }
        }
      } catch (sbErr) {
        // Network fallback
      }
    }

    // Auto-sync any patrons who placed orders into the customers list if missing
    let dbUpdated = false;
    const knownEmails = new Set(customers.map((c: any) => c.email?.toLowerCase().trim()).filter(Boolean));

    for (const ord of orders) {
      const ordEmail = (ord.customerEmail || ord.email || "").toLowerCase().trim();
      if (ordEmail && !knownEmails.has(ordEmail)) {
        const ordPhone = (ord.customerPhone || ord.phone || "").trim();
        const ordName = (ord.customerName || ord.customer || ordEmail.split("@")[0]).trim();
        const syntheticCustomer = {
          id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: ordName,
          email: ordEmail,
          phone: ordPhone,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(ordName)}&backgroundColor=0a0a0a,d4af37,18181b`,
          tier: "Silver",
          points: 250,
          authProvider: ordEmail.endsWith("@gmail.com") ? "google" : "email",
          authProviders: [ordEmail.endsWith("@gmail.com") ? "google" : "email"],
          role: "customer",
          isAdmin: false,
          createdAt: ord.createdAt || new Date().toISOString(),
        };
        customers.push(syntheticCustomer);
        knownEmails.add(ordEmail);
        dbUpdated = true;
      }
    }

    if (dbUpdated) {
      try {
        db.customers = customers;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
      } catch (writeErr) {
        console.warn("Could not sync customers back to db.json:", writeErr);
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

      const isAdmin = cleanEmail === "gayatripuri634@gmail.com" || c.role === "admin" || c.isAdmin;

      let tier = c.tier || "Silver";
      if (isAdmin) tier = "Platinum";
      else if (totalSpent >= 15000) tier = "Platinum";
      else if (totalSpent >= 5000) tier = "Gold";

      const name = c.name || (cleanEmail ? cleanEmail.split("@")[0].replace(/[._]/g, " ") : "Patron");
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

      // Check if user is Google authenticated
      const isGoogle =
        c.authProvider === "google" ||
        (Array.isArray(c.authProviders) && c.authProviders.includes("google")) ||
        Boolean(c.googleId) ||
        (cleanEmail && cleanEmail.endsWith("@gmail.com"));

      const finalAvatar =
        c.avatar && (c.avatar.startsWith("http") || c.avatar.startsWith("/"))
          ? c.avatar
          : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0a0a0a,d4af37,18181b`;

      return {
        id: c.id || `cust_${Date.now()}`,
        name,
        email: c.email || "",
        phone: c.phone || "",
        tier,
        orders: ordersCount,
        ordersCount,
        totalSpent,
        points: c.points ?? Math.max(250, Math.round(totalSpent * 0.1)),
        joined,
        avatar: finalAvatar,
        initials,
        authProvider: isGoogle ? "google" : (c.authProvider || "email"),
        authProviders: c.authProviders || [isGoogle ? "google" : "email"],
        role: isAdmin ? "admin" : (c.role || "customer"),
        isAdmin,
        createdAt: c.createdAt || new Date().toISOString(),
      };
    });

    // Sort: Admin first, then latest registered
    formattedCustomers.sort((a, b) => {
      if (a.isAdmin && !b.isAdmin) return -1;
      if (!a.isAdmin && b.isAdmin) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      customers: formattedCustomers,
      total: formattedCustomers.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load customers" }, { status: 500 });
  }
}
