import { createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

export function makeTheme(mode: PaletteMode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: mode === "dark" ? "#81c8d6" : "#20566a" },
      background: {
        default: mode === "dark" ? "#111a20" : "#f7f9fa",
        paper: mode === "dark" ? "#1c2931" : "#ffffff",
      },
    },
    typography: {
      fontFamily: "Arial, sans-serif",
      button: { textTransform: "none" },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            "&.BookNest-heroButton": {
              backgroundColor: "#ffffff",
              color: "#20566a",
              "&:hover": { backgroundColor: "#e8f3f5" },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          outlined: { borderRadius: 30 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 30,
            "&.BookNest-bookCard": {
              height: "100%",
              display: "flex",
              flexDirection: "column",
            },
          },
        },
      },
    },
  });
}
