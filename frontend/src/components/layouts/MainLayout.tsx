import React, { useState, ReactNode } from "react";
import { Box, Toolbar, Skeleton } from "@mui/material";
import Header from "../common/Header";
import Sidebar from "../common/Sidebar";
import Footer from "../common/Footer";
import { useAuth } from "../../hooks/useAuth";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerWidth = 240;

  // Check if we're on an auth page to conditionally render the footer
  const isAuthPage =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/verify-email");

  // Check if we need to fix footer at bottom (dashboard, profile pages)
  const needsFixedFooter =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/profile");

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      dir="rtl"
      sx={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column",
      }}
    >
      {/* Header component */}
      <Header />

      {/* Sidebar - show skeleton while loading, otherwise only for logged in users */}
      {loading ? (
        <Box
          sx={{
            width: drawerWidth,
            height: "100vh",
            position: "fixed",
            bgcolor: "background.paper",
            borderRight: 1,
            borderColor: "divider",
          }}
        >
          <Toolbar />
          <Box sx={{ p: 2 }}>
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} height={40} sx={{ mb: 2 }} animation="wave" />
            ))}
          </Box>
        </Box>
      ) : (
        isLoggedIn && (
          <Sidebar
            mobileOpen={mobileOpen}
            handleDrawerToggle={handleDrawerToggle}
            drawerWidth={drawerWidth}
          />
        )
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            sm: `calc(100% - ${loading || isLoggedIn ? drawerWidth : 0}px)`,
          },
          marginInlineStart: {
            sm: loading || isLoggedIn ? `${drawerWidth}px` : 0,
          },
          display: "flex",
          flexDirection: "column",
          minHeight: needsFixedFooter ? "calc(100vh - 64px)" : "auto", // Subtract header height
        }}
      >
        <Toolbar /> {/* Offset for fixed header */}
        <Box
          sx={{
            flexGrow: 1,
            maxWidth: "1200px",
            width: "100%",
            mx: "auto", // centers the container
            px: { xs: 2, sm: 3, md: 4 }, // responsive padding
            pb: 4, // bottom padding for consistent spacing
          }}
        >
          {loading ? (
            <Box sx={{ py: 3 }}>
              <Skeleton variant="rectangular" height={200} sx={{ mb: 4 }} />
              <Skeleton width="60%" height={40} sx={{ mb: 2 }} />
              <Skeleton width="40%" height={20} sx={{ mb: 4 }} />
              <Skeleton height={100} sx={{ mb: 2 }} />
              <Skeleton height={100} sx={{ mb: 2 }} />
              <Skeleton height={100} />
            </Box>
          ) : (
            children
          )}
        </Box>
        {!isAuthPage && <Footer />}
      </Box>
    </Box>
  );
};

export default MainLayout;
