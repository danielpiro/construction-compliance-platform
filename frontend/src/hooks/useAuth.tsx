import { useContext } from "react";
import { AuthContext, AuthContextType } from "../context/AuthContext";

/**
 * Custom hook to access the authentication context
 * @returns Authentication context value
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// Re-export the AuthProvider from the context
export { AuthProvider } from "../context/AuthContext";
