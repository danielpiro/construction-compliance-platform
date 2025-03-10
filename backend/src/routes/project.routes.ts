// src/routes/project.routes.ts
import { Router } from "express";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  shareProject,
  removeSharedAccess,
  uploadProjectImage,
} from "../controllers/project.controller";
import {
  getBuildingTypes,
  getBuildingType,
  createBuildingType,
  updateBuildingType,
  deleteBuildingType,
} from "../controllers/buildingType.controller";
import {
  getSpaces,
  getSpace,
  createSpace,
  updateSpace,
  deleteSpace,
} from "../controllers/space.controller";
import {
  getElements,
  getElement,
  createElement,
  updateElement,
  deleteElement,
  runComplianceCheck,
} from "../controllers/element.controller";
import { protect } from "../middleware/auth.middleware";
import {
  uploadImage,
  handleUploadError,
} from "../middleware/fileUpload.middleware";
import path from "path";
import express, { Request, Response, NextFunction } from "express";

const router = Router();

// Protect all routes
router.use(protect);

// Project routes
router
  .route("/")
  .get(getProjects)
  .post(uploadImage, handleUploadError, createProject);

router
  .route("/:id")
  .get(getProject)
  .put(uploadImage, handleUploadError, updateProject)
  .delete(deleteProject);

// Project image upload route with multer middleware
router
  .route("/:id/image")
  .put(uploadImage, handleUploadError, uploadProjectImage);

// Project sharing routes
router.route("/:id/share").post(shareProject);

router.route("/:id/share/:userId").delete(removeSharedAccess);

// Building type routes
router.route("/:projectId/types").get(getBuildingTypes);

// Create building type route (must be before :typeId routes to avoid route param conflicts)
router.route("/:projectId/types/create").post(createBuildingType);

// Individual building type routes
router
  .route("/:projectId/types/:typeId")
  .get(getBuildingType)
  .put(updateBuildingType)
  .delete(deleteBuildingType);

// Space routes
router.route("/:projectId/types/:typeId/spaces").get(getSpaces);

// Create space route (must be before :spaceId routes)
router.route("/:projectId/types/:typeId/spaces/create").post(createSpace);

router
  .route("/:projectId/types/:typeId/spaces/:spaceId")
  .get(getSpace)
  .put(updateSpace)
  .delete(deleteSpace);

// Element routes
router
  .route("/:projectId/types/:typeId/spaces/:spaceId/elements")
  .get(getElements);

// Create element route (must be before :elementId routes)
router
  .route("/:projectId/types/:typeId/spaces/:spaceId/elements/create")
  .post(createElement);

router
  .route("/:projectId/types/:typeId/spaces/:spaceId/elements/:elementId")
  .get(getElement)
  .put(updateElement)
  .delete(deleteElement);

router
  .route(
    "/:projectId/types/:typeId/spaces/:spaceId/elements/:elementId/compliance-check"
  )
  .post(runComplianceCheck);

export default router;
