"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import RouterLink from "./NextLink";
import { APP_ROUTES, BOOKNEST_LOGO_PATH } from "../constants";
import { T, useI18n } from "@/i18n/LocaleContext";
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
  const { t } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isRegisterPage = pathname === APP_ROUTES.register;
  const otherPage = isRegisterPage ? APP_ROUTES.login : APP_ROUTES.register;
  const hasCheckoutRedirect =
    searchParams?.get("redirect") === APP_ROUTES.checkout;
  const otherPageLink = hasCheckoutRedirect
    ? `${otherPage}?redirect=%2Fcheckout`
    : otherPage;

  return (
    <AuthPage>
      <AuthPageHeader>
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
            src={BOOKNEST_LOGO_PATH}
            alt=""
            sx={{ width: 38, height: 38 }}
          />
          <Typography variant="h6" className="BookNest-textWeight700">
            <T text="BookNest" />
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Typography
            variant="body2"
            sx={{ color: "common.white", display: { xs: "none", sm: "block" } }}
          >
            {isRegisterPage
              ? t("Already have an account?")
              : t("Don't have an account?")}
          </Typography>
          <Button
            component={RouterLink}
            href={otherPageLink}
            variant="outlined"
            className="BookNest-authSwitchButton"
          >
            {isRegisterPage ? t("Log In") : t("Sign Up")}
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
