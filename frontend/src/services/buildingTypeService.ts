// src/services/buildingTypeService.ts
import apiClient from "./api";

export interface BuildingTypeData {
  name: string;
  type:
    | "Residential"
    | "Schools"
    | "Offices"
    | "Hotels"
    | "Commercials"
    | "Public Gathering";
}

// Building Type service
const buildingTypeService = {
  // Get all building types for a project
  getBuildingTypes: async (projectId: string) => {
    const response = await apiClient.get(`/projects/${projectId}/types`);
    return response.data;
  },

  // Get single building type by ID
  getBuildingType: async (projectId: string, typeId: string) => {
    const response = await apiClient.get(
      `/projects/${projectId}/types/${typeId}`
    );
    return response.data;
  },

  // Create new building type
  createBuildingType: async (projectId: string, typeData: BuildingTypeData) => {
    const response = await apiClient.post(
      `/projects/${projectId}/types/create`,
      typeData
    );
    return response.data;
  },

  // Update building type
  updateBuildingType: async (
    projectId: string,
    typeId: string,
    typeData: Partial<BuildingTypeData>
  ) => {
    const response = await apiClient.put(
      `/projects/${projectId}/types/${typeId}`,
      typeData
    );
    return response.data;
  },

  // Delete building type
  deleteBuildingType: async (projectId: string, typeId: string) => {
    const response = await apiClient.delete(
      `/projects/${projectId}/types/${typeId}`
    );
    return response.data;
  },
};

export default buildingTypeService;
