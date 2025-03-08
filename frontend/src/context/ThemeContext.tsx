import React, { createContext, useContext, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { lightTheme, darkTheme } from "../styles/theme";
import { useAuth } from "../hooks/useAuth";

interface ThemeContextType {
  themeMode: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [themeMode, setThemeMode] = React.useState<"light" | "dark">("light");

  // Handle system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (user?.settings?.appearance?.theme === "system") {
        setThemeMode(e.matches ? "dark" : "light");
      }
    };

    // Initial check
    handleChange(mediaQuery);

    // Listen for changes
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [user?.settings?.appearance?.theme]);

  // Update theme when user settings change
  useEffect(() => {
    if (user?.settings?.appearance?.theme) {
      const theme = user.settings.appearance.theme;
      if (theme === "system") {
        const isDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setThemeMode(isDark ? "dark" : "light");
      } else if (theme === "light" || theme === "dark") {
        setThemeMode(theme);
      }
    }
  }, [user?.settings?.appearance?.theme]);

  return (
    <ThemeContext.Provider value={{ themeMode }}>
      <MuiThemeProvider theme={themeMode === "light" ? lightTheme : darkTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
