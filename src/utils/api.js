import axios from "axios";

// 🔍 Debug (remove after testing)
console.log("ENV VITE_API_URL:", import.meta.env.VITE_API_URL);

// ✅ Get backend URL from env
const envUrl = import.meta.env.VITE_API_URL;

if (!envUrl) {
  throw new Error("❌ VITE_API_URL is not defined in environment variables");
}

// ✅ Normalize URL (remove trailing slash + ensure /api)
const trimmed = envUrl.replace(/\/$/, "");
const baseURL = trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;

// ✅ Create axios instance
const api = axios.create({
  baseURL,
  withCredentials: true,
});

// ✅ Request interceptor (attach token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("pf_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor (handle auth errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("pf_token");
      localStorage.removeItem("pf_user");

      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
