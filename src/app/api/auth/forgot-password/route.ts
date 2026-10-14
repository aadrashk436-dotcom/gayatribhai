import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

function getDbPath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

const SUPABASE_URL = process.env.SUPABASE_URL || "https://qnhtnbzeyqbrzjguhgsy.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const cleanEmail = (email || "").toLowerCase().trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
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

    db.customers = db.customers || [];
    const customer = db.customers.find((c: any) => c.email?.toLowerCase() === cleanEmail);

    // If Gayatri Puri admin
    const isAdmin = cleanEmail === "gayatripuri634@gmail.com";

    if (!customer && !isAdmin) {
      return NextResponse.json(
        { error: "No account found with this email. Please check the email or create a new account." },
        { status: 404 }
      );
    }

    // Generate 6-digit Reset Code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    db.otps = db.otps || {};
    db.otps[cleanEmail] = { otp, expiresAt, type: "password_reset" };

    try {
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
    } catch (saveErr) {
      console.warn("Could not save to db.json:", saveErr);
    }

    // Supabase sync
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
            identifier: cleanEmail,
            otp,
            expires_at: new Date(expiresAt).toISOString(),
          }),
        });
      } catch (sbErr) {
        // Non-blocking
      }
    }

    // Send real Password Reset email via Gmail SMTP
    let emailSent = false;
    let mailError: string | null = null;
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
        to: cleanEmail,
        subject: `${otp} is your Gayatri Bhai Password Reset Code`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #faf9f6; border-radius: 12px; border: 1px solid #e8e6df;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: #d4af37;">GAYATRI BHAI ATELIER</span>
              <h1 style="font-size: 24px; color: #111; margin: 6px 0 0 0; font-family: Georgia, serif;">Reset Your Password</h1>
            </div>
            <div style="background: #ffffff; padding: 28px; border-radius: 8px; border: 1px solid #e5e5e5; text-align: center;">
              <p style="font-size: 14px; color: #555; margin: 0 0 16px 0;">Use the verification code below to set a new password for your account:</p>
              <div style="background: #f7f5f0; padding: 14px 24px; border-radius: 8px; display: inline-block;">
                <span style="font-size: 38px; font-weight: 700; letter-spacing: 0.25em; color: #b4321f; font-family: monospace;">${otp}</span>
              </div>
              <p style="font-size: 12px; color: #888; margin: 18px 0 0 0;">This code is valid for 10 minutes. If you did not request this, you can safely ignore this email.</p>
            </div>
            <p style="text-align: center; font-size: 11px; color: #999; margin: 24px 0 0 0;">
              Gayatri Bhai Atelier • Handcrafted Luxury Linen • Surat & Mumbai
            </p>
          </div>
        `,
      });
      emailSent = true;
      console.log(`[Gayatri Bhai Reset] Reset code ${otp} sent to ${cleanEmail}`);
    } catch (mailErr: any) {
      mailError = mailErr?.message || String(mailErr);
      console.error("[Gayatri Bhai Reset] SMTP Error:", mailError);
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? `Password reset code sent to ${cleanEmail}. Please check your inbox and spam folder.`
        : `Password reset code generated. Use code ${otp} to reset your password.`,
      expiresIn: 600,
      devOtp: otp,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process password reset" }, { status: 500 });
  }
}
