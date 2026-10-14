import nodemailer from "nodemailer";

export async function sendOtpEmail(options: {
  to: string;
  otp: string;
  title?: string;
  purpose?: string;
}) {
  const smtpUser = process.env.SMTP_USER || "purigayatri006@gmail.com";
  const smtpPass = process.env.SMTP_PASS || "njde azoq lyix yjlk";

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const title = options.title || "Verification Code";
  const purpose = options.purpose || "Your one-time login & verification code is:";

  await transporter.sendMail({
    from: `"Gayatri Bhai Atelier" <${smtpUser}>`,
    to: options.to,
    subject: `${options.otp} is your Gayatri Bhai ${title}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #faf9f6; border-radius: 12px; border: 1px solid #e8e6df;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: #d4af37;">GAYATRI BHAI ATELIER</span>
          <h1 style="font-size: 24px; color: #111; margin: 6px 0 0 0; font-family: Georgia, serif;">${title}</h1>
        </div>
        <div style="background: #ffffff; padding: 28px; border-radius: 8px; border: 1px solid #e5e5e5; text-align: center;">
          <p style="font-size: 14px; color: #555; margin: 0 0 16px 0;">${purpose}</p>
          <div style="background: #f7f5f0; padding: 14px 24px; border-radius: 8px; display: inline-block;">
            <span style="font-size: 38px; font-weight: 700; letter-spacing: 0.25em; color: #111; font-family: monospace;">${options.otp}</span>
          </div>
          <p style="font-size: 12px; color: #888; margin: 18px 0 0 0;">This code is valid for 5 minutes. Do not share it with anyone.</p>
        </div>
        <p style="text-align: center; font-size: 11px; color: #999; margin: 24px 0 0 0;">
          Heritage Craft • Pure French Linen • Direct from Gujarati Craftsmen
        </p>
      </div>
    `,
  });
}
