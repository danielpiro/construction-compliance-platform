// src/routes/auth.routes.ts
import { Router } from "express";
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  updateDetails,
  updatePassword,
  updateEmail,
  deleteAccount,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// Protected routes
router.get("/me", protect, getMe);
router.put("/update-details", protect, updateDetails);
router.put("/update-password", protect, updatePassword);
router.put("/update-email", protect, updateEmail);
router.delete("/delete-account", protect, deleteAccount);

export default router;
