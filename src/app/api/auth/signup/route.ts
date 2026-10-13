import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getDbPath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json();

    // 1. Validation - Name
    const cleanName = (name || "").trim();
    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json({ error: "Please enter your full name (minimum 2 characters)" }, { status: 400 });
    }

    // 2. Validation - Email
    const cleanEmail = (email || "").toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address (e.g. name@domain.com)" }, { status: 400 });
    }

    // 3. Validation - Password
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    // 4. Validation - Phone (if provided)
    const cleanPhone = (phone || "").trim();
    if (cleanPhone && !/^[0-9+\s-]{10,15}$/.test(cleanPhone)) {
      return NextResponse.json({ error: "Please enter a valid 10-digit mobile number" }, { status: 400 });
    }

    // 5. Check if email already registered (Duplicate Email Check)
    const dbPath = getDbPath();
    let db: any = { customers: [] };
    if (fs.existsSync(dbPath)) {
      try {
        db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      } catch (e) {
        console.warn("DB read error:", e);
      }
    }
    db.customers = db.customers || [];

    const existingUser = db.customers.find((c: any) => c.email?.toLowerCase() === cleanEmail);
    if (existingUser) {
      return NextResponse.json(
        {
          error: "This email is already registered. Please sign in to your account.",
          alreadyExists: true,
          email: cleanEmail,
        },
        { status: 409 }
      );
    }

    // 6. Create Customer
    const customer = {
      id: `cust_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone || "",
      password,
      tier: "Silver",
      points: 250,
      createdAt: new Date().toISOString(),
    };

    db.customers.push(customer);
    try {
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
    } catch (saveErr) {
      console.warn("Could not write db.json:", saveErr);
    }

    const token = `gb_token_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return NextResponse.json(
      {
        success: true,
        token,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          avatar: "",
          tier: customer.tier,
          points: customer.points,
        },
        message: "Account created successfully. Welcome to Gayatri Bhai!",
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Signup failed. Please try again." }, { status: 500 });
  }
}
