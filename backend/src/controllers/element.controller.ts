// src/controllers/element.controller.ts
import { Request, Response, NextFunction } from "express";
import Element from "../models/Element";
import Space from "../models/Space";
import BuildingType from "../models/BuildingType";
import Project from "../models/Project";

// Helper function to check user access to space
const checkSpaceAccess = async (spaceId: string, userId: string) => {
  // Find space
  const space = await Space.findById(spaceId);
  if (!space) {
    return { access: false, message: "Space not found" };
  }

  // Find building type
  const buildingType = await BuildingType.findById(space.buildingType);
  if (!buildingType) {
    return { access: false, message: "Building type not found" };
  }

  // Check project access
  const project = await Project.findById(buildingType.project);
  if (!project) {
    return { access: false, message: "Project not found" };
  }

  // Check if user has access to the project
  const isOwner = project.owner.toString() === userId;
  const isShared = project.sharedWith.some((s) => s.user.toString() === userId);

  if (!isOwner && !isShared) {
    return { access: false, message: "Not authorized to access this space" };
  }

  // Check if user has write access to the project
  const hasWriteAccess =
    isOwner ||
    project.sharedWith.some(
      (s) => s.user.toString() === userId && s.role === "editor"
    );

  return {
    access: true,
    writeAccess: hasWriteAccess,
    project,
    buildingType,
    space,
  };
};

// @desc    Get all elements for a space
// @route   GET /api/projects/:projectId/types/:typeId/spaces/:spaceId/elements
// @access  Private
export const getElements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const spaceId = req.params.spaceId;

    // Check access
    const accessCheck = await checkSpaceAccess(spaceId, userId);
    if (!accessCheck.access) {
      return res.status(403).json({
        success: false,
        message: accessCheck.message,
      });
    }

    // Get elements
    const elements = await Element.find({ space: spaceId });

    res.status(200).json({
      success: true,
      count: elements.length,
      data: elements,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Get single element
// @route   GET /api/projects/:projectId/types/:typeId/spaces/:spaceId/elements/:elementId
// @access  Private
export const getElement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const elementId = req.params.elementId;

    console.log("Getting element with ID:", elementId);

    // Find element
    const element = await Element.findById(elementId);

    if (!element) {
      return res.status(404).json({
        success: false,
        message: "Element not found",
      });
    }

    console.log("Found element:", element.toObject());

    // Check access
    const accessCheck = await checkSpaceAccess(
      element.space.toString(),
      userId
    );
    if (!accessCheck.access) {
      return res.status(403).json({
        success: false,
        message: accessCheck.message,
      });
    }

    res.status(200).json({
      success: true,
      data: element,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Create new element
// @route   POST /api/projects/:projectId/types/:typeId/spaces/:spaceId/elements/create
// @access  Private
export const createElement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const spaceId = req.params.spaceId;

    // Check access
    const accessCheck = await checkSpaceAccess(spaceId, userId);
    if (!accessCheck.access) {
      return res.status(403).json({
        success: false,
        message: accessCheck.message,
      });
    }

    // Check write access
    if (!accessCheck.writeAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create elements for this space",
      });
    }

    // For Wall type with Outside Wall subtype, validate required fields
    const data = req.body;
    if (data.type === "Wall" && data.subType === "Outside Wall") {
      if (!data.outsideCover) {
        return res.status(400).json({
          success: false,
          message: "Outside Cover is required for Outside Wall elements",
        });
      }
      if (!data.buildMethod) {
        return res.status(400).json({
          success: false,
          message: "Build Method is required for Outside Wall elements",
        });
      }
      if (
        ["blocks", "concrete", "amir wall", "baranovich"].includes(
          data.buildMethod
        ) &&
        !data.buildMethodIsolation
      ) {
        return res.status(400).json({
          success: false,
          message: "Build Method Isolation is required for this build method",
        });
      }
      if (!data.isolationCoverage) {
        return res.status(400).json({
          success: false,
          message: "Isolation Coverage is required for Outside Wall elements",
        });
      }
    }

    console.log("Creating element with data:", {
      ...req.body,
      space: spaceId,
    });

    // Prepare element data
    const elementData = {
      ...req.body,
      space: spaceId,
      parameters: req.body.parameters || {},
      layers: req.body.layers || [],
    };

    // For Wall/Outside Wall, ensure required fields
    if (elementData.type === "Wall" && elementData.subType === "Outside Wall") {
      elementData.outsideCover = elementData.outsideCover || null;
      elementData.buildMethod = elementData.buildMethod || null;
      elementData.buildMethodIsolation =
        elementData.buildMethodIsolation || null;
      elementData.isolationCoverage = elementData.isolationCoverage || null;
    }

    console.log("Creating element with data:", elementData);

    // Create element with explicit data
    const element = await Element.create(elementData);

    console.log("Created element:", element.toObject());

    res.status(201).json({
      success: true,
      data: element,
    });
  } catch (error: any) {
    console.error("Error creating element:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((err: any) => err.message)
          .join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Update element
// @route   PUT /api/projects/:projectId/types/:typeId/spaces/:spaceId/elements/:elementId
// @access  Private
export const updateElement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const elementId = req.params.elementId;

    // Find element
    let element = await Element.findById(elementId);

    if (!element) {
      return res.status(404).json({
        success: false,
        message: "Element not found",
      });
    }

    // Check access
    const accessCheck = await checkSpaceAccess(
      element.space.toString(),
      userId
    );
    if (!accessCheck.access) {
      return res.status(403).json({
        success: false,
        message: accessCheck.message,
      });
    }

    // Check write access
    if (!accessCheck.writeAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this element",
      });
    }

    // For Wall type with Outside Wall subtype, validate required fields
    const data = req.body;
    if (data.type === "Wall" && data.subType === "Outside Wall") {
      if (!data.outsideCover) {
        return res.status(400).json({
          success: false,
          message: "Outside Cover is required for Outside Wall elements",
        });
      }
      if (!data.buildMethod) {
        return res.status(400).json({
          success: false,
          message: "Build Method is required for Outside Wall elements",
        });
      }
      if (
        ["blocks", "concrete", "amir wall", "baranovich"].includes(
          data.buildMethod
        ) &&
        !data.buildMethodIsolation
      ) {
        return res.status(400).json({
          success: false,
          message: "Build Method Isolation is required for this build method",
        });
      }
      if (!data.isolationCoverage) {
        return res.status(400).json({
          success: false,
          message: "Isolation Coverage is required for Outside Wall elements",
        });
      }
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      parameters: req.body.parameters || {},
      layers: req.body.layers || [],
    };

    // For Wall/Outside Wall, ensure required fields
    if (updateData.type === "Wall" && updateData.subType === "Outside Wall") {
      updateData.outsideCover = updateData.outsideCover || null;
      updateData.buildMethod = updateData.buildMethod || null;
      updateData.buildMethodIsolation = updateData.buildMethodIsolation || null;
      updateData.isolationCoverage = updateData.isolationCoverage || null;
    }

    console.log("Updating element with data:", updateData);

    // Update element with explicit data
    element = await Element.findByIdAndUpdate(elementId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: element,
    });
  } catch (error: any) {
    console.error("Error updating element:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((err: any) => err.message)
          .join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Clear all elements for a space
// @route   DELETE /api/projects/:projectId/types/:typeId/spaces/:spaceId/elements/clear
// @access  Private
export const clearSpaceElements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const spaceId = req.params.spaceId;

    // Check access
    const accessCheck = await checkSpaceAccess(spaceId, userId);
    if (!accessCheck.access) {
      return res.status(403).json({
        success: false,
        message: accessCheck.message,
      });
    }

    // Check write access
    if (!accessCheck.writeAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to clear elements for this space",
      });
    }

    // Delete all elements for this space
    await Element.deleteMany({ space: spaceId });

    res.status(200).json({
      success: true,
      message: "All elements cleared successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Delete element
// @route   DELETE /api/projects/:projectId/types/:typeId/spaces/:spaceId/elements/:elementId
// @access  Private
export const deleteElement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const elementId = req.params.elementId;

    // Find element
    const element = await Element.findById(elementId);

    if (!element) {
      return res.status(404).json({
        success: false,
        message: "Element not found",
      });
    }

    // Check access
    const accessCheck = await checkSpaceAccess(
      element.space.toString(),
      userId
    );
    if (!accessCheck.access) {
      return res.status(403).json({
        success: false,
        message: accessCheck.message,
      });
    }

    // Check write access
    if (!accessCheck.writeAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this element",
      });
    }

    // Delete the element
    await Element.findByIdAndDelete(elementId);

    res.status(200).json({
      success: true,
      message: "Element deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Run compliance check for an element
// @route   POST /api/projects/:projectId/types/:typeId/spaces/:spaceId/elements/:elementId/compliance-check
// @access  Private
export const runComplianceCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const elementId = req.params.elementId;

    // Find element
    const element = await Element.findById(elementId);

    if (!element) {
      return res.status(404).json({
        success: false,
        message: "Element not found",
      });
    }

    // Check access
    const accessCheck = await checkSpaceAccess(
      element.space.toString(),
      userId
    );
    if (!accessCheck.access) {
      return res.status(403).json({
        success: false,
        message: accessCheck.message,
      });
    }

    // TODO: Implement actual compliance check algorithm
    // This would involve checking the element's parameters against regulatory requirements
    // For now, we'll return a dummy response

    const complianceResult = {
      isCompliant: Math.random() > 0.3, // Random result for demo
      details: {
        checksPassed: ["Structural integrity", "Material standards"],
        checksFailed: Math.random() > 0.3 ? [] : ["Thermal insulation"],
        recommendations:
          Math.random() > 0.3
            ? []
            : ["Increase insulation thickness to meet standards"],
      },
    };

    res.status(200).json({
      success: true,
      data: complianceResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
