import axios from "axios";

// Define the API base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Response types
interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
}

interface PasswordResetRequest {
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyName?: string;
  companyAddress?: string;
}

interface UpdateProfileData {
  name: string;
  companyName?: string;
  companyAddress?: string;
}

interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface UpdateEmailData {
  newEmail: string;
  password: string;
}

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth service methods
const authService = {
  // Register user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      throw error;
    }
  },

  // Login user
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      console.log(
        `Attempting to login with email: ${email} to ${API_URL}/auth/login`
      );
      const response = await apiClient.post("/auth/login", { email, password });
      console.log("Login response:", response.data);

      if (response.data.success && response.data.token) {
        // Store token in localStorage
        localStorage.setItem("token", response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (token: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.get(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (data: { email: string }): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post("/auth/forgot-password", data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      throw error;
    }
  },

  // Reset password
  resetPassword: async (
    token: string,
    data: PasswordResetRequest
  ): Promise<AuthResponse> => {
    try {
      const response = await apiClient.put(
        `/auth/reset-password/${token}`,
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      throw error;
    }
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem("token");
  },

  // Get token
  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData) => {
    const response = await apiClient.put("/auth/update-details", data);
    return response.data;
  },

  // Update password
  updatePassword: async (data: UpdatePasswordData) => {
    const response = await apiClient.put("/auth/update-password", data);
    return response.data;
  },

  // Update email
  updateEmail: async (data: UpdateEmailData) => {
    const response = await apiClient.put("/auth/update-email", data);
    return response.data;
  },

  // Delete account
  deleteAccount: async () => {
    const response = await apiClient.delete("/auth/delete-account");
    return response.data;
  },
};

export default authService;
