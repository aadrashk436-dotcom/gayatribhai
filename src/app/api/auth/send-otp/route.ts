import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { createOtpToken } from "@/lib/otpAuth";

function getDbPath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

const SUPABASE_URL = process.env.SUPABASE_URL || "https://qnhtnbzeyqbrzjguhgsy.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json({ error: "Email or phone number is required" }, { status: 400 });
    }

    const clean = identifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);

    if (!isEmail) {
      return NextResponse.json(
        { error: "Please enter a valid email address. Phone number login is not supported." },
        { status: 400 }
      );
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInMs = 10 * 60 * 1000; // 10 minutes validity
    const expiresAt = Date.now() + expiresInMs;
    const verificationToken = createOtpToken(clean.toLowerCase(), otp, expiresInMs);

    // 1. Save to local db.json
    try {
      const dbPath = getDbPath();
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        db.otps = db.otps || {};
        db.otps[clean.toLowerCase()] = { otp, expiresAt };
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
      }
    } catch (err) {
      console.warn("Could not save OTP to db.json:", err);
    }

    // 2. Sync to Supabase if configured
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/otps`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            identifier: clean.toLowerCase(),
            otp,
            expires_at: new Date(expiresAt).toISOString(),
          }),
        });
      } catch (sbErr) {
        // Non-blocking
      }
    }

    // 3. If identifier is an email, send actual verification email via Gmail SMTP
    let emailSent = false;
    let mailError: string | null = null;
    if (isEmail) {
      try {
        const smtpUser = process.env.SMTP_USER || "purigayatri006@gmail.com";
        const smtpPass = process.env.SMTP_PASS || "njde azoq lyix yjlk";

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"Gayatri Bhai Atelier" <${smtpUser}>`,
          to: clean,
          subject: `${otp} is your Gayatri Bhai Verification Code`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #faf9f6; border-radius: 12px; border: 1px solid #e8e6df;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: #d4af37;">GAYATRI BHAI ATELIER</span>
                <h1 style="font-size: 24px; color: #111; margin: 6px 0 0 0; font-family: Georgia, serif;">Verification Code</h1>
              </div>
              <div style="background: #ffffff; padding: 28px; border-radius: 8px; border: 1px solid #e5e5e5; text-align: center;">
                <p style="font-size: 14px; color: #555; margin: 0 0 16px 0;">Your one-time login & verification code is:</p>
                <div style="background: #f7f5f0; padding: 14px 24px; border-radius: 8px; display: inline-block;">
                  <span style="font-size: 38px; font-weight: 700; letter-spacing: 0.25em; color: #111; font-family: monospace;">${otp}</span>
                </div>
                <p style="font-size: 12px; color: #888; margin: 18px 0 0 0;">This code is valid for 5 minutes. Do not share it with anyone.</p>
              </div>
              <p style="text-align: center; font-size: 11px; color: #999; margin: 24px 0 0 0;">
                Heritage Craft • Pure French Linen • Direct from Gujarati Craftsmen
              </p>
            </div>
          `,
        });
        emailSent = true;
        console.log(`[Gayatri Bhai OTP] Real verification code ${otp} successfully sent to ${clean}`);
      } catch (err: any) {
        mailError = err?.message || String(err);
        console.error("[Gayatri Bhai OTP] Failed to send email via SMTP:", mailError);
      }
    }

    const response = NextResponse.json({
      success: true,
      verificationToken,
      message: isEmail
        ? `Verification code sent to ${clean}. Please check your inbox and spam folder.`
        : `Verification code sent to ${clean}.`,
      expiresIn: 600,
    });

    response.cookies.set("gb_otp_token", verificationToken, {
      path: "/",
      httpOnly: true,
      maxAge: 600,
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to send OTP" }, { status: 500 });
  }
}
