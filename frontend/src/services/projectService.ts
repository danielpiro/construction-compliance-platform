// src/services/projectService.ts
import apiClient from "./api";

interface ProjectData {
  name: string;
  address: string;
  location: string;
  permissionDate: string; // format: YYYY-MM-DD
  image?: File;
}

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
  createProject: async (projectData: ProjectData) => {
    // First create the project without the image
    const { image, ...data } = projectData;
    const response = await apiClient.post("/projects", data);

    // If there's an image, upload it in a separate request
    if (image && response.data.success) {
      const projectId = response.data.data._id;
      await projectService.uploadProjectImage(projectId, image);

      // Refresh project data after image upload
      return projectService.getProject(projectId);
    }

    return response.data;
  },

  // Update project
  updateProject: async (
    projectId: string,
    projectData: Partial<ProjectData>
  ) => {
    // First update the project without the image
    const { image, ...data } = projectData;
    const response = await apiClient.put(`/projects/${projectId}`, data);

    // If there's an image, upload it in a separate request
    if (image && response.data.success) {
      await projectService.uploadProjectImage(projectId, image);

      // Refresh project data after image upload
      return projectService.getProject(projectId);
    }

    return response.data;
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
