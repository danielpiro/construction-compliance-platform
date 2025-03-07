// src/utils/countries.ts
import fs from "fs";
import path from "path";

export interface City {
  city: string;
  area: "A" | "B" | "C" | "D";
}

let citiesCache: City[] | null = null;

/**
 * Load cities data from the countries.json file
 */
export const loadCities = (): City[] => {
  if (citiesCache) {
    return citiesCache;
  }

  try {
    const filePath = path.join(__dirname, "../../data/countries.json");
    const data = fs.readFileSync(filePath, "utf8");
    const cities = JSON.parse(data) as City[];

    citiesCache = cities;
    return cities;
  } catch (error) {
    console.error("Error loading cities data:", error);
    return [];
  }
};

/**
 * Search cities by name (partial match)
 */
export const searchCities = (query: string): City[] => {
  const cities = loadCities();
  if (!query) return cities;

  const lowerQuery = query.toLowerCase();
  return cities.filter((city) => city.city.toLowerCase().includes(lowerQuery));
};

/**
 * Get city by exact name
 */
export const getCityByName = (cityName: string): City | undefined => {
  const cities = loadCities();
  return cities.find(
    (city) => city.city.toLowerCase() === cityName.toLowerCase()
  );
};

/**
 * Get area for a city
 */
export const getAreaForCity = (
  cityName: string
): "A" | "B" | "C" | "D" | undefined => {
  const city = getCityByName(cityName);
  return city?.area;
};

export default {
  loadCities,
  searchCities,
  getCityByName,
  getAreaForCity,
};
