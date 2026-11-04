import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Grid,
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
import { BOOKS_PAGE_SIZE, BOOK_SORT_OPTIONS } from "../constants";

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

  const pageCount = Math.max(
    1,
    Math.ceil(filteredBooks.length / BOOKS_PAGE_SIZE),
  );
  const page = Math.min(requestedPage, pageCount);
  const visibleBooks = filteredBooks.slice(
    (page - 1) * BOOKS_PAGE_SIZE,
    page * BOOKS_PAGE_SIZE,
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4">All books</Typography>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
          <Grid container columns={{ xs: 1, sm: 2, md: 5 }} spacing={2}>
            <Grid size={1}>
              <TextField
                fullWidth
                label="Search title or author"
                value={search}
                onChange={(e) => updateFilter("q", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid size={1}>
              <TextField
                fullWidth
                select
                label="Category"
                value={
                  categories.some((item) => item.id === category)
                    ? category
                    : ""
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
            </Grid>
            <Grid size={1}>
              <TextField
                fullWidth
                label="Min price"
                type="number"
                value={minPrice}
                onChange={(e) => updateFilter("min", e.target.value)}
                size="small"
                slotProps={{ htmlInput: { min: 0 } }}
              />
            </Grid>
            <Grid size={1}>
              <TextField
                fullWidth
                label="Max price"
                type="number"
                value={maxPrice}
                onChange={(e) => updateFilter("max", e.target.value)}
                size="small"
                slotProps={{ htmlInput: { min: 0 } }}
              />
            </Grid>
            <Grid size={1}>
              <TextField
                fullWidth
                select
                label="Sort by"
                value={sort}
                onChange={(e) => updateFilter("sort", e.target.value)}
                size="small"
              >
                {BOOK_SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && (
          <Stack spacing={4}>
            <Stack spacing={2}>
              <Typography color="text.secondary">
                {filteredBooks.length} books found
              </Typography>
              {visibleBooks.length > 0 ? (
                <BookGrid books={visibleBooks} />
              ) : (
                <Alert severity="info">No books match your filters.</Alert>
              )}
            </Stack>
            {filteredBooks.length > BOOKS_PAGE_SIZE && (
              <Stack direction="row" sx={{ justifyContent: "center" }}>
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
          </Stack>
        )}
      </Stack>
    </Container>
  );
}

export default Books;
