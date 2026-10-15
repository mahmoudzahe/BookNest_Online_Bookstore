import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getOrder } from "../services/checkoutApi";
import type { Order } from "../types/order";

function OrderSuccess() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Order not found.");
      setLoading(false);
      return;
    }

    let active = true;

    async function loadOrder() {
      try {
        const data = await getOrder(id!);

        if (active) {
          if (data.userId === user?.id) {
            setOrder(data);
          } else {
            setError("Order not found.");
          }
        }
      } catch {
        if (active) {
          setError("Could not load the order.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      active = false;
    };
  }, [id, user?.id]);

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      {loading && <CircularProgress />}

      {error && <Alert severity="error">{error}</Alert>}

      {order && !loading && !error && (
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 3, sm: 4 },
            textAlign: "center",
            borderRadius: 3,
          }}
        >
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <Typography
              sx={{
                fontSize: 60,
                color: "success.main",
                lineHeight: 1,
              }}
            >
              ✓
            </Typography>

            <Typography variant="h4">Order Placed Successfully!</Typography>

            <Typography color="text.secondary">
              Your order has been created successfully.
            </Typography>

            <Typography>Order ID: {order.id}</Typography>

            <Typography>Status: {order.status}</Typography>

            <Typography variant="h6">
              Total: ${order.total.toFixed(2)}
            </Typography>

            <Button
              variant="contained"
              component={RouterLink}
              to="/books"
              sx={{ borderRadius: 2, px: 3 }}
            >
              Continue Shopping
            </Button>
          </Stack>
        </Paper>
      )}
    </Container>
  );
}

export default OrderSuccess;
