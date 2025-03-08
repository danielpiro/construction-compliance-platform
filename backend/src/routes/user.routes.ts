// src/routes/user.routes.ts
import { Router } from "express";
import {
  getProfile,
  updateDetails,
  getSettings,
  updateSettings,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateDetails);
router.get("/settings", protect, getSettings);
router.put("/settings", protect, updateSettings);

export default router;
