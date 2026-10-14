import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getDbPath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

const SUPABASE_URL = process.env.SUPABASE_URL || "https://qnhtnbzeyqbrzjguhgsy.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();

    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanOtp = (otp || "").toString().trim();
    const cleanPass = (newPassword || "").trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    if (!cleanOtp) {
      return NextResponse.json({ error: "Verification code is required." }, { status: 400 });
    }

    if (!cleanPass || cleanPass.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long." }, { status: 400 });
    }

    // Read DB
    const dbPath = getDbPath();
    let db: any = { customers: [], otps: {} };
    if (fs.existsSync(dbPath)) {
      try {
        db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      } catch (e) {
        console.warn("DB read error:", e);
      }
    }
    db.otps = db.otps || {};
    db.customers = db.customers || [];

    const record = db.otps[cleanEmail];

    // Strictly validate real stored OTP (no master code bypass)
    let isOtpValid = Boolean(record && record.otp === cleanOtp && (!record.expiresAt || Date.now() <= record.expiresAt));

    if (!isOtpValid && SUPABASE_URL && SUPABASE_KEY) {
      try {
        const sbRes = await fetch(
          `${SUPABASE_URL}/rest/v1/otps?identifier=eq.${encodeURIComponent(cleanEmail)}&otp=eq.${encodeURIComponent(cleanOtp)}&expires_at=gte.${new Date().toISOString()}&select=*`,
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
            isOtpValid = true;
          }
        }
      } catch (sbErr) {
        // Fallback
      }
    }

    if (!isOtpValid) {
      return NextResponse.json({ error: "Invalid or expired verification code. Please check your inbox and try again." }, { status: 400 });
    }

    // Find customer or create admin if needed
    const isAdmin = cleanEmail === "gayatripuri634@gmail.com";
    let customer = db.customers.find((c: any) => c.email?.toLowerCase() === cleanEmail);

    if (!customer) {
      if (isAdmin) {
        customer = {
          id: "admin_super_1",
          name: "Gayatri Puri (Store Owner)",
          email: "gayatripuri634@gmail.com",
          phone: "+91 98765 43210",
          tier: "Platinum",
          points: 10000,
          role: "super_admin",
          password: cleanPass,
        };
        db.customers.push(customer);
      } else {
        return NextResponse.json(
          { error: "Account not found for this email address." },
          { status: 404 }
        );
      }
    } else {
      customer.password = cleanPass;
    }

    // Clean up OTP
    delete db.otps[cleanEmail];

    // Persist to local JSON DB
    try {
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
    } catch (saveErr) {
      console.warn("Could not save to db.json:", saveErr);
    }

    // Update in Supabase if configured
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/customers?email=eq.${encodeURIComponent(cleanEmail)}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({ password: cleanPass }),
        });
      } catch (err: any) {
        console.warn("[Reset Password] Supabase update warning:", err?.message);
      }
    }

    const token = `gb_token_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return NextResponse.json({
      success: true,
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        avatar: customer.avatar || "",
        tier: customer.tier || (isAdmin ? "Platinum" : "Silver"),
        points: customer.points || (isAdmin ? 10000 : 250),
        role: isAdmin ? "super_admin" : (customer.role || "customer"),
      },
      message: "Password reset successful! You are now signed in.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to reset password." }, { status: 500 });
  }
}
