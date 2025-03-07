// src/routes/user.routes.ts
import { Router } from "express";
import { getProfile, updateDetails } from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateDetails);

export default router;
