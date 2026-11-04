"use client";

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
import { useRouter } from "next/navigation";
import RouterLink from "../components/NextLink";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import { useCheckoutFlow } from "../checkout/CheckoutFlowContext";
import CheckoutOrderSummary from "../components/CheckoutOrderSummary";
import CheckoutProgress from "../components/CheckoutProgress";
import { getBooks } from "../services/booksApi";
import { findCoupon } from "../services/checkoutApi";
import type { Book } from "../types/book";
import type { Coupon, OrderItem, ShippingInformation } from "../types/order";
import { shippingSchema } from "../schemas/shippingSchema";
import { T, useI18n } from "@/i18n/LocaleContext";

function Checkout() {
  const { t } = useI18n();
  const router = useRouter();
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
          setLoadError(t("Could not load checkout. Check the mock API."));
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
      setCouponError(t("Enter a coupon code."));
      return;
    }

    setCheckingCoupon(true);
    try {
      const coupon = await findCoupon(couponInput);
      if (!coupon) {
        setCouponError(t("Invalid or inactive coupon."));
        return;
      }
      setAppliedCoupon(coupon);
    } catch {
      setCouponError(t("Could not check the coupon. Try again."));
    } finally {
      setCheckingCoupon(false);
    }
  }

  async function handleContinue(shipping: ShippingInformation) {
    setSubmitError("");
    if (!user) {
      setSubmitError(t("Please log in to continue."));
      return;
    }
    if (couponInput.trim() && !appliedCoupon) {
      setCouponError(
        t("Apply a valid coupon or clear the coupon field to continue."),
      );
      return;
    }
    if (items.length === 0 || orderItems.length !== items.length) {
      setSubmitError(
        t("Your cart has changed. Review your cart and try again."),
      );
      return;
    }
    if (cartBooks.some(({ book, quantity }) => book.stock < quantity)) {
      setSubmitError(
        t("Some books are out of stock. Review your cart and try again."),
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
            t(
              "This coupon is no longer valid. Remove it or apply another one.",
            ),
          );
          return;
        }
      } catch {
        setCouponError(t("Could not verify the coupon. Please try again."));
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
    router.push("/payment");
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
            <T text="Your cart is empty." />
          </Alert>
          <Button component={RouterLink} href="/books" variant="contained">
            <T text="Browse books" />
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
          href="/cart"
          startIcon={
            <ArrowBackRoundedIcon
              sx={{
                transform: (theme) =>
                  theme.direction === "rtl" ? "scaleX(-1)" : undefined,
              }}
            />
          }
          sx={{ alignSelf: "flex-start" }}
        >
          <T text="Back to Cart" />
        </Button>
        <Typography variant="h4" component="h1">
          <T text="Checkout" />
        </Typography>
        <Typography color="text.secondary">
          <T text="Add your shipping details and review your order before choosing a payment method." />
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
                <Typography variant="h6">
                  <T text="Shipping Information" />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <T text="Where should we deliver your books?" />
                </Typography>
              </Stack>
              <TextField
                label={t("Full Name")}
                fullWidth
                autoComplete="name"
                {...register("fullName")}
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
              />
              <TextField
                label={t("Phone Number")}
                fullWidth
                autoComplete="tel"
                {...register("phone")}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
              <TextField
                label={t("Shipping Address")}
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
                <Typography variant="subtitle2">
                  <T text="Discount Coupon" />
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    label={t("Coupon code")}
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
                    {checkingCoupon ? t("Checking...") : t("Apply")}
                  </Button>
                </Stack>
                {couponError && <Alert severity="error">{couponError}</Alert>}
                {appliedCoupon && (
                  <Alert severity="success">
                    {appliedCoupon.code} <T text="applied (" />
                    {appliedCoupon.discountPercent}
                    <T text="% off)." />
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
              <T text="Continue to Payment" />
            </Button>
            <Button
              component={RouterLink}
              href="/books"
              fullWidth
              color="inherit"
            >
              <T text="Continue Shopping" />
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Checkout;
