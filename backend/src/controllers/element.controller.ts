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
// @route   GET /api/spaces/:spaceId/elements
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
// @route   GET /api/elements/:id
// @access  Private
export const getElement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const elementId = req.params.id;

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
// @route   POST /api/spaces/:spaceId/elements
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

    // Create element
    const element = await Element.create({
      ...req.body,
      space: spaceId,
    });

    res.status(201).json({
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

// @desc    Update element
// @route   PUT /api/elements/:id
// @access  Private
export const updateElement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const elementId = req.params.id;

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

    // Update element
    element = await Element.findByIdAndUpdate(elementId, req.body, {
      new: true,
      runValidators: true,
    });

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

// @desc    Delete element
// @route   DELETE /api/elements/:id
// @access  Private
export const deleteElement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const elementId = req.params.id;

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
// @route   POST /api/elements/:id/compliance-check
// @access  Private
export const runComplianceCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const elementId = req.params.id;

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
