// src/routes/city.routes.ts
import { Router } from "express";
import {
  searchCitiesController,
  getCityController,
} from "../controllers/city.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Protect all routes
router.use(protect);

// City routes
router.get("/search", searchCitiesController);
router.get("/:name", getCityController);

export default router;
