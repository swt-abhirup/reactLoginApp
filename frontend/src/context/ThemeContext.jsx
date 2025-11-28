import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

const ThemeContext = createContext();

export function useThemeContext() {
  return useContext(ThemeContext);
}

export function CustomThemeProvider({ children }) {
  // try to load saved mode from localStorage, default to 'light'
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem("appThemeMode");
    return saved === "dark" ? "dark" : "light";
  });

  // watch mode changes → save to localStorage
  useEffect(() => {
    localStorage.setItem("appThemeMode", mode);
  }, [mode]);

  const toggleMode = () => {
    setMode(prev => (prev === "light" ? "dark" : "light"));
  };

  // create MUI theme object
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          // optionally, customize primary/secondary colors for dark/light
          // primary: { main: mode === "dark" ? "#90caf9" : "#1976d2" },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
