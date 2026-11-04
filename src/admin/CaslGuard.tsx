"use client";

import { CircularProgress, Stack } from "@mui/material";
import type { ReactNode } from "react";
import ClientRedirect from "@/components/ClientRedirect";
import { useAuth } from "@/auth/AuthContext";
import { defineAbilityFor } from "./ability";

export default function CaslGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Stack
        sx={{
          minHeight: "60vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Stack>
    );
  }

  if (!user) return <ClientRedirect href="/login" />;

  if (!defineAbilityFor(user).can("access", "AdminPanel")) {
    return <ClientRedirect href="/" />;
  }

  return <>{children}</>;
}
