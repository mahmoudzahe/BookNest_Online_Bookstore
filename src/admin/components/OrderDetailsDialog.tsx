import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { Order } from "../../types/order";
import { money } from "../formatters";
import { ORDER_STATUSES } from "../constants";

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
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {error && (
            <Grid size={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
          {order && (
            <>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  Placed {new Date(order.createdAt).toLocaleString()}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.5}>
                  <Typography
                    variant="subtitle1"
                    className="BookNest-textWeight700"
                  >
                    Shipping Information
                  </Typography>
                  <Typography>{order.shipping.fullName}</Typography>
                  <Typography>{order.shipping.phone}</Typography>
                  <Typography>{order.shipping.address}</Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.5}>
                  <Typography
                    variant="subtitle1"
                    className="BookNest-textWeight700"
                  >
                    Items
                  </Typography>
                  {order.items.map((item, index) => (
                    <Stack
                      key={`${item.bookId}-${index}`}
                      direction="row"
                      spacing={2}
                      sx={{ justifyContent: "space-between" }}
                    >
                      <Typography>
                        {item.title} × {item.quantity}
                      </Typography>
                      <Typography>
                        {money(item.price * item.quantity)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Grid>
              <Grid size={12}>
                <Stack
                  spacing={1}
                  sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2 }}
                >
                  <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between" }}
                  >
                    <Typography>Subtotal</Typography>
                    <Typography>{money(order.subtotal)}</Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between" }}
                  >
                    <Typography>Discount</Typography>
                    <Typography>−{money(order.discount)}</Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between" }}
                  >
                    <Typography className="BookNest-textWeight700">
                      Total
                    </Typography>
                    <Typography className="BookNest-textWeight700">
                      {money(order.total)}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid size={12}>
                <TextField
                  select
                  fullWidth
                  label="Order Status"
                  value={status}
                  onChange={(event) =>
                    onStatusChange(event.target.value as Order["status"])
                  }
                >
                  {ORDER_STATUSES.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </>
          )}
        </Grid>
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
