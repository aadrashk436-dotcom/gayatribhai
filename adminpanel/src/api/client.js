import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? `${window.location.origin}/api`
    : "http://localhost:5000/api");
const API_KEY = import.meta.env.VITE_API_KEY || "gb_pub_live_2026_xK9mN3pQ7rT1vW5";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gb_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes("/login")) {
      localStorage.removeItem("gb_admin_token");
      localStorage.removeItem("gb_admin_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
