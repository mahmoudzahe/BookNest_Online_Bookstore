import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useCart } from "../cart/CartContext";
import { getBook, getCategories, getReviews } from "../services/booksApi";
import type { Book, BookReview, Category } from "../types/book";

function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const { items, addBook } = useCart();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Book not found.");
      setLoading(false);
      return;
    }

    const bookId = id;
    let active = true;

    async function load() {
      try {
        const [bookData, reviewData, categoryData] = await Promise.all([
          getBook(bookId),
          getReviews(bookId),
          getCategories(),
        ]);

        if (active) {
          setBook(bookData);
          setReviews(reviewData);
          setCategories(categoryData);
        }
      } catch {
        if (active) setError("Book not found or the mock API is unavailable.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [id]);

  const quantity = items.find((item) => item.bookId === book?.id)?.quantity ?? 0;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button component={RouterLink} to="/books" sx={{ mb: 2 }}>
        ← Back to books
      </Button>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {book && !loading && !error && (
        <>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "220px 1fr" },
              gap: 3,
            }}
          >
            <Box
              component="img"
              src={book.image}
              alt={book.title}
              sx={{ width: "100%", height: 300, objectFit: "contain" }}
            />
            <Stack spacing={1.5} sx={{ alignItems: "flex-start" }}>
              <Typography variant="h4">{book.title}</Typography>
              <Typography color="text.secondary">by {book.author}</Typography>
              <Typography>
                Category: {categories.find((category) => category.id === book.categoryId)?.name ?? "Unknown"}
              </Typography>
              <Rating value={book.rating} precision={0.5} readOnly />
              <Typography sx={{ fontWeight: 700 }}>
                ${book.price.toFixed(2)}
              </Typography>
              <Typography color={book.stock > 0 ? "success.main" : "error.main"}>
                {book.stock > 0 ? `${book.stock} in stock` : "Out of stock"}
              </Typography>
              <Typography>{book.description}</Typography>
              <Button
                variant="contained"
                disabled={book.stock <= 0 || quantity >= book.stock}
                onClick={() => addBook(book)}
              >
                {book.stock <= 0 ? "Sold out" : quantity >= book.stock ? "Max added" : "Add to cart"}
              </Button>
            </Stack>
          </Paper>

          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            Customer reviews
          </Typography>

          {reviews.length === 0 && (
            <Typography color="text.secondary">No reviews yet.</Typography>
          )}

          {reviews.map((review) => (
            <Box key={review.id} sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 600 }}>{review.userName}</Typography>
              <Rating size="small" value={review.rating} readOnly />
              <Typography>{review.comment}</Typography>
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </>
      )}
    </Container>
  );
}

export default BookDetails;
