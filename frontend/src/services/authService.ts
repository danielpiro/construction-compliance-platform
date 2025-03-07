/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

// Define interfaces for auth responses
interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  data?: any;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyName?: string;
  companyAddress?: string;
}

interface PasswordResetRequest {
  password: string;
}

interface UpdateProfileData {
  name?: string;
  companyName?: string;
  companyAddress?: string;
  phone?: string;
  role?: string;
}

interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

const authService = {
  // Register user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as AuthResponse;
      }
      return {
        success: false,
        message: "Connection error. Please try again later.",
      };
    }
  },

  // Login user
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post("/auth/login", { email, password });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as AuthResponse;
      }
      return {
        success: false,
        message: "Connection error. Please try again later.",
      };
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<AuthResponse> => {
    try {
      const response = await api.get("/auth/me");
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      if (error.response) {
        return error.response.data as AuthResponse;
      }
      return {
        success: false,
        message: "Failed to fetch user data.",
      };
    }
  },

  // Verify email
  verifyEmail: async (token: string): Promise<AuthResponse> => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as AuthResponse;
      }
      return {
        success: false,
        message: "Email verification failed.",
      };
    }
  },

  // Forgot password
  forgotPassword: async (data: { email: string }): Promise<AuthResponse> => {
    try {
      const response = await api.post("/auth/forgot-password", data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as AuthResponse;
      }
      return {
        success: false,
        message: "Failed to process password reset request.",
      };
    }
  },

  // Reset password
  resetPassword: async (
    token: string,
    data: PasswordResetRequest
  ): Promise<AuthResponse> => {
    try {
      const response = await api.put(`/auth/reset-password/${token}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as AuthResponse;
      }
      return {
        success: false,
        message: "Failed to reset password.",
      };
    }
  },

  // Update profile
  updateProfile: async (data: UpdateProfileData): Promise<AuthResponse> => {
    try {
      const response = await api.put("/auth/update-profile", data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as AuthResponse;
      }
      return {
        success: false,
        message: "Failed to update profile.",
      };
    }
  },

  // Update password
  updatePassword: async (data: UpdatePasswordData): Promise<AuthResponse> => {
    try {
      const response = await api.put("/auth/update-password", data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data as AuthResponse;
      }
      return {
        success: false,
        message: "Failed to update password.",
      };
    }
  },

  // Logout user
  logout: (): void => {
    // Just client-side logout, no server call needed
    // The token will be removed in the auth context
  },
};

export default authService;
