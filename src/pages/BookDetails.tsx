import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useCart } from "../cart/CartContext";
import BookReviews from "../components/BookReviews";
import { getBook, getCategories, getReviews } from "../services/booksApi";
import type { Book, BookReview, Category } from "../types/book";
import {
  LOW_STOCK_THRESHOLD,
  STOCK_LABELS,
  CART_ACTION_LABELS,
} from "../constants";

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

    let active = true;
    Promise.all([getBook(id), getReviews(id), getCategories()])
      .then(([bookData, reviewData, categoryData]) => {
        if (active) {
          setBook(bookData);
          setReviews(reviewData);
          setCategories(categoryData);
        }
      })
      .catch(() => {
        if (active) setError("Book not found or the mock API is unavailable.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const quantity =
    items.find((item) => item.bookId === book?.id)?.quantity ?? 0;
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button component={RouterLink} to="/books" sx={{ mb: 2 }}>
        ← Back to books
      </Button>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {book && !loading && !error && (
        <Stack spacing={5}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: "auto" }} sx={{ width: { md: 220 } }}>
                <Box
                  component="img"
                  src={book.image}
                  alt={book.title}
                  sx={{ width: "100%", height: 300, objectFit: "contain" }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: "grow" }} sx={{ minWidth: 0 }}>
                <Stack spacing={1.5} sx={{ alignItems: "flex-start" }}>
                  <Typography variant="h4">{book.title}</Typography>
                  <Typography color="text.secondary">
                    by {book.author}
                  </Typography>
                  <Typography>
                    Category:{" "}
                    {categories.find(
                      (category) => category.id === book.categoryId,
                    )?.name ?? "Unknown"}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center" }}
                  >
                    <Rating value={averageRating} precision={0.5} readOnly />
                    <Typography variant="body2" color="text.secondary">
                      {reviews.length > 0
                        ? `${averageRating.toFixed(1)} (${reviews.length} ${reviews.length === 1 ? "review" : "reviews"})`
                        : "No Ratings"}
                    </Typography>
                  </Stack>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    ${book.price.toFixed(2)}
                  </Typography>
                  <Typography
                    color={
                      book.stock === 0
                        ? "error.main"
                        : book.stock <= LOW_STOCK_THRESHOLD
                          ? "warning.main"
                          : "success.main"
                    }
                  >
                    {book.stock === 0
                      ? STOCK_LABELS.outOfStock
                      : book.stock <= LOW_STOCK_THRESHOLD
                        ? `${STOCK_LABELS.lowStock} · ${book.stock} left`
                        : `${book.stock} in stock`}
                  </Typography>
                  <Typography>{book.description}</Typography>
                  <Button
                    variant="contained"
                    disabled={book.stock <= 0 || quantity >= book.stock}
                    onClick={() => addBook(book)}
                  >
                    {book.stock <= 0
                      ? "Sold out"
                      : quantity >= book.stock
                        ? "Max added"
                        : "Add to cart"}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          <BookReviews
            book={book}
            reviews={reviews}
            onReviewsChange={setReviews}
          />
        </Stack>
      )}
    </Container>
  );
}

export default BookDetails;
