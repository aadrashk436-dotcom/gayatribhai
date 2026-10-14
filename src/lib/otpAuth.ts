import crypto from "crypto";

const OTP_SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "gb_atelier_otp_stateless_secret_2026_xK9mN3pQ7rT1";

/**
 * Generate a cryptographically signed OTP verification token.
 * Stateless and 100% resilient on serverless platforms (Vercel, AWS Lambda).
 */
export function createOtpToken(identifier: string, otp: string, expiresInMs = 10 * 60 * 1000): string {
  const clean = identifier.toLowerCase().trim();
  const cleanOtp = String(otp || "").trim();
  const expiresAt = Date.now() + expiresInMs;
  const payload = `${clean}:${cleanOtp}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", OTP_SECRET).update(payload).digest("hex");
  return `${expiresAt}.${signature}`;
}

/**
 * Verify an OTP against a signed token without relying on server file storage.
 */
export function verifyOtpToken(
  identifier: string,
  otp: string,
  token?: string | null
): { valid: boolean; reason?: "expired" | "invalid_token" | "invalid_code" } {
  try {
    if (!identifier || !otp || !token) {
      return { valid: false, reason: "invalid_token" };
    }
    const clean = identifier.toLowerCase().trim();
    const cleanOtp = String(otp || "").trim();
    const parts = token.trim().split(".");
    if (parts.length !== 2) {
      return { valid: false, reason: "invalid_token" };
    }
    const [expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt)) {
      return { valid: false, reason: "invalid_token" };
    }
    if (Date.now() > expiresAt) {
      return { valid: false, reason: "expired" };
    }
    const expectedPayload = `${clean}:${cleanOtp}:${expiresAt}`;
    const expectedSignature = crypto.createHmac("sha256", OTP_SECRET).update(expectedPayload).digest("hex");

    if (
      signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
    ) {
      return { valid: true };
    }
    return { valid: false, reason: "invalid_code" };
  } catch (err) {
    console.warn("[OTP verifyOtpToken error]:", err);
    return { valid: false, reason: "invalid_token" };
  }
}
