import { app, connectDB } from "./app";

const PORT = process.env.PORT || 5000;

// Import routes
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import adminRoutes from "./routes/admin.routes";

// Connect to the database then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
  });

  // Mount routes
  app.use("/api/auth", authRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/admin", adminRoutes);
});
