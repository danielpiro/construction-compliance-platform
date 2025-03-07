import { createTheme, responsiveFontSizes } from "@mui/material/styles";
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

// Create enhanced theme
const theme = createTheme({
  direction: "rtl",
  palette: {
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
      default: "#f8fafc",
      paper: "#ffffff",
    },
    divider: "rgba(0, 0, 0, 0.08)",
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
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
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
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
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          borderRadius: "16px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
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
          borderRight: "none",
          boxShadow: "2px 0 10px rgba(0, 0, 0, 0.05)",
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

export default responsiveFontSizes(theme);
