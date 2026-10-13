import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getDbPath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let email = "";
    let name = "";
    let avatar = "";
    let googleId = "";

    // Support both Google ID Token (credential) and direct profile
    if (body.credential) {
      try {
        const parts = body.credential.split(".");
        if (parts.length >= 2) {
          const payloadJson = Buffer.from(parts[1], "base64").toString("utf8");
          const payload = JSON.parse(payloadJson);
          email = payload.email || "";
          name = payload.name || payload.given_name || "";
          avatar = payload.picture || "";
          googleId = payload.sub || "";
        }
      } catch (decodeErr) {
        console.warn("Could not decode Google credential JWT:", decodeErr);
      }
    }

    if (!email && body.email) {
      email = body.email;
      name = body.name || body.email.split("@")[0];
      avatar = body.avatar || body.picture || "";
      googleId = body.googleId || "";
    }

    if (!email) {
      return NextResponse.json({ error: "Google authentication failed: Email not found" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim() || cleanEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

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
    let customer = db.customers.find((c: any) => c.email?.toLowerCase() === cleanEmail);
    let isNewUser = false;

    if (!customer) {
      isNewUser = true;
      customer = {
        id: `cust_${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        phone: "",
        avatar,
        googleId,
        tier: "Silver",
        points: 250,
        authProvider: "google",
        createdAt: new Date().toISOString(),
      };
      db.customers.push(customer);
    } else {
      if (avatar && !customer.avatar) customer.avatar = avatar;
      if (googleId && !customer.googleId) customer.googleId = googleId;
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
        avatar: customer.avatar,
        tier: customer.tier || "Silver",
        points: customer.points || 250,
      },
      message: isNewUser
        ? `Welcome to Gayatri Bhai, ${customer.name}! 250 points added.`
        : `Welcome back, ${customer.name}!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Google login failed" }, { status: 500 });
  }
}
