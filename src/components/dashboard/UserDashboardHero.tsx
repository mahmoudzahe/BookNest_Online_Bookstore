"use client";

import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import { alpha, styled, useTheme } from "@mui/material/styles";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import RouterLink from "@/components/NextLink";
import { useI18n } from "@/i18n/LocaleContext";

const HeroBanner = styled(Box)(({ theme }) =>
  theme.unstable_sx({
    position: "relative",
    overflow: "hidden",
    borderRadius: { xs: 3, sm: 4 },
    px: { xs: 2.75, sm: 4.5, md: 5 },
    py: { xs: 3.5, sm: 4.5 },
    color: theme.dashboard.hero.text,
    background: theme.dashboard.hero.background,
    boxShadow: `0 14px 40px ${alpha(theme.palette.common.black, 0.1)}`,
    "&::after": {
      content: '""',
      position: "absolute",
      width: 260,
      height: 260,
      borderRadius: "50%",
      top: -130,
      insetInlineEnd: -60,
      bgcolor: theme.dashboard.hero.decorationBackground,
      pointerEvents: "none",
    },
  }),
);

export default function UserDashboardHero({
  firstName,
}: {
  firstName?: string;
}) {
  const { t } = useI18n();
  const { dashboard } = useTheme();

  return (
    <HeroBanner>
      <Stack
        direction={{ xs: "column", md: "row" }}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 3,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Stack spacing={1.25} sx={{ maxWidth: 610 }}>
          <Stack direction="row" sx={{ alignItems: "center", gap: 1.25 }}>
            <Avatar
              sx={{
                width: 43,
                height: 43,
                bgcolor: dashboard.hero.avatarBackground,
                color: dashboard.hero.text,
                fontWeight: 800,
              }}
            >
              {firstName?.charAt(0).toUpperCase() ?? "B"}
            </Avatar>
            <Typography
              variant="overline"
              sx={{
                color: dashboard.hero.overline,
                letterSpacing: 1.25,
                fontWeight: 800,
              }}
            >
              {t("My Dashboard")}
            </Typography>
          </Stack>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: "1.7rem", sm: "2.2rem", md: "2.55rem" },
              fontWeight: 800,
              lineHeight: 1.25,
            }}
          >
            {t("Welcome back, {name}!", { name: firstName ?? t("reader") })}
          </Typography>
          <Typography
            sx={{ color: dashboard.hero.description, lineHeight: 1.8 }}
          >
            {t("Your orders, favorite reads and spending at a glance.")}
          </Typography>
        </Stack>
        <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 1.25 }}>
          <Button
            component={RouterLink}
            href="/books"
            variant="contained"
            startIcon={<AutoStoriesOutlinedIcon />}
            sx={{
              bgcolor: dashboard.hero.text,
              color: dashboard.hero.exploreText,
              px: 2.25,
              fontWeight: 800,
              "&:hover": { bgcolor: dashboard.hero.exploreHover },
            }}
          >
            {t("Explore books")}
          </Button>
          <Button
            component={RouterLink}
            href="/profile"
            variant="outlined"
            sx={{
              borderColor: dashboard.hero.profileBorder,
              color: dashboard.hero.text,
              px: 2.25,
              "&:hover": {
                borderColor: dashboard.hero.text,
                bgcolor: dashboard.hero.profileHover,
              },
            }}
          >
            {t("My Profile")}
          </Button>
        </Stack>
      </Stack>
    </HeroBanner>
  );
}
