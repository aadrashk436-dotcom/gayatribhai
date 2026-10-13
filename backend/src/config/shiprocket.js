// Shiprocket API token management — token valid for 10 days
let cachedToken = null;
let tokenExpiry = null;

const SHIPROCKET_BASE = "https://apiv2.shiprocket.in/v1/external";

async function getToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  const data = await res.json();
  if (!data.token) throw new Error("Shiprocket login failed: " + JSON.stringify(data));

  cachedToken = data.token;
  tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000; // refresh 1 day before expiry
  return cachedToken;
}

export async function shiprocketFetch(endpoint, options = {}) {
  const token = await getToken();
  const url = `${SHIPROCKET_BASE}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    body: options.body ? (typeof options.body === "string" ? options.body : JSON.stringify(options.body)) : undefined,
  });

  const data = await res.json();
  return data;
}

export { SHIPROCKET_BASE };
