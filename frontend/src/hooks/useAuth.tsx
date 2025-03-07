import React, { createContext, useContext, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyName?: string;
  companyAddress?: string;
}

// Export the User interface for use in other files
export type { User };

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  setError: (error: string) => void;
  updateUserData: (newUserData: Partial<User>) => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthProvider(); // Custom hook to manage authentication state

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
