import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getUserOrders } from "../services/ordersApi";
import { getBooks } from "../services/booksApi";
import type { Order } from "../types/order";

function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookImages, setBookImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let active = true;

    Promise.all([getUserOrders(user.id), getBooks().catch(() => [])])
      .then(([data, books]) => {
        if (active) {
          setOrders(data);
          setBookImages(
            Object.fromEntries(books.map((book) => [book.id, book.image])),
          );
        }
      })
      .catch(() => {
        if (active) setError("Could not load your orders.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Orders
      </Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && orders.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography sx={{ mb: 2 }}>
            You haven't placed any orders yet.
          </Typography>
          <Button component={RouterLink} to="/books" variant="contained">
            Browse Books
          </Button>
        </Paper>
      )}

      {!loading && !error && orders.length > 0 && (
        <Stack spacing={2}>
          {orders.map((order) => (
            <Paper key={order.id} variant="outlined" sx={{ p: 3 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                sx={{ justifyContent: "space-between", gap: 2 }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>
                    Order #{order.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Chip
                  label={order.status}
                  color={
                    order.status === "cancelled"
                      ? "default"
                      : order.status === "delivered"
                        ? "success"
                        : "primary"
                  }
                  size="small"
                />
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                {order.items.map((item) => (
                  <Stack
                    key={item.bookId}
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: "center" }}
                  >
                    {bookImages[item.bookId] && (
                      <Box
                        component="img"
                        src={bookImages[item.bookId]}
                        alt={item.title}
                        sx={{
                          width: 55,
                          height: 75,
                          objectFit: "contain",
                        }}
                      />
                    )}
                    <Typography>
                      {item.title} × {item.quantity}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  ${order.total.toFixed(2)}
                </Typography>
                <Button
                  component={RouterLink}
                  to={`/my-orders/${order.id}`}
                  variant="outlined"
                  size="small"
                >
                  View Details
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
}

export default MyOrders;
