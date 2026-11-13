import { Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

export const BookCoverFrame = styled(Paper)(({ theme }) => ({
  minHeight: 340,
  padding: theme.spacing(4, 3),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up("md")]: {
    minHeight: 450,
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
}));
