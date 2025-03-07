import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Protected routes - require authentication
router.use(protect);

// Profile routes
router.route("/profile").get(getProfile).put(updateProfile);

// Email change routes removed for now

export default router;
