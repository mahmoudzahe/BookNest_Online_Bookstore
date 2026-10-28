"use client";

import { Box, CircularProgress } from "@mui/material";
import type { ReactNode } from "react";
import ClientRedirect from "../components/ClientRedirect";
import { useAuth } from "../auth/AuthContext";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <ClientRedirect href="/login" />;
  if (user.role !== "admin") return <ClientRedirect href="/" />;

  return <>{children}</>;
}
