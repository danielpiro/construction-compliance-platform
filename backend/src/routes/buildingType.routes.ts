// src/routes/buildingType.routes.ts
import { Router } from "express";
import {
  getBuildingType,
  updateBuildingType,
  deleteBuildingType,
} from "../controllers/buildingType.controller";
import { getSpaces, createSpace } from "../controllers/space.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Protect all routes
router.use(protect);

// Building type routes
router
  .route("/:id")
  .get(getBuildingType)
  .put(updateBuildingType)
  .delete(deleteBuildingType);

// Space routes
router.route("/:buildingTypeId/spaces").get(getSpaces).post(createSpace);

export default router;
