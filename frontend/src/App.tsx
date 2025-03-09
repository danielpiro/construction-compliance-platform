import React, { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
} from "react-router-dom";
import { Box, Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import MainLayout from "./components/layouts/MainLayout";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Public Pages
import HomePage from "./pages/projects/HomePage";
import AboutPage from "./pages/AboutPage";
import TeamPage from "./pages/TeamPage";
import ContactPage from "./pages/ContactPage";
import PricingPage from "./pages/PricingPage";

// Protected Pages
import ProjectsPage from "./pages/projects/ProjectsPage";
import CreateProjectPage from "./pages/projects/CreateProjectPage";
import EditProjectPage from "./pages/projects/EditProjectPage";
import ProjectDetailPage from "./pages/projects/ProjectDetailPage";
import ProjectTypePage from "./pages/projects/ProjectTypePage";
import SpacesPage from "./pages/spaces/SpacesPage";
import ElementsPage from "./pages/elements/ElementsPage";
import NotFoundPage from "./pages/NotFoundPage";
import { useAuth } from "./hooks/useAuth";
import ProfilePage from "./pages/projects/ProfilePage";
import SettingsPage from "./pages/settings/SettingsPage";
import { SpaceForm, SpaceFormData } from "./components/spaces/SpaceForm";
import EditSpaceForm from "./components/spaces/EditSpaceForm";
import spaceService from "./services/spaceService";

import "./utils/i18n"; // Import your i18n configuration

// Create Space Form Component
const CreateSpaceForm: React.FC = () => {
  const { typeId, projectId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (spaces: SpaceFormData[]) => {
    try {
      if (!typeId) throw new Error(t("errors.generic"));
      setError(null);

      // Create all spaces at once
      const creationPromises = spaces.map((space) =>
        spaceService.createSpace(typeId, {
          name: space.name,
          type: space.type,
          elements: space.elements,
        })
      );

      await Promise.all(creationPromises);

      // Navigate back to project type page
      navigate(`/projects/${projectId}/types/${typeId}/spaces`);
    } catch (error) {
      console.error("Failed to create space:", error);
      setError(error instanceof Error ? error.message : t("errors.generic"));
    }
  };

  return (
    <>
      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      <SpaceForm onSubmit={handleSubmit} />
    </>
  );
};

// Root redirect component that checks auth state
const RootRedirect: React.FC = () => {
  const { isLoggedIn, loading } = useAuth();

  const { t } = useTranslation();
  if (loading) {
    return <div>{t("common.loading")}</div>;
  }

  return isLoggedIn ? <Navigate to="/projects" /> : <HomePage />;
};

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { t } = useTranslation();
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <div>{t("common.loadingMessage")}</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <MainLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected Routes */}
        {/* Dashboard route temporarily hidden
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Project Routes */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/create"
          element={
            <ProtectedRoute>
              <CreateProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/edit"
          element={
            <ProtectedRoute>
              <EditProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/types/:typeId"
          element={
            <ProtectedRoute>
              <ProjectTypePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/types/:typeId/spaces"
          element={
            <ProtectedRoute>
              <SpacesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/types/:typeId/spaces/create"
          element={
            <ProtectedRoute>
              <CreateSpaceForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/types/:typeId/spaces/:spaceId/elements"
          element={
            <ProtectedRoute>
              <ElementsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:projectId/types/:typeId/spaces/:spaceId/edit"
          element={
            <ProtectedRoute>
              <EditSpaceForm />
            </ProtectedRoute>
          }
        />

        {/* Redirect legacy routes */}
        <Route
          path="/building-types/:typeId"
          element={<Navigate to="/projects" />}
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  );
};

export default App;
