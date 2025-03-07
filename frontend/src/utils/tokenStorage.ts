// Utility functions for handling JWT tokens in localStorage

/**
 * Saves a JWT token to localStorage
 * @param token - The JWT token to save
 */
export const saveToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

/**
 * Retrieves the JWT token from localStorage
 * @returns The JWT token or null if not found
 */
export const getToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

/**
 * Removes the JWT token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem("auth_token");
};

/**
 * Checks if a token exists and is potentially valid
 * Note: This doesn't validate the token signature or check expiration
 * It only confirms a token exists
 * @returns Boolean indicating if a token exists
 */
export const hasToken = (): boolean => {
  return !!getToken();
};
