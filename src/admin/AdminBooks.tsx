import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { getBooks, getCategories } from "../services/booksApi";
import { removeBook, saveBook, setBookFeatured } from "../services/adminApi";
import type { BookInput } from "../services/adminApi";
import type { Book, Category } from "../types/book";
import { LoadError, PageHeading } from "./AdminCommon";
import BooksTable from "./components/BooksTable";
import BookFormDialog from "./components/BookFormDialog";
import ConfirmDialog from "./components/ConfirmDialog";

const PAGE_SIZE = 8;
const emptyBook: BookInput = {
  title: "",
  author: "",
  description: "",
  categoryId: "",
  price: 0,
  stock: 0,
  featured: false,
  image: "",
};

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Book | null>(null);
  const [form, setForm] = useState<BookInput>(emptyBook);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const [allBooks, allCategories] = await Promise.all([
      getBooks(),
      getCategories(),
    ]);
    setBooks(allBooks);
    setCategories(allCategories);
  }

  useEffect(() => {
    let active = true;
    Promise.all([getBooks(), getCategories()])
      .then(([allBooks, allCategories]) => {
        if (!active) return;
        setBooks(allBooks);
        setCategories(allCategories);
      })
      .catch(() => {
        if (active) setError("Could not load books. Check JSON Server.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredBooks = useMemo(() => {
    const search = query.trim().toLowerCase();
    return books
      .filter((book) =>
        `${book.title} ${book.author}`.toLowerCase().includes(search),
      )
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        if (sort === "price") return a.price - b.price;
        if (sort === "stock") return a.stock - b.stock;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [books, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const displayedBooks = filteredBooks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function showForm(book?: Book) {
    setEditing(book ?? null);
    setForm(
      book
        ? {
            title: book.title,
            author: book.author,
            description: book.description,
            categoryId: book.categoryId,
            price: book.price,
            stock: book.stock,
            image: book.image,
            featured: book.featured,
          }
        : { ...emptyBook },
    );
    setError("");
    setOpen(true);
  }

  function change<K extends keyof BookInput>(key: K, value: BookInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    if (
      !form.title.trim() ||
      !form.author.trim() ||
      !form.description.trim() ||
      !form.categoryId ||
      !form.image.trim() ||
      !Number.isFinite(form.price) ||
      form.price <= 0 ||
      !Number.isInteger(form.stock) ||
      form.stock < 0
    ) {
      setError(
        "Enter all book details. Price must be positive and stock must be a whole number (0 or more).",
      );
      return;
    }

    setSaving(true);
    setError("");
    try {
      await saveBook(
        {
          ...form,
          title: form.title.trim(),
          author: form.author.trim(),
          description: form.description.trim(),
          image: form.image.trim(),
        },
        editing?.id,
      );
      await load();
      setOpen(false);
    } catch {
      setError("Could not save the book. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;

    setSaving(true);
    setError("");
    try {
      await removeBook(deleting.id);
      await load();
      setDeleting(null);
    } catch {
      setError("Could not delete the book.");
      setDeleting(null);
    } finally {
      setSaving(false);
    }
  }

  async function toggleFeatured(book: Book) {
    setError("");
    try {
      await setBookFeatured(book.id, !book.featured);
      await load();
    } catch {
      setError("Could not update featured status.");
    }
  }

  return (
    <>
      <PageHeading
        title="Books"
        description={`${books.length} books in your catalog.`}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => showForm()}
          >
            Add Book
          </Button>
        }
      />
      <LoadError loading={loading} error={!open ? error : ""} />

      {!loading && (
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <TextField
              size="small"
              label="Search title or author"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              sx={{ flexGrow: 1 }}
            />
            <TextField
              select
              size="small"
              label="Sort by"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
              sx={{ minWidth: 165 }}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="title">Title A–Z</MenuItem>
              <MenuItem value="price">Price: Low–High</MenuItem>
              <MenuItem value="stock">Lowest Stock</MenuItem>
            </TextField>
          </Stack>

          <BooksTable
            books={displayedBooks}
            categories={categories}
            onEdit={showForm}
            onDelete={setDeleting}
            onToggleFeatured={(book) => void toggleFeatured(book)}
          />

          {pageCount > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={pageCount}
                page={currentPage}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </Paper>
      )}

      <BookFormDialog
        open={open}
        book={editing}
        categories={categories}
        form={form}
        error={error}
        saving={saving}
        onChange={change}
        onClose={() => setOpen(false)}
        onSave={() => void handleSave()}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete Book?"
        busy={saving}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      >
        Are you sure you want to delete <strong>{deleting?.title}</strong>? This
        cannot be undone.
      </ConfirmDialog>
    </>
  );
}
