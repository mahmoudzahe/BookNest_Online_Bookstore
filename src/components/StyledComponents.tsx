import { Card } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

export const StoreBookCard = styled(Card)(({ theme }) => ({
  height: "100%",
  border: `1px solid ${alpha(theme.palette.text.primary, 0.09)}`,
  borderRadius: theme.spacing(2.25),
  boxShadow: `0 5px 22px ${alpha(theme.palette.common.black, theme.palette.mode === "dark" ? 0.13 : 0.035)}`,
  transition: theme.transitions.create(
    ["box-shadow", "transform", "border-color"],
    { duration: theme.transitions.duration.short },
  ),
  "&:hover": {
    transform: "translateY(-3px)",
    borderColor: alpha(theme.palette.primary.main, 0.32),
    boxShadow: `0 12px 28px ${alpha(theme.palette.common.black, 0.1)}`,
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    "&:hover": { transform: "none" },
  },
}));

export const StoreBookCoverLink = styled(RouterLink)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: 106,
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  borderRadius:
    typeof theme.shape.borderRadius === "number"
      ? theme.shape.borderRadius * 1.5
      : theme.shape.borderRadius,
  backgroundColor: theme.palette.action.hover,
  padding: theme.spacing(1, 0.75),
  [theme.breakpoints.up("sm")]: { width: 96 },
  [theme.breakpoints.up("lg")]: { width: 100 },
}));
