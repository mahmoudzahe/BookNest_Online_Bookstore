import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Paper, Stack, TextField } from "@mui/material";
import type { GridPaginationModel } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { getBooks, getCategories } from "../services/booksApi";
import { removeBook, saveBook, setBookFeatured } from "../services/adminApi";
import type { BookInput } from "../services/adminApi";
import type { Book, Category } from "../types/book";
import { LoadError, PageHeading } from "./AdminCommon";
import BooksTable from "./components/BooksTable";
import BookFormDialog from "./components/BookFormDialog";
import ConfirmDialog from "./components/ConfirmDialog";

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
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 8,
  });
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
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [books, query]);

  const showForm = useCallback((book?: Book) => {
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
  }, []);

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
        "Fill all fields and choose a book cover. Price must be positive and stock a whole number (0 or more).",
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

  const toggleFeatured = useCallback(async (book: Book) => {
    setError("");
    try {
      await setBookFeatured(book.id, !book.featured);
      await load();
    } catch {
      setError("Could not update featured status.");
    }
  }, []);

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
          <Stack sx={{ mb: 2 }}>
            <TextField
              size="small"
              label="Search title or author"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPagination((current) => ({ ...current, page: 0 }));
              }}
            />
          </Stack>

          <BooksTable
            books={filteredBooks}
            categories={categories}
            paginationModel={pagination}
            onPaginationChange={setPagination}
            onEdit={showForm}
            onDelete={setDeleting}
            onToggleFeatured={(book) => void toggleFeatured(book)}
          />
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
