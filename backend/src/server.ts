import { app, connectDB } from "./app";

const PORT = process.env.PORT || 5000;

// Import routes
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import adminRoutes from "./routes/admin.routes";

// Connect to the database then start the server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
  });

  // Handle server errors
  server.on("error", (e: NodeJS.ErrnoException) => {
    if (e.code === "EADDRINUSE") {
      console.log(`Port ${PORT} is already in use. You can:`);
      console.log("1. Stop the other process using this port");
      console.log(
        "2. Use a different port by setting the PORT environment variable"
      );
      console.log(`Example: PORT=5001 npm run dev`);
      process.exit(1);
    } else {
      console.error(`Server error: ${e.message}`);
      process.exit(1);
    }
  });

  // Handle graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully");
    server.close(() => {
      console.log("Process terminated");
    });
  });

  process.on("SIGINT", () => {
    console.log("SIGINT received. Shutting down gracefully");
    server.close(() => {
      console.log("Process terminated");
    });
  });

  // Mount routes
  app.use("/api/auth", authRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/admin", adminRoutes);
});
