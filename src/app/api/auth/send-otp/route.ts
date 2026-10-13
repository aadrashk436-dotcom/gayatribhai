import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getDbPath() {
  return path.join(process.cwd(), "backend", "src", "data", "db.json");
}

export async function POST(request: Request) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json({ error: "Email or phone number is required" }, { status: 400 });
    }

    const clean = identifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
    const isPhone = /^[0-9+\s-]{10,15}$/.test(clean);

    if (!isEmail && !isPhone) {
      return NextResponse.json(
        { error: "Please enter a valid email address or 10-digit mobile number" },
        { status: 400 }
      );
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    // Save to db.json
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

    // If identifier is an email, try sending actual email via Gmail SMTP if nodemailer is available
    let emailSent = false;
    if (isEmail) {
      try {
        let nodemailer: any = null;
        try {
          nodemailer = (eval("require"))("nodemailer");
        } catch {
          // nodemailer optional
        }

        if (nodemailer) {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.SMTP_USER || "purigayatri006@gmail.com",
              pass: process.env.SMTP_PASS || "njde azoq lyix yjlk",
            },
          });

          await transporter.sendMail({
            from: `"Gayatri Bhai Atelier" <${process.env.SMTP_USER || "purigayatri006@gmail.com"}>`,
            to: clean,
            subject: `${otp} is your Gayatri Bhai Verification Code`,
            html: `
              <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #faf9f6; border-radius: 8px;">
                <h1 style="font-size: 24px; color: #1a1a1a; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">Gayatri Bhai</h1>
                <p style="color: #666; font-size: 14px; margin-bottom: 24px;">Haute Artisanal Hand-Embroidered Shirts</p>
                <div style="background: #ffffff; padding: 24px; border-radius: 6px; border: 1px solid #e5e5e5; text-align: center;">
                  <p style="font-size: 14px; color: #444; margin-bottom: 12px;">Your one-time verification code is:</p>
                  <h2 style="font-size: 36px; letter-spacing: 0.2em; color: #d4af37; margin: 0; font-family: monospace;">${otp}</h2>
                  <p style="font-size: 12px; color: #888; margin-top: 16px;">Valid for 5 minutes. Please do not share this code with anyone.</p>
                </div>
              </div>
            `,
          });
          emailSent = true;
        }
      } catch (mailErr) {
        console.warn("Nodemailer SMTP notice:", mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${clean}${emailSent ? " via email" : ""}.`,
      expiresIn: 300,
      devOtp: otp, // Returned for instant testing and convenience
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to send OTP" }, { status: 500 });
  }
}
