import { createTheme, responsiveFontSizes, Theme } from "@mui/material/styles";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import createCache from "@emotion/cache";

// RTL cache setup
export const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

// Enhanced color palette
const primaryColor = {
  main: "#2563eb", // Vibrant blue
  light: "#93c5fd",
  dark: "#1e40af",
  contrastText: "#ffffff",
};

const secondaryColor = {
  main: "#10b981", // Teal green
  light: "#a7f3d0",
  dark: "#059669",
  contrastText: "#ffffff",
};

// Create theme function
const createAppTheme = (mode: "light" | "dark"): Theme => {
  return createTheme({
    direction: "rtl",
    palette: {
      mode,
      primary: primaryColor,
      secondary: secondaryColor,
      error: {
        main: "#ef4444",
      },
      warning: {
        main: "#f59e0b",
      },
      info: {
        main: "#0ea5e9",
      },
      success: {
        main: "#10b981",
      },
      background: {
        default: mode === "light" ? "#f8fafc" : "#0f172a",
        paper: mode === "light" ? "#ffffff" : "#1e293b",
      },
      divider:
        mode === "light" ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)",
      text: {
        primary: mode === "light" ? "#1e293b" : "#f8fafc",
        secondary: mode === "light" ? "#64748b" : "#94a3b8",
      },
    },
    typography: {
      fontFamily: '"Heebo", "Roboto", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
      },
      button: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            padding: "8px 16px",
            fontSize: "1rem",
            boxShadow: "none",
            "&:hover": {
              boxShadow:
                mode === "light"
                  ? "0 4px 8px rgba(0, 0, 0, 0.1)"
                  : "0 4px 8px rgba(0, 0, 0, 0.3)",
            },
          },
          contained: {
            "&:hover": {
              boxShadow:
                mode === "light"
                  ? "0 4px 12px rgba(0, 0, 0, 0.15)"
                  : "0 4px 12px rgba(0, 0, 0, 0.4)",
            },
          },
          sizeLarge: {
            padding: "10px 24px",
            fontSize: "1.1rem",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow:
              mode === "light"
                ? "0 2px 10px rgba(0, 0, 0, 0.08)"
                : "0 2px 10px rgba(0, 0, 0, 0.3)",
            backgroundColor: mode === "light" ? "#ffffff" : "#1e293b",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow:
              mode === "light"
                ? "0 4px 12px rgba(0, 0, 0, 0.05)"
                : "0 4px 12px rgba(0, 0, 0, 0.2)",
            borderRadius: "16px",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow:
              mode === "light"
                ? "0 4px 12px rgba(0, 0, 0, 0.05)"
                : "0 4px 12px rgba(0, 0, 0, 0.2)",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderLeft: "none",
            boxShadow:
              mode === "light"
                ? "-2px 0 10px rgba(0, 0, 0, 0.05)"
                : "-2px 0 10px rgba(0, 0, 0, 0.2)",
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: "8px",
            margin: "4px 8px",
            padding: "10px 16px",
          },
        },
      },
    },
  });
};

// Create themes
export const lightTheme = responsiveFontSizes(createAppTheme("light"));
export const darkTheme = responsiveFontSizes(createAppTheme("dark"));

export default lightTheme;
