import React, { createContext, useContext, useState, useMemo } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import getTheme from "../theme/theme";

const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem("themeMode") || "dark");

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", next);
      return next;
    });
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
