import jwt from "jsonwebtoken";

// Customer auth middleware
export function authenticateCustomer(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.customer = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Admin auth middleware
export function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Admin authentication required" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired admin token" });
  }
}

// API Key middleware — checks x-api-key header
export function validateApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) {
    return res.status(401).json({ error: "API key required" });
  }

  if (apiKey === process.env.API_PUBLIC_KEY || apiKey === process.env.API_PRIVATE_KEY) {
    req.apiKeyType = apiKey === process.env.API_PRIVATE_KEY ? "private" : "public";
    return next();
  }

  return res.status(403).json({ error: "Invalid API key" });
}

// Private API Key only
export function requirePrivateKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.API_PRIVATE_KEY) {
    return res.status(403).json({ error: "Private API key required" });
  }
  next();
}
