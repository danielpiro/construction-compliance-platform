// src/services/buildingTypeService.ts
import apiClient from "./api";

interface BuildingTypeData {
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
    const response = await apiClient.get(
      `/projects/${projectId}/building-types`
    );
    return response.data;
  },

  // Get single building type by ID
  getBuildingType: async (typeId: string) => {
    const response = await apiClient.get(`/building-types/${typeId}`);
    return response.data;
  },

  // Create new building type
  createBuildingType: async (projectId: string, typeData: BuildingTypeData) => {
    const response = await apiClient.post(
      `/projects/${projectId}/building-types`,
      typeData
    );
    return response.data;
  },

  // Update building type
  updateBuildingType: async (
    typeId: string,
    typeData: Partial<BuildingTypeData>
  ) => {
    const response = await apiClient.put(`/building-types/${typeId}`, typeData);
    return response.data;
  },

  // Delete building type
  deleteBuildingType: async (typeId: string) => {
    const response = await apiClient.delete(`/building-types/${typeId}`);
    return response.data;
  },
};

export default buildingTypeService;
