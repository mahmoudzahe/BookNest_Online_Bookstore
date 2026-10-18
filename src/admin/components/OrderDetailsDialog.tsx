import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import type { Order } from "../../types/order";
import { money } from "../AdminCommon";

export const orderStatuses: Order["status"][] = [
  "pending",
  "shipped",
  "delivered",
  "cancelled",
];

interface OrderDetailsDialogProps {
  order: Order | null;
  status: Order["status"];
  error: string;
  saving: boolean;
  onStatusChange: (status: Order["status"]) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function OrderDetailsDialog({
  order,
  status,
  error,
  saving,
  onStatusChange,
  onClose,
  onSave,
}: OrderDetailsDialogProps) {
  return (
    <Dialog
      open={Boolean(order)}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Order #{order?.id}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {order && (
          <Box sx={{ display: "grid", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Placed {new Date(order.createdAt).toLocaleString()}
            </Typography>
            <Box>
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                Shipping Information
              </Typography>
              <Typography>{order.shipping.fullName}</Typography>
              <Typography>{order.shipping.phone}</Typography>
              <Typography>{order.shipping.address}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Items</Typography>
              {order.items.map((item, index) => (
                <Box
                  key={`${item.bookId}-${index}`}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                    py: 0.5,
                  }}
                >
                  <Typography>
                    {item.title} × {item.quantity}
                  </Typography>
                  <Typography>{money(item.price * item.quantity)}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>Subtotal</Typography>
                <Typography>{money(order.subtotal)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>Discount</Typography>
                <Typography>−{money(order.discount)}</Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
              >
                <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {money(order.total)}
                </Typography>
              </Box>
            </Box>
            <TextField
              select
              label="Order Status"
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as Order["status"])
              }
            >
              {orderStatuses.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button disabled={saving} onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          disabled={saving || status === order?.status}
          onClick={onSave}
        >
          {saving ? "Saving..." : "Save Status"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
