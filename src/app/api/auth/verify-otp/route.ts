import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getDbPath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

export async function POST(request: Request) {
  try {
    const { identifier, otp, name } = await request.json();

    if (!identifier || !otp) {
      return NextResponse.json({ error: "Identifier and verification code are required" }, { status: 400 });
    }

    const clean = identifier.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const dbPath = getDbPath();
    let db: any = { customers: [], otps: {} };
    if (fs.existsSync(dbPath)) {
      try {
        db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      } catch (e) {
        console.warn("DB read error:", e);
      }
    }

    const record = db.otps?.[clean];

    // Master test OTP for seamless testing
    const isValidOtp = (record && record.otp === cleanOtp && Date.now() <= record.expiresAt) || cleanOtp === "123456";

    if (!isValidOtp) {
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please check and try again." },
        { status: 400 }
      );
    }

    // Clean up used OTP
    if (db.otps && db.otps[clean]) {
      delete db.otps[clean];
    }

    db.customers = db.customers || [];
    let customer = db.customers.find(
      (c: any) => c.email?.toLowerCase() === clean || c.phone === clean
    );

    let isNewUser = false;
    if (!customer) {
      isNewUser = true;
      const isEmail = clean.includes("@");
      const derivedName = (name || "").trim() || (isEmail ? clean.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : "Patron");
      
      customer = {
        id: `cust_${Date.now()}`,
        name: derivedName,
        email: isEmail ? clean : "",
        phone: !isEmail ? clean : "",
        tier: "Silver",
        points: 250,
        authProvider: "otp",
        createdAt: new Date().toISOString(),
      };
      db.customers.push(customer);
    }

    try {
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
    } catch (saveErr) {
      console.warn("Could not save to db.json:", saveErr);
    }

    const token = `gb_token_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return NextResponse.json({
      success: true,
      token,
      isNewUser,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        tier: customer.tier || "Silver",
        points: customer.points || 250,
      },
      message: isNewUser ? "Account created successfully via OTP. Welcome to Gayatri Bhai!" : "Welcome back!",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to verify OTP" }, { status: 500 });
  }
}
