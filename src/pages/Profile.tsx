import { useState } from "react";
import {
  Alert,
  Avatar,
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
import { Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { profileSchema } from "../schemas/authSchemas";
import type { ProfileData } from "../types/user";
import { useAuth } from "../auth/AuthContext";

function Profile() {
  const { user, updateProfile } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileData>({
    resolver: yupResolver(profileSchema),
    values: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phone: user?.phone ?? "",
      address: user?.address ?? "",
    },
  });

  async function onSubmit(data: ProfileData) {
    setError("");
    setMessage("");
    try {
      await updateProfile(data);
      setMessage("Profile updated successfully.");
    } catch {
      setError("Could not update your profile. Please try again.");
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
              My profile
            </Typography>
            <Typography color="text.secondary">
              Manage your personal information and keep your account up to date.
            </Typography>
          </Stack>

          <Grid container spacing={{ xs: 3, md: 6 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={2.5} sx={{ maxWidth: 340 }}>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      fontSize: 25,
                    }}
                  >
                    {user?.firstName?.charAt(0).toUpperCase() ?? ""}
                  </Avatar>
                  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {user
                        ? `${user.firstName} ${user.lastName}`
                        : "My account"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ overflowWrap: "anywhere" }}
                    >
                      {user?.email}
                    </Typography>
                  </Stack>
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.8 }}
                >
                  Your account details are used to make checkout and order
                  management easier.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/change-password"
                  variant="text"
                  startIcon={<LockOutlinedIcon />}
                  sx={{ alignSelf: "flex-start", px: 0 }}
                >
                  Change password
                </Button>
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
                      Personal information
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Update your contact details below.
                    </Typography>
                  </Stack>

                  {message && <Alert severity="success">{message}</Alert>}
                  {error && <Alert severity="error">{error}</Alert>}

                  <TextField
                    label="Email address"
                    value={user?.email ?? ""}
                    disabled
                    fullWidth
                  />

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      label="First name"
                      fullWidth
                      {...register("firstName")}
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                    <TextField
                      label="Last name"
                      fullWidth
                      {...register("lastName")}
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  </Stack>

                  <TextField
                    label="Phone number"
                    fullWidth
                    {...register("phone")}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                  <TextField
                    label="Address"
                    fullWidth
                    multiline
                    rows={3}
                    {...register("address")}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    sx={{
                      alignSelf: { xs: "stretch", sm: "flex-start" },
                      minWidth: 180,
                    }}
                  >
                    {isSubmitting ? "Saving..." : "Save changes"}
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

export default Profile;
