// src/controllers/buildingType.controller.ts
import { Request, Response, NextFunction } from "express";
import BuildingType from "../models/BuildingType";
import Project from "../models/Project";
import Space from "../models/Space";
import Element from "../models/Element";
import mongoose from "mongoose";

// @desc    Get all building types for a project
// @route   GET /api/projects/:projectId/building-types
// @access  Private
export const getBuildingTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const projectId = req.params.projectId;

    // Check project access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user has access to the project
    const isOwner = project.owner.toString() === userId;
    const isShared = project.sharedWith.some(
      (s) => s.user.toString() === userId
    );

    if (!isOwner && !isShared) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this project",
      });
    }

    // Get building types
    const buildingTypes = await BuildingType.find({ project: projectId });

    res.status(200).json({
      success: true,
      count: buildingTypes.length,
      data: buildingTypes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Get single building type
// @route   GET /api/building-types/:id
// @access  Private
export const getBuildingType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const buildingTypeId = req.params.id;

    // Find building type
    const buildingType = await BuildingType.findById(buildingTypeId);

    if (!buildingType) {
      return res.status(404).json({
        success: false,
        message: "Building type not found",
      });
    }

    // Check project access
    const project = await Project.findById(buildingType.project);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user has access to the project
    const isOwner = project.owner.toString() === userId;
    const isShared = project.sharedWith.some(
      (s) => s.user.toString() === userId
    );

    if (!isOwner && !isShared) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this building type",
      });
    }

    res.status(200).json({
      success: true,
      data: buildingType,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Create new building type
// @route   POST /api/projects/:projectId/building-types
// @access  Private
export const createBuildingType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const projectId = req.params.projectId;

    // Check project access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user has write access to the project
    const isOwner = project.owner.toString() === userId;
    const hasEditorAccess = project.sharedWith.some(
      (s) => s.user.toString() === userId && s.role === "editor"
    );

    if (!isOwner && !hasEditorAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create building types for this project",
      });
    }

    // Create building type
    const buildingType = await BuildingType.create({
      ...req.body,
      project: projectId,
    });

    res.status(201).json({
      success: true,
      data: buildingType,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Update building type
// @route   PUT /api/building-types/:id
// @access  Private
export const updateBuildingType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const buildingTypeId = req.params.id;

    // Find building type
    let buildingType = await BuildingType.findById(buildingTypeId);

    if (!buildingType) {
      return res.status(404).json({
        success: false,
        message: "Building type not found",
      });
    }

    // Check project access
    const project = await Project.findById(buildingType.project);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user has write access to the project
    const isOwner = project.owner.toString() === userId;
    const hasEditorAccess = project.sharedWith.some(
      (s) => s.user.toString() === userId && s.role === "editor"
    );

    if (!isOwner && !hasEditorAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this building type",
      });
    }

    // Update building type
    buildingType = await BuildingType.findByIdAndUpdate(
      buildingTypeId,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: buildingType,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Delete building type
// @route   DELETE /api/building-types/:id
// @access  Private
export const deleteBuildingType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const buildingTypeId = req.params.id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find building type
      const buildingType = await BuildingType.findById(buildingTypeId).session(
        session
      );

      if (!buildingType) {
        return res.status(404).json({
          success: false,
          message: "Building type not found",
        });
      }

      // Check project access
      const project = await Project.findById(buildingType.project).session(
        session
      );
      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      // Check if user has write access to the project
      const isOwner = project.owner.toString() === userId;
      const hasEditorAccess = project.sharedWith.some(
        (s) => s.user.toString() === userId && s.role === "editor"
      );

      if (!isOwner && !hasEditorAccess) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this building type",
        });
      }

      // Get all spaces for this building type
      const spaces = await Space.find({ buildingType: buildingTypeId }).session(
        session
      );
      const spaceIds = spaces.map((s) => s._id);

      // Delete all related elements
      await Element.deleteMany({ space: { $in: spaceIds } }).session(session);

      // Delete all spaces
      await Space.deleteMany({ buildingType: buildingTypeId }).session(session);

      // Delete the building type
      await BuildingType.findByIdAndDelete(buildingTypeId).session(session);

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: "Building type deleted successfully",
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
