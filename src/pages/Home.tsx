import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import BookGrid from "../components/BookGrid";
import { getBooks, getCategories } from "../services/booksApi";
import type { Book, Category } from "../types/book";

function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [bookData, categoryData] = await Promise.all([
          getBooks(),
          getCategories(),
        ]);
        if (active) {
          setBooks(bookData);
          setCategories(categoryData);
        }
      } catch {
        if (active)
          setError("Could not load books. Check that the mock API is running.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const featured = books.filter((book) => book.featured).slice(0, 4);
  const newest = [...books]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);
  const bestRated = [...books].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          p: { xs: 3, md: 5 },
          borderRadius: 2,
          mb: 4,
        }}
      >
        <Typography
          variant="h3"
          sx={{ fontWeight: 700, fontSize: { xs: "2rem", md: "3rem" } }}
        >
          Find your next favorite book
        </Typography>
        <Typography sx={{ my: 2 }}>
          Browse stories, discover new authors, and explore our collection.
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          component={RouterLink}
          to="/books"
        >
          Browse books
        </Button>
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Categories
          </Typography>
          <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap", mb: 4 }}>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outlined"
                component={RouterLink}
                to={`/books?category=${category.id}`}
                size="small"
              >
                {category.name}
              </Button>
            ))}
          </Stack>

          <Typography variant="h5" sx={{ mb: 2 }}>
            Featured books
          </Typography>
          <BookGrid books={featured} />
          <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
            Newest books
          </Typography>
          <BookGrid books={newest} />
          <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
            Best rated books
          </Typography>
          <BookGrid books={bestRated} />
        </>
      )}
    </Container>
  );
}

export default Home;
