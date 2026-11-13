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
import { registerSchema } from "../schemas/authSchemas";
import type { RegisterForm } from "../types/user";
import { useAuth } from "../auth/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { T, useI18n } from "@/i18n/LocaleContext";

function Register() {
  const { t } = useI18n();
  const { user, register: createAccount } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const redirect =
    searchParams?.get("redirect") === "/checkout" ? "/checkout" : "/";
  const loginLink =
    redirect === "/checkout" ? "/login?redirect=%2Fcheckout" : "/login";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: yupResolver(registerSchema) });

  async function onSubmit(data: RegisterForm) {
    setError("");
    try {
      await createAccount({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      router.replace(redirect);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t("Could not create your account. Try again."),
      );
    }
  }

  if (user) return <ClientRedirect href={redirect} />;

  return (
    <AuthLayout
      title={t("Get Started")}
      subtitle={t("Create your BookNest account")}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label={t("First Name")}
              fullWidth
              autoComplete="given-name"
              {...register("firstName")}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
            <TextField
              label={t("Last Name")}
              fullWidth
              autoComplete="family-name"
              {...register("lastName")}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          </Stack>
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
            autoComplete="new-password"
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
          <TextField
            label={t("Confirm Password")}
            type={showPassword ? "text" : "password"}
            fullWidth
            autoComplete="new-password"
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? t("Creating account...") : t("Create Account")}
          </Button>
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            <T text="Already have an account?" />{" "}
            <Typography
              component={RouterLink}
              href={loginLink}
              color="primary"
              sx={{ fontWeight: 700, textDecoration: "none" }}
            >
              <T text="Log In" />
            </Typography>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}

export default Register;
