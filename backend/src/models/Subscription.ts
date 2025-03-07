// src/models/Subscription.ts
import mongoose, { Document, Schema } from "mongoose";
import { SUBSCRIPTION_PLANS } from "../utils/stripe";

export interface ISubscription extends Document {
  user: mongoose.Schema.Types.ObjectId;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  plan: string;
  status:
    | "active"
    | "canceled"
    | "past_due"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "free";
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  createdAt: Date;
}

const SubscriptionSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
    },
    plan: {
      type: String,
      enum: Object.values(SUBSCRIPTION_PLANS),
      default: SUBSCRIPTION_PLANS.FREE,
    },
    status: {
      type: String,
      enum: [
        "active",
        "canceled",
        "past_due",
        "unpaid",
        "incomplete",
        "incomplete_expired",
        "trialing",
        "free",
      ],
      default: "free",
    },
    currentPeriodEnd: {
      type: Date,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISubscription>(
  "Subscription",
  SubscriptionSchema
);
