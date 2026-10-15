import { useState } from "react";
import {
  Alert,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../auth/AuthContext";
import { changeUserPassword } from "../services/authApi";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const schema: yup.ObjectSchema<PasswordForm> = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(8, "Use at least 8 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .required("Confirm the new password")
    .oneOf([yup.ref("newPassword")], "Passwords do not match"),
});

function ChangePassword() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ resolver: yupResolver(schema) });

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
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Change Password
      </Typography>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Current Password"
            type="password"
            autoComplete="current-password"
            fullWidth
            {...register("currentPassword")}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword?.message}
          />
          <TextField
            label="New Password"
            type="password"
            autoComplete="new-password"
            fullWidth
            {...register("newPassword")}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />
          <TextField
            label="Confirm New Password"
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
            disabled={isSubmitting}
            sx={{ borderRadius: 2 }}
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default ChangePassword;
