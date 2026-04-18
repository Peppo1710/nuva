import axios from "axios";
import { Platform } from "react-native";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  return Platform.OS === "android"
    ? "http://10.0.2.2:3000/v1"
    : "http://localhost:3000/v1";
};

const BASE_URL = getBaseUrl();
console.log(`[Nuva API] Platform=${Platform.OS} baseURL=${BASE_URL}`);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const userId = useAuthStore.getState().user?.id;
    if (userId) config.headers["x-user-id"] = userId;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // Clear offline flag on successful response
    useUIStore.getState().setOffline(false);
    return response;
  },
  async (error) => {
    console.log(`[Nuva API] ERROR: ${error.message} | code=${error.code} | url=${error.config?.baseURL}${error.config?.url} | status=${error.response?.status ?? "none"}`);

    if (!error.response) {
      const isNetworkError =
        error.code === "ECONNREFUSED" ||
        error.code === "ENOTFOUND" ||
        error.code === "NETWORK_ERROR" ||
        error.message === "Network Error";

      const base = error.config?.baseURL || "";
      const isLocalDev =
        base.includes("localhost") ||
        base.includes("10.0.2.2") ||
        base.includes("127.0.0.1") ||
        /192\.168\.\d+\.\d+/.test(base) ||
        /10\.\d+\.\d+\.\d+/.test(base) ||
        /172\.(1[6-9]|2\d|3[01])\.\d+\.\d+/.test(base);

      if (isNetworkError && !isLocalDev) {
        useUIStore.getState().setOffline(true);
      }
    } else {
      // We got a response (4xx, 5xx), so definitely not offline
      useUIStore.getState().setOffline(false);
    }

    return Promise.reject(error);
  }
);

export default api;
