import axios from "axios";
import { Platform } from "react-native";
import { useUIStore } from "@/store/uiStore";

// Fixed dev UUID sent on every request (must be valid UUID for Supabase columns)
const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  return Platform.OS === "android"
    ? "http://10.0.2.2:3000/v1"
    : "http://localhost:3000/v1";
};

const BASE_URL = getBaseUrl();
console.log(`[MediAssist API] Platform=${Platform.OS} baseURL=${BASE_URL}`);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Dummy auth: send a fixed user ID header instead of a real Bearer token
    config.headers["x-user-id"] = DEV_USER_ID;
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
    console.log(`[MediAssist API] ERROR: ${error.message} | code=${error.code} | url=${error.config?.baseURL}${error.config?.url} | status=${error.response?.status ?? "none"}`);

    if (!error.response) {
      const isNetworkError =
        error.code === "ECONNREFUSED" ||
        error.code === "ENOTFOUND" ||
        error.code === "NETWORK_ERROR" ||
        error.message === "Network Error";

      // If the backend is simply down/unreachable on emulator, don't show offline banner
      // The backend might be down but the device still has internet
      // Only show banner if the error looks like a genuine connectivity loss
      if (
        isNetworkError &&
        error.config?.baseURL?.includes("localhost") === false &&
        error.config?.baseURL?.includes("10.0.2.2") === false
      ) {
        useUIStore.getState().setOffline(true);
      }
      // For localhost/10.0.2.2 (dev), never show the offline banner
      // since it just means the dev server is not running
    } else {
      // We got a response (4xx, 5xx), so definitely not offline
      useUIStore.getState().setOffline(false);
    }

    return Promise.reject(error);
  }
);

export default api;
