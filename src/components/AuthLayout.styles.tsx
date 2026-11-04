import { Paper, Stack } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";

export const AuthPage = styled(Stack)(({ theme }) => ({
  minHeight: "100dvh",
  width: "100%",
  boxSizing: "border-box",
  position: "relative",
  overflow: "hidden",
  backgroundColor: theme.palette.primary.dark,
  backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  "&::before": {
    content: '""',
    position: "absolute",
    width: 500,
    height: 500,
    top: "-30%",
    right: "-110%",
    borderRadius: "50%",
    border: `65px solid ${alpha(theme.palette.common.white, 0.07)}`,
    pointerEvents: "none",
    [theme.breakpoints.up("md")]: {
      width: 900,
      height: 900,
      top: "-75%",
      right: "-25%",
    },
  },
  "&::after": {
    content: '""',
    position: "absolute",
    width: 450,
    height: 450,
    bottom: "-45%",
    left: "-100%",
    borderRadius: "50%",
    border: `55px solid ${alpha(theme.palette.common.white, 0.06)}`,
    pointerEvents: "none",
    [theme.breakpoints.up("md")]: {
      width: 850,
      height: 850,
      bottom: "-80%",
      left: "-25%",
    },
  },
}));

export const AuthPageHeader = styled("header")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: theme.spacing(2),
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2),
  position: "relative",
  zIndex: 1,
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(3, 4),
  },
}));

export const AuthPageContent = styled("section")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  position: "relative",
  zIndex: 1,
  width: "100%",
  boxSizing: "border-box",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(3, 2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(5, 2),
  },
}));

export const AuthFormPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: 440,
  boxSizing: "border-box",
  borderRadius:
    typeof theme.shape.borderRadius === "number"
      ? theme.shape.borderRadius * 3
      : theme.shape.borderRadius,
  padding: theme.spacing(3),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
}));
