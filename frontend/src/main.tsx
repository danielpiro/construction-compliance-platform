import React from "react";
import ReactDOM from "react-dom/client";
import { CacheProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
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
          <CssBaseline />
          <BrowserRouter>
            <ToastContainer position="top-left" rtl autoClose={5000} />
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </CacheProvider>
  </React.StrictMode>
);
