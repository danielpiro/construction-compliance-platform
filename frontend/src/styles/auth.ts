// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  address?: string;
}

// Auth context interface
export interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>; // Return boolean for success/failure
  register: (
    name: string,
    email: string,
    password: string,
    company?: string,
    address?: string
  ) => Promise<boolean>; // Return boolean
  logout: () => void;
  clearError: () => void;
}
