import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import { useCheckoutFlow } from "../checkout/CheckoutFlowContext";
import CheckoutOrderSummary from "../components/CheckoutOrderSummary";
import CheckoutProgress from "../components/CheckoutProgress";
import { getBooks } from "../services/booksApi";
import { findCoupon } from "../services/checkoutApi";
import type { Book } from "../types/book";
import type { Coupon, OrderItem, ShippingInformation } from "../types/order";

const shippingSchema: yup.ObjectSchema<ShippingInformation> = yup.object({
  fullName: yup
    .string()
    .trim()
    .required("Full name is required")
    .min(2, "Enter a valid name"),
  phone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(/^[0-9+()\s-]{7,20}$/, "Enter a valid phone number"),
  address: yup
    .string()
    .trim()
    .required("Address is required")
    .min(5, "Enter a valid address"),
});

function Checkout() {
  const navigate = useNavigate();
  const { items, syncStock } = useCart();
  const { user } = useAuth();
  const { draft, saveDraft, clearDraft, returningFromPayment } =
    useCheckoutFlow();
  const preserveDraft = useRef(returningFromPayment).current;
  const savedDraft = preserveDraft && draft?.userId === user?.id ? draft : null;

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [couponInput, setCouponInput] = useState(
    savedDraft?.coupon?.code ?? "",
  );
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(
    savedDraft?.coupon ?? null,
  );
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingInformation>({
    resolver: yupResolver(shippingSchema),
    defaultValues: savedDraft?.shipping ?? {
      fullName: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (!preserveDraft) clearDraft();
  }, [preserveDraft, clearDraft]);

  useEffect(() => {
    let active = true;
    getBooks()
      .then((data) => {
        if (active) {
          setBooks(data);
          syncStock(data);
        }
      })
      .catch(() => {
        if (active)
          setLoadError("Could not load checkout. Check the mock API.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [syncStock]);

  const cartBooks = items.flatMap((item) => {
    const book = books.find((entry) => entry.id === item.bookId);
    return book ? [{ book, quantity: item.quantity }] : [];
  });
  const orderItems: OrderItem[] = cartBooks.map(({ book, quantity }) => ({
    bookId: book.id,
    title: book.title,
    price: book.price,
    quantity,
  }));
  const subtotal = Number(
    orderItems
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2),
  );
  const discount = Number(
    (subtotal * ((appliedCoupon?.discountPercent ?? 0) / 100)).toFixed(2),
  );
  const total = Math.max(0, Number((subtotal - discount).toFixed(2)));

  async function handleApplyCoupon() {
    setCouponError("");
    setAppliedCoupon(null);
    if (!couponInput.trim()) {
      setCouponError("Enter a coupon code.");
      return;
    }

    setCheckingCoupon(true);
    try {
      const coupon = await findCoupon(couponInput);
      if (!coupon) {
        setCouponError("Invalid or inactive coupon.");
        return;
      }
      setAppliedCoupon(coupon);
    } catch {
      setCouponError("Could not check the coupon. Try again.");
    } finally {
      setCheckingCoupon(false);
    }
  }

  async function handleContinue(shipping: ShippingInformation) {
    setSubmitError("");
    if (!user) {
      setSubmitError("Please log in to continue.");
      return;
    }
    if (couponInput.trim() && !appliedCoupon) {
      setCouponError(
        "Apply a valid coupon or clear the coupon field to continue.",
      );
      return;
    }
    if (items.length === 0 || orderItems.length !== items.length) {
      setSubmitError("Your cart has changed. Review your cart and try again.");
      return;
    }
    if (cartBooks.some(({ book, quantity }) => book.stock < quantity)) {
      setSubmitError(
        "Some books are out of stock. Review your cart and try again.",
      );
      return;
    }
    if (appliedCoupon) {
      try {
        const latestCoupon = await findCoupon(appliedCoupon.code);
        if (
          !latestCoupon ||
          latestCoupon.discountPercent !== appliedCoupon.discountPercent
        ) {
          setAppliedCoupon(null);
          setCouponError(
            "This coupon is no longer valid. Remove it or apply another one.",
          );
          return;
        }
      } catch {
        setCouponError("Could not verify the coupon. Please try again.");
        return;
      }
    }

    saveDraft({
      userId: user.id,
      shipping,
      items: orderItems,
      coupon: appliedCoupon,
      subtotal,
      discount,
      total,
    });
    navigate("/payment");
  }

  if (loading) {
    return (
      <Container sx={{ py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }
  if (loadError) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">{loadError}</Alert>
      </Container>
    );
  }
  if (cartBooks.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
          <Alert severity="info" sx={{ width: "100%" }}>
            Your cart is empty.
          </Alert>
          <Button component={RouterLink} to="/books" variant="contained">
            Browse books
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 9, md: 12 } }}
    >
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Button
          component={RouterLink}
          to="/cart"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ alignSelf: "flex-start" }}
        >
          Back to Cart
        </Button>
        <Typography variant="h4" component="h1">
          Checkout
        </Typography>
        <Typography color="text.secondary">
          Add your shipping details and review your order before choosing a
          payment method.
        </Typography>
      </Stack>
      <CheckoutProgress step={1} />

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      <Grid
        container
        component="form"
        onSubmit={handleSubmit(handleContinue)}
        spacing={3.5}
        sx={{ alignItems: "flex-start" }}
      >
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            variant="outlined"
            sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3 }}
          >
            <Stack spacing={3}>
              <Stack spacing={0.5}>
                <Typography variant="h6">Shipping Information</Typography>
                <Typography variant="body2" color="text.secondary">
                  Where should we deliver your books?
                </Typography>
              </Stack>
              <TextField
                label="Full Name"
                fullWidth
                autoComplete="name"
                {...register("fullName")}
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
              />
              <TextField
                label="Phone Number"
                fullWidth
                autoComplete="tel"
                {...register("phone")}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
              <TextField
                label="Shipping Address"
                fullWidth
                multiline
                minRows={3}
                autoComplete="street-address"
                {...register("address")}
                error={!!errors.address}
                helperText={errors.address?.message}
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2.5}>
            <CheckoutOrderSummary
              items={orderItems}
              subtotal={subtotal}
              discount={discount}
              total={total}
            >
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Discount Coupon</Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    label="Coupon code"
                    value={couponInput}
                    onChange={(event) => {
                      setCouponInput(event.target.value.toUpperCase());
                      setAppliedCoupon(null);
                      setCouponError("");
                    }}
                    disabled={checkingCoupon || isSubmitting}
                    fullWidth
                  />
                  <Button
                    type="button"
                    variant="outlined"
                    disabled={checkingCoupon || isSubmitting}
                    onClick={handleApplyCoupon}
                  >
                    {checkingCoupon ? "Checking..." : "Apply"}
                  </Button>
                </Stack>
                {couponError && <Alert severity="error">{couponError}</Alert>}
                {appliedCoupon && (
                  <Alert severity="success">
                    {appliedCoupon.code} applied (
                    {appliedCoupon.discountPercent}% off).
                  </Alert>
                )}
              </Stack>
            </CheckoutOrderSummary>
            <Button
              type="submit"
              size="large"
              fullWidth
              variant="contained"
              disabled={isSubmitting || checkingCoupon}
            >
              Continue to Payment
            </Button>
            <Button
              component={RouterLink}
              to="/books"
              fullWidth
              color="inherit"
            >
              Continue Shopping
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Checkout;
