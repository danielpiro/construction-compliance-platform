import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

// Import token storage utilities
import { getToken, removeToken } from "../utils/tokenStorage";

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to attach token and handle FormData
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If sending FormData, let the browser set the correct Content-Type
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Don't redirect if it's a login attempt failure
      const isLoginEndpoint = error.config?.url?.includes("/auth/login");
      if (!isLoginEndpoint) {
        // Only remove token and redirect for non-login 401 errors
        removeToken();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
