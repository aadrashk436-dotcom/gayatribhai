import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getDbPath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if store admin login
    const isAdmin = cleanEmail === "gayatripuri634@gmail.com";

    let customer = null;
    try {
      const dbPath = getDbPath();
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        if (db.customers) {
          customer = db.customers.find((c: any) => c.email === cleanEmail);
        }
      }
    } catch (err) {
      console.warn("DB read error in login:", err);
    }

    if (!customer) {
      // Create profile on the fly for returning customers
      const name = cleanEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      customer = {
        id: `cust_${Buffer.from(cleanEmail).toString("base64").slice(0, 10)}`,
        name: isAdmin ? "Gayatri Puri (Admin)" : name,
        email: cleanEmail,
        phone: "+91 98765 43210",
        tier: isAdmin ? "Platinum" : "Silver",
        points: isAdmin ? 5000 : 1240,
        role: isAdmin ? "admin" : "customer",
      };
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
        tier: customer.tier || "Silver",
        points: customer.points || 1240,
        role: isAdmin ? "admin" : "customer",
      },
      isAdmin,
      message: isAdmin ? "Welcome back, Admin Gayatri Puri" : "Login successful",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 });
  }
}
