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

function Login() {
  const { user, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const redirect =
    searchParams?.get("redirect") === "/checkout" ? "/checkout" : "/";
  const registerLink =
    redirect === "/checkout" ? "/register?redirect=%2Fcheckout" : "/register";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: yupResolver(loginSchema) });

  async function onSubmit(data: LoginForm) {
    setError("");
    try {
      const account = await login(data.email, data.password);
      router.replace(account.role === "admin" ? "/admin" : redirect);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not log in. Please try again.",
      );
    }
  }

  if (user)
    return (
      <ClientRedirect href={user.role === "admin" ? "/admin" : redirect} />
    );

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Log in to your BookNest account"
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2.2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Email"
            placeholder="name@email.com"
            fullWidth
            autoComplete="email"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="Password"
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
                      {showPassword ? "Hide" : "Show"}
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
            {isSubmitting ? "Logging in..." : "Log In"}
          </Button>
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            Don't have an account?{" "}
            <Typography
              component={RouterLink}
              href={registerLink}
              color="primary"
              sx={{ fontWeight: 700, textDecoration: "none" }}
            >
              Create one
            </Typography>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}

export default Login;
