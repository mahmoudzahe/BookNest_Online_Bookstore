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

type ProfileData = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
};

const schema: yup.ObjectSchema<ProfileData> = yup.object({
  firstName: yup
    .string()
    .trim()
    .min(2, "Enter at least 2 characters")
    .required("First name is required"),
  lastName: yup
    .string()
    .trim()
    .min(2, "Enter at least 2 characters")
    .required("Last name is required"),
  phone: yup
    .string()
    .trim()
    .matches(/^[0-9+()\s-]{7,20}$/, {
      message: "Enter a valid phone number",
      excludeEmptyString: true,
    })
    .required("Phone number is required"),
  address: yup
    .string()
    .trim()
    .min(5, "Enter a valid address")
    .required("Address is required"),
});

function Profile() {
  const { user, updateProfile } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileData>({
    resolver: yupResolver(schema),
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
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Profile
      </Typography>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Email"
            value={user?.email ?? ""}
            disabled
            fullWidth
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="First Name"
              fullWidth
              {...register("firstName")}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
            <TextField
              label="Last Name"
              fullWidth
              {...register("lastName")}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          </Stack>
          <TextField
            label="Phone Number"
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
            disabled={isSubmitting}
            sx={{ borderRadius: 2 }}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default Profile;
