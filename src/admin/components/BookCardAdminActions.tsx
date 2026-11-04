"use client";

import { useState } from "react";
import {
  Alert,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
import { T, useI18n } from "@/i18n/LocaleContext";

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
  const { t } = useI18n();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
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

  function closeMenu() {
    setMenuAnchor(null);
  }

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
      setFeedback(t("Could not load categories. Please try again."));
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
      setFormError(t("Could not save the book. Please try again."));
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
      setFeedback(t("Could not delete the book. Please try again."));
      setConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {(canEdit || canDelete) && (
        <IconButton
          size="small"
          aria-label={t("More actions for {title}", { title: book.title })}
          aria-haspopup="menu"
          aria-expanded={Boolean(menuAnchor) ? "true" : undefined}
          onClick={(event) => setMenuAnchor(event.currentTarget)}
          disabled={loadingCategories || saving}
          sx={{
            flexShrink: 0,
            alignSelf: "flex-start",
            mt: -0.5,
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {canEdit && (
          <MenuItem
            onClick={() => {
              closeMenu();
              void openEditForm();
            }}
            disabled={loadingCategories || saving}
          >
            <ListItemIcon>
              <EditOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              <T text="Edit" />
            </ListItemText>
          </MenuItem>
        )}
        {canDelete && (
          <MenuItem
            onClick={() => {
              closeMenu();
              setConfirmOpen(true);
            }}
            disabled={saving}
          >
            <ListItemIcon>
              <DeleteOutlinedIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: "error.main" }}>
              <T text="Delete" />
            </ListItemText>
          </MenuItem>
        )}
      </Menu>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={4000}
        onClose={() => setFeedback("")}
      >
        <Alert severity="error" onClose={() => setFeedback("")}>
          {feedback}
        </Alert>
      </Snackbar>

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
        title={t("Delete Book?")}
        busy={saving}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void confirmDelete()}
      >
        <T text="Are you sure you want to delete" />{" "}
        <strong>{book.title}</strong>
        <T text="? This cannot be undone." />
      </ConfirmDialog>
    </>
  );
}
