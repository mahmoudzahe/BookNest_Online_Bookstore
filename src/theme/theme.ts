import { createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";
import type {} from "@mui/x-data-grid/themeAugmentation";
import { ADMIN_SIDEBAR_WIDTH } from "../admin/constants";

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
      MuiTypography: {
        styleOverrides: {
          root: {
            "&.BookNest-textWeight600": { fontWeight: 600 },
            "&.BookNest-textWeight700": { fontWeight: 700 },
            "&.BookNest-textWeight800": { fontWeight: 800 },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            "&.BookNest-footerSubscribeButton": {
              backgroundColor: mode === "dark" ? "#81c8d6" : "#b3d9e1",
              color: "#132B35",
              fontWeight: 700,
              paddingInline: 24,
              whiteSpace: "nowrap",
              "&:hover": {
                backgroundColor: mode === "dark" ? "#9cd9e5" : "#94c4d0",
              },
            },
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
          root: ({ theme }) => ({
            "&.BookNest-dashboardStat": {
              padding: theme.spacing(2.5),
              textDecoration: "none",
              color: theme.palette.text.primary,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: theme.spacing(1),
              height: "100%",
            },
            "& .BookNest-dashboardStatIcon": {
              backgroundColor: theme.palette.action.hover,
              color: theme.palette.primary.main,
              padding: theme.spacing(1.25),
              borderRadius: theme.shape.borderRadius,
            },
            "&.BookNest-dashboardPanel": {
              padding: theme.spacing(2),
              height: "100%",
              minWidth: 0,
            },
          }),
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          columnHeaderTitle: { fontWeight: 700 },
          root: ({ theme }) => ({
            "&.BookNest-adminDataGrid": {
              border: 0,
              "& .MuiDataGrid-cell": {
                display: "flex",
                alignItems: "center",
              },
              "& .MuiDataGrid-row.low-stock": {
                backgroundColor: theme.palette.action.hover,
              },
            },
          }),
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: ({ theme }) => ({
            "&.BookNest-adminDrawerPaper": {
              width: ADMIN_SIDEBAR_WIDTH,
              boxSizing: "border-box",
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
            },
          }),
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: ({ theme }) => ({
            "&.BookNest-footerEmailInput .MuiOutlinedInput-root": {
              backgroundColor: theme.palette.background.paper,
            },
          }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            "&.BookNest-adminAppBar": {
              backgroundColor: theme.palette.background.paper,
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
          }),
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            "&.BookNest-featuredNavButton": {
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            },
          }),
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: ({ theme }) => ({
            "&.BookNest-adminAvatar": {
              backgroundColor: theme.palette.primary.main,
              width: 36,
              height: 36,
              fontSize: theme.typography.body2.fontSize,
            },
          }),
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            "&.BookNest-adminNavItem": {
              minHeight: 45,
              borderRadius: theme.shape.borderRadius,
            },
            "&.BookNest-adminNavItem.Mui-selected": {
              backgroundColor: theme.palette.action.selected,
              color: theme.palette.primary.main,
            },
          }),
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
