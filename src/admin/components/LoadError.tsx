import { Alert, CircularProgress, Stack } from "@mui/material";

interface LoadErrorProps {
  error: string;
  loading: boolean;
}

export default function LoadError({ error, loading }: LoadErrorProps) {
  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }
  return error ? (
    <Alert severity="error" sx={{ mb: 2 }}>
      {error}
    </Alert>
  ) : null;
}
