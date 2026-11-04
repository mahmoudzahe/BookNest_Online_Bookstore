import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
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
    <Container
      maxWidth="lg"
      sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 8, md: 10 } }}
    >
      <Stack spacing={{ xs: 3, md: 4 }}>
        <Button
          component={RouterLink}
          to="/books"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ alignSelf: "flex-start", px: 0 }}
        >
          Back to books
        </Button>

        {loading && <CircularProgress aria-label="Loading book details" />}
        {error && <Alert severity="error">{error}</Alert>}

        {book && !loading && !error && (
          <Stack spacing={{ xs: 4, md: 6 }}>
            <Grid container spacing={{ xs: 3, md: 5 }}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    minHeight: { xs: 340, md: 450 },
                    px: { xs: 3, md: 4 },
                    py: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "background.paper",
                  }}
                >
                  <Box
                    component="img"
                    src={book.image}
                    alt={book.title}
                    sx={{
                      display: "block",
                      maxWidth: "100%",
                      height: { xs: 290, md: 370 },
                      objectFit: "contain",
                    }}
                  />
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 7 }}>
                <Stack
                  spacing={2.5}
                  sx={{ alignItems: "flex-start", pt: { md: 1 } }}
                >
                  <Stack spacing={1}>
                    <Typography
                      component="h1"
                      variant="h3"
                      sx={{
                        fontFamily: "Georgia, serif",
                        fontWeight: 700,
                        fontSize: { xs: "2rem", sm: "2.5rem", md: "2.75rem" },
                        lineHeight: 1.15,
                      }}
                    >
                      {book.title}
                    </Typography>
                    <Typography color="text.secondary">
                      by {book.author}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Category:{" "}
                      {categories.find(
                        (category) => category.id === book.categoryId,
                      )?.name ?? "Unknown"}
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center", flexWrap: "wrap" }}
                  >
                    <Rating value={averageRating} precision={0.5} readOnly />
                    <Typography variant="body2" color="text.secondary">
                      {reviews.length > 0
                        ? `${averageRating.toFixed(1)} (${reviews.length} ${reviews.length === 1 ? "review" : "reviews"})`
                        : "No ratings yet"}
                    </Typography>
                  </Stack>

                  <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {book.description}
                  </Typography>

                  <Stack spacing={1.5} sx={{ width: "100%" }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      ${book.price.toFixed(2)}
                    </Typography>
                    <Chip
                      size="small"
                      label={
                        book.stock <= 0
                          ? STOCK_LABELS.outOfStock
                          : book.stock <= LOW_STOCK_THRESHOLD
                            ? `${STOCK_LABELS.lowStock} · ${book.stock} left`
                            : `${book.stock} in stock`
                      }
                      color={
                        book.stock <= 0
                          ? "error"
                          : book.stock <= LOW_STOCK_THRESHOLD
                            ? "warning"
                            : "success"
                      }
                      variant={
                        book.stock > LOW_STOCK_THRESHOLD ? "outlined" : "filled"
                      }
                      sx={{ alignSelf: "flex-start" }}
                    />
                  </Stack>

                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingCartOutlinedIcon />}
                    disabled={book.stock <= 0 || quantity >= book.stock}
                    onClick={() => addBook(book)}
                    sx={{ width: { xs: "100%", sm: 220 } }}
                  >
                    {book.stock <= 0
                      ? CART_ACTION_LABELS.soldOut
                      : quantity >= book.stock
                        ? CART_ACTION_LABELS.maxAdded
                        : CART_ACTION_LABELS.addToCart}
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            <Paper
              variant="outlined"
              component="section"
              sx={{ p: { xs: 2.5, sm: 4 } }}
            >
              <BookReviews
                book={book}
                reviews={reviews}
                onReviewsChange={setReviews}
              />
            </Paper>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}

export default BookDetails;
