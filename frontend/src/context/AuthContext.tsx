import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

// Import the token storage utility
import {
  getToken,
  saveToken,
  removeToken,
  hasToken,
} from "../utils/tokenStorage";
import { AuthContextType, User } from "../styles/auth";

// Create context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
          const response = await axios.get("/api/users/me", {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          });

          setUser(response.data);
          setIsLoggedIn(true);
        }
      } catch (error) {
        // If token is invalid, remove it
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

      const response = await axios.post("/api/auth/login", { email, password });

      // Save token and set auth state
      saveToken(response.data.token);
      setUser(response.data.user);
      setIsLoggedIn(true);

      // Navigation will be handled by the component using this hook
      return true; // Return success status
    } catch (err) {
      // Handle login error
      if (axios.isAxiosError(err) && err.response) {
        setError(
          err.response.data.message || "Login failed. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      return false; // Return failure status
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

      await axios.post("/api/auth/register", {
        name,
        email,
        password,
        company,
        address,
      });

      // Return success status - navigation will be handled by the component
      return true;
    } catch (err) {
      // Handle registration error
      if (axios.isAxiosError(err) && err.response) {
        setError(
          err.response.data.message || "Registration failed. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    removeToken();
    setIsLoggedIn(false);
    setUser(null);
    // Navigation will be handled by the component using this hook
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export AuthContext for hook usage
export { AuthContext };
