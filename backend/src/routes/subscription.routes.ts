// src/routes/subscription.routes.ts
import { Router } from "express";
import {
  getMySubscription,
  createSubscriptionCheckout,
  handleSubscriptionSuccess,
  cancelMySubscription,
  handleStripeWebhook,
} from "../controllers/subscription.controller";
import { protect } from "../middleware/auth.middleware";
import express from "express";

const router = Router();

// Protect routes (except webhook)
router.use("/webhook", express.raw({ type: "application/json" }));
router.post("/webhook", handleStripeWebhook);

// Protected routes
router.use(protect);

router.get("/me", getMySubscription);
router.post("/checkout", createSubscriptionCheckout);
router.get("/success", handleSubscriptionSuccess);
router.delete("/cancel", cancelMySubscription);

export default router;
