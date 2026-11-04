"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { Box, Stack } from "@mui/material";
import { NAVBAR_MIN_HEIGHT } from "@/constants";
import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function StoreLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const isWhiteCommercePage =
    pathname === "/cart" || pathname.startsWith("/order-success/");

  return (
    <Stack sx={{ minHeight: "100vh" }}>
      <Suspense fallback={<Box sx={{ minHeight: NAVBAR_MIN_HEIGHT }} />}>
        {mounted ? <NavBar /> : <Box sx={{ minHeight: NAVBAR_MIN_HEIGHT }} />}
      </Suspense>
      <Box
        component="main"
        sx={{
          flex: 1,
          bgcolor: isWhiteCommercePage
            ? (theme) =>
                theme.palette.mode === "dark"
                  ? theme.palette.background.default
                  : theme.palette.background.paper
            : undefined,
        }}
      >
        {children}
      </Box>
      <Footer />
    </Stack>
  );
}
