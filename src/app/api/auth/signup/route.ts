import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getDbPath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name?.trim() || cleanEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    const cleanPhone = phone?.trim() || "";

    const customer = {
      id: `cust_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password, // in real production hashed, here stored for persistent login
      tier: "Silver",
      points: 250,
      createdAt: new Date().toISOString(),
    };

    // Save to persistent db.json
    try {
      const dbPath = getDbPath();
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        db.customers = db.customers || [];
        const existingIdx = db.customers.findIndex((c: any) => c.email === cleanEmail);
        if (existingIdx >= 0) {
          db.customers[existingIdx] = { ...db.customers[existingIdx], ...customer };
        } else {
          db.customers.push(customer);
        }
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
      }
    } catch (saveErr) {
      console.warn("Could not save registered customer:", saveErr);
    }

    const token = `gb_token_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return NextResponse.json({
      success: true,
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        tier: customer.tier,
        points: customer.points,
      },
      message: "Account created successfully. Welcome to Gayatri Bhai!",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Signup failed" }, { status: 500 });
  }
}
