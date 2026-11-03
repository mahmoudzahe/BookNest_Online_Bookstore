import { createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";
import { createComponentOverrides } from "./componentOverrides";
import { arSD as arGrid } from "@mui/x-data-grid/locales";
import { arSD as arMaterial } from "@mui/material/locale";
import type { Locale } from "@/i18n/translation";

export function makeTheme(mode: PaletteMode, locale: Locale = "en") {
  return createTheme(
    {
      direction: locale === "ar" ? "rtl" : "ltr",
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
      components: createComponentOverrides(mode),
    },
    ...(locale === "ar" ? [arMaterial, arGrid] : []),
  );
}
