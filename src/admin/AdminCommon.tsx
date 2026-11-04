import type { ReactNode } from "react";
import { Stack, Typography } from "@mui/material";

interface PageHeadingProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeading({ title, description, action }: PageHeadingProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        mb: 3,
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant="h4" className="BookNest-textWeight800">
          {title}
        </Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Stack>
      {action}
    </Stack>
  );
}
