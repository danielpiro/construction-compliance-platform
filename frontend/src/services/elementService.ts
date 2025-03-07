import api from "./api";

// Define types
export interface Element {
  _id: string;
  name: string;
  type: "Wall" | "Ceiling" | "Floor" | "Thermal Bridge";
  subType?: string;
  spaceId: string;
  projectId: string;
  typeId: string;
}

export interface ElementFormData {
  name: string;
  type: "Wall" | "Ceiling" | "Floor" | "Thermal Bridge";
  subType?: string;
}

// Get all elements for a space
export const getElements = async (
  projectId: string,
  typeId: string,
  spaceId: string
): Promise<Element[]> => {
  try {
    const response = await api.get(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching elements:", error);
    throw error;
  }
};

// Get a single element by ID
export const getElement = async (
  projectId: string,
  typeId: string,
  spaceId: string,
  elementId: string
): Promise<Element> => {
  try {
    const response = await api.get(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${elementId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching element:", error);
    throw error;
  }
};

// Create a new element
export const createElement = async (
  projectId: string,
  typeId: string,
  spaceId: string,
  elementData: ElementFormData
): Promise<Element> => {
  try {
    const response = await api.post(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements`,
      elementData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating element:", error);
    throw error;
  }
};

// Update an existing element
export const updateElement = async (
  projectId: string,
  typeId: string,
  spaceId: string,
  elementId: string,
  elementData: ElementFormData
): Promise<Element> => {
  try {
    const response = await api.put(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${elementId}`,
      elementData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating element:", error);
    throw error;
  }
};

// Delete an element
export const deleteElement = async (
  projectId: string,
  typeId: string,
  spaceId: string,
  elementId: string
): Promise<void> => {
  try {
    await api.delete(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${elementId}`
    );
  } catch (error) {
    console.error("Error deleting element:", error);
    throw error;
  }
};
