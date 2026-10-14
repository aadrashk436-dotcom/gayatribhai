import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { sendOtpEmail } from "@/lib/mailer";
import { createOtpToken, verifyOtpToken } from "@/lib/otpAuth";

function getDbPath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

const SUPABASE_URL = process.env.SUPABASE_URL || "https://qnhtnbzeyqbrzjguhgsy.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, otp, step, verificationToken } = body;

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

    // 4. Read Database
    const dbPath = getDbPath();
    let db: any = { customers: [], otps: {} };
    if (fs.existsSync(dbPath)) {
      try {
        db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      } catch (e) {
        console.warn("DB read error:", e);
      }
    }
    db.customers = db.customers || [];
    db.otps = db.otps || {};

    // 5. Check if email already registered (Duplicate Email Check)
    let existingUser = db.customers.find((c: any) => c.email?.toLowerCase().trim() === cleanEmail);
    if (!existingUser && SUPABASE_URL && SUPABASE_KEY) {
      try {
        const sbRes = await fetch(
          `${SUPABASE_URL}/rest/v1/customers?email=eq.${encodeURIComponent(cleanEmail)}&select=*`,
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
            existingUser = rows[0];
            db.customers.push(existingUser);
          }
        }
      } catch {}
    }

    if (existingUser) {
      return NextResponse.json(
        {
          error: "You already have an account with this email. Please sign in to your account.",
          alreadyExists: true,
          email: cleanEmail,
          name: existingUser.name || cleanName,
        },
        { status: 409 }
      );
    }

    // ── STEP 1: VALID DETAILS -> SEND OTP TO EMAIL ──
    const isVerifyStep = step === "verify" || Boolean(otp);

    if (!isVerifyStep) {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresInMs = 10 * 60 * 1000; // 10 minutes
      const expiresAt = Date.now() + expiresInMs;
      const token = createOtpToken(cleanEmail, generatedOtp, expiresInMs);

      db.otps[cleanEmail] = {
        otp: generatedOtp,
        expiresAt,
        name: cleanName,
        password,
        type: "signup",
      };

      try {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
      } catch (saveErr) {
        console.warn("Could not write db.json:", saveErr);
      }

      // Send email via Gmail SMTP
      try {
        await sendOtpEmail({
          to: cleanEmail,
          otp: generatedOtp,
          title: "Account Verification Code",
          purpose: `Welcome ${cleanName}! Use this 6-digit verification code to complete your Gayatri Bhai account registration:`,
        });
      } catch (mailErr: any) {
        console.error("[Signup OTP] Email send error:", mailErr);
      }

      const response = NextResponse.json({
        success: true,
        otpRequired: true,
        email: cleanEmail,
        verificationToken: token,
        message: `Verification code sent to ${cleanEmail}. Please enter the 6-digit code to complete registration.`,
      });

      response.cookies.set("gb_otp_token", token, {
        path: "/",
        httpOnly: true,
        maxAge: 600,
        sameSite: "lax",
      });

      return response;
    }

    // ── STEP 2: VERIFY OTP CODE & CREATE ACCOUNT ──
    const cleanOtp = String(otp || "").trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      return NextResponse.json({ error: "Please enter the 6-digit verification code" }, { status: 400 });
    }

    // Read cookie token if available
    const cookieHeader = request.headers.get("cookie") || "";
    const cookieToken = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("gb_otp_token="))
      ?.split("=")[1];

    const tokenToCheck = verificationToken || cookieToken;

    let isValidOtp = false;

    // 1. Verify stateless cryptographic token (resilient across serverless instances)
    if (tokenToCheck) {
      const verifyRes = verifyOtpToken(cleanEmail, cleanOtp, tokenToCheck);
      if (verifyRes.valid) {
        isValidOtp = true;
      }
    }

    // 2. Fallback check local db.otps
    if (!isValidOtp) {
      const record = db.otps?.[cleanEmail];
      if (record && record.otp === cleanOtp && Date.now() <= record.expiresAt) {
        isValidOtp = true;
      }
    }

    if (!isValidOtp) {
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please check your inbox and try again." },
        { status: 400 }
      );
    }

    // Clear used OTP
    if (db.otps[cleanEmail]) {
      delete db.otps[cleanEmail];
    }

    // Create Customer
    const customer = {
      id: `cust_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: (phone || "").trim(),
      password,
      tier: "Silver",
      points: 0,
      authProvider: "email",
      authProviders: ["email", "otp"],
      createdAt: new Date().toISOString(),
    };

    db.customers.push(customer);
    try {
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
    } catch (saveErr) {
      console.warn("Could not write db.json:", saveErr);
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
            phone: customer.phone,
            tier: customer.tier,
            points: customer.points,
            auth_provider: "email",
          }),
        });
      } catch {
        // Non-blocking
      }
    }

    const token = `gb_token_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const res = NextResponse.json(
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
    res.cookies.set("gb_otp_token", "", { path: "/", maxAge: 0 });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Signup failed. Please try again." }, { status: 500 });
  }
}
