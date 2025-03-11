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
  getSpaces: async (projectId: string, typeId: string) => {
    const response = await apiClient.get(
      `/projects/${projectId}/types/${typeId}/spaces`
    );
    return response.data;
  },

  // Get single space by ID
  getSpace: async (projectId: string, typeId: string, spaceId: string) => {
    const response = await apiClient.get(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}`
    );
    return {
      success: true,
      data: response.data.data,
      elements: response.data.data.elements || [],
      message: response.data.message,
    };
  },

  // Create new space
  createSpace: async (
    projectId: string,
    typeId: string,
    spaceData: SpaceData
  ): Promise<SpaceResponse> => {
    const response = await apiClient.post(
      `/projects/${projectId}/types/${typeId}/spaces/create`,
      spaceData
    );
    return response.data.data;
  },

  // Update space
  updateSpace: async (
    projectId: string,
    typeId: string,
    spaceId: string,
    spaceData: Partial<SpaceData>
  ) => {
    const response = await apiClient.put(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}`,
      spaceData
    );
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  },

  // Delete space
  deleteSpace: async (projectId: string, typeId: string, spaceId: string) => {
    const response = await apiClient.delete(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}`
    );
    return response.data;
  },
};

export default spaceService;
