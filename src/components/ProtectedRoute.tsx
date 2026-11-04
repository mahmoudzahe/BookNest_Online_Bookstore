"use client";

import { Box, CircularProgress } from "@mui/material";
import { usePathname } from "next/navigation";
import ClientRedirect from "./ClientRedirect";
import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname() ?? "/";

  if (loading) {
    return (
      <Box sx={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(pathname);
    return <ClientRedirect href={`/login?redirect=${redirect}`} />;
  }

  return <>{children}</>;
}
