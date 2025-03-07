// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

// Protect routes
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  // Check if auth header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    ) as DecodedToken;

    // Get user from the token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Add user to request
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${user.role} is not authorized to access this route`,
      });
    }

    next();
  };
};
