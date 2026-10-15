
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useCart } from "../cart/CartContext";
import { getBooks } from "../services/booksApi";
import { createOrder, findCoupon } from "../services/checkoutApi";
import type { Book } from "../types/book";
import type {
  Coupon,
  OrderItem,
  ShippingInformation,
} from "../types/order";

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
  const { items, clearCart, syncStock } = useCart();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingInformation>({
    resolver: yupResolver(shippingSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    let active = true;

    async function loadBooks() {
      try {
        const data = await getBooks();

        if (active) {
          setBooks(data);
          syncStock(data);
        }
      } catch {
        if (active) {
          setLoadError("Could not load checkout. Check the mock API.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadBooks();

    return () => {
      active = false;
    };
  }, [syncStock]);

  const cartBooks = items.flatMap((item) => {
    const book = books.find((book) => book.id === item.bookId);
    return book ? [{ book, quantity: item.quantity }] : [];
  });

  const subtotal = cartBooks.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );

  const discount = Number(
    (
      subtotal *
      ((appliedCoupon?.discountPercent ?? 0) / 100)
    ).toFixed(2)
  );

  const total = Math.max(
    0,
    Number((subtotal - discount).toFixed(2))
  );

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

  async function handlePlaceOrder(shipping: ShippingInformation) {
    setSubmitError("");

    if (couponInput.trim() && !appliedCoupon) {
      setCouponError(
        "Please apply a valid coupon or clear the coupon field before placing your order."
      );
      return;
    }

    if (items.length === 0) {
      setSubmitError("Your cart is empty.");
      return;
    }

    try {
      const latestBooks = await getBooks();
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const book = latestBooks.find(
          (book) => book.id === item.bookId
        );

        if (!book || book.stock < item.quantity) {
          syncStock(latestBooks);
          setBooks(latestBooks);
          setSubmitError(
            "Some items are no longer available in the selected quantities. Review your cart and try again."
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
          .reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          )
          .toFixed(2)
      );

      if (latestSubtotal !== Number(subtotal.toFixed(2))) {
        setBooks(latestBooks);
        setSubmitError(
          "Book prices have changed. Review the updated total and try again."
        );
        return;
      }

      const checkedCoupon = appliedCoupon
        ? await findCoupon(appliedCoupon.code)
        : null;

      if (
        appliedCoupon &&
        (!checkedCoupon ||
          checkedCoupon.discountPercent !==
            appliedCoupon.discountPercent)
      ) {
        setAppliedCoupon(null);
        setSubmitError(
          "The coupon has changed or is no longer valid. Apply it again."
        );
        return;
      }

      const finalDiscount = Number(
        (
          latestSubtotal *
          ((checkedCoupon?.discountPercent ?? 0) / 100)
        ).toFixed(2)
      );

      const finalTotal = Math.max(
        0,
        Number((latestSubtotal - finalDiscount).toFixed(2))
      );

      const order = await createOrder({
        userId: null,
        items: orderItems,
        shipping,
        subtotal: latestSubtotal,
        discount: finalDiscount,
        total: finalTotal,
        couponCode: checkedCoupon?.code ?? null,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      clearCart();
      navigate(`/order-success/${order.id}`, { replace: true });
    } catch {
      setSubmitError(
        "Could not place your order. Please try again."
      );
    }
  }

  if (loading) {
    return (
      <Container sx={{ py: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (loadError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{loadError}</Alert>
      </Container>
    );
  }

  if (cartBooks.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Your cart is empty.
        </Alert>

        <Button
          component={RouterLink}
          to="/books"
          variant="contained"
        >
          Browse books
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Checkout
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit(handlePlaceOrder)}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(0, 1fr) 340px",
          },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        >
          <Typography variant="h6" sx={{ mb: 3 }}>
            Shipping Information
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Full Name"
              fullWidth
              {...register("fullName")}
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
            />

            <TextField
              label="Phone Number"
              fullWidth
              {...register("phone")}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />

            <TextField
              label="Shipping Address"
              fullWidth
              multiline
              rows={3}
              {...register("address")}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Order Summary
          </Typography>

          <Stack spacing={1}>
            {cartBooks.map(({ book, quantity }) => (
              <Box
                key={book.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography variant="body2">
                  {book.title} × {quantity}
                </Typography>

                <Typography variant="body2">
                  ${(book.price * quantity).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography sx={{ mb: 1 }}>
            Discount Coupon
          </Typography>

          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              placeholder="Coupon code"
              value={couponInput}
              onChange={(event) => {
                setCouponInput(event.target.value.toUpperCase());
                setAppliedCoupon(null);
                setCouponError("");
              }}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <Button
              type="button"
              variant="outlined"
              disabled={checkingCoupon || isSubmitting}
              onClick={handleApplyCoupon}
              sx={{ borderRadius: 2 }}
            >
              {checkingCoupon ? "Checking..." : "Apply"}
            </Button>
          </Stack>

          {couponError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {couponError}
            </Alert>
          )}

          {appliedCoupon && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {appliedCoupon.code} applied (
              {appliedCoupon.discountPercent}% off).
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.5}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography>Subtotal</Typography>

              <Typography>
                ${subtotal.toFixed(2)}
              </Typography>
            </Box>

            {appliedCoupon && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Discount</Typography>

                <Typography color="success.main">
                  -${discount.toFixed(2)}
                </Typography>
              </Box>
            )}

            <Divider />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6">
                Total
              </Typography>

              <Typography variant="h6">
                ${total.toFixed(2)}
              </Typography>
            </Box>
          </Stack>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isSubmitting || checkingCoupon}
            sx={{ mt: 3, borderRadius: 2 }}
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </Button>

          <Button
            component={RouterLink}
            to="/cart"
            fullWidth
            disabled={isSubmitting}
            sx={{ mt: 1, borderRadius: 2 }}
          >
            Back to Cart
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default Checkout;
