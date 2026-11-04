import type { ReactNode } from "react";
import { Divider, Paper, Stack, Typography } from "@mui/material";
import type { OrderItem } from "../types/order";

type CheckoutOrderSummaryProps = {
  items: Pick<OrderItem, "bookId" | "title" | "quantity" | "price">[];
  subtotal: number;
  discount: number;
  total: number;
  children?: ReactNode;
};

export default function CheckoutOrderSummary({
  items,
  subtotal,
  discount,
  total,
  children,
}: CheckoutOrderSummaryProps) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
      <Stack spacing={2.5}>
        <Typography variant="h6">Order Summary</Typography>

        <Stack spacing={1.5}>
          {items.map((item) => (
            <Stack
              key={item.bookId}
              direction="row"
              spacing={2}
              sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
            >
              <Typography variant="body2" color="text.secondary">
                {item.title} × {item.quantity}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                ${(item.price * item.quantity).toFixed(2)}
              </Typography>
            </Stack>
          ))}
        </Stack>

        {children}

        <Divider />
        <Stack spacing={1.5}>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography color="text.secondary">Subtotal</Typography>
            <Typography>${subtotal.toFixed(2)}</Typography>
          </Stack>
          {discount > 0 && (
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography color="text.secondary">Discount</Typography>
              <Typography color="success.main">
                -${discount.toFixed(2)}
              </Typography>
            </Stack>
          )}
          <Divider />
          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6">${total.toFixed(2)}</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}
