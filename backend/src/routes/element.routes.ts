// src/routes/element.routes.ts
import { Router } from "express";
import {
  getElement,
  updateElement,
  deleteElement,
  runComplianceCheck,
} from "../controllers/element.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Protect all routes
router.use(protect);

// Element routes
router.route("/:id").get(getElement).put(updateElement).delete(deleteElement);

router.route("/:id/compliance-check").post(runComplianceCheck);

export default router;
