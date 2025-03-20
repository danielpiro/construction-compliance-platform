/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/elementService.ts
import api from "./api";
import { AxiosError } from "axios";

// Define types
export interface Layer {
  id: string;
  name: string;
  substance: string;
  maker: string;
  product: string;
  thickness: number;
  thermalConductivity: number;
  mass: number;
  group: 1 | 2 | 3;
}

export type IsolationCoverage = "dark color" | "bright color";
export type OutsideCover = "tiah" | "dry hang" | "wet hang";
export type BuildMethod =
  | "blocks"
  | "concrete"
  | "amir wall"
  | "baranovich"
  | "light build";
export type BuildMethodIsolation =
  | "no extra cover"
  | "extra cover"
  | "inside isolation"
  | "outside isolation";

export interface Element {
  _id: string;
  name: string;
  type: "Wall" | "Ceiling" | "Floor" | "Thermal Bridge";
  subType?: string;
  spaceId: string;
  projectId: string;
  typeId: string;
  parameters?: Record<string, any>;
  outsideCover?: OutsideCover;
  buildMethod?: BuildMethod;
  buildMethodIsolation?: BuildMethodIsolation;
  isolationCoverage?: IsolationCoverage;
  layers: Layer[];
}

export interface ElementFormData {
  name: string;
  type: "Wall" | "Ceiling" | "Floor" | "Thermal Bridge";
  subType?: string;
  parameters?: Record<string, any>;
  outsideCover?: OutsideCover;
  buildMethod?: BuildMethod;
  buildMethodIsolation?: BuildMethodIsolation;
  isolationCoverage?: IsolationCoverage;
  layers?: Layer[];
}

export interface ComplianceCheckResult {
  isCompliant: boolean;
  details: {
    checksPassed: string[];
    checksFailed: string[];
    recommendations: string[];
  };
}

// Get all elements for a space
export const getElements = async (
  projectId: string,
  typeId: string,
  spaceId: string
): Promise<{ success: boolean; data: Element[]; message?: string }> => {
  try {
    const response = await api.get(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements`
    );
    return response.data as {
      success: boolean;
      data: Element[];
      message?: string;
    };
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
): Promise<{ success: boolean; data: Element; message?: string }> => {
  try {
    const response = await api.get(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${elementId}`
    );
    return response.data as {
      success: boolean;
      data: Element;
      message?: string;
    };
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
): Promise<{ success: boolean; data: Element; message?: string }> => {
  try {
    const response = await api.post(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/create`,
      elementData
    );
    return response.data as {
      success: boolean;
      data: Element;
      message?: string;
    };
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
): Promise<{ success: boolean; data: Element; message?: string }> => {
  // Create a clean update object with only the fields we want to update
  const updateData: ElementFormData = {
    name: elementData.name,
    type: elementData.type,
    subType: elementData.subType,
    // Only include Wall/Outside Wall specific fields if they exist
    ...(elementData.type === "Wall" &&
      elementData.subType === "Outside Wall" && {
        outsideCover: elementData.outsideCover,
        buildMethod: elementData.buildMethod,
        buildMethodIsolation: elementData.buildMethodIsolation,
        isolationCoverage: elementData.isolationCoverage,
      }),
    parameters: elementData.parameters || {},
    layers:
      elementData.layers?.map((layer) => ({
        ...layer,
        id: layer.id || crypto.randomUUID(),
      })) || [],
  };

  try {
    const response = await api.put(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${elementId}`,
      updateData
    );

    return response.data as {
      success: boolean;
      data: Element;
      message?: string;
    };
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
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await api.delete(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${elementId}`
    );
    return response.data as { success: boolean; message?: string };
  } catch (error) {
    console.error("Error deleting element:", error);
    throw error;
  }
};

// Run compliance check for an element
export const runComplianceCheck = async (
  projectId: string,
  typeId: string,
  spaceId: string,
  elementId: string
): Promise<{
  success: boolean;
  data: ComplianceCheckResult;
  message?: string;
}> => {
  try {
    const response = await api.post(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${elementId}/compliance-check`
    );
    return response.data as {
      success: boolean;
      data: ComplianceCheckResult;
      message?: string;
    };
  } catch (error) {
    console.error("Error running compliance check:", error);
    throw error;
  }
};

// Add parameters to an element
export const addElementParameters = async (
  projectId: string,
  typeId: string,
  spaceId: string,
  elementId: string,
  parameters: Record<string, any>
): Promise<Element> => {
  try {
    const response = await api.post(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${elementId}/parameters`,
      parameters
    );
    return response.data;
  } catch (error) {
    console.error("Error adding element parameters:", error);
    throw error;
  }
};

// Update parameters of an element
export const updateElementParameters = async (
  projectId: string,
  typeId: string,
  spaceId: string,
  elementId: string,
  parameters: Record<string, any>
): Promise<Element> => {
  try {
    const response = await api.put(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${elementId}/parameters`,
      parameters
    );
    return response.data;
  } catch (error) {
    console.error("Error updating element parameters:", error);
    throw error;
  }
};

// Get regulatory standards for an element type
export const getElementStandards = async (
  elementType: string
): Promise<Record<string, any>> => {
  try {
    const response = await api.get(`/standards/elements/${elementType}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching element standards:", error);
    throw error;
  }
};

// Get thermal properties for an element type
export const getElementThermalProperties = async (
  projectId: string,
  typeId: string,
  spaceId: string,
  elementId: string
): Promise<Record<string, any>> => {
  try {
    const response = await api.get(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${elementId}/thermal-properties`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching element thermal properties:", error);
    throw error;
  }
};

// Calculate U-value for an element
export const calculateElementUValue = async (
  projectId: string,
  typeId: string,
  spaceId: string,
  elementId: string,
  materials: Array<{ type: string; thickness: number }>
): Promise<{
  uValue: number;
  isCompliant: boolean;
  minimumRequired: number;
}> => {
  try {
    const response = await api.post(
      `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${elementId}/calculate-u-value`,
      { materials }
    );
    return response.data;
  } catch (error) {
    console.error("Error calculating element U-value:", error);
    throw error;
  }
};

// Error handler helper function
export const handleElementServiceError = (error: unknown): string => {
  if (error instanceof AxiosError && error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 400:
        return `Invalid request: ${data.message || "Bad request"}`;
      case 401:
        return "Authentication required. Please log in again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "Element not found.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return `Error: ${data.message || "Unknown error"}`;
    }
  }
  return error instanceof Error ? error.message : "An unknown error occurred";
};

// Export all functions in an object for alternate import style
const elementService = {
  getElements,
  getElement,
  createElement,
  updateElement,
  deleteElement,
  runComplianceCheck,
  addElementParameters,
  updateElementParameters,
  getElementStandards,
  getElementThermalProperties,
  calculateElementUValue,
  handleElementServiceError,
};

export default elementService;
