import { styled } from "@mui/material/styles";

export const ReadingMomentImage = styled("img")(({ theme }) => ({
  display: "block",
  width: "100%",
  objectFit: "cover",
  borderRadius:
    typeof theme.shape.borderRadius === "number"
      ? theme.shape.borderRadius * 2
      : theme.shape.borderRadius,
  "&.reading-featured": {
    height: 250,
    objectPosition: "center 60%",
    [theme.breakpoints.up("sm")]: { height: 320 },
    [theme.breakpoints.up("md")]: { height: 392 },
  },
  "&.reading-reader, &.reading-coffee": {
    height: 160,
    [theme.breakpoints.up("sm")]: { height: 210 },
    [theme.breakpoints.up("md")]: { height: 188 },
  },
  "&.reading-reader": { objectPosition: "center 45%" },
  "&.reading-coffee": { objectPosition: "center 65%" },
}));
