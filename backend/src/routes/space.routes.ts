// src/routes/space.routes.ts
import { Router } from "express";
import {
  getSpace,
  updateSpace,
  deleteSpace,
} from "../controllers/space.controller";
import { getElements, createElement } from "../controllers/element.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Protect all routes
router.use(protect);

// Space routes
router.route("/:id").get(getSpace).put(updateSpace).delete(deleteSpace);

// Element routes
router.route("/:spaceId/elements").get(getElements).post(createElement);

export default router;
