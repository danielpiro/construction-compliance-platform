import api from "./api";

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
}

/**
 * Get the current user's profile data
 */
export const getProfile = async (): Promise<ProfileData> => {
  const response = await api.get("/user/profile");
  return response.data;
};

/**
 * Update the current user's profile data
 */
export const updateProfile = async (
  data: Partial<ProfileData>
): Promise<ProfileData> => {
  const response = await api.put("/user/profile", data);
  return response.data;
};

// Email change functionality removed for now
