import api from "./api";

export interface UserSettings {
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

export interface ProfileData {
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
  return response.data.data;
};

/**
 * Update the current user's profile data
 */
export const updateProfile = async (
  data: Partial<ProfileData>
): Promise<ProfileData> => {
  const response = await api.put("/user/profile", data);
  return response.data.data;
};

/**
 * Get user settings
 */
export const getSettings = async (): Promise<UserSettings> => {
  const response = await api.get("/user/settings");
  return response.data.data;
};

/**
 * Update user settings
 */
export const updateSettings = async (
  data: UserSettings
): Promise<UserSettings> => {
  const response = await api.put("/user/settings", data);
  return response.data.data;
};
