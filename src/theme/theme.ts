import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#20566a" },
    background: { default: "#f7f9fa", paper: "#ffffff" },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
    button: { textTransform: "none" },
  },
  shape: { borderRadius: 10 },
});

export default theme;
