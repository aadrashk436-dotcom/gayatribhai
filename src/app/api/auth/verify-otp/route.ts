import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyOtpToken } from "@/lib/otpAuth";

function getDbPath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

export async function POST(request: Request) {
  try {
    const { identifier, otp, name, verificationToken } = await request.json();

    if (!identifier || !otp) {
      return NextResponse.json({ error: "Identifier and verification code are required" }, { status: 400 });
    }

    const clean = identifier.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    // Read cookie token if present
    const cookieHeader = request.headers.get("cookie") || "";
    const cookieToken = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("gb_otp_token="))
      ?.split("=")[1];

    const tokenToCheck = verificationToken || cookieToken;

    let isValidOtp = false;

    // 1. Verify stateless cryptographic token
    if (tokenToCheck) {
      const verifyRes = verifyOtpToken(clean, cleanOtp, tokenToCheck);
      if (verifyRes.valid) {
        isValidOtp = true;
      }
    }

    const dbPath = getDbPath();
    let db: any = { customers: [], otps: {} };
    if (fs.existsSync(dbPath)) {
      try {
        db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      } catch (e) {
        console.warn("DB read error:", e);
      }
    }

    // 2. Check local db.otps
    if (!isValidOtp) {
      const record = db.otps?.[clean];
      if (record && record.otp === cleanOtp && Date.now() <= record.expiresAt) {
        isValidOtp = true;
      }
    }

    const SUPABASE_URL = process.env.SUPABASE_URL || "https://qnhtnbzeyqbrzjguhgsy.supabase.co";
    const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 3. Fallback check Supabase
    if (!isValidOtp && SUPABASE_URL && SUPABASE_KEY) {
      try {
        const sbRes = await fetch(
          `${SUPABASE_URL}/rest/v1/otps?identifier=eq.${encodeURIComponent(clean)}&otp=eq.${encodeURIComponent(cleanOtp)}&expires_at=gte.${new Date().toISOString()}&select=*`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
          }
        );
        if (sbRes.ok) {
          const rows = await sbRes.json();
          if (Array.isArray(rows) && rows.length > 0) {
            isValidOtp = true;
          }
        }
      } catch (sbErr) {
        // Fallback
      }
    }

    if (!isValidOtp) {
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please check your inbox and try again." },
        { status: 400 }
      );
    }

    // Clean up used OTP
    if (db.otps && db.otps[clean]) {
      delete db.otps[clean];
    }

    db.customers = db.customers || [];
    let customer = db.customers.find(
      (c: any) => c.email?.toLowerCase().trim() === clean || (clean && c.phone === clean)
    );

    // Also check Supabase if not found in db.json
    if (!customer && SUPABASE_URL && SUPABASE_KEY) {
      try {
        const sbRes = await fetch(
          `${SUPABASE_URL}/rest/v1/customers?email=eq.${encodeURIComponent(clean)}&select=*`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
            cache: "no-store",
          }
        );
        if (sbRes.ok) {
          const rows = await sbRes.json();
          if (Array.isArray(rows) && rows.length > 0) {
            customer = rows[0];
            db.customers.push(customer);
          }
        }
      } catch {}
    }

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
        points: 0,
        authProvider: "otp",
        authProviders: ["otp"],
        createdAt: new Date().toISOString(),
      };
      db.customers.push(customer);
    } else {
      // PRESERVE ALL DATA: existing customer found!
      if (!customer.authProviders) {
        customer.authProviders = customer.authProvider ? [customer.authProvider] : ["email"];
      }
      if (!customer.authProviders.includes("otp")) {
        customer.authProviders.push("otp");
      }
    }

    const isAdmin = clean === "gayatripuri634@gmail.com";
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

    // Sync to Supabase
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
            id: customer.id,
            email: customer.email,
            name: customer.name,
            phone: customer.phone || "",
            avatar: customer.avatar || "",
            tier: customer.tier || "Silver",
            points: customer.points ?? 0,
            auth_provider: customer.authProvider || "otp",
          }),
        });
      } catch {}
    }

    const token = isAdmin ? `gb_admin_token_${Date.now()}` : `gb_token_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const response = NextResponse.json({
      success: true,
      token,
      isAdmin,
      isNewUser,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        avatar: customer.avatar || "",
        tier: customer.tier || "Silver",
        points: customer.points || 0,
        role: customer.role || (isAdmin ? "super_admin" : "customer"),
      },
      message: isAdmin
        ? "Welcome back, Store Admin Gayatri Puri!"
        : isNewUser
        ? "Account created successfully via OTP. Welcome to Gayatri Bhai!"
        : "Welcome back!",
    });

    response.cookies.set("gb_otp_token", "", { path: "/", maxAge: 0 });
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to verify OTP" }, { status: 500 });
  }
}
