"use client";

import type { ReactNode } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import RouterLink from "@/components/NextLink";
import type { DashboardAccent } from "@/theme/dashboardTokens";

export default function DashboardStatCard({
  label,
  value,
  icon,
  href,
  accent = "teal",
  note,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  href: string;
  accent?: DashboardAccent;
  note?: string;
}) {
  const theme = useTheme();
  const color = theme.dashboard.accents[accent];

  return (
    <Paper
      component={RouterLink}
      href={href}
      variant="outlined"
      sx={{
        display: "block",
        height: "100%",
        minHeight: 164,
        p: { xs: 2.25, sm: 2.75 },
        textDecoration: "none",
        color: "text.primary",
        borderRadius: 3,
        borderColor: alpha(color, theme.palette.mode === "dark" ? 0.28 : 0.18),
        background: `linear-gradient(150deg, ${alpha(color, theme.palette.mode === "dark" ? 0.16 : 0.07)} 0%, ${theme.palette.background.paper} 72%)`,
        transition: "transform 180ms ease, box-shadow 180ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 13px 30px ${alpha(theme.palette.common.black, 0.11)}`,
        },
        "&:focus-visible": {
          outline: `3px solid ${theme.palette.primary.main}`,
          outlineOffset: 3,
        },
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ fontWeight: 700, lineHeight: 1.5 }}
          >
            {label}
          </Typography>
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: 2,
              color,
              bgcolor: alpha(color, 0.13),
            }}
          >
            {icon}
          </Stack>
        </Stack>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.035em",
              overflowWrap: "anywhere",
            }}
          >
            {value}
          </Typography>
          {note && (
            <Typography variant="caption" color="text.secondary">
              {note}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
