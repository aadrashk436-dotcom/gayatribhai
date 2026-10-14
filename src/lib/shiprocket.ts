// Shiprocket API Client with token caching & retry logic
const SHIPROCKET_BASE = "https://apiv2.shiprocket.in/v1/external";

let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function getShiprocketToken(): Promise<string> {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL || "gayatripuri634@gmail.com";
  const password = process.env.SHIPROCKET_PASSWORD || "1dIfzNNBvoux23^FX@ENPl3JlJyAE%@G";

  const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(data.message || "Shiprocket authentication failed");
  }

  cachedToken = data.token;
  // Cache token for 8 days (token expires in 10 days)
  tokenExpiry = Date.now() + 8 * 24 * 60 * 60 * 1000;
  return data.token as string;
}

export async function shiprocketFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await getShiprocketToken();
  const res = await fetch(`${SHIPROCKET_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  return data;
}

export interface ShiprocketOrderPayload {
  order_id: string;
  order_date?: string;
  pickup_location?: string;
  channel_id?: string;
  comment?: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: number | string;
  billing_state: string;
  billing_country?: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    discount?: number;
    tax?: number;
    hsn?: string | number;
  }>;
  payment_method: "COD" | "Prepaid";
  sub_total: number;
  length?: number;
  breadth?: number;
  height?: number;
  weight?: number;
}

/**
 * Creates an adhoc order in Shiprocket
 */
export async function createShiprocketOrder(payload: ShiprocketOrderPayload): Promise<any> {
  return shiprocketFetch("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify({
      pickup_location: "Primary",
      billing_country: "India",
      length: 25,
      breadth: 20,
      height: 5,
      weight: 0.5,
      ...payload,
    }),
  });
}

/**
 * Assigns AWB and courier to a created Shiprocket shipment
 */
export async function assignShiprocketAWB(shipmentId: number | string, courierId?: number | string): Promise<any> {
  const body: Record<string, any> = { shipment_id: shipmentId };
  if (courierId) body.courier_id = courierId;

  return shiprocketFetch("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Generate pickup request for shipment
 */
export async function scheduleShiprocketPickup(shipmentId: number | string): Promise<any> {
  return shiprocketFetch("/courier/generate/pickup", {
    method: "POST",
    body: JSON.stringify({ shipment_id: [shipmentId] }),
  });
}

/**
 * Track shipment by AWB
 */
export async function trackShiprocketAWB(awbCode: string): Promise<any> {
  return shiprocketFetch(`/courier/track/awb/${encodeURIComponent(awbCode)}`, {
    method: "GET",
  });
}

/**
 * Cancel order on Shiprocket
 */
export async function cancelShiprocketOrder(orderIds: number[] | string[]): Promise<any> {
  return shiprocketFetch("/orders/cancel", {
    method: "POST",
    body: JSON.stringify({ ids: orderIds }),
  });
}
