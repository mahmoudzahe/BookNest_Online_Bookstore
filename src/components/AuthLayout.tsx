import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import RouterLink from "./NextLink";
const booknestLogo = "/assets/booknest-logo.svg";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isRegisterPage = pathname === "/register";
  const otherPage = isRegisterPage ? "/login" : "/register";
  const hasCheckoutRedirect =
    searchParams?.get("redirect") === "/checkout";
  const otherPageLink = hasCheckoutRedirect
    ? `${otherPage}?redirect=%2Fcheckout`
    : otherPage;

  return (
    <Stack
      sx={{
        minHeight: "100dvh",
        width: "100%",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        bgcolor: "primary.dark",
        backgroundImage: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
        "&::before": {
          content: '""',
          position: "absolute",
          width: { xs: 500, md: 900 },
          height: { xs: 500, md: 900 },
          top: { xs: "-30%", md: "-75%" },
          right: { xs: "-110%", md: "-25%" },
          borderRadius: "50%",
          border: "65px solid",
          borderColor: (theme) => alpha(theme.palette.common.white, 0.07),
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: { xs: 450, md: 850 },
          height: { xs: 450, md: 850 },
          bottom: { xs: "-45%", md: "-80%" },
          left: { xs: "-100%", md: "-25%" },
          borderRadius: "50%",
          border: "55px solid",
          borderColor: (theme) => alpha(theme.palette.common.white, 0.06),
          pointerEvents: "none",
        },
      }}
    >
      <Stack
        component="header"
        direction="row"
        spacing={2}
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, sm: 4 },
          py: { xs: 2, sm: 3 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Stack
          component={RouterLink}
          href="/"
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            color: "common.white",
            textDecoration: "none",
          }}
        >
          <Box
            component="img"
            src={booknestLogo}
            alt=""
            sx={{ width: 38, height: 38 }}
          />
          <Typography variant="h6" className="BookNest-textWeight700">
            BookNest
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Typography
            variant="body2"
            sx={{ color: "common.white", display: { xs: "none", sm: "block" } }}
          >
            {isRegisterPage
              ? "Already have an account?"
              : "Don't have an account?"}
          </Typography>
          <Button
            component={RouterLink}
            href={otherPageLink}
            variant="outlined"
            sx={{
              color: "common.white",
              borderColor: (theme) => alpha(theme.palette.common.white, 0.65),
              "&:hover": {
                borderColor: "common.white",
                bgcolor: (theme) => alpha(theme.palette.common.white, 0.12),
              },
            }}
          >
            {isRegisterPage ? "Log In" : "Sign Up"}
          </Button>
        </Stack>
      </Stack>

      <Stack
        component="section"
        sx={{
          flex: 1,
          position: "relative",
          zIndex: 1,
          width: "100%",
          boxSizing: "border-box",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: { xs: 3, sm: 5 },
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: 440,
            boxSizing: "border-box",
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
          }}
        >
          <Stack spacing={1} sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              component="h1"
              variant="h4"
              className="BookNest-textWeight700"
            >
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Stack>
          {children}
        </Paper>
      </Stack>
    </Stack>
  );
}

export default AuthLayout;
