"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { makeTheme } from "./theme";

const ThemeModeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDarkMode(localStorage.getItem("booknest-dark-mode") === "true");
    setHydrated(true);
  }, []);
  const theme = useMemo(
    () => makeTheme(darkMode ? "dark" : "light"),
    [darkMode],
  );

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("booknest-dark-mode", String(darkMode));
    }
  }, [darkMode, hydrated]);

  return (
    <ThemeModeContext.Provider
      value={{ darkMode, toggleDarkMode: () => setDarkMode((value) => !value) }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
