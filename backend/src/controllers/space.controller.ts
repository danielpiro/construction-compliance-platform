// src/controllers/space.controller.ts
import { Request, Response, NextFunction } from "express";
import Space from "../models/Space";
import BuildingType from "../models/BuildingType";
import Project from "../models/Project";
import Element from "../models/Element";
import mongoose from "mongoose";

// Helper function to check user access to building type
const checkBuildingTypeAccess = async (
  buildingTypeId: string,
  projectId: string,
  userId: string
) => {
  // Find building type
  const buildingType = await BuildingType.findById(buildingTypeId);
  if (!buildingType) {
    return { access: false, message: "Building type not found" };
  }

  // Check project matches and exists
  const project = await Project.findById(projectId);
  if (!project) {
    return { access: false, message: "Project not found" };
  }

  // Verify building type belongs to the project
  if (buildingType.project.toString() !== projectId) {
    return {
      access: false,
      message: "Building type does not belong to this project",
    };
  }

  // Check user access
  const isOwner = project.owner.toString() === userId;
  const isShared = project.sharedWith.some((s) => s.user.toString() === userId);

  if (!isOwner && !isShared) {
    return {
      access: false,
      message: "Not authorized to access this building type",
    };
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
  };
};

// @desc    Get all spaces for a building type
// @route   GET /api/projects/:projectId/types/:typeId/spaces
// @access  Private
export const getSpaces = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const buildingTypeId = req.params.typeId;

    // Check access
    const accessCheck = await checkBuildingTypeAccess(
      buildingTypeId,
      req.params.projectId,
      userId
    );
    if (!accessCheck.access) {
      return res.status(403).json({
        success: false,
        message: accessCheck.message,
      });
    }

    // Get spaces
    const spaces = await Space.find({ buildingType: buildingTypeId }).lean();

    res.status(200).json({
      success: true,
      data: spaces,
      message: "Spaces retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Get single space
// @route   GET /api/projects/:projectId/types/:typeId/spaces/:spaceId
// @access  Private
export const getSpace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const spaceId = req.params.spaceId;

    // Find space and its elements
    const space = await Space.findById(spaceId);
    if (!space) {
      return res.status(404).json({
        success: false,
        message: "Space not found",
      });
    }

    // Check access
    const accessCheck = await checkBuildingTypeAccess(
      space.buildingType.toString(),
      req.params.projectId,
      userId
    );
    if (!accessCheck.access) {
      return res.status(403).json({
        success: false,
        message: accessCheck.message,
      });
    }

    // Get elements for this space
    const elements = await Element.find({ space: spaceId });

    res.status(200).json({
      success: true,
      data: {
        ...space.toObject(),
        elements,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Create new space
// @route   POST /api/projects/:projectId/types/:typeId/spaces/create
// @access  Private
export const createSpace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const buildingTypeId = req.params.typeId;

    // Check access
    const accessCheck = await checkBuildingTypeAccess(
      buildingTypeId,
      req.params.projectId,
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
        message: "Not authorized to create spaces for this building type",
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create space
      const space = await Space.create(
        [
          {
            name: req.body.name,
            type: req.body.type,
            buildingType: buildingTypeId,
          },
        ],
        { session }
      );

      let elements = [];
      // Create elements if provided
      if (req.body.elements && Array.isArray(req.body.elements)) {
        elements = await Element.create(
          req.body.elements.map((element: any) => ({
            ...element,
            space: space[0]._id,
          })),
          { session }
        );
      }

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        data: space[0],
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Update space
// @route   PUT /api/projects/:projectId/types/:typeId/spaces/:spaceId
// @access  Private
export const updateSpace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const spaceId = req.params.spaceId;

    // Find space
    let space = await Space.findById(spaceId);

    if (!space) {
      return res.status(404).json({
        success: false,
        message: "Space not found",
      });
    }

    // Check access
    const accessCheck = await checkBuildingTypeAccess(
      space.buildingType.toString(),
      req.params.projectId,
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
        message: "Not authorized to update this space",
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update space
      space = await Space.findByIdAndUpdate(
        spaceId,
        { name: req.body.name, type: req.body.type },
        {
          new: true,
          runValidators: true,
          session,
        }
      );

      // Update elements if provided
      if (req.body.elements && Array.isArray(req.body.elements)) {
        // Delete existing elements
        await Element.deleteMany({ space: spaceId }).session(session);

        // Create new elements
        const elements = await Element.create(
          req.body.elements.map((element: any) => ({
            ...element,
            space: spaceId,
          })),
          { session }
        );

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
          success: true,
          data: {
            space,
            elements,
          },
        });
      } else {
        // Commit transaction even if no elements
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
          success: true,
          data: {
            space,
            elements: [],
          },
        });
      }
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Delete space
// @route   DELETE /api/projects/:projectId/types/:typeId/spaces/:spaceId
// @access  Private
export const deleteSpace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const spaceId = req.params.spaceId;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find space
      const space = await Space.findById(spaceId).session(session);

      if (!space) {
        return res.status(404).json({
          success: false,
          message: "Space not found",
        });
      }

      // Check access
      const accessCheck = await checkBuildingTypeAccess(
        space.buildingType.toString(),
        req.params.projectId,
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
          message: "Not authorized to delete this space",
        });
      }

      // Delete all elements in the space
      await Element.deleteMany({ space: spaceId }).session(session);

      // Delete the space
      await Space.findByIdAndDelete(spaceId).session(session);

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: "Space deleted successfully",
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
