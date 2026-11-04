import { Box, Button, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import booknestLogo from "../assets/booknest-logo.svg";
import {
  AuthFormPaper,
  AuthPage,
  AuthPageContent,
  AuthPageHeader,
} from "./AuthLayout.styles";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const { pathname, search } = useLocation();
  const isRegisterPage = pathname === "/register";
  const otherPage = isRegisterPage ? "/login" : "/register";
  const hasCheckoutRedirect =
    new URLSearchParams(search).get("redirect") === "/checkout";
  const otherPageLink = hasCheckoutRedirect
    ? `${otherPage}?redirect=%2Fcheckout`
    : otherPage;

  return (
    <AuthPage>
      <AuthPageHeader>
        <Stack
          component={RouterLink}
          to="/"
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
            to={otherPageLink}
            variant="outlined"
            className="BookNest-authSwitchButton"
          >
            {isRegisterPage ? "Log In" : "Sign Up"}
          </Button>
        </Stack>
      </AuthPageHeader>

      <AuthPageContent>
        <AuthFormPaper elevation={6}>
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
        </AuthFormPaper>
      </AuthPageContent>
    </AuthPage>
  );
}

export default AuthLayout;
