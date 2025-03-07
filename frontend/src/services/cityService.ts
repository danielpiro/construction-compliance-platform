// src/services/cityService.ts
import apiClient from "./api";

interface City {
  city: string;
  area: "A" | "B" | "C" | "D";
}

// City service
const cityService = {
  // Search cities with autocomplete
  searchCities: async (query: string): Promise<City[]> => {
    const response = await apiClient.get(
      `/cities/search?query=${encodeURIComponent(query)}`
    );
    return response.data.data;
  },

  // Get city details by name
  getCityByName: async (name: string): Promise<City> => {
    const response = await apiClient.get(`/cities/${encodeURIComponent(name)}`);
    return response.data.data;
  },
};

export default cityService;
