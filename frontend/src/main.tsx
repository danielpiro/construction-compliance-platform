import React from "react";
import ReactDOM from "react-dom/client";
import { CacheProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Import from context directly
import App from "./App";
import { cacheRtl } from "./styles/theme";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CacheProvider value={cacheRtl}>
      <AuthProvider>
        <ThemeProvider>
          <Box sx={{ direction: "rtl" }}>
            <CssBaseline />
            <BrowserRouter>
              <ToastContainer position="top-right" rtl autoClose={3000} />
              <App />
            </BrowserRouter>
          </Box>
        </ThemeProvider>
      </AuthProvider>
    </CacheProvider>
  </React.StrictMode>
);
