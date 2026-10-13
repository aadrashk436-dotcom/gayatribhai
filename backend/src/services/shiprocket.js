import { shiprocketFetch } from "../config/shiprocket.js";

export async function createShiprocketOrder(order) {
  const items = order.items.map((item) => ({
    name: item.name,
    sku: item.sku || item.id,
    units: item.quantity,
    selling_price: item.price / 100,
    discount: 0,
    tax: 0,
    hsn: "",
  }));

  const addr = order.shipping_address;

  const payload = {
    order_id: order.order_number,
    order_date: new Date().toISOString().replace("T", " ").split(".")[0],
    pickup_location: "Primary",
    billing_customer_name: addr.name.split(" ")[0],
    billing_last_name: addr.name.split(" ").slice(1).join(" ") || "",
    billing_address: addr.street,
    billing_address_2: addr.area || "",
    billing_city: addr.city,
    billing_pincode: parseInt(addr.pincode),
    billing_state: addr.state,
    billing_country: "India",
    billing_email: order.customer_email || "",
    billing_phone: addr.phone.replace(/\D/g, "").slice(-10),
    shipping_is_billing: true,
    order_items: items,
    payment_method: order.payment_method === "cod" ? "COD" : "Prepaid",
    sub_total: order.subtotal / 100,
    length: order.package_length || 25,
    breadth: order.package_breadth || 20,
    height: order.package_height || 5,
    weight: order.package_weight || 0.5,
  };

  return shiprocketFetch("/orders/create/adhoc", {
    method: "POST",
    body: payload,
  });
}

export async function assignAWB(shipmentId, courierId) {
  const payload = { shipment_id: shipmentId };
  if (courierId) payload.courier_id = courierId;

  return shiprocketFetch("/courier/assign/awb", {
    method: "POST",
    body: payload,
  });
}

export async function schedulePickup(shipmentIds) {
  return shiprocketFetch("/courier/generate/pickup", {
    method: "POST",
    body: { shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds] },
  });
}

export async function trackShipment(awbCode) {
  return shiprocketFetch(`/courier/track/awb/${awbCode}`, { method: "GET" });
}

export async function trackByShipmentId(shipmentId) {
  return shiprocketFetch(`/courier/track/shipment/${shipmentId}`, { method: "GET" });
}

export async function cancelShiprocketOrder(orderIds) {
  return shiprocketFetch("/orders/cancel", {
    method: "POST",
    body: { ids: Array.isArray(orderIds) ? orderIds : [orderIds] },
  });
}

export async function generateLabel(shipmentIds) {
  return shiprocketFetch("/courier/generate/label", {
    method: "POST",
    body: { shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds] },
  });
}

export async function generateInvoice(orderIds) {
  return shiprocketFetch("/orders/print/invoice", {
    method: "POST",
    body: { ids: Array.isArray(orderIds) ? orderIds : [orderIds] },
  });
}

export async function checkServiceability(pickupPostcode, deliveryPostcode, weight, cod = 0, dimensions = {}) {
  const params = new URLSearchParams({
    pickup_postcode: pickupPostcode,
    delivery_postcode: deliveryPostcode,
    weight: weight.toString(),
    cod: cod.toString(),
  });

  if (dimensions.length) params.append("length", dimensions.length);
  if (dimensions.breadth) params.append("breadth", dimensions.breadth);
  if (dimensions.height) params.append("height", dimensions.height);
  if (dimensions.declared_value) params.append("declared_value", dimensions.declared_value);

  return shiprocketFetch(`/courier/serviceability/?${params.toString()}`, { method: "GET" });
}
