// src/services/subscriptionService.ts
import apiClient from "./api";

interface CheckoutData {
  priceId: string;
}

// Subscription service
const subscriptionService = {
  // Get current user's subscription
  getMySubscription: async () => {
    const response = await apiClient.get("/subscriptions/me");
    return response.data;
  },

  // Create checkout session
  createCheckoutSession: async (data: CheckoutData) => {
    const response = await apiClient.post("/subscriptions/checkout", data);
    return response.data;
  },

  // Handle successful subscription (after redirect from Stripe)
  handleSubscriptionSuccess: async (sessionId: string) => {
    const response = await apiClient.get(
      `/subscriptions/success?sessionId=${sessionId}`
    );
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async () => {
    const response = await apiClient.delete("/subscriptions/cancel");
    return response.data;
  },
};

export default subscriptionService;
