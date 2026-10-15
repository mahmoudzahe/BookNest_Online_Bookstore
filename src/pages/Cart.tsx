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
  Divider,
  IconButton,
  Paper,
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
    return () => { active = false; };
  }, [syncStock]);

  const cartBooks = items.flatMap((item) => {
    const book = books.find((book) => book.id === item.bookId);
    return book ? [{ ...item, book }] : [];
  });
  const total = cartBooks.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const totalItems = cartBooks.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Shopping Cart{!loading && !error && totalItems > 0 ? ` (${totalItems} ${totalItems === 1 ? "item" : "items"})` : ""}
      </Typography>

      {loading && <CircularProgress />}
      {error && items.length > 0 && <Alert severity="error">{error}</Alert>}

      {!loading && items.length === 0 && (
        <Box sx={{ textAlign: "center", py: 7 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Your shopping cart is empty
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            You have no books in your cart yet.
          </Typography>
          <Button component={RouterLink} to="/books" variant="outlined">
            Continue Shopping
          </Button>
        </Box>
      )}

      {!loading && !error && cartBooks.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 340px" },
            gap: 3,
            alignItems: "start",
          }}
        >
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2} divider={<Divider flexItem />}>
              {cartBooks.map(({ book, quantity }) => (
                <Stack key={book.id} direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                  <Box component={RouterLink} to={`/books/${book.id}`} sx={{ flexShrink: 0 }}>
                    <Box
                      component="img"
                      src={book.image}
                      alt={book.title}
                      sx={{ width: { xs: 65, sm: 85 }, height: 110, objectFit: "contain" }}
                    />
                  </Box>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      component={RouterLink}
                      to={`/books/${book.id}`}
                      sx={{ fontWeight: 700, color: "text.primary", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                    >
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{book.author}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      ${book.price.toFixed(2)} each
                    </Typography>

                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", mt: 1 }}>
                      <IconButton size="small" aria-label={`Decrease quantity of ${book.title}`} disabled={quantity <= 1} onClick={() => setQuantity(book.id, quantity - 1, book.stock)}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ minWidth: 25, textAlign: "center" }}>{quantity}</Typography>
                      <IconButton size="small" aria-label={`Increase quantity of ${book.title}`} disabled={quantity >= book.stock} onClick={() => setQuantity(book.id, quantity + 1, book.stock)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>

                  <Stack spacing={1} sx={{ alignItems: "flex-end", flexShrink: 0 }}>
                    <IconButton size="small" color="error" aria-label={`Remove ${book.title} from cart`} onClick={() => setBookToDelete(book)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ fontWeight: 700 }}>${(book.price * quantity).toFixed(2)}</Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, bgcolor: "background.paper", borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Order Summary</Typography>
            <Stack direction="row" sx={{ justifyContent: "space-between", gap: 1, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Discounts</Typography>
              <Typography variant="body2">Applied at checkout</Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" sx={{ justifyContent: "space-between", mb: 3 }}>
              <Typography sx={{ fontWeight: 700 }}>Subtotal</Typography>
              <Typography sx={{ fontWeight: 700 }}>${total.toFixed(2)}</Typography>
            </Stack>
            <Stack spacing={1.5}>
              <Button component={RouterLink} to="/checkout" variant="contained" fullWidth size="large">
                Proceed to Checkout
              </Button>
              <Button component={RouterLink} to="/books" variant="outlined" fullWidth>
                Continue Shopping
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}

      <Dialog open={bookToDelete !== null} onClose={() => setBookToDelete(null)} fullWidth maxWidth="xs" aria-labelledby="remove-book-title">
        <DialogTitle id="remove-book-title">Remove book?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove {bookToDelete?.title} from your cart?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBookToDelete(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => {
            if (bookToDelete) removeBook(bookToDelete.id);
            setBookToDelete(null);
          }}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Cart;
