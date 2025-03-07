// src/controllers/subscription.controller.ts
import { Request, Response, NextFunction } from "express";
import Subscription from "../models/Subscription";
import User from "../models/User";
import {
  createCustomer,
  createCheckoutSession,
  cancelSubscription,
  getSubscription,
  SUBSCRIPTION_PLANS,
  PLAN_LIMITS,
} from "../utils/stripe";
import stripe from "../utils/stripe";
import Stripe from "stripe";

// @desc    Get current user's subscription
// @route   GET /api/subscriptions/me
// @access  Private
export const getMySubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;

    // Find subscription
    const subscription = await Subscription.findOne({ user: userId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Add plan limits to response
    const planDetails =
      PLAN_LIMITS[subscription.plan as keyof typeof PLAN_LIMITS];

    res.status(200).json({
      success: true,
      data: {
        ...subscription.toObject(),
        planDetails,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Create checkout session for subscription
// @route   POST /api/subscriptions/checkout
// @access  Private
export const createSubscriptionCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({
        success: false,
        message: "Please provide a price ID",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find or create subscription document
    let subscription = await Subscription.findOne({ user: userId });

    if (!subscription) {
      // Create a customer in Stripe
      const stripeCustomerId = await createCustomer(user.email, user.name);

      // Create subscription record
      subscription = await Subscription.create({
        user: userId,
        stripeCustomerId,
        plan: SUBSCRIPTION_PLANS.FREE,
        status: "free",
      });
    }

    // Create checkout session
    const successUrl = `${req.protocol}://${req.get(
      "host"
    )}/subscription/success?sessionId={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${req.protocol}://${req.get(
      "host"
    )}/subscription/cancel`;

    const sessionUrl = await createCheckoutSession(
      subscription.stripeCustomerId,
      priceId,
      successUrl,
      cancelUrl
    );

    res.status(200).json({
      success: true,
      data: {
        sessionUrl,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Handle successful subscription
// @route   GET /api/subscriptions/success
// @access  Private
export const handleSubscriptionSuccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(
      sessionId as string,
      {
        expand: ["subscription"],
      }
    );

    // Find subscription in our database
    const subscription = await Subscription.findOne({ user: userId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Update subscription with Stripe data
    if (session.subscription) {
      const stripeSubscription = session.subscription as Stripe.Subscription;

      // Determine plan from price
      let plan = SUBSCRIPTION_PLANS.BASIC;
      // TODO: Add logic to determine plan based on price ID

      // Update subscription
      subscription.stripeSubscriptionId = stripeSubscription.id;
      subscription.plan = plan;
      subscription.status = stripeSubscription.status as any;
      subscription.currentPeriodEnd = new Date(
        stripeSubscription.current_period_end * 1000
      );
      subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;

      await subscription.save();
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Cancel subscription
// @route   DELETE /api/subscriptions/cancel
// @access  Private
export const cancelMySubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;

    // Find subscription
    const subscription = await Subscription.findOne({ user: userId });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(404).json({
        success: false,
        message: "Active subscription not found",
      });
    }

    // Cancel subscription in Stripe
    await cancelSubscription(subscription.stripeSubscriptionId);

    // Update subscription in our database
    subscription.status = "canceled";
    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      data: subscription,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Handle Stripe webhook
// @route   POST /api/subscriptions/webhook
// @access  Public
export const handleStripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sig = req.headers["stripe-signature"] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const stripeSubscription = event.data.object as Stripe.Subscription;
        await updateSubscriptionFromStripe(stripeSubscription);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Helper function to update subscription from Stripe webhook
const updateSubscriptionFromStripe = async (
  stripeSubscription: Stripe.Subscription
) => {
  try {
    // Find subscription by Stripe subscription ID
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: stripeSubscription.id,
    });

    if (!subscription) {
      console.error(
        `Subscription not found for Stripe subscription ID: ${stripeSubscription.id}`
      );
      return;
    }

    // Update subscription data
    subscription.status = stripeSubscription.status as any;
    subscription.currentPeriodEnd = new Date(
      stripeSubscription.current_period_end * 1000
    );
    subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;

    // If subscription is canceled or unpaid, downgrade to free plan
    if (["canceled", "unpaid"].includes(stripeSubscription.status)) {
      subscription.plan = SUBSCRIPTION_PLANS.FREE;
    }

    await subscription.save();
    console.log(`Subscription updated for user: ${subscription.user}`);
  } catch (error) {
    console.error("Error updating subscription from Stripe webhook:", error);
  }
};
