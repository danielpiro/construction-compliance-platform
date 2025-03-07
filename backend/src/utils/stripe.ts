// src/utils/stripe.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16", // Use a supported API version
});

// Define subscription plans
export const SUBSCRIPTION_PLANS = {
  FREE: "free",
  BASIC: "basic",
  PREMIUM: "premium",
};

// Plan limits
export const PLAN_LIMITS = {
  [SUBSCRIPTION_PLANS.FREE]: {
    projectLimit: 5,
    advancedValidation: false,
    supportLevel: "basic",
  },
  [SUBSCRIPTION_PLANS.BASIC]: {
    projectLimit: 50,
    advancedValidation: true,
    supportLevel: "standard",
  },
  [SUBSCRIPTION_PLANS.PREMIUM]: {
    projectLimit: Infinity,
    advancedValidation: true,
    supportLevel: "premium",
  },
};

// Create a customer in Stripe
export const createCustomer = async (
  email: string,
  name: string
): Promise<string> => {
  const customer = await stripe.customers.create({
    email,
    name,
  });

  return customer.id;
};

// Create a subscription
export const createSubscription = async (
  customerId: string,
  priceId: string
): Promise<Stripe.Subscription> => {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    expand: ["latest_invoice.payment_intent"],
  });

  return subscription;
};

// Cancel a subscription
export const cancelSubscription = async (
  subscriptionId: string
): Promise<Stripe.Subscription> => {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);

  return subscription;
};

// Get a subscription
export const getSubscription = async (
  subscriptionId: string
): Promise<Stripe.Subscription> => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return subscription;
};

// List all subscriptions for a customer
export const listCustomerSubscriptions = async (
  customerId: string
): Promise<Stripe.ApiList<Stripe.Subscription>> => {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
  });

  return subscriptions;
};

// Create a payment session
export const createCheckoutSession = async (
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> => {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session.url as string;
};

export default stripe;
