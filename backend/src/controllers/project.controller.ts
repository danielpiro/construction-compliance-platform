// src/controllers/project.controller.ts
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Project, { IProject } from "../models/Project";
import BuildingType from "../models/BuildingType";
import Space from "../models/Space";
import Element from "../models/Element";
import fs from "fs";
import path from "path";
import User from "../models/User";

// Extended Request interface to include file property from multer
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// Helper function to normalize MongoDB ObjectIds for comparison
const normalizeId = (id: any): string => {
  if (!id) return "";

  // If it's already a string, return it
  if (typeof id === "string") return id;

  // If it's a MongoDB ObjectId, convert to string
  if (id instanceof mongoose.Types.ObjectId) return id.toString();

  // If it's an object with _id (populated document), get the _id
  if (id._id) return normalizeId(id._id);

  // If it's an object with toString method, use that
  if (id.toString && typeof id.toString === "function") return id.toString();

  // Fallback - stringify the object
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

    // Query to get projects owned by user or shared with user
    const query = {
      $or: [{ owner: userId }, { "sharedWith.user": userId }],
    };

    // Count total documents for pagination
    const total = await Project.countDocuments(query);

    // Get projects
    const projects = await Project.find(query)
      .populate("owner", "name email")
      .populate("sharedWith.user", "name email")
      .skip(startIndex)
      .limit(limit)
      .sort({ creationDate: -1 });

    // Debug logging
    console.log(`User ID: ${userId}`);
    console.log(`Found ${projects.length} projects for this user`);
    projects.forEach((project, index) => {
      console.log(
        `Project ${index + 1}: ${project._id}, Owner: ${normalizeId(
          project.owner
        )}`
      );
    });

    // Pagination result
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

    console.log(`GET project/${projectId} - User ID: ${userId}`);

    // Find project
    const project = await Project.findById(projectId)
      .populate("owner", "name email")
      .populate("sharedWith.user", "name email");

    if (!project) {
      console.log(`Project ${projectId} not found`);
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Get owner ID in a standardized format
    const ownerId = normalizeId(project.owner);
    console.log(`Project owner: ${ownerId}, Request user: ${userId}`);

    // Check if user owns or has access to the project
    const isOwner = ownerId === userId;

    // Check if the project is shared with the user
    const isShared =
      project.sharedWith &&
      project.sharedWith.some((s) => normalizeId(s.user) === userId);

    console.log(`Access check - Is owner: ${isOwner}, Is shared: ${isShared}`);

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
  try {
    const userId = normalizeId((req as any).user.id);
    console.log(`Creating project - User ID: ${userId}`);

    // Check for project limit (50 per user)
    const projectCount = await Project.countDocuments({ owner: userId });
    if (projectCount >= 50) {
      return res.status(400).json({
        success: false,
        message: "You have reached the maximum number of projects (50)",
      });
    }

    // Parse and validate permissionDate (expected format: yyyy-MM-dd)
    const permissionDate = new Date(req.body.permissionDate);
    if (isNaN(permissionDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid permission date format. Expected yyyy-MM-dd",
      });
    }

    // Prepare project data
    const projectData = {
      name: req.body.name,
      address: req.body.address,
      location: req.body.location,
      area: req.body.area,
      type: req.body.type,
      permissionDate,
      owner: userId,
      ...(req.file && { image: `/api/uploads/${req.file.filename}` }),
    };

    console.log("Creating project with data:", JSON.stringify(projectData));

    // Create project
    const project = await Project.create(projectData);
    console.log(`Project created with ID: ${project._id}`);

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Project creation error:", error);
    // Check for validation errors
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
  }
};

// Rest of the controller remains the same...

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = normalizeId((req as any).user.id);
    const projectId = req.params.id;

    // Find project
    let project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user owns or has editor access to the project
    const isOwner = normalizeId(project.owner) === userId;
    const hasEditorAccess = project.sharedWith.some(
      (s) => normalizeId(s.user) === userId && s.role === "editor"
    );

    if (!isOwner && !hasEditorAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this project",
      });
    }

    // Parse and validate data from FormData
    const updateData: any = {};

    // Handle basic fields
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.address) updateData.address = req.body.address;
    if (req.body.location) updateData.location = req.body.location;
    if (req.body.area) updateData.area = req.body.area;
    if (req.body.type) updateData.type = req.body.type;

    // Handle permission date
    if (req.body.permissionDate) {
      const permissionDate = new Date(req.body.permissionDate);
      if (isNaN(permissionDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid permission date format",
        });
      }
      updateData.permissionDate = permissionDate;
    }

    if (req.body.buildingVersion) {
      const validVersions = [
        "version2011",
        "version2019",
        "fixSheet1",
        "fixSheet2",
      ];
      if (!validVersions.includes(req.body.buildingVersion)) {
        return res.status(400).json({
          success: false,
          message: "Invalid building version",
        });
      }
      updateData.buildingVersion = req.body.buildingVersion;
    }

    // Handle image if it exists in the request
    if ((req as RequestWithFile).file) {
      // If project already has an image, delete the old one
      if (project.image) {
        const oldImagePath = path.join(
          __dirname,
          "../../uploads",
          project.image.split("/").pop() || ""
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      const file = (req as RequestWithFile).file;
      if (file && file.filename) {
        updateData.image = `/api/uploads/${file.filename}`;
      }
    }

    // Update project with parsed data
    project = await Project.findByIdAndUpdate(projectId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = normalizeId((req as any).user.id);
    const projectId = req.params.id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find project
      const project = await Project.findById(projectId).session(session);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      // Check if user owns the project
      if (normalizeId(project.owner) !== userId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this project",
        });
      }

      // Get all building types for this project
      const buildingTypes = await BuildingType.find({
        project: projectId,
      }).session(session);
      const buildingTypeIds = buildingTypes.map((bt) => bt._id);

      // Get all spaces for these building types
      const spaces = await Space.find({
        buildingType: { $in: buildingTypeIds },
      }).session(session);
      const spaceIds = spaces.map((s) => s._id);

      // Delete all related elements
      await Element.deleteMany({ space: { $in: spaceIds } }).session(session);

      // Delete all spaces
      await Space.deleteMany({
        buildingType: { $in: buildingTypeIds },
      }).session(session);

      // Delete all building types
      await BuildingType.deleteMany({ project: projectId }).session(session);

      // Delete the project
      await Project.findByIdAndDelete(projectId).session(session);

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: "Project deleted successfully",
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

// Other methods (share, upload, etc.) would be updated similarly...

// @desc    Share project with another user
// @route   POST /api/projects/:id/share
// @access  Private
export const shareProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const projectId = req.params.id;
    const { email, role } = req.body;

    // Validate role
    if (!["editor", "viewer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Role must be editor or viewer",
      });
    }

    // Find the user to share with
    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user owns the project
    if (project.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to share this project",
      });
    }

    // Check if already shared with this user
    const isAlreadyShared = project.sharedWith.some(
      (s) => s.user.toString() === userToShare._id?.toString()
    );

    if (isAlreadyShared) {
      // Update role if already shared
      project.sharedWith = project.sharedWith.map((s) => {
        if (s.user.toString() === userToShare._id?.toString()) {
          return { user: s.user, role };
        }
        return s;
      });
    } else {
      // Add new share
      project.sharedWith.push({
        user: userToShare._id as any,
        role,
      });
    }

    await project.save();

    // TODO: Send notification to the user

    res.status(200).json({
      success: true,
      message: `Project shared with ${email} as ${role}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Remove shared access from a user
// @route   DELETE /api/projects/:id/share/:userId
// @access  Private
export const removeSharedAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = (req as any).user.id;
    const projectId = req.params.id;
    const sharedUserId = req.params.userId;

    // Find project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user owns the project
    if (project.owner.toString() !== ownerId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to remove shared access",
      });
    }

    // Remove shared access
    project.sharedWith = project.sharedWith.filter(
      (s) => s.user.toString() !== sharedUserId
    );

    await project.save();

    res.status(200).json({
      success: true,
      message: "Shared access removed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Upload project image
// @route   PUT /api/projects/:id/image
// @access  Private
export const uploadProjectImage = async (
  req: RequestWithFile,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const projectId = req.params.id;

    // Find project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user owns or has editor access to the project
    const isOwner = project.owner.toString() === userId;
    const hasEditorAccess = project.sharedWith.some(
      (s) => s.user.toString() === userId && s.role === "editor"
    );

    if (!isOwner && !hasEditorAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this project",
      });
    }

    // Check if file exists in request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    // Get file path
    const filePath = req.file.path;

    // If project already has an image, delete the old one
    if (project.image) {
      const oldImagePath = path.join(
        __dirname,
        "../../uploads",
        project.image.split("/").pop() || ""
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update project with new image path
    project.image = `/api/uploads/${req.file.filename}`;
    await project.save();

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
