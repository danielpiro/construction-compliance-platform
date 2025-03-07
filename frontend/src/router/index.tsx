// src/router/index.tsx
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

// Pages
import HomePage from "../pages/projects/HomePage";
import AuthLayout from "../components/layouts/AuthLayout";
import MainLayout from "../components/layouts/MainLayout";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import ProjectDetailPage from "../pages/projects/ProjectDetailPage";
import ProjectTypePage from "../pages/projects/ProjectTypePage";
import ElementsPage from "../pages/elements/ElementsPage";
import NotFoundPage from "../pages/NotFoundPage";
import DashboardPage from "../pages/projects/DashboardPage";
import ProfilePage from "../pages/projects/ProfilePage";
import ProjectsPage from "../pages/projects/ProjectsPage";
import SpacesPage from "../pages/spaces/SpacesPage";
import SettingsPage from "../pages/settings/SettingsPage";
import { useAuth } from "../hooks/useAuth";
import VerifyEmailChangePage from "../pages/auth/VerifyEmailChangePage";

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Guest only route wrapper (redirect if already logged in)
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Router configuration
const Router = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout children={undefined} />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: "dashboard",
          element: (
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "profile",
          element: (
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "projects",
          element: (
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "projects/:projectId",
          element: (
            <ProtectedRoute>
              <ProjectDetailPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "building-types/:typeId",
          element: (
            <ProtectedRoute>
              <ProjectTypePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "spaces/:spaceId",
          element: (
            <ProtectedRoute>
              <SpacesPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "elements/:elementId",
          element: (
            <ProtectedRoute>
              <ElementsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "settings",
          element: (
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          ),
        },

        {
          path: "*",
          element: <NotFoundPage />,
        },
      ],
    },
    {
      path: "/",
      element: <AuthLayout />,
      children: [
        {
          path: "login",
          element: (
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          ),
        },
        {
          path: "register",
          element: (
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          ),
        },
        {
          path: "forgot-password",
          element: (
            <GuestRoute>
              <ForgotPasswordPage />
            </GuestRoute>
          ),
        },
        {
          path: "reset-password/:token",
          element: (
            <GuestRoute>
              <ResetPasswordPage />
            </GuestRoute>
          ),
        },
        {
          path: "verify-email/:token",
          element: <VerifyEmailPage />,
        },
        {
          path: "verify-email-change/:token",
          element: <VerifyEmailChangePage />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Router;
