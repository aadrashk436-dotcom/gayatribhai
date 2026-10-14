import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getDbPath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

const SUPABASE_URL = process.env.SUPABASE_URL || "https://qnhtnbzeyqbrzjguhgsy.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, email, name, newEmail, phone, addresses } = body;

    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanNewEmail = (newEmail || cleanEmail).toLowerCase().trim();
    const cleanName = (name || "").trim();
    const cleanPhone = (phone || "").trim();

    if (!cleanEmail && !id) {
      return NextResponse.json({ error: "Customer identifier required" }, { status: 400 });
    }

    const dbPath = getDbPath();
    let db: any = { customers: [] };
    if (fs.existsSync(dbPath)) {
      try {
        db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      } catch (err) {
        console.warn("DB read error in profile update:", err);
      }
    }
    db.customers = db.customers || [];

    const existingIdx = db.customers.findIndex(
      (c: any) =>
        (id && c.id === id) ||
        (cleanEmail && c.email?.toLowerCase().trim() === cleanEmail)
    );

    let updatedCustomer: any;

    if (existingIdx >= 0) {
      db.customers[existingIdx] = {
        ...db.customers[existingIdx],
        ...(cleanName && { name: cleanName }),
        ...(cleanNewEmail && { email: cleanNewEmail }),
        phone: cleanPhone,
        ...(Array.isArray(addresses) && { addresses }),
        updatedAt: new Date().toISOString(),
      };
      updatedCustomer = db.customers[existingIdx];
    } else {
      updatedCustomer = {
        id: id || `cust_${Date.now()}`,
        name: cleanName || cleanEmail.split("@")[0],
        email: cleanNewEmail || cleanEmail,
        phone: cleanPhone,
        addresses: Array.isArray(addresses) ? addresses : [],
        tier: "Silver",
        points: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.customers.push(updatedCustomer);
    }

    try {
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
    } catch (saveErr) {
      console.warn("Could not write db.json in profile update:", saveErr);
    }

    // Sync to Supabase if available
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            id: updatedCustomer.id,
            email: updatedCustomer.email,
            name: updatedCustomer.name,
            phone: updatedCustomer.phone,
          }),
        });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone || "",
        addresses: updatedCustomer.addresses || [],
        tier: updatedCustomer.tier || "Silver",
        points: updatedCustomer.points || 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}
