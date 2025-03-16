import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
import ProjectDetailPage from "./pages/projects/ProjectDetailPage";
import ProjectTypePage from "./pages/projects/ProjectTypePage";
import NotFoundPage from "./pages/NotFoundPage";
import { useAuth } from "./hooks/useAuth";
import ProfilePage from "./pages/projects/ProfilePage";
import SettingsPage from "./pages/projects/SettingsPage";

import "./utils/i18n"; // Import your i18n configuration
import SpaceDetailsPage from "./pages/projects/SpaceDetailsPage";
import ElementDetailsPage from "./pages/projects/ElementDetailsPage";
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
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <ProjectDetailPage />
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
          path="/projects/:projectId/types/:typeId/spaces/:spaceId"
          element={
            <ProtectedRoute>
              <SpaceDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/types/:typeId/spaces/:spaceId/elements/:elementId"
          element={
            <ProtectedRoute>
              <ElementDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  );
};

export default App;
