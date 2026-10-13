import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const BRAND = "Gayatri Bhai";
const BRAND_COLOR = "#1a1a2e";
const ACCENT_COLOR = "#c9a96e";

function baseTemplate(title, content) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
  .container{max-width:600px;margin:0 auto;background:#fff}
  .header{background:${BRAND_COLOR};color:#fff;padding:24px;text-align:center}
  .header h1{margin:0;font-size:24px;letter-spacing:2px;color:${ACCENT_COLOR}}
  .body{padding:32px 24px}
  .footer{background:#f9f9f9;padding:16px 24px;text-align:center;font-size:12px;color:#888}
  .btn{display:inline-block;background:${BRAND_COLOR};color:#fff;padding:12px 32px;text-decoration:none;border-radius:4px;font-weight:600;margin:16px 0}
  .order-table{width:100%;border-collapse:collapse;margin:16px 0}
  .order-table th{text-align:left;padding:8px;border-bottom:2px solid #eee;font-size:13px;color:#666}
  .order-table td{padding:8px;border-bottom:1px solid #f0f0f0;font-size:14px}
  .status-badge{display:inline-block;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;text-transform:uppercase}
  h2{color:${BRAND_COLOR};margin-top:0}
</style></head><body>
<div class="container">
  <div class="header"><h1>${BRAND}</h1></div>
  <div class="body">${content}</div>
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} ${BRAND}. All rights reserved.</p>
    <p>Handcrafted with love in India</p>
  </div>
</div></body></html>`;
}

function formatPrice(paise) {
  return "Rs. " + (paise / 100).toLocaleString("en-IN");
}

function itemsTable(items) {
  const rows = items.map(i => `<tr>
    <td><img src="${i.image}" width="50" height="65" style="object-fit:cover;border-radius:4px" alt="${i.name}"></td>
    <td><strong>${i.name}</strong><br><span style="color:#888;font-size:12px">Size: ${i.size} | Qty: ${i.quantity}</span></td>
    <td style="text-align:right">${formatPrice(i.price * i.quantity)}</td>
  </tr>`).join("");
  return `<table class="order-table"><thead><tr><th></th><th>Product</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rows}</tbody></table>`;
}

export async function sendEmail({ to, subject, html }) {
  try {
    return await transporter.sendMail({
      from: `"${BRAND}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: baseTemplate(subject, html),
    });
  } catch (err) {
    console.warn("Could not dispatch email:", err.message);
    return null;
  }
}

export async function sendOrderConfirmation(order, customerEmail) {
  const content = `
    <h2>Order Confirmed! ✨</h2>
    <p>Hi ${order.shipping_address.name},</p>
    <p>Thank you for your order! We've received it and are getting it ready.</p>
    <p><strong>Order #${order.order_number}</strong></p>
    ${itemsTable(order.items)}
    <table style="width:100%;margin:16px 0">
      <tr><td>Subtotal</td><td style="text-align:right">${formatPrice(order.subtotal)}</td></tr>
      ${order.discount_amount ? `<tr><td>Discount</td><td style="text-align:right;color:green">-${formatPrice(order.discount_amount)}</td></tr>` : ""}
      <tr><td>Shipping</td><td style="text-align:right">${order.shipping_cost ? formatPrice(order.shipping_cost) : "FREE"}</td></tr>
      <tr><td><strong>Total</strong></td><td style="text-align:right"><strong>${formatPrice(order.total)}</strong></td></tr>
    </table>
    <p style="text-align:center"><a href="${process.env.FRONTEND_URL}/account" class="btn">Track Your Order</a></p>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `Order Confirmed - #${order.order_number}`,
    html: content,
  });
}

export async function sendStatusUpdate(order, customerEmail, status) {
  const statusMessages = {
    confirmed: { emoji: "✓", text: "Your order has been confirmed and is being processed." },
    processing: { emoji: "⏳", text: "Your order is being prepared for shipment." },
    shipped: { emoji: "📦", text: `Your order has been shipped! AWB: ${order.awb_code || "N/A"}` },
    delivered: { emoji: "🎉", text: "Your order has been delivered! We hope you love it." },
    cancelled: { emoji: "❌", text: "Your order has been cancelled." },
    rto: { emoji: "↩️", text: "Your shipment is being returned to origin." },
  };

  const info = statusMessages[status] || { emoji: "ℹ️", text: `Order status updated to: ${status}` };

  const content = `
    <h2>Order Update ${info.emoji}</h2>
    <p>Hi ${order.shipping_address?.name || "Customer"},</p>
    <p>${info.text}</p>
    <p><strong>Order #${order.order_number}</strong></p>
    ${order.awb_code && order.tracking_url ? `<p style="text-align:center"><a href="${order.tracking_url}" class="btn">Track Shipment</a></p>` : ""}
    ${order.items ? itemsTable(order.items) : ""}
  `;

  await sendEmail({
    to: customerEmail,
    subject: `Order ${status.charAt(0).toUpperCase() + status.slice(1)} - #${order.order_number}`,
    html: content,
  });
}

export async function sendRefundNotification(order, customerEmail, refundAmount) {
  const content = `
    <h2>Refund Initiated 💸</h2>
    <p>Hi ${order.shipping_address?.name || "Customer"},</p>
    <p>A refund of <strong>${formatPrice(refundAmount)}</strong> has been initiated for your order <strong>#${order.order_number}</strong>.</p>
    <p>The refund will be credited to your original payment method within 5-7 business days.</p>
    <p style="text-align:center"><a href="${process.env.FRONTEND_URL}/account" class="btn">View Order Details</a></p>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `Refund Initiated - #${order.order_number}`,
    html: content,
  });
}

export async function sendShippingLabel(order, customerEmail) {
  const content = `
    <h2>Shipping Label Generated 🏷️</h2>
    <p>Hi ${order.shipping_address?.name || "Customer"},</p>
    <p>Your order <strong>#${order.order_number}</strong> has been assigned AWB: <strong>${order.awb_code}</strong></p>
    <p>Courier: <strong>${order.courier_name || "Assigned"}</strong></p>
    ${order.tracking_url ? `<p style="text-align:center"><a href="${order.tracking_url}" class="btn">Track Your Shipment</a></p>` : ""}
  `;

  await sendEmail({
    to: customerEmail,
    subject: `Shipment Tracking - #${order.order_number}`,
    html: content,
  });
}

export default transporter;
