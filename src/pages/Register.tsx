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
import {
  Link as RouterLink,
  Navigate,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "../schemas/authSchemas";
import type { RegisterForm } from "../types/user";
import { useAuth } from "../auth/AuthContext";
import AuthLayout from "../components/AuthLayout";

function Register() {
  const { user, register: createAccount } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const redirect =
    searchParams.get("redirect") === "/checkout" ? "/checkout" : "/";
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
      navigate(redirect, { replace: true });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not create your account. Try again.",
      );
    }
  }

  if (user) return <Navigate to={redirect} replace />;

  return (
    <AuthLayout title="Get Started" subtitle="Create your BookNest account">
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="First Name"
              fullWidth
              autoComplete="given-name"
              {...register("firstName")}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
            <TextField
              label="Last Name"
              fullWidth
              autoComplete="family-name"
              {...register("lastName")}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          </Stack>
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
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="Confirm Password"
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
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            Already have an account?{" "}
            <Typography
              component={RouterLink}
              to={loginLink}
              color="primary"
              sx={{ fontWeight: 700, textDecoration: "none" }}
            >
              Log In
            </Typography>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}

export default Register;
