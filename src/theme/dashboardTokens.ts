import type { PaletteMode } from "@mui/material";

export type DashboardAccent = "teal" | "blue" | "amber" | "purple";

export type DashboardTokens = {
  accents: Record<DashboardAccent, string>;
  statusColors: Record<
    "pending" | "shipped" | "delivered" | "cancelled",
    string
  >;
  revenueColor: string;
  hero: {
    background: string;
    text: string;
    overline: string;
    description: string;
    avatarBackground: string;
    decorationBackground: string;
    exploreText: string;
    exploreHover: string;
    profileBorder: string;
    profileHover: string;
  };
};

declare module "@mui/material/styles" {
  interface Theme {
    dashboard: DashboardTokens;
  }

  interface ThemeOptions {
    dashboard?: DashboardTokens;
  }
}

export function createDashboardTokens(mode: PaletteMode): DashboardTokens {
  return {
    accents: {
      teal: "#238E91",
      blue: "#4786C3",
      amber: "#D69B37",
      purple: "#8373C8",
    },
    statusColors: {
      pending: "#D7A043",
      shipped: "#4A8ACB",
      delivered: "#329A7C",
      cancelled: "#B67A88",
    },
    revenueColor: mode === "dark" ? "#72CAD0" : "#217C89",
    hero: {
      background:
        "linear-gradient(110deg, #173E50 0%, #235F70 55%, #307C86 100%)",
      text: "#ffffff",
      overline: "#CEEDF1",
      description: "#D5EAF0",
      avatarBackground: "rgba(255,255,255,0.18)",
      decorationBackground: "rgba(255,255,255,0.065)",
      exploreText: "#1A5361",
      exploreHover: "#E8F3F5",
      profileBorder: "rgba(255,255,255,0.55)",
      profileHover: "rgba(255,255,255,0.12)",
    },
  };
}
