import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { makeTheme } from "./theme";

const ThemeModeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("booknest-dark-mode") === "true",
  );
  const theme = useMemo(() => makeTheme(darkMode ? "dark" : "light"), [darkMode]);

  useEffect(() => {
    localStorage.setItem("booknest-dark-mode", String(darkMode));
  }, [darkMode]);

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
