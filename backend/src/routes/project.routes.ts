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
  createBuildingType,
} from "../controllers/buildingType.controller";
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

router.route("/:id").get(getProject).put(updateProject).delete(deleteProject);

// Project image upload route with multer middleware
router
  .route("/:id/image")
  .put(uploadImage, handleUploadError, uploadProjectImage);

// Project sharing routes
router.route("/:id/share").post(shareProject);

router.route("/:id/share/:userId").delete(removeSharedAccess);

// Building type routes
router
  .route("/:projectId/building-types")
  .get(getBuildingTypes)
  .post(createBuildingType);

export default router;
