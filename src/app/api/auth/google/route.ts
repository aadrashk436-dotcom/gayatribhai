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

    // 1. Support Google ID Token (credential) via Google TokenInfo or base64url decode
    if (body.credential) {
      try {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.credential)}`,
          { cache: "no-store" }
        );
        if (verifyRes.ok) {
          const googleInfo = await verifyRes.json();
          email = googleInfo.email || "";
          name = googleInfo.name || googleInfo.given_name || "";
          avatar = googleInfo.picture || "";
          googleId = googleInfo.sub || "";
        }
      } catch (vErr) {
        console.warn("Google tokeninfo verify network error (falling back to JWT decode):", vErr);
      }

      if (!email) {
        try {
          const parts = body.credential.split(".");
          if (parts.length >= 2) {
            const payloadJson = Buffer.from(parts[1], "base64url").toString("utf8");
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
    }

    // 2. Support Google OAuth Access Token
    if (!email && (body.accessToken || body.access_token)) {
      const aToken = body.accessToken || body.access_token;
      try {
        const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${aToken}` },
          cache: "no-store",
        });
        if (userRes.ok) {
          const info = await userRes.json();
          email = info.email || "";
          name = info.name || info.given_name || "";
          avatar = info.picture || "";
          googleId = info.sub || "";
        }
      } catch (tokenErr) {
        console.warn("Google userinfo fetch error:", tokenErr);
      }
    }

    // 3. Direct profile fallback
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

    const isAdmin = cleanEmail === "gayatripuri634@gmail.com";
    if (isAdmin) {
      customer.tier = "Platinum";
      customer.points = Math.max(customer.points || 0, 10000);
      customer.role = "super_admin";
    }

    try {
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
    } catch (saveErr) {
      console.warn("Could not save to db.json:", saveErr);
    }

    const token = isAdmin ? `gb_admin_token_${Date.now()}` : `gb_token_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return NextResponse.json({
      success: true,
      token,
      isAdmin,
      isNewUser,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        avatar: customer.avatar,
        tier: customer.tier || "Silver",
        points: customer.points || 250,
        role: customer.role || (isAdmin ? "super_admin" : "customer"),
      },
      message: isAdmin
        ? `Welcome back, Store Admin ${customer.name}!`
        : isNewUser
        ? `Welcome to Gayatri Bhai, ${customer.name}! 250 points added.`
        : `Welcome back, ${customer.name}!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Google login failed" }, { status: 500 });
  }
}
