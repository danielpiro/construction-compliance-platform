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

  // Cache keys
  const USER_CACHE_KEY = "userData";
  const CACHE_EXPIRY_KEY = "userCacheExpiry";
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  // Cache management functions
  const setCachedUser = (userData: User) => {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
    localStorage.setItem(
      CACHE_EXPIRY_KEY,
      (Date.now() + CACHE_DURATION).toString()
    );
  };

  const getCachedUser = (): User | null => {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);

    if (cached && expiry && Date.now() < parseInt(expiry)) {
      try {
        return JSON.parse(cached);
      } catch {
        // Ignore parse error
        return null;
      }
    }
    return null;
  };

  const clearUserCache = () => {
    localStorage.removeItem(USER_CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
  };

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (hasToken()) {
          // 1. Quick local check with cached data
          const cachedUser = getCachedUser();
          if (cachedUser) {
            setUser(cachedUser);
            setIsLoggedIn(true);
            setLoading(false);
          }

          // 2. Background sync for fresh data
          try {
            const response = await authService.getCurrentUser();
            if (response.success && response.data) {
              setUser(response.data);
              setCachedUser(response.data);
              setIsLoggedIn(true);
            } else {
              if (!cachedUser) {
                // Only clear if we didn't have cached data
                removeToken();
                setIsLoggedIn(false);
                setUser(null);
              }
            }
          } catch (error) {
            console.error("Background sync failed:", error);
            if (!cachedUser) {
              // Only clear if we didn't have cached data
              removeToken();
              setIsLoggedIn(false);
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        removeToken();
        clearUserCache();
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
    clearUserCache();
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
      const updatedUser = { ...user, ...newUserData };
      setUser(updatedUser);
      setCachedUser(updatedUser);
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
