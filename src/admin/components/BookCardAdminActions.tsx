"use client";

import { useState } from "react";
import { Alert, Button, Stack } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import BookFormDialog from "./BookFormDialog";
import ConfirmDialog from "./ConfirmDialog";
import { bookSchema } from "../schemas/bookSchema";
import { getCategories } from "../../services/booksApi";
import { removeBook, saveBook } from "../../services/adminApi";
import type { BookInput } from "../../services/adminApi";
import type { Book, Category } from "../../types/book";

interface BookCardAdminActionsProps {
  book: Book;
  canEdit: boolean;
  canDelete: boolean;
  onBookUpdated: (book: Book) => void;
  onBookDeleted: (bookId: string) => void;
}

function toBookInput(book: Book): BookInput {
  return {
    title: book.title,
    author: book.author,
    description: book.description,
    categoryId: book.categoryId,
    price: book.price,
    stock: book.stock,
    featured: book.featured,
    image: book.image,
  };
}

export default function BookCardAdminActions({
  book,
  canEdit,
  canDelete,
  onBookUpdated,
  onBookDeleted,
}: BookCardAdminActionsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [feedback, setFeedback] = useState("");

  const {
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<BookInput>({
    resolver: yupResolver(bookSchema),
    defaultValues: toBookInput(book),
  });

  const form = watch();
  const validationError =
    Object.values(errors)
      .map((item) => item?.message)
      .find(Boolean) ?? "";

  async function openEditForm() {
    setFormError("");
    setFeedback("");
    setLoadingCategories(true);

    try {
      const loadedCategories = categories.length
        ? categories
        : await getCategories();

      setCategories(loadedCategories);
      reset(toBookInput(book));
      setFormOpen(true);
    } catch {
      setFeedback("Could not load categories. Please try again.");
    } finally {
      setLoadingCategories(false);
    }
  }

  function change<K extends keyof BookInput>(key: K, value: BookInput[K]) {
    setValue(key, value as never, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  const save = handleSubmit(async (values) => {
    setSaving(true);
    setFormError("");

    const updatedValues: BookInput = {
      ...values,
      title: values.title.trim(),
      author: values.author.trim(),
      description: values.description.trim(),
    };

    try {
      await saveBook(updatedValues, book.id);
      onBookUpdated({ ...book, ...updatedValues });
      setFormOpen(false);
    } catch {
      setFormError("Could not save the book. Please try again.");
    } finally {
      setSaving(false);
    }
  });

  async function confirmDelete() {
    setSaving(true);
    setFeedback("");

    try {
      await removeBook(book.id);
      onBookDeleted(book.id);
      setConfirmOpen(false);
    } catch {
      setFeedback("Could not delete the book. Please try again.");
      setConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Stack spacing={0.75} sx={{ width: "100%" }}>
      <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
        {canEdit && (
          <Button
            fullWidth
            size="small"
            variant="outlined"
            startIcon={<EditOutlinedIcon fontSize="small" />}
            onClick={() => void openEditForm()}
            disabled={loadingCategories || saving}
          >
            Edit
          </Button>
        )}
        {canDelete && (
          <Button
            fullWidth
            size="small"
            color="error"
            variant="outlined"
            startIcon={<DeleteOutlinedIcon fontSize="small" />}
            onClick={() => setConfirmOpen(true)}
            disabled={saving}
          >
            Delete
          </Button>
        )}
      </Stack>

      {feedback && (
        <Alert severity="error" onClose={() => setFeedback("")}>
          {feedback}
        </Alert>
      )}

      <BookFormDialog
        open={formOpen}
        book={book}
        categories={categories}
        form={form}
        error={formError || validationError}
        saving={saving}
        onChange={change}
        onClose={() => setFormOpen(false)}
        onSave={() => void save()}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Book?"
        busy={saving}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void confirmDelete()}
      >
        Are you sure you want to delete <strong>{book.title}</strong>? This
        cannot be undone.
      </ConfirmDialog>
    </Stack>
  );
}
