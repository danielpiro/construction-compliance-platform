// src/services/spaceService.ts
import apiClient from "./api";

interface ElementData {
  name: string;
  type: "Wall" | "Ceiling" | "Floor" | "Thermal Bridge";
  subType?:
    | "Outside Wall"
    | "Isolation Wall"
    | "Upper Open Space"
    | "Upper Close Room"
    | "Upper Roof"
    | "Under Roof";
}

interface SpaceData {
  name: string;
  type: "Bedroom" | "Protect Space" | "Wet Room" | "Balcony";
  elements?: ElementData[];
}

interface SpaceResponse {
  space: {
    _id: string;
    name: string;
    type: string;
    buildingType: string;
    createdAt: string;
    updatedAt: string;
  };
  elements: Array<ElementData & { _id: string; space: string }>;
}

// Space service
const spaceService = {
  // Get all spaces for a building type
  getSpaces: async (buildingTypeId: string) => {
    const response = await apiClient.get(
      `/building-types/${buildingTypeId}/spaces`
    );
    return response.data;
  },

  // Get single space by ID
  getSpace: async (spaceId: string) => {
    const response = await apiClient.get(`/spaces/${spaceId}`);
    return response.data;
  },

  // Create new space
  createSpace: async (
    buildingTypeId: string,
    spaceData: SpaceData
  ): Promise<SpaceResponse> => {
    const response = await apiClient.post(
      `/building-types/${buildingTypeId}/spaces`,
      spaceData
    );
    return response.data.data;
  },

  // Update space
  updateSpace: async (spaceId: string, spaceData: Partial<SpaceData>) => {
    const response = await apiClient.put(`/spaces/${spaceId}`, spaceData);
    return response.data;
  },

  // Delete space
  deleteSpace: async (spaceId: string) => {
    const response = await apiClient.delete(`/spaces/${spaceId}`);
    return response.data;
  },
};

export default spaceService;
