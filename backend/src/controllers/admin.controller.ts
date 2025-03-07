// src/controllers/admin.controller.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import Project from "../models/Project";

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;

    // Count total documents for pagination
    const total = await User.countDocuments();

    // Get users
    const users = await User.find()
      .select("-password")
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Pagination result
    const pagination = {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    };

    res.status(200).json({
      success: true,
      count: users.length,
      pagination,
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Activate/Deactivate user
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { active } = req.body;

    // Find user
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user
    // We'll add an 'active' field to the User model for this
    user.set("active", Boolean(active));
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        active: user.get("active"),
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

// @desc    Get all projects
// @route   GET /api/admin/projects
// @access  Private/Admin
export const getAllProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;

    // Count total documents for pagination
    const total = await Project.countDocuments();

    // Get projects
    const projects = await Project.find()
      .populate("owner", "name email")
      .populate("sharedWith.user", "name email")
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

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
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Get project details
// @route   GET /api/admin/projects/:id
// @access  Private/Admin
export const getProjectDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("sharedWith.user", "name email");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

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

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private/Admin
export const getSystemLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implement actual system logs
    // This would typically involve reading from a log collection or file

    // For now, return dummy data
    const logs = [
      {
        timestamp: new Date(),
        level: "info",
        message: "System started",
        user: null,
      },
      {
        timestamp: new Date(Date.now() - 60000),
        level: "warning",
        message: "High CPU usage detected",
        user: null,
      },
    ];

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Get subscription stats
// @route   GET /api/admin/subscriptions
// @access  Private/Admin
export const getSubscriptionStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implement actual subscription stats from Stripe
    // This would typically involve querying the Stripe API or a local database

    // For now, return dummy data
    const stats = {
      totalSubscribers: 150,
      activeSubscriptions: 120,
      canceledSubscriptions: 30,
      revenueThisMonth: 12000,
      revenueLastMonth: 10500,
      subscriptionsByPlan: {
        basic: 50,
        premium: 40,
        enterprise: 30,
      },
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // TODO: Add logic to delete all user-related data (projects, etc.)

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
