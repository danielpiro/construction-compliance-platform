// src/components/layouts/AuthLayout.tsx
import React from "react";
import { Outlet, Link } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import theme, { cacheRtl } from "../../styles/theme";
import { CacheProvider } from "@emotion/react";
import Logo from "../common/Logo";

const AuthLayout: React.FC = () => {
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastContainer
          position="top-left" // RTL-friendly position
          autoClose={5000}
          rtl
        />
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
            direction: "rtl",
          }}
        >
          <Box
            component={Link}
            to="/"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textDecoration: "none",
              color: "inherit",
              my: 4,
              "& .logo-text": {
                color: "primary.main",
                fontWeight: 700,
                ml: 1,
              },
            }}
          >
            <Logo height={40} />
            <Typography variant="h5" className="logo-text">
              פלטפורמת בדיקת תאימות
            </Typography>
          </Box>

          <Container maxWidth="sm" sx={{ mb: 8 }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderRadius: 2,
              }}
            >
              <Box sx={{ width: "100%" }}>
                <Outlet />
              </Box>
            </Paper>
          </Container>
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default AuthLayout;
