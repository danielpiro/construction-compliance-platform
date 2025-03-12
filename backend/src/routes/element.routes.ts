// src/routes/element.routes.ts
import { Router } from "express";
import {
  getElement,
  updateElement,
  deleteElement,
  runComplianceCheck,
  insertTestLayers,
} from "../controllers/element.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Public route for testing
router.post("/amir", insertTestLayers);

// Protect all other routes
router.use(protect);

// Element routes
router.route("/:id").get(getElement).put(updateElement).delete(deleteElement);

router.route("/:id/compliance-check").post(runComplianceCheck);

export default router;
