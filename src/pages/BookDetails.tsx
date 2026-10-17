import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
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

  const quantity = items.find((item) => item.bookId === book?.id)?.quantity ?? 0;
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
        <>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 3,
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
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Rating value={averageRating} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary">
                  {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </Typography>
              </Stack>
              <Typography sx={{ fontWeight: 700 }}>${book.price.toFixed(2)}</Typography>
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

          <BookReviews
            book={book}
            reviews={reviews}
            averageRating={averageRating}
            onReviewsChange={setReviews}
          />
        </>
      )}
    </Container>
  );
}

export default BookDetails;
