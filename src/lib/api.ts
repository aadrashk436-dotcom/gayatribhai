const API_BASE_URL = (() => {
  if (typeof window !== "undefined") {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && envUrl.startsWith("/")) return envUrl;
    if (envUrl && !envUrl.includes("localhost:5000")) return envUrl;
    return "/api";
  }
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes("localhost:5000")) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }
  return "http://localhost:3000/api";
})();
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "gb_pub_live_2026_xK9mN3pQ7rT1vW5";

function getHeaders(token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ─── Products ───
export async function apiFetchProducts(params?: { category?: string; search?: string; sort?: string }) {
  try {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`${API_BASE_URL}/products?${q}`, {
      headers: getHeaders(),
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch (err) {
    console.error("apiFetchProducts error:", err);
    return null;
  }
}

export async function apiFetchProductBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${slug}`, {
      headers: getHeaders(),
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("apiFetchProductBySlug error:", err);
    return null;
  }
}

// ─── Banners ───
export async function apiFetchBanners() {
  try {
    const res = await fetch(`${API_BASE_URL}/banners`, {
      headers: getHeaders(),
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("apiFetchBanners error:", err);
    return [];
  }
}

// ─── Coupons ───
export async function apiValidateCoupon(code: string, subtotal: number) {
  const res = await fetch(`${API_BASE_URL}/coupons/validate`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ code, subtotal }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Invalid coupon");
  return data;
}

// ─── Shipping Calculation ───
export async function apiCalculateShipping(deliveryPincode: string, items: Array<{ productId: string; quantity: number }>) {
  const res = await fetch(`${API_BASE_URL}/shipping/calculate`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ deliveryPincode, items }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Shipping calculation failed");
  return data;
}

// ─── Checkout & Razorpay ───
export async function apiCreateOrder(
  items: Array<{ productId: string; quantity: number; size: string }>,
  address: any,
  couponCode?: string,
  token?: string,
  shippingOptions?: {
    shippingFee?: number;
    selectedCourier?: any;
    packageSummary?: any;
  }
) {
  const res = await fetch(`${API_BASE_URL}/checkout/create-order`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({
      items,
      address,
      couponCode,
      shippingFee: shippingOptions?.shippingFee,
      selectedCourier: shippingOptions?.selectedCourier,
      packageSummary: shippingOptions?.packageSummary,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create order");
  return data;
}

export async function apiVerifyPayment(
  paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId?: string;
  },
  token?: string
) {
  const res = await fetch(`${API_BASE_URL}/checkout/verify-payment`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(paymentData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Payment verification failed");
  return data;
}

// ─── Contact Form ───
export async function apiSubmitContact(formData: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  const res = await fetch(`${API_BASE_URL}/contact`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to submit message");
  return data;
}

export class AuthError extends Error {
  alreadyExists?: boolean;
  notFound?: boolean;
  incorrectPassword?: boolean;
  status: number;

  constructor(message: string, status: number, meta?: any) {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.alreadyExists = Boolean(meta?.alreadyExists);
    this.notFound = Boolean(meta?.notFound);
    this.incorrectPassword = Boolean(meta?.incorrectPassword);
  }
}

// ─── Customer Auth ───
export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new AuthError(data.error || "Login failed", res.status, data);
  }
  if (data.token && typeof window !== "undefined") {
    localStorage.setItem("gb_customer_token", data.token);
  }
  return data;
}

export async function apiSignup(formData: { name: string; email: string; phone?: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new AuthError(data.error || "Signup failed", res.status, data);
  }
  if (data.token && typeof window !== "undefined") {
    localStorage.setItem("gb_customer_token", data.token);
  }
  return data;
}

// ─── OTP Authentication ───
export async function apiSendOtp(identifier: string) {
  const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ identifier }),
  });
  const data = await res.json();
  if (!res.ok) throw new AuthError(data.error || "Failed to send verification code", res.status, data);
  return data;
}

export async function apiVerifyOtp(identifier: string, otp: string, name?: string) {
  const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ identifier, otp, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new AuthError(data.error || "Invalid verification code", res.status, data);
  if (data.token && typeof window !== "undefined") {
    localStorage.setItem("gb_customer_token", data.token);
  }
  return data;
}

// ─── Password Reset ───
export async function apiForgotPassword(email: string) {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new AuthError(data.error || "Failed to request password reset", res.status, data);
  return data;
}

export async function apiResetPassword(email: string, otp: string, newPassword: string) {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, otp, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new AuthError(data.error || "Failed to reset password", res.status, data);
  if (data.token && typeof window !== "undefined") {
    localStorage.setItem("gb_customer_token", data.token);
  }
  return data;
}

// ─── Google Authentication ───
export async function apiGoogleLogin(payload: {
  credential?: string;
  accessToken?: string;
  access_token?: string;
  email?: string;
  name?: string;
  avatar?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/auth/google`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new AuthError(data.error || "Google login failed", res.status, data);
  if (data.token && typeof window !== "undefined") {
    localStorage.setItem("gb_customer_token", data.token);
  }
  return data;
}

export async function apiDirectGmailLogin(email: string, name?: string) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName =
    name?.trim() ||
    cleanEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=0a0a0a,d4af37,18181b`;

  return apiGoogleLogin({
    email: cleanEmail,
    name: cleanName,
    avatar,
  });
}

export function apiLogout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("gb_customer_token");
  }
}

export function apiGetCurrentToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("gb_customer_token");
  }
  return null;
}

// ─── Dynamic Razorpay SDK Loader ───
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

