// src/services/spaceService.ts
import apiClient from "./api";

export interface ElementData {
  _id?: string;
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

export interface Space {
  _id: string;
  name: string;
  type: "Bedroom" | "Protect Space" | "Wet Room" | "Balcony";
  buildingType: string;
  elements: ElementData[];
}

export interface SpaceData {
  name: string;
  type: "Bedroom" | "Protect Space" | "Wet Room" | "Balcony";
  elements?: ElementData[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface SpaceResponse extends Space {
  createdAt: string;
  updatedAt: string;
}

// Space service
const spaceService = {
  // Get all spaces for a building type
  getSpaces: async (
    projectId: string,
    typeId: string
  ): Promise<ApiResponse<SpaceResponse[]>> => {
    const response = await apiClient.get(
      `/projects/${projectId}/types/${typeId}/spaces`
    );
    return response.data;
  },

  // Get single space by ID
  getSpace: async (
    projectId: string,
    typeId: string,
    spaceId: string
  ): Promise<ApiResponse<SpaceResponse>> => {
    const response = await apiClient.get(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}`
    );
    return response.data;
  },

  // Create new space
  createSpace: async (
    projectId: string,
    typeId: string,
    spaceData: SpaceData
  ): Promise<ApiResponse<SpaceResponse>> => {
    const response = await apiClient.post(
      `/projects/${projectId}/types/${typeId}/spaces/create`,
      spaceData
    );
    return response.data;
  },

  // Update space
  updateSpace: async (
    projectId: string,
    typeId: string,
    spaceId: string,
    spaceData: Partial<SpaceData>
  ): Promise<ApiResponse<SpaceResponse>> => {
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
  deleteSpace: async (
    projectId: string,
    typeId: string,
    spaceId: string
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}`
    );
    return response.data;
  },
};

export default spaceService;
