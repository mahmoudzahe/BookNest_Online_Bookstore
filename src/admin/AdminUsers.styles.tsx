import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";

export const AccountStatusButton = styled(Button)(({ theme }) => ({
  borderWidth: 2,
  fontWeight: 700,
  "&:hover": {
    borderWidth: 2,
  },
  "&.Mui-disabled": {
    border: `2px solid ${theme.palette.text.secondary}`,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.action.hover,
  },
}));
