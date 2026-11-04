import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getOrder } from "../services/checkoutApi";
import type { Order } from "../types/order";
import CheckoutProgress from "../components/CheckoutProgress";

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
    <Container
      maxWidth="sm"
      sx={{
        minHeight: { xs: "68vh", md: "72vh" },
        pt: { xs: 7, md: 10 },
        pb: { xs: 9, md: 12 },
      }}
    >
      {loading && <CircularProgress />}

      {error && <Alert severity="error">{error}</Alert>}

      {order && !loading && !error && (
        <Stack sx={{ textAlign: "center", py: { xs: 2, sm: 3 } }} spacing={3}>
          <CheckoutProgress step={3} />
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <CheckCircleOutlineRoundedIcon
              color="success"
              aria-hidden="true"
              sx={{ fontSize: 68 }}
            />

            <Typography variant="h4">Order Placed Successfully!</Typography>

            <Typography color="text.secondary">
              Your order has been created successfully.
            </Typography>

            <Typography>Order ID: {order.id}</Typography>

            <Typography>Status: {order.status}</Typography>

            {order.paymentMethod && (
              <Typography>
                Payment:{" "}
                {order.paymentMethod === "cash_on_delivery"
                  ? "Cash on Delivery"
                  : "Card Payment"}
              </Typography>
            )}

            <Typography variant="h6">
              Total: ${order.total.toFixed(2)}
            </Typography>

            <Button
              variant="contained"
              component={RouterLink}
              to="/books"
              sx={{ px: 3 }}
            >
              Continue Shopping
            </Button>
          </Stack>
        </Stack>
      )}
    </Container>
  );
}

export default OrderSuccess;
