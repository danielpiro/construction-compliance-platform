// src/routes/admin.routes.ts
import { Router } from "express";
import {
  getUsers,
  getUser,
  toggleUserStatus,
  getAllProjects,
  getProjectDetails,
  getSystemLogs,
  getSubscriptionStats,
  deleteUser,
} from "../controllers/admin.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

// Protect all routes and restrict to admin
router.use(protect, authorize("admin"));

// User management routes
router.route("/users").get(getUsers);

router.route("/users/:id").get(getUser).delete(deleteUser);

router.route("/users/:id/status").put(toggleUserStatus);

// Project management routes
router.route("/projects").get(getAllProjects);

router.route("/projects/:id").get(getProjectDetails);

// System routes
router.route("/logs").get(getSystemLogs);

router.route("/subscriptions").get(getSubscriptionStats);

export default router;
