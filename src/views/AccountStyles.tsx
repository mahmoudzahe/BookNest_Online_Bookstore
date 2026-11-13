import { styled } from "@mui/material/styles";

export const AccountPageSurface = styled("div")(({ theme }) => ({
  minHeight: "74vh",
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.background.default
      : theme.palette.background.paper,
}));

const OrderBookCover = styled("div")(({ theme }) => ({
  display: "flex",
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.action.hover,
  borderRadius:
    typeof theme.shape.borderRadius === "number"
      ? theme.shape.borderRadius * 1.5
      : theme.shape.borderRadius,
}));

export const SmallOrderBookCover = styled(OrderBookCover)({
  width: 62,
  height: 82,
});

export const LargeOrderBookCover = styled(OrderBookCover)({
  width: 72,
  height: 98,
});
