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
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
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
        if (active)
          setBookImages(
            Object.fromEntries(books.map((book) => [book.id, book.image])),
          );
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
    <Box
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? theme.palette.background.default
            : theme.palette.background.paper,
        minHeight: "74vh",
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Stack spacing={3}>
          <Button
            component={RouterLink}
            to="/my-orders"
            variant="text"
            startIcon={<ArrowBackRoundedIcon />}
            sx={{ alignSelf: "flex-start", px: 0 }}
          >
            Back to my orders
          </Button>

          <Stack spacing={1}>
            <Typography
              component="h1"
              variant="h4"
              sx={{ fontFamily: "Georgia, serif", fontWeight: 700 }}
            >
              Order details
            </Typography>
            <Typography color="text.secondary">
              Review your books, payment summary and delivery information.
            </Typography>
          </Stack>

          {loading && <CircularProgress aria-label="Loading order" />}
          {error && <Alert severity="error">{error}</Alert>}

          {order && (
            <Stack spacing={3}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{
                  alignItems: { sm: "center" },
                  justifyContent: "space-between",
                }}
              >
                <Stack spacing={0.5}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
                  >
                    Order #{order.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Placed on {new Date(order.createdAt).toLocaleString()}
                  </Typography>
                </Stack>
                <Chip
                  label={order.status}
                  color={
                    order.status === "delivered"
                      ? "success"
                      : order.status === "cancelled"
                        ? "default"
                        : "primary"
                  }
                  sx={{ alignSelf: "flex-start", textTransform: "capitalize" }}
                />
              </Stack>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: { xs: 2.5, sm: 3 },
                      borderRadius: 3,
                      boxShadow: "none",
                    }}
                  >
                    <Stack spacing={3}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Books in this order
                      </Typography>
                      {order.items.map((item) => (
                        <Stack
                          key={item.bookId}
                          direction="row"
                          spacing={2}
                          sx={{ alignItems: "center" }}
                        >
                          <Box
                            sx={{
                              width: 72,
                              height: 98,
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "action.hover",
                              borderRadius: 1.5,
                            }}
                          >
                            {bookImages[item.bookId] ? (
                              <Box
                                component="img"
                                src={bookImages[item.bookId]}
                                alt={item.title}
                                sx={{
                                  maxWidth: "85%",
                                  maxHeight: "88%",
                                  objectFit: "contain",
                                }}
                              />
                            ) : (
                              <MenuBookOutlinedIcon color="disabled" />
                            )}
                          </Box>
                          <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600 }}>
                              {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ${item.price.toFixed(2)} each · Quantity:{" "}
                              {item.quantity}
                            </Typography>
                          </Stack>
                          <Typography
                            sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
                          >
                            ${(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={2.5}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 3, borderRadius: 3, boxShadow: "none" }}
                    >
                      <Stack spacing={2}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Order summary
                        </Typography>
                        <Stack
                          direction="row"
                          sx={{ justifyContent: "space-between" }}
                        >
                          <Typography color="text.secondary">
                            Subtotal
                          </Typography>
                          <Typography>${order.subtotal.toFixed(2)}</Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          sx={{ justifyContent: "space-between" }}
                        >
                          <Typography color="text.secondary">
                            Discount
                          </Typography>
                          <Typography>−${order.discount.toFixed(2)}</Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          sx={{
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography sx={{ fontWeight: 700 }}>
                            Total
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            ${order.total.toFixed(2)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>

                    <Paper
                      variant="outlined"
                      sx={{ p: 3, borderRadius: 3, boxShadow: "none" }}
                    >
                      <Stack spacing={1}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Shipping information
                        </Typography>
                        <Typography>{order.shipping.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.shipping.phone}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ whiteSpace: "pre-wrap" }}
                        >
                          {order.shipping.address}
                        </Typography>
                      </Stack>
                    </Paper>

                    {order.status === "pending" && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setConfirmOpen(true)}
                      >
                        Cancel order
                      </Button>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          )}
        </Stack>
      </Container>

      <Dialog
        open={confirmOpen}
        onClose={() => !cancelling && setConfirmOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle>Cancel order?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this pending order?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={cancelling}>
            Keep order
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Cancel order"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default OrderDetails;
