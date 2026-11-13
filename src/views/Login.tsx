"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import ClientRedirect from "../components/ClientRedirect";
import RouterLink from "../components/NextLink";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../schemas/authSchemas";
import type { LoginForm } from "../types/user";
import { useAuth } from "../auth/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { APP_ROUTES, USER_ROLES } from "../constants";
import { T, useI18n } from "@/i18n/LocaleContext";

function Login() {
  const { t } = useI18n();
  const { user, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const redirect =
    searchParams?.get("redirect") === APP_ROUTES.checkout
      ? APP_ROUTES.checkout
      : APP_ROUTES.home;
  const registerLink =
    redirect === APP_ROUTES.checkout
      ? `${APP_ROUTES.register}?redirect=%2Fcheckout`
      : APP_ROUTES.register;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: yupResolver(loginSchema) });

  async function onSubmit(data: LoginForm) {
    setError("");
    try {
      const account = await login(data.email, data.password);
      router.replace(account.role === USER_ROLES.admin ? APP_ROUTES.admin : redirect);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t("Could not log in. Please try again."),
      );
    }
  }

  if (user)
    return (
      <ClientRedirect href={user.role === USER_ROLES.admin ? APP_ROUTES.admin : redirect} />
    );

  return (
    <AuthLayout
      title={t("Welcome Back!")}
      subtitle={t("Log in to your BookNest account")}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2.2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label={t("Email")}
            placeholder={t("name@email.com")}
            fullWidth
            autoComplete="email"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label={t("Password")}
            type={showPassword ? "text" : "password"}
            fullWidth
            autoComplete="current-password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      type="button"
                      size="small"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? t("Hide") : t("Show")}
                    </Button>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("Logging in...") : t("Log In")}
          </Button>
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            <T text="Don't have an account?" />{" "}
            <Typography
              component={RouterLink}
              href={registerLink}
              color="primary"
              sx={{ fontWeight: 700, textDecoration: "none" }}
            >
              <T text="Create one" />
            </Typography>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}

export default Login;
