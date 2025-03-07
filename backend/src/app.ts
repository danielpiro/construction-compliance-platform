// src/app.ts
import express, { Application, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";

// Import route files
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import buildingTypeRoutes from "./routes/buildingType.routes";
import spaceRoutes from "./routes/space.routes";
import elementRoutes from "./routes/element.routes";
import adminRoutes from "./routes/admin.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import cityRoutes from "./routes/city.routes";
import userRoutes from "./routes/user.routes";

// Load environment variables
dotenv.config();

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors()); // TODO - restrict to specific origins in production

// Body parser middleware for most routes
app.use(express.json({ limit: "10mb" }));

// Special handling for Stripe webhook - this should come AFTER the general body parser
// but BEFORE the routes are mounted
app.use(
  "/api/subscriptions/webhook",
  express.raw({ type: "application/json" })
);

// Database connection
const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb://localhost:27017/construction-compliance"
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Set up static folders
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/building-types", buildingTypeRoutes);
app.use("/api/spaces", spaceRoutes);
app.use("/api/elements", elementRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/user", userRoutes);

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.send("Construction Compliance Platform API");
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

export { app, connectDB };
