import { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { getBooks, getCategories } from "../services/booksApi";
import { removeCategory, saveCategory } from "../services/adminApi";
import type { Book, Category } from "../types/book";
import { LoadError, PageHeading } from "./AdminCommon";
import CategoryFormDialog from "./components/CategoryFormDialog";
import ConfirmDialog from "./components/ConfirmDialog";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const [allCategories, allBooks] = await Promise.all([
      getCategories(),
      getBooks(),
    ]);
    setCategories(allCategories);
    setBooks(allBooks);
  }

  useEffect(() => {
    let active = true;
    Promise.all([getCategories(), getBooks()])
      .then(([allCategories, allBooks]) => {
        if (!active) return;
        setCategories(allCategories);
        setBooks(allBooks);
      })
      .catch(() => {
        if (active) setError("Could not load categories.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function showForm(category?: Category) {
    setEditing(category ?? null);
    setName(category?.name ?? "");
    setError("");
    setOpen(true);
  }

  async function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Enter a category name.");
      return;
    }
    if (
      categories.some(
        (category) =>
          category.id !== editing?.id &&
          category.name.toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      setError("This category already exists.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await saveCategory(trimmedName, editing?.id);
      await load();
      setOpen(false);
    } catch {
      setError("Could not save category.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;

    setSaving(true);
    setError("");
    try {
      const latestBooks = await getBooks();
      if (latestBooks.some((book) => book.categoryId === deleting.id)) {
        setError("Move or delete the books in this category first.");
        setDeleting(null);
        return;
      }
      await removeCategory(deleting.id);
      await load();
      setDeleting(null);
    } catch {
      setError("Could not delete category.");
      setDeleting(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeading
        title="Categories"
        description="Organize books into collections."
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => showForm()}
          >
            Add Category
          </Button>
        }
      />
      <LoadError loading={loading} error={!open ? error : ""} />

      {!loading && (
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Books</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => {
                  const count = books.filter(
                    (book) => book.categoryId === category.id,
                  ).length;
                  return (
                    <TableRow key={category.id} hover>
                      <TableCell>{category.name}</TableCell>
                      <TableCell align="right">{count}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Rename">
                          <IconButton
                            size="small"
                            onClick={() => showForm(category)}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={
                            count
                              ? "Cannot delete a category containing books"
                              : "Delete"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={count > 0}
                              onClick={() => setDeleting(category)}
                            >
                              <DeleteOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <CategoryFormDialog
        open={open}
        editing={Boolean(editing)}
        name={name}
        error={error}
        saving={saving}
        onChange={setName}
        onClose={() => setOpen(false)}
        onSave={() => void handleSave()}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete Category?"
        busy={saving}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      >
        Delete <strong>{deleting?.name}</strong>?
      </ConfirmDialog>
    </>
  );
}
