import { Request, Response, NextFunction } from "express";
import Element from "../models/Element";
import Space from "../models/Space";
import BuildingType from "../models/BuildingType";
import Project from "../models/Project";

// Helper function to check user access to space
const checkSpaceAccess = async (spaceId: string, userId: string) => {
  const space = await Space.findById(spaceId);
  if (!space) {
    return { access: false, message: "Space not found" };
  }

  const buildingType = await BuildingType.findById(space.buildingType);
  if (!buildingType) {
    return { access: false, message: "Building type not found" };
  }

  const project = await Project.findById(buildingType.project);
  if (!project) {
    return { access: false, message: "Project not found" };
  }

  const isOwner = project.owner.toString() === userId;
  const isShared = project.sharedWith.some((s) => s.user.toString() === userId);

  if (!isOwner && !isShared) {
    return { access: false, message: "Not authorized to access this space" };
  }

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

export const getElements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const spaceId = req.params.spaceId;

    const accessCheck = await checkSpaceAccess(spaceId, userId);
    if (!accessCheck.access) {
      return res.status(403).json({
        success: false,
        message: accessCheck.message,
      });
    }

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

export const getElement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const elementId = req.params.elementId;

    const element = await Element.findById(elementId);
    if (!element) {
      return res.status(404).json({
        success: false,
        message: "Element not found",
      });
    }

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

export const createElement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const spaceId = req.params.spaceId;

    const accessCheck = await checkSpaceAccess(spaceId, userId);
    if (!accessCheck.access) {
      return res.status(403).json({
        success: false,
        message: accessCheck.message,
      });
    }

    if (!accessCheck.writeAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create elements for this space",
      });
    }

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

    const elementData = {
      ...req.body,
      space: spaceId,
      parameters: req.body.parameters || {},
      layers: (req.body.layers || []).map((layer: any, index: number) => ({
        ...layer,
        group: layer.group || (index % 3) + 1,
      })),
    };

    if (elementData.type === "Wall" && elementData.subType === "Outside Wall") {
      elementData.outsideCover = elementData.outsideCover || null;
      elementData.buildMethod = elementData.buildMethod || null;
      elementData.buildMethodIsolation =
        elementData.buildMethodIsolation || null;
      elementData.isolationCoverage = elementData.isolationCoverage || null;
    }

    const element = await Element.create(elementData);

    res.status(201).json({
      success: true,
      data: element,
    });
  } catch (error: any) {
    console.error("Error creating element:", error);

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

export const updateElement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const elementId = req.params.elementId;

    let element = await Element.findById(elementId);
    if (!element) {
      return res.status(404).json({
        success: false,
        message: "Element not found",
      });
    }

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

    if (!accessCheck.writeAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this element",
      });
    }

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

    // Prepare update data with layer group validation
    const updateData = {
      ...req.body,
      parameters: req.body.parameters || {},
      layers: (req.body.layers || []).map((layer: any, index: number) => ({
        ...layer,
        group: layer.group || (index % 3) + 1,
      })),
    };

    // For Wall/Outside Wall, ensure required fields
    if (updateData.type === "Wall" && updateData.subType === "Outside Wall") {
      updateData.outsideCover = updateData.outsideCover || null;
      updateData.buildMethod = updateData.buildMethod || null;
      updateData.buildMethodIsolation = updateData.buildMethodIsolation || null;
      updateData.isolationCoverage = updateData.isolationCoverage || null;
    }

    // Update element with explicit data and run validators
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

export const deleteElement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const elementId = req.params.elementId;

    const element = await Element.findById(elementId);
    if (!element) {
      return res.status(404).json({
        success: false,
        message: "Element not found",
      });
    }

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

    if (!accessCheck.writeAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this element",
      });
    }

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

export const clearSpaceElements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const spaceId = req.params.spaceId;

    const accessCheck = await checkSpaceAccess(spaceId, userId);
    if (!accessCheck.access) {
      return res.status(403).json({
        success: false,
        message: accessCheck.message,
      });
    }

    if (!accessCheck.writeAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to clear elements for this space",
      });
    }

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

export const runComplianceCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const elementId = req.params.elementId;

    const element = await Element.findById(elementId);
    if (!element) {
      return res.status(404).json({
        success: false,
        message: "Element not found",
      });
    }

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

    const complianceResult = {
      isCompliant: Math.random() > 0.3,
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
