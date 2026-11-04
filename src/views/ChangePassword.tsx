"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { passwordSchema } from "../schemas/authSchemas";
import type { PasswordForm } from "../types/user";
import { useAuth } from "../auth/AuthContext";
import { changeUserPassword } from "../services/authApi";

function ChangePassword() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ resolver: yupResolver(passwordSchema) });

  async function onSubmit(data: PasswordForm) {
    setError("");
    setMessage("");
    if (!user) return;
    try {
      await changeUserPassword(user.id, data.currentPassword, data.newPassword);
      reset();
      setMessage("Password changed successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not change password.",
      );
    }
  }

  return (
    <Box
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? theme.palette.background.default
            : theme.palette.background.paper,
        minHeight: "74vh",
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Typography
              component="h1"
              variant="h4"
              sx={{ fontFamily: "Georgia, serif", fontWeight: 700 }}
            >
              Change password
            </Typography>
            <Typography color="text.secondary">
              Keep your BookNest account secure by updating your password.
            </Typography>
          </Stack>

          <Grid container spacing={{ xs: 3, md: 6 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={1.5} sx={{ maxWidth: 340 }}>
                <LockOutlinedIcon color="primary" sx={{ fontSize: 34 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Account security
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.8 }}
                >
                  Choose a password with at least 8 characters. Keep it private
                  and avoid using the same password across accounts.
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 2.5, sm: 4 },
                  borderRadius: 3,
                  boxShadow: "none",
                }}
              >
                <Stack
                  component="form"
                  spacing={2.5}
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Update your password
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Enter your current password, then choose a new one.
                    </Typography>
                  </Stack>

                  {message && <Alert severity="success">{message}</Alert>}
                  {error && <Alert severity="error">{error}</Alert>}

                  <TextField
                    label="Current password"
                    type="password"
                    autoComplete="current-password"
                    fullWidth
                    {...register("currentPassword")}
                    error={!!errors.currentPassword}
                    helperText={errors.currentPassword?.message}
                  />
                  <TextField
                    label="New password"
                    type="password"
                    autoComplete="new-password"
                    fullWidth
                    {...register("newPassword")}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword?.message}
                  />
                  <TextField
                    label="Confirm new password"
                    type="password"
                    autoComplete="new-password"
                    fullWidth
                    {...register("confirmPassword")}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    sx={{
                      alignSelf: { xs: "stretch", sm: "flex-start" },
                      minWidth: 190,
                    }}
                  >
                    {isSubmitting ? "Updating..." : "Update password"}
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}

export default ChangePassword;
