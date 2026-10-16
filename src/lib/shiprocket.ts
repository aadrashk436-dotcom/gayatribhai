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
  shipping_charges?: number;
  total_discount?: number;
  discount?: number;
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
      shipping_charges: Number(payload.shipping_charges || 0),
      total_discount: Number(payload.total_discount || 0),
      ...payload,
    }),
  });
}

/**
 * Get full order details from Shiprocket by Shiprocket Order ID
 */
export async function getShiprocketOrderDetails(orderId: number | string): Promise<any> {
  return shiprocketFetch(`/orders/show/${encodeURIComponent(String(orderId))}`, {
    method: "GET",
  });
}

/**
 * Get available serviceable couriers for a destination pincode
 */
export async function getShiprocketServiceability(
  deliveryPincode: number | string,
  isCod: boolean = false,
  weight: number = 0.5,
  pickupPincode: number | string = "395002"
): Promise<any> {
  const pin = String(deliveryPincode).replace(/\D/g, "");
  const pPin = String(pickupPincode).replace(/\D/g, "") || "395002";
  const codParam = isCod ? 1 : 0;
  return shiprocketFetch(
    `/courier/serviceability/?pickup_postcode=${pPin}&delivery_postcode=${pin}&weight=${weight}&cod=${codParam}`,
    { method: "GET" }
  );
}

/**
 * Assigns AWB and courier to a created Shiprocket shipment.
 * Robustly parses AWB even if Shiprocket responds with "AWB is already assigned".
 */
export async function assignShiprocketAWB(
  shipmentId: number | string,
  courierId?: number | string,
  shiprocketOrderId?: number | string,
  preferredCourierName?: string
): Promise<{
  success: boolean;
  awb_code?: string;
  courier_name?: string;
  courier_company_id?: number | string;
  raw?: any;
}> {
  const body: Record<string, any> = { shipment_id: Number(shipmentId) || shipmentId };
  if (courierId) body.courier_id = Number(courierId) || courierId;

  const awbRes = await shiprocketFetch("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify(body),
  });

  // 1. Direct success
  if (awbRes?.response?.data?.awb_code) {
    return {
      success: true,
      awb_code: awbRes.response.data.awb_code,
      courier_name: awbRes.response.data.courier_name || preferredCourierName || "Shiprocket Express Partner",
      courier_company_id: awbRes.response.data.courier_company_id || courierId,
      raw: awbRes,
    };
  }

  // 2. Check if already assigned in error message (e.g. "AWB is already assigned with awb - 14112364702148 and status - AWB ASSIGNED")
  const errorMsg =
    awbRes?.response?.data?.awb_assign_error ||
    awbRes?.message ||
    JSON.stringify(awbRes);
  const match = errorMsg.match(/with awb\s*-\s*([A-Za-z0-9]+)/i);
  if (match && match[1]) {
    return {
      success: true,
      awb_code: match[1],
      courier_name: awbRes?.response?.data?.courier_name || preferredCourierName || "Shiprocket Express Partner",
      courier_company_id: awbRes?.response?.data?.courier_id || courierId,
      raw: awbRes,
    };
  }

  // 3. Fallback: inspect order via orders/show endpoint if shiprocketOrderId provided
  if (shiprocketOrderId) {
    try {
      const orderData = await getShiprocketOrderDetails(shiprocketOrderId);
      const shipments = orderData?.data?.shipments;
      const sh = Array.isArray(shipments) ? shipments[0] : shipments;
      if (sh?.awb) {
        return {
          success: true,
          awb_code: sh.awb,
          courier_name: sh.courier || "Shiprocket Express Partner",
          courier_company_id: sh.courier_id || courierId,
          raw: orderData,
        };
      }
    } catch (e) {
      console.warn("Fallback query order details error:", e);
    }
  }

  return {
    success: false,
    raw: awbRes,
  };
}

/**
 * Generate pickup request for shipment
 */
export async function scheduleShiprocketPickup(shipmentId: number | string): Promise<any> {
  return shiprocketFetch("/courier/generate/pickup", {
    method: "POST",
    body: JSON.stringify({ shipment_id: [Number(shipmentId) || shipmentId] }),
  });
}

/**
 * Generate Shipping Label (PDF)
 */
export async function generateShiprocketLabel(shipmentId: number | string): Promise<{ label_url?: string; label_created?: number; message?: string }> {
  return shiprocketFetch("/courier/generate/label", {
    method: "POST",
    body: JSON.stringify({ shipment_id: [Number(shipmentId) || shipmentId] }),
  });
}

/**
 * Generate Official Tax Invoice (PDF)
 */
export async function generateShiprocketInvoice(orderId: number | string): Promise<{ invoice_url?: string; is_invoice_created?: boolean; message?: string }> {
  return shiprocketFetch("/orders/print/invoice", {
    method: "POST",
    body: JSON.stringify({ ids: [Number(orderId) || orderId] }),
  });
}

/**
 * Track shipment by AWB or Shipment ID
 */
export async function trackShiprocketAWB(awbCode: string): Promise<any> {
  return shiprocketFetch(`/courier/track/awb/${encodeURIComponent(awbCode)}`, {
    method: "GET",
  });
}

export async function trackShiprocketShipment(shipmentId: number | string): Promise<any> {
  return shiprocketFetch(`/courier/track/shipment/${encodeURIComponent(String(shipmentId))}`, {
    method: "GET",
  });
}

/**
 * Cancel order on Shiprocket by Order IDs
 */
export async function cancelShiprocketOrder(orderIds: (number | string)[]): Promise<any> {
  const cleanIds = orderIds.map((id) => Number(id) || id).filter(Boolean);
  if (!cleanIds.length) return { message: "No order IDs provided" };
  return shiprocketFetch("/orders/cancel", {
    method: "POST",
    body: JSON.stringify({ ids: cleanIds }),
  });
}

/**
 * Cancel shipment by AWB on Shiprocket
 */
export async function cancelShiprocketShipmentAWBs(awbs: string[]): Promise<any> {
  const cleanAwbs = awbs.map((a) => String(a).trim()).filter(Boolean);
  if (!cleanAwbs.length) return { message: "No AWBs provided" };
  return shiprocketFetch("/orders/cancel/shipment/awbs", {
    method: "POST",
    body: JSON.stringify({ awbs: cleanAwbs }),
  });
}

/**
 * Fully cancel a shipment and/or order in Shiprocket matching Triotech pattern.
 * Cancels both the courier AWB (if assigned) and the Shiprocket Order itself.
 */
export async function cancelShiprocketComplete({
  orderNumber,
  shiprocketOrderId,
  awbNumber,
}: {
  orderNumber?: string;
  shiprocketOrderId?: number | string;
  awbNumber?: string;
} = {}): Promise<{
  awbCancelled: boolean;
  orderCancelled: boolean;
  shiprocketOrderIds: string[];
  errors: string[];
}> {
  const result = {
    awbCancelled: false,
    orderCancelled: false,
    shiprocketOrderIds: [] as string[],
    errors: [] as string[],
  };

  try {
    // 1. Cancel AWB if assigned and not a test placeholder
    if (awbNumber && !awbNumber.startsWith("SR-") && awbNumber.length > 5) {
      try {
        await cancelShiprocketShipmentAWBs([awbNumber]);
        result.awbCancelled = true;
      } catch (awbErr: any) {
        console.warn("Shiprocket AWB cancel notice:", awbErr?.message || awbErr);
        result.errors.push(`AWB cancel: ${awbErr?.message || awbErr}`);
      }
    }

    // 2. Identify all Shiprocket order IDs to cancel
    const idsToCancel = new Set<string>();
    if (shiprocketOrderId) {
      idsToCancel.add(String(shiprocketOrderId));
    }

    // Also search Shiprocket by channel_order_id if orderNumber is provided
    if (orderNumber) {
      try {
        const searchData = await shiprocketFetch(
          `/orders?filter_by=channel_order_id&filter_value=${encodeURIComponent(orderNumber)}`
        );
        const found = searchData?.data || [];
        for (const o of found) {
          if (o?.id) idsToCancel.add(String(o.id));
        }
      } catch (searchErr: any) {
        console.warn("Shiprocket order search notice:", searchErr?.message || searchErr);
      }
    }

    // 3. Cancel the Shiprocket order(s)
    if (idsToCancel.size > 0) {
      const idsArray = Array.from(idsToCancel);
      result.shiprocketOrderIds = idsArray;
      try {
        await cancelShiprocketOrder(idsArray);
        result.orderCancelled = true;
      } catch (cancelErr: any) {
        console.warn("Shiprocket order cancel notice:", cancelErr?.message || cancelErr);
        result.errors.push(`Order cancel: ${cancelErr?.message || cancelErr}`);
      }
    }
  } catch (err: any) {
    console.warn("cancelShiprocketComplete error:", err?.message || err);
    result.errors.push(err?.message || String(err));
  }

  return result;
}
