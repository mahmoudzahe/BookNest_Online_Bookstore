"use client";

import { Container, Typography } from "@mui/material";
import { T } from "@/i18n/LocaleContext";

export default function NotFound() {
  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h5">
        <T text="Page not found" />
      </Typography>
    </Container>
  );
}
