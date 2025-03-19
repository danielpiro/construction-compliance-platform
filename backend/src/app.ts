// src/app.ts
import express, { Application, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Import route files
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import buildingTypeRoutes from "./routes/buildingType.routes";
import spaceRoutes from "./routes/space.routes";
import elementRoutes from "./routes/element.routes";
import adminRoutes from "./routes/admin.routes";
import userRoutes from "./routes/user.routes";

// Load environment variables
dotenv.config();

const app: Application = express();

// Set up static folders and paths
const uploadsPath = path.join(__dirname, "../uploads");

// Configure security middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "*"],
        mediaSrc: ["'self'", "*"],
        connectSrc: ["'self'", "*"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", "data:", "https:", "*"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(
  "/api/subscriptions/webhook",
  express.raw({ type: "application/json" })
);

// Set up static file serving with debug logging
app.use(
  "/api/uploads",
  (req, res, next) => {
    const filePath = path.join(uploadsPath, req.path);
    next();
  },
  express.static(uploadsPath)
);

// Database connection
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb://localhost:27017/construction-compliance"
    );
    console.log(
      `MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`
    );
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Log files in uploads directory
fs.readdir(
  uploadsPath,
  (err: NodeJS.ErrnoException | null, files: string[]) => {
    if (err) {
      console.error("Error reading uploads directory:", err);
    }
  }
);

// Set up static directories
app.use(express.static(path.join(__dirname, "../public")));

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes); // This will handle all nested routes
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.send("Construction Compliance Platform API");
});

// Also serve uploads at root path for backward compatibility
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

export { app };
