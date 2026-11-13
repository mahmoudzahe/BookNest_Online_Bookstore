"use client";

import type { ReactNode } from "react";
import { Box } from "@mui/material";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? theme.palette.background.default
            : theme.palette.background.paper,
      }}
    >
      {children}
    </Box>
  );
}
