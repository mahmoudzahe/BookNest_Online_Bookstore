import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import BookGrid from "../components/BookGrid";
import { getBooks, getCategories } from "../services/booksApi";
import type { Book, Category } from "../types/book";

const PAGE_SIZE = 8;

function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const search = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const minPrice = searchParams.get("min") ?? "";
  const maxPrice = searchParams.get("max") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const pageParam = Number(searchParams.get("page") ?? "1");
  const requestedPage =
    Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

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

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next, { replace: true });
  }

  const filteredBooks = useMemo(() => {
    const result = books.filter((book) => {
      const matchesSearch = `${book.title} ${book.author}`
        .toLowerCase()
        .includes(search.toLowerCase().trim());
      const matchesCategory = !category || book.categoryId === category;
      const matchesMin = !minPrice || book.price >= Number(minPrice);
      const matchesMax = !maxPrice || book.price <= Number(maxPrice);
      return matchesSearch && matchesCategory && matchesMin && matchesMax;
    });

    return result.sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [books, search, category, minPrice, maxPrice, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);
  const visibleBooks = filteredBooks.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        All books
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(5, 1fr)",
            },
            gap: 2,
          }}
        >
          <TextField
            label="Search title or author"
            value={search}
            onChange={(e) => updateFilter("q", e.target.value)}
            size="small"
          />
          <TextField
            select
            label="Category"
            value={
              categories.some((item) => item.id === category) ? category : ""
            }
            onChange={(e) => updateFilter("category", e.target.value)}
            size="small"
          >
            <MenuItem value="">All categories</MenuItem>
            {categories.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Min price"
            type="number"
            value={minPrice}
            onChange={(e) => updateFilter("min", e.target.value)}
            size="small"
            slotProps={{ htmlInput: { min: 0 } }}
          />
          <TextField
            label="Max price"
            type="number"
            value={maxPrice}
            onChange={(e) => updateFilter("max", e.target.value)}
            size="small"
            slotProps={{ htmlInput: { min: 0 } }}
          />
          <TextField
            select
            label="Sort by"
            value={sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            size="small"
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="price-low">Price: low to high</MenuItem>
            <MenuItem value="price-high">Price: high to low</MenuItem>
            <MenuItem value="rating">Best rated</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {filteredBooks.length} books found
          </Typography>
          {visibleBooks.length > 0 ? (
            <BookGrid books={visibleBooks} />
          ) : (
            <Alert severity="info">No books match your filters.</Alert>
          )}
          {filteredBooks.length > PAGE_SIZE && (
            <Stack sx={{ alignItems: "center", mt: 4 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, nextPage) => {
                  const next = new URLSearchParams(searchParams);
                  next.set("page", String(nextPage));
                  setSearchParams(next);
                }}
                color="primary"
              />
            </Stack>
          )}
        </>
      )}
    </Container>
  );
}

export default Books;
