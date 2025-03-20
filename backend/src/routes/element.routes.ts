import express from "express";
import {
  getElements,
  getElement,
  createElement,
  updateElement,
  deleteElement,
  clearSpaceElements,
  runComplianceCheck,
} from "../controllers/element.controller";
import { protect } from "../middleware/auth.middleware";
import { validateLayers } from "../middleware/validateLayers.middleware";

const router = express.Router({ mergeParams: true });

// Base route: /api/projects/:projectId/types/:typeId/spaces/:spaceId/elements

// Protect all routes
router.use(protect);

router.route("/").get(getElements);

router.route("/create").post(validateLayers, createElement);

router.route("/clear").delete(clearSpaceElements);

router
  .route("/:elementId")
  .get(getElement)
  .put(validateLayers, updateElement)
  .delete(deleteElement);

router.route("/:elementId/compliance-check").post(runComplianceCheck);

export default router;
