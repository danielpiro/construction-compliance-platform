// src/controllers/project.controller.ts
import { Request, Response, NextFunction } from "express";
import mongoose, { Document } from "mongoose";
import Project, { IProject } from "../models/Project";
import BuildingType from "../models/BuildingType";
import Space, { ISpace } from "../models/Space";
import Element from "../models/Element";
import fs from "fs";
import path from "path";
import User from "../models/User";

// Extended Request interface to include file property from multer
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// Interface for space and element data
interface ISpaceData {
  name: string;
  type: "Bedroom" | "Protect Space" | "Wet Room" | "Balcony";
  elements: {
    name: string;
    type: "Wall" | "Ceiling" | "Floor" | "Thermal Bridge";
    subType?: string;
  }[];
}

// Helper function to normalize MongoDB ObjectIds for comparison
const normalizeId = (id: any): string => {
  if (!id) return "";
  if (typeof id === "string") return id;
  if (id instanceof mongoose.Types.ObjectId) return id.toString();
  if (id._id) return normalizeId(id._id);
  if (id.toString && typeof id.toString === "function") return id.toString();
  return String(id);
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = normalizeId((req as any).user.id);

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;

    const query = {
      $or: [{ owner: userId }, { "sharedWith.user": userId }],
    };

    const total = await Project.countDocuments(query);

    const projects = await Project.find(query)
      .populate("owner", "name email")
      .populate("sharedWith.user", "name email")
      .populate({
        path: "spaces",
        populate: { path: "elements" },
      })
      .skip(startIndex)
      .limit(limit)
      .sort({ creationDate: -1 });

    const pagination = {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    };

    res.status(200).json({
      success: true,
      count: projects.length,
      pagination,
      data: projects,
    });
  } catch (error) {
    console.error("Error in getProjects:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = normalizeId((req as any).user.id);
    const projectId = req.params.id;

    const project = await Project.findById(projectId)
      .populate("owner", "name email")
      .populate("sharedWith.user", "name email")
      .populate({
        path: "spaces",
        populate: { path: "elements" },
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const ownerId = normalizeId(project.owner);
    const isOwner = ownerId === userId;
    const isShared =
      project.sharedWith &&
      project.sharedWith.some((s) => normalizeId(s.user) === userId);

    if (!isOwner && !isShared) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this project",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error in getProject:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (
  req: RequestWithFile,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = normalizeId((req as any).user.id);

    // Check for project limit (50 per user)
    const projectCount = await Project.countDocuments({ owner: userId });
    if (projectCount >= 50) {
      return res.status(400).json({
        success: false,
        message: "You have reached the maximum number of projects (50)",
      });
    }

    // Parse and validate permissionDate
    const permissionDate = new Date(req.body.permissionDate);
    if (isNaN(permissionDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid permission date format. Expected yyyy-MM-dd",
      });
    }

    // Parse spaces data
    let spacesData: ISpaceData[] = [];
    try {
      spacesData = JSON.parse(req.body.spaces || "[]");
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid spaces data format",
      });
    }

    // Create project
    const projectData = {
      name: req.body.name,
      address: req.body.address,
      location: req.body.location,
      area: req.body.area,
      permissionDate,
      owner: userId,
      ...(req.file && { image: `uploads/${req.file.filename}` }),
    };

    const project = await Project.create([projectData], { session });

    // Create spaces and elements
    const createdSpaces = (await Promise.all(
      spacesData.map((spaceData) =>
        Space.create(
          [
            {
              name: spaceData.name,
              type: spaceData.type,
              buildingType: project[0]._id,
            },
          ],
          { session }
        )
      )
    )) as Array<Document<unknown, any, ISpace>[]>;

    // Use the space _ids directly with proper typing
    const createdSpaceIds: mongoose.Types.ObjectId[] = createdSpaces.map(
      (space) => space[0]._id as mongoose.Types.ObjectId
    );

    // Create elements for all spaces
    await Promise.all(
      createdSpaces.flatMap((space, index) =>
        spacesData[index].elements.map((elementData) =>
          Element.create(
            [
              {
                name: elementData.name,
                type: elementData.type,
                subType: elementData.subType,
                space: space[0]._id,
              },
            ],
            { session }
          )
        )
      )
    );

    // Update project with space IDs
    project[0].spaces =
      createdSpaceIds as unknown as mongoose.Schema.Types.ObjectId[];
    await project[0].save({ session });

    await session.commitTransaction();

    // Fetch the complete project with populated data
    const populatedProject = await Project.findById(project[0]._id)
      .populate({
        path: "spaces",
        populate: { path: "elements" },
      })
      .populate("owner", "name email")
      .populate("sharedWith.user", "name email");

    res.status(201).json({
      success: true,
      data: populatedProject,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Project creation error:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      const validationError = error as any;
      const errorMessages = Object.values(validationError.errors).map(
        (err: any) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Invalid project data",
        errors: errorMessages,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  } finally {
    session.endSession();
  }
};

// Other methods remain the same...
export const updateProject = async (
  req: RequestWithFile,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const projectId = req.params.id;
    const userId = normalizeId((req as any).user.id);

    // Find the project and check authorization
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is authorized to update the project
    const ownerId = normalizeId(project.owner);
    if (ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this project",
      });
    }

    // Update project fields
    if (req.body.name) project.name = req.body.name;
    if (req.body.address) project.address = req.body.address;
    if (req.body.location) project.location = req.body.location;
    if (req.body.area) project.area = req.body.area;
    if (req.body.permissionDate) {
      const permissionDate = new Date(req.body.permissionDate);
      if (isNaN(permissionDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid permission date format. Expected yyyy-MM-dd",
        });
      }
      project.permissionDate = permissionDate;
    }

    // Handle image update if new file is provided
    if (req.file) {
      // Delete old image if it exists
      if (project.image) {
        const oldImagePath = path.join(__dirname, "..", "..", project.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      project.image = `uploads/${req.file.filename}`;
    }

    // Save the updated project
    await project.save({ session });

    await session.commitTransaction();

    // Return updated project with populated data
    const updatedProject = await Project.findById(projectId)
      .populate({
        path: "spaces",
        populate: { path: "elements" },
      })
      .populate("owner", "name email")
      .populate("sharedWith.user", "name email");

    res.status(200).json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Project update error:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      const validationError = error as any;
      const errorMessages = Object.values(validationError.errors).map(
        (err: any) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Invalid project data",
        errors: errorMessages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  } finally {
    session.endSession();
  }
};

export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const projectId = req.params.id;
    const userId = normalizeId((req as any).user.id);

    // Find the project and check authorization
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is authorized to delete the project
    const ownerId = normalizeId(project.owner);
    if (ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this project",
      });
    }

    // Delete associated spaces and elements
    const spaces = await Space.find({ buildingType: projectId });
    for (const space of spaces) {
      await Element.deleteMany({ space: space._id }, { session });
    }
    await Space.deleteMany({ buildingType: projectId }, { session });

    // Delete project image if it exists
    if (project.image) {
      const imagePath = path.join(__dirname, "..", "..", project.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete the project
    await Project.findByIdAndDelete(projectId, { session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: {},
      message: "Project deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Project deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  } finally {
    session.endSession();
  }
};

export const shareProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Implementation remains the same...
};

export const removeSharedAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Implementation remains the same...
};

export const uploadProjectImage = async (
  req: RequestWithFile,
  res: Response,
  next: NextFunction
) => {
  // Implementation remains the same...
};
