import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveIcon from "@mui/icons-material/Remove";
import { Link as RouterLink } from "react-router-dom";
import { useCart } from "../cart/CartContext";
import { getBooks } from "../services/booksApi";
import type { Book } from "../types/book";
import { CART_COVER_WIDTH, CART_COVER_HEIGHT } from "../constants";

function Cart() {
  const { items, setQuantity, removeBook, syncStock } = useCart();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await getBooks();
        if (active) {
          setBooks(data);
          syncStock(data);
        }
      } catch {
        if (active) setError("Could not load your cart. Check the mock API.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [syncStock]);

  const cartBooks = items.flatMap((item) => {
    const book = books.find((book) => book.id === item.bookId);
    return book ? [{ ...item, book }] : [];
  });
  const total = cartBooks.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0,
  );
  const totalItems = cartBooks.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: { xs: "68vh", md: "72vh" },
        pt: { xs: 4, md: 6 },
        pb: { xs: 8, md: 10 },
      }}
    >
      <Typography variant="h5" sx={{ mb: { xs: 4, md: 5 } }}>
        Cart{" "}
        {!loading && !error && totalItems > 0
          ? ` (${totalItems} ${totalItems === 1 ? "item" : "items"})`
          : ""}
      </Typography>

      {loading && <CircularProgress />}
      {error && items.length > 0 && <Alert severity="error">{error}</Alert>}

      {!loading && items.length === 0 && (
        <Stack
          spacing={2}
          sx={{
            minHeight: 220,
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Your shopping cart is empty
          </Typography>
          <Typography color="text.secondary">
            You have no books in your cart yet.
          </Typography>
          <Button component={RouterLink} to="/books" variant="outlined">
            Continue Shopping
          </Button>
        </Stack>
      )}

      {!loading && !error && cartBooks.length > 0 && (
        <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
          <Grid size={{ xs: 12, md: "grow" }} sx={{ minWidth: 0 }}>
            <Stack sx={{ py: 1 }}>
              <Stack spacing={3}>
                {cartBooks.map(({ book, quantity }) => (
                  <Stack
                    key={book.id}
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: "flex-start" }}
                  >
                    <Box
                      component={RouterLink}
                      to={`/books/${book.id}`}
                      sx={{ flexShrink: 0 }}
                    >
                      <Box
                        component="img"
                        src={book.image}
                        alt={book.title}
                        sx={{
                          width: CART_COVER_WIDTH,
                          height: CART_COVER_HEIGHT,
                          objectFit: "contain",
                        }}
                      />
                    </Box>

                    <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Link
                        component={RouterLink}
                        to={`/books/${book.id}`}
                        color="text.primary"
                        underline="hover"
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                      >
                        {book.title}
                      </Link>
                      <Typography variant="body2" color="text.secondary">
                        {book.author}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${book.price.toFixed(2)} each
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ alignItems: "center" }}
                      >
                        <IconButton
                          size="small"
                          aria-label={`Decrease quantity of ${book.title}`}
                          disabled={quantity <= 1}
                          onClick={() =>
                            setQuantity(book.id, quantity - 1, book.stock)
                          }
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ minWidth: 25, textAlign: "center" }}>
                          {quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          aria-label={`Increase quantity of ${book.title}`}
                          disabled={quantity >= book.stock}
                          onClick={() =>
                            setQuantity(book.id, quantity + 1, book.stock)
                          }
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Stack
                      spacing={1}
                      sx={{ alignItems: "flex-end", flexShrink: 0 }}
                    >
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={`Remove ${book.title} from cart`}
                        onClick={() => setBookToDelete(book)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ fontWeight: 700 }}>
                        ${(book.price * quantity).toFixed(2)}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: "auto" }} sx={{ width: { md: 340 } }}>
            <Stack spacing={2} sx={{ px: { xs: 0, md: 2 }, py: 1 }}>
              <Typography variant="h6">Order Summary</Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: "space-between" }}
              >
                <Typography variant="body2" color="text.secondary">
                  Discounts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Applied at checkout
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  Subtotal
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  ${total.toFixed(2)}
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                <Button
                  component={RouterLink}
                  to="/checkout"
                  variant="contained"
                  fullWidth
                  size="large"
                >
                  Proceed to Checkout
                </Button>
                <Button
                  component={RouterLink}
                  to="/books"
                  variant="outlined"
                  fullWidth
                >
                  Continue Shopping
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      )}

      <Dialog
        open={bookToDelete !== null}
        onClose={() => setBookToDelete(null)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="remove-book-title"
      >
        <DialogTitle id="remove-book-title">Remove book?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove {bookToDelete?.title} from your
            cart?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBookToDelete(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (bookToDelete) removeBook(bookToDelete.id);
              setBookToDelete(null);
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Cart;
