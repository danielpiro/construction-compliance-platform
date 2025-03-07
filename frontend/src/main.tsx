import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth"; // Change from "./context/AuthContext"
import App from "./App";
import theme, { cacheRtl } from "./styles/theme";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <ToastContainer position="top-left" rtl autoClose={5000} />
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  </React.StrictMode>
);
