import { Box, Container, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 74px)",
        py: { xs: 5, sm: 8 },
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#eff5fb",
        backgroundImage:
          "radial-gradient(circle at 10% 85%, #c9ddec 0, transparent 38%), radial-gradient(circle at 95% 10%, #cddfea 0, transparent 42%)",
      }}
    >
      <Container maxWidth="xs" disableGutters>
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 4,
            bgcolor: "white",
            borderColor: "#e5edf4",
            boxShadow: "0 16px 45px rgba(24, 57, 88, 0.10)",
            p: { xs: 3, sm: 4 },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              fontWeight: 700,
              color: "#172b40",
              mb: 1,
            }}
          >
            {title}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ textAlign: "center", mb: 3 }}
          >
            {subtitle}
          </Typography>
          {children}
        </Paper>
      </Container>
    </Box>
  );
}

export default AuthLayout;
