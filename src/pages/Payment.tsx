import { useRef, useState } from "react";
import {
  Alert,
  Button,
  Container,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import { useCheckoutFlow } from "../checkout/CheckoutFlowContext";
import CheckoutOrderSummary from "../components/CheckoutOrderSummary";
import CheckoutProgress from "../components/CheckoutProgress";
import { getBooks } from "../services/booksApi";
import { createOrder, findCoupon } from "../services/checkoutApi";
import type { OrderItem } from "../types/order";
import {
  CARD_NUMBER_DIGITS,
  CVC_MAX_DIGITS,
  paymentSchema,
} from "../schemas/paymentSchema";
import type { PaymentFormValues } from "../schemas/paymentSchema";

const paymentInputProps = { autoComplete: "off" } as const;

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, CARD_NUMBER_DIGITS);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
    : digits;
}

function Payment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const { draft, clearDraft } = useCheckoutFlow();
  const [submitError, setSubmitError] = useState("");
  const submittingRef = useRef(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: yupResolver(paymentSchema),
    defaultValues: {
      method: "cash_on_delivery",
      cardholderName: "",
      cardNumber: "",
      expiry: "",
      cvc: "",
    },
  });
  const method = watch("method");

  const hasValidDraft = Boolean(
    draft &&
    user?.id === draft.userId &&
    draft.items.length > 0 &&
    items.length === draft.items.length &&
    draft.items.every((draftItem) =>
      items.some(
        (item) =>
          item.bookId === draftItem.bookId &&
          item.quantity === draftItem.quantity,
      ),
    ),
  );

  async function handleConfirm(values: PaymentFormValues) {
    if (submittingRef.current) return;
    setSubmitError("");

    if (!draft || !user || !hasValidDraft) {
      setSubmitError(
        "Your checkout information has changed. Return to Checkout and review your order.",
      );
      return;
    }

    submittingRef.current = true;
    try {
      const latestBooks = await getBooks();
      const orderItems: OrderItem[] = [];
      for (const item of draft.items) {
        const book = latestBooks.find((entry) => entry.id === item.bookId);
        if (!book || book.stock < item.quantity) {
          setSubmitError(
            "An item is no longer available in that quantity. Return to Checkout to review your cart.",
          );
          return;
        }
        orderItems.push({
          bookId: book.id,
          title: book.title,
          price: book.price,
          quantity: item.quantity,
        });
      }

      const latestSubtotal = Number(
        orderItems
          .reduce((sum, item) => sum + item.price * item.quantity, 0)
          .toFixed(2),
      );
      if (latestSubtotal !== draft.subtotal) {
        setSubmitError(
          "Book prices have changed. Return to Checkout to review your updated total.",
        );
        return;
      }

      const latestCoupon = draft.coupon
        ? await findCoupon(draft.coupon.code)
        : null;
      if (
        draft.coupon &&
        (!latestCoupon ||
          latestCoupon.discountPercent !== draft.coupon.discountPercent)
      ) {
        setSubmitError(
          "Your coupon has changed or expired. Return to Checkout to apply it again.",
        );
        return;
      }

      const finalDiscount = Number(
        (latestSubtotal * ((latestCoupon?.discountPercent ?? 0) / 100)).toFixed(
          2,
        ),
      );
      const finalTotal = Math.max(
        0,
        Number((latestSubtotal - finalDiscount).toFixed(2)),
      );
      if (finalTotal !== draft.total) {
        setSubmitError(
          "The order total has changed. Return to Checkout to review it.",
        );
        return;
      }

      const order = await createOrder({
        userId: user.id,
        items: orderItems,
        shipping: draft.shipping,
        subtotal: latestSubtotal,
        discount: finalDiscount,
        total: finalTotal,
        couponCode: latestCoupon?.code ?? null,
        paymentMethod: values.method,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      clearCart();
      clearDraft();
      navigate(`/order-success/${order.id}`, { replace: true });
    } catch {
      setSubmitError(
        "Could not create your order. Please check the mock API and try again.",
      );
    } finally {
      submittingRef.current = false;
    }
  }

  if (!hasValidDraft || !draft) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack spacing={3}>
          <CheckoutProgress step={2} />
          <Alert severity="info">
            Your checkout details are missing or the cart has changed. Please
            review your order again. Returning to this page after a refresh also
            requires repeating Checkout.
          </Alert>
          <Button component={RouterLink} to="/checkout" variant="contained">
            Return to Checkout
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
          to="/checkout"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ alignSelf: "flex-start" }}
        >
          Back to Checkout
        </Button>
        <Typography variant="h4" component="h1">
          Payment
        </Typography>
        <Typography color="text.secondary">
          Choose how you want to complete your order.
        </Typography>
      </Stack>
      <CheckoutProgress step={2} />

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      <Grid
        container
        component="form"
        autoComplete="off"
        onSubmit={handleSubmit(handleConfirm)}
        spacing={3.5}
        sx={{ alignItems: "flex-start" }}
      >
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>
            <Paper
              variant="outlined"
              sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3 }}
            >
              <Stack spacing={2.5}>
                <Typography variant="h6">Payment Method</Typography>
                <Controller
                  name="method"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} aria-label="Choose payment method">
                      <FormControlLabel
                        value="cash_on_delivery"
                        control={<Radio />}
                        label={
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: "center" }}
                          >
                            <LocalShippingOutlinedIcon color="primary" />
                            <Typography>Cash on Delivery</Typography>
                          </Stack>
                        }
                      />
                      <FormControlLabel
                        value="card_demo"
                        control={<Radio />}
                        label={
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: "center" }}
                          >
                            <CreditCardOutlinedIcon color="primary" />
                            <Typography>Card Payment</Typography>
                          </Stack>
                        }
                      />
                    </RadioGroup>
                  )}
                />
                {method === "card_demo" && (
                  <Stack spacing={2.5}>
                    <Controller
                      name="cardholderName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          label="Cardholder Name"
                          fullWidth
                          value={field.value}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value.replace(/\p{N}/gu, ""),
                            )
                          }
                          onBlur={field.onBlur}
                          inputRef={field.ref}
                          error={!!errors.cardholderName}
                          helperText={errors.cardholderName?.message}
                          slotProps={{
                            htmlInput: {
                              ...paymentInputProps,
                              name: "booknest-payment-holder",
                            },
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="cardNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          label="Card Number"
                          fullWidth
                          value={field.value}
                          onChange={(event) =>
                            field.onChange(formatCardNumber(event.target.value))
                          }
                          onBlur={field.onBlur}
                          inputRef={field.ref}
                          error={!!errors.cardNumber}
                          helperText={errors.cardNumber?.message}
                          slotProps={{
                            htmlInput: {
                              ...paymentInputProps,
                              name: "booknest-payment-number",
                              inputMode: "numeric",
                              maxLength: 19,
                            },
                          }}
                        />
                      )}
                    />
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller
                          name="expiry"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              label="Expiry Date"
                              fullWidth
                              value={field.value}
                              onChange={(event) =>
                                field.onChange(formatExpiry(event.target.value))
                              }
                              onBlur={field.onBlur}
                              inputRef={field.ref}
                              error={!!errors.expiry}
                              helperText={errors.expiry?.message}
                              placeholder="MM/YY"
                              slotProps={{
                                htmlInput: {
                                  ...paymentInputProps,
                                  name: "booknest-payment-expiry",
                                  inputMode: "numeric",
                                  maxLength: 5,
                                },
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller
                          name="cvc"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              label="Security Code"
                              fullWidth
                              value={field.value}
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, CVC_MAX_DIGITS),
                                )
                              }
                              onBlur={field.onBlur}
                              inputRef={field.ref}
                              error={!!errors.cvc}
                              helperText={errors.cvc?.message}
                              slotProps={{
                                htmlInput: {
                                  ...paymentInputProps,
                                  name: "booknest-payment-code",
                                  inputMode: "numeric",
                                  maxLength: CVC_MAX_DIGITS,
                                },
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                )}
              </Stack>
            </Paper>
            <Paper
              variant="outlined"
              sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3 }}
            >
              <Stack spacing={1}>
                <Typography variant="h6">Shipping To</Typography>
                <Typography>{draft.shipping.fullName}</Typography>
                <Typography color="text.secondary">
                  {draft.shipping.phone}
                </Typography>
                <Typography color="text.secondary">
                  {draft.shipping.address}
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2.5}>
            <CheckoutOrderSummary
              items={draft.items}
              subtotal={draft.subtotal}
              discount={draft.discount}
              total={draft.total}
            >
              <Typography variant="body2" color="text.secondary">
                {draft.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                items
                {draft.coupon ? ` · Coupon ${draft.coupon.code}` : ""}
              </Typography>
            </CheckoutOrderSummary>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Confirming Order..." : "Confirm Order"}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Payment;
