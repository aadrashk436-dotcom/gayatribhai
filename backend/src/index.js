import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import helmet from "helmet";

// Middlewares
import { authenticateAdmin } from "./middleware/auth.js";

// Public / Customer Routes
import authRoutes from "./routes/auth.js";
import productsRoutes from "./routes/products.js";
import checkoutRoutes from "./routes/checkout.js";
import ordersRoutes from "./routes/orders.js";
import shippingRoutes from "./routes/shipping.js";
import bannersRoutes from "./routes/banners.js";
import blogRoutes from "./routes/blog.js";
import reelsRoutes from "./routes/reels.js";
import contactRoutes from "./routes/contact.js";
import couponsRoutes from "./routes/coupons.js";
import addressesRoutes from "./routes/addresses.js";

// Admin Routes
import adminAuthRoutes from "./routes/admin/auth.js";
import adminDashboardRoutes from "./routes/admin/dashboard.js";
import adminProductsRoutes from "./routes/admin/products.js";
import adminOrdersRoutes from "./routes/admin/orders.js";
import adminCustomersRoutes from "./routes/admin/customers.js";
import adminCouponsRoutes from "./routes/admin/coupons.js";
import adminBannersRoutes from "./routes/admin/banners.js";
import adminBlogRoutes from "./routes/admin/blog.js";
import adminReelsRoutes from "./routes/admin/reels.js";
import adminContactsRoutes from "./routes/admin/contacts.js";
import adminSettingsRoutes from "./routes/admin/settings.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Security & CORS
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Gayatri Bhai E-Commerce Backend",
    timestamp: new Date().toISOString()
  });
});

// Customer & Public Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/banners", bannersRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/reels", reelsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/coupons", couponsRoutes);
app.use("/api/addresses", addressesRoutes);

// Admin Routes
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/dashboard", authenticateAdmin, adminDashboardRoutes);
app.use("/api/admin/products", authenticateAdmin, adminProductsRoutes);
app.use("/api/admin/orders", authenticateAdmin, adminOrdersRoutes);
app.use("/api/admin/customers", authenticateAdmin, adminCustomersRoutes);
app.use("/api/admin/coupons", authenticateAdmin, adminCouponsRoutes);
app.use("/api/admin/banners", authenticateAdmin, adminBannersRoutes);
app.use("/api/admin/blog", authenticateAdmin, adminBlogRoutes);
app.use("/api/admin/reels", authenticateAdmin, adminReelsRoutes);
app.use("/api/admin/contacts", authenticateAdmin, adminContactsRoutes);
app.use("/api/admin/settings", authenticateAdmin, adminSettingsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

const server = app.listen(PORT, () => {
  console.log(`✨ Gayatri Bhai Backend Server running on http://localhost:${PORT}`);
});

export default app;
