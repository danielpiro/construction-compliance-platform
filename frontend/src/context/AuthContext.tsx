import React, { createContext, useState, useEffect, ReactNode } from "react";
import authService from "../services/authService";
import { saveToken, removeToken, hasToken } from "../utils/tokenStorage";

// User interface
interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    projectUpdates: boolean;
    systemAnnouncements: boolean;
  };
  appearance: {
    theme: "light" | "dark" | "system";
    language: string;
    density: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  companyName?: string;
  companyAddress?: string;
  settings: UserSettings;
}

// AuthContext interface
export interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    company?: string,
    address?: string
  ) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  setError: (error: string) => void;
  updateUserData: (newUserData: Partial<User>) => void;
}

// Create context with default undefined value
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Context provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (hasToken()) {
          // Verify token and get user data
          const response = await authService.getCurrentUser();

          if (response.success && response.data) {
            setUser(response.data);
            setIsLoggedIn(true);
          } else {
            // If getting user data fails, remove token
            removeToken();
            setIsLoggedIn(false);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        removeToken();
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(email, password);

      if (response.success && response.token) {
        // Save token and set auth state
        saveToken(response.token);

        // Get user data after successful login
        const userResponse = await authService.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
          setIsLoggedIn(true);
          return true;
        }
      }

      // If we reach here, login failed
      setError(response.message || "Login failed. Please try again.");
      return false;
    } catch (err) {
      // Handle login error
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (
    name: string,
    email: string,
    password: string,
    company?: string,
    address?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const userData = {
        name,
        email,
        password,
        companyName: company,
        companyAddress: address,
      };

      const response = await authService.register(userData);

      if (response.success) {
        return true;
      } else {
        setError(response.message || "Registration failed. Please try again.");
        return false;
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    removeToken();
    setIsLoggedIn(false);
    setUser(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Update user data
  const updateUserData = (newUserData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...newUserData });
    }
  };

  // AuthContext value
  const contextValue: AuthContextType = {
    isLoggedIn,
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    setError,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
