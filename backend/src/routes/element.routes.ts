// src/routes/element.routes.ts
import { Router } from "express";
import {
  getElement,
  updateElement,
  deleteElement,
  runComplianceCheck,
  clearSpaceElements,
} from "../controllers/element.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Protect all other routes
router.use(protect);

// Element routes
router.route("/:id").get(getElement).put(updateElement).delete(deleteElement);

router.route("/:id/compliance-check").post(runComplianceCheck);

// Clear all elements in a space
router.route("/clear").delete(clearSpaceElements);

export default router;
