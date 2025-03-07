import { Request, Response, NextFunction } from "express";
import User from "../models/User";

// @desc    Get current user profile
// @route   GET /api/user/profile
// @access  Private
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // User is already available from auth middleware
    const userId = req.user?.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        companyAddress: user.companyAddress,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { name, companyName, companyAddress, phone } = req.body;

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields
    if (name) user.name = name;
    if (companyName) user.companyName = companyName;
    if (companyAddress) user.companyAddress = companyAddress;
    if (phone) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        companyAddress: user.companyAddress,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Email change functionality removed for now
