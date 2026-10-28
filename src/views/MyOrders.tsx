"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import RouterLink from "../components/NextLink";
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
    <Box
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? theme.palette.background.default
            : theme.palette.background.paper,
        minHeight: "74vh",
      }}
    >
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 } }}>
        <Stack spacing={3.5}>
          <Stack spacing={1}>
            <Typography
              component="h1"
              variant="h4"
              sx={{ fontFamily: "Georgia, serif", fontWeight: 700 }}
            >
              My orders
            </Typography>
            <Typography color="text.secondary">
              View your purchases and track the status of each order.
            </Typography>
          </Stack>

          {loading && <CircularProgress aria-label="Loading orders" />}
          {error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && orders.length === 0 && (
            <Paper
              variant="outlined"
              sx={{ p: { xs: 3, sm: 5 }, textAlign: "center", borderRadius: 3 }}
            >
              <Stack spacing={2} sx={{ alignItems: "center" }}>
                <MenuBookOutlinedIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  No orders yet
                </Typography>
                <Typography color="text.secondary">
                  Your books will show up here once you've placed an order.
                </Typography>
                <Button
                  component={RouterLink}
                  href="/books"
                  variant="contained"
                >
                  Explore books
                </Button>
              </Stack>
            </Paper>
          )}

          {!loading && !error && orders.length > 0 && (
            <Stack spacing={2.5}>
              <Typography variant="body2" color="text.secondary">
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </Typography>

              {orders.map((order) => (
                <Paper
                  key={order.id}
                  variant="outlined"
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: 3,
                    boxShadow: "none",
                  }}
                >
                  <Stack spacing={2.5}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
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
                          Placed on{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
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
                        size="small"
                        sx={{
                          alignSelf: "flex-start",
                          textTransform: "capitalize",
                        }}
                      />
                    </Stack>

                    <Stack spacing={1.75}>
                      {order.items.map((item) => (
                        <Stack
                          key={item.bookId}
                          direction="row"
                          spacing={2}
                          sx={{ alignItems: "center" }}
                        >
                          <Box
                            sx={{
                              width: 62,
                              height: 82,
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
                                loading="lazy"
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
                          <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
                              {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {item.quantity}
                            </Typography>
                          </Stack>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
                          >
                            ${(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      sx={{
                        alignItems: { sm: "center" },
                        justifyContent: "space-between",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "baseline" }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Total
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          ${order.total.toFixed(2)}
                        </Typography>
                      </Stack>
                      <Button
                        component={RouterLink}
                        href={`/my-orders/${order.id}`}
                        variant="outlined"
                        endIcon={<ArrowForwardRoundedIcon />}
                        sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
                      >
                        View order details
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

export default MyOrders;
