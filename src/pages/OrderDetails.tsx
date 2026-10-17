import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { getBooks } from "../services/booksApi";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { cancelUserOrder, getUserOrder } from "../services/ordersApi";
import type { Order } from "../types/order";

function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [bookImages, setBookImages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id || !user) return;
    let active = true;

    getBooks()
      .then((books) => {
        if (active) {
          setBookImages(
            Object.fromEntries(books.map((book) => [book.id, book.image])),
          );
        }
      })
      .catch(() => {});

    getUserOrder(id, user.id)
      .then((data) => {
        if (active) setOrder(data);
      })
      .catch(() => {
        if (active) setError("Order not found.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, user?.id]);

  async function handleCancel() {
    if (!order || !user) return;
    setCancelling(true);
    setError("");
    try {
      const updated = await cancelUserOrder(order.id, user.id);
      setOrder(updated);
      setConfirmOpen(false);
    } catch (err) {
      setConfirmOpen(false);
      setError(
        err instanceof Error ? err.message : "Could not cancel your order.",
      );
    } finally {
      setCancelling(false);
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button component={RouterLink} to="/my-orders" sx={{ mb: 2 }}>
        ← Back to My Orders
      </Button>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Order Details
      </Typography>
      {loading && <CircularProgress />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {order && (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              sx={{
                alignItems: { sm: "center" },
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700 }}>
                  Order #{order.id}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {new Date(order.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Chip
                label={order.status}
                color={order.status === "delivered" ? "success" : "default"}
              />
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Books
            </Typography>

            {order.items.map((item) => (
              <Stack
                key={item.bookId}
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  {bookImages[item.bookId] && (
                    <Box
                      component="img"
                      src={bookImages[item.bookId]}
                      alt={item.title}
                      sx={{ width: 55, height: 75, objectFit: "contain" }}
                    />
                  )}
                  <Typography>
                    {item.title} × {item.quantity}
                  </Typography>
                </Stack>
                <Typography>
                  ${(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Stack>
            ))}

            <Divider sx={{ my: 2 }} />
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography>Subtotal</Typography>
              <Typography>${order.subtotal.toFixed(2)}</Typography>
            </Stack>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", mt: 1 }}
            >
              <Typography>Discount</Typography>
              <Typography>−${order.discount.toFixed(2)}</Typography>
            </Stack>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", mt: 1 }}
            >
              <Typography sx={{ fontWeight: 700 }}>Total</Typography>
              <Typography sx={{ fontWeight: 700 }}>
                ${order.total.toFixed(2)}
              </Typography>
            </Stack>
          </Paper>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Shipping Information
            </Typography>
            <Typography>{order.shipping.fullName}</Typography>
            <Typography>{order.shipping.phone}</Typography>
            <Typography>{order.shipping.address}</Typography>
          </Paper>
          {order.status === "pending" && (
            <Box>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setConfirmOpen(true)}
              >
                Cancel Order
              </Button>
            </Box>
          )}
        </Stack>
      )}
      <Dialog
        open={confirmOpen}
        onClose={() => !cancelling && setConfirmOpen(false)}
        slotProps={{
          paper: { sx: { borderRadius: 3 } },
        }}
      >
        <DialogTitle>Cancel order?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this pending order?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={cancelling}>
            Keep Order
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default OrderDetails;
