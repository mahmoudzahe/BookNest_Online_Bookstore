import { Grid } from "@mui/material";
import { styled } from "@mui/material/styles";

export const FeaturedScroller = styled(Grid)({
  overflowX: "auto",
  scrollBehavior: "smooth",
  scrollSnapType: "x mandatory",
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  "& > .MuiGrid-root": {
    flexShrink: 0,
    minWidth: 0,
    scrollSnapAlign: "start",
  },
});

export const FeaturedDot = styled("button")(({ theme }) => ({
  width: theme.spacing(1),
  height: theme.spacing(1),
  padding: 0,
  border: 0,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.action.disabledBackground,
  cursor: "pointer",
  transition: "width 0.2s ease",
  "&.is-active": {
    width: theme.spacing(3),
    backgroundColor: theme.palette.primary.main,
  },
}));
