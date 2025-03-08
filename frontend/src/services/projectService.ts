// src/services/projectService.ts
import apiClient from "./api";

interface ShareProjectData {
  email: string;
  role: "editor" | "viewer";
}

interface ProjectQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Project service
const projectService = {
  // Get all projects (paginated)
  getProjects: async (params: ProjectQueryParams = {}) => {
    const response = await apiClient.get("/projects", { params });
    return response.data;
  },

  // Get single project by ID
  getProject: async (projectId: string) => {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data;
  },

  // Create new project
  createProject: async (formData: FormData) => {
    try {
      // Send the entire FormData including image in a single request
      const response = await apiClient.post("/projects", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create project:", error);
      throw error;
    }
  },

  // Update project
  updateProject: async (projectId: string, formData: FormData) => {
    try {
      const response = await apiClient.put(`/projects/${projectId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update project:", error);
      throw error;
    }
  },

  // Upload project image
  uploadProjectImage: async (projectId: string, image: File) => {
    const formData = new FormData();
    formData.append("image", image);

    const response = await apiClient.put(
      `/projects/${projectId}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  // Delete project
  deleteProject: async (projectId: string) => {
    const response = await apiClient.delete(`/projects/${projectId}`);
    return response.data;
  },

  // Share project with another user
  shareProject: async (projectId: string, shareData: ShareProjectData) => {
    const response = await apiClient.post(
      `/projects/${projectId}/share`,
      shareData
    );
    return response.data;
  },

  // Remove shared access
  removeSharedAccess: async (projectId: string, userId: string) => {
    const response = await apiClient.delete(
      `/projects/${projectId}/share/${userId}`
    );
    return response.data;
  },
};

export default projectService;
