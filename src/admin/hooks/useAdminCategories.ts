import { useEffect, useMemo, useState } from "react";
import { getBooks, getCategories } from "../../services/booksApi";
import { removeCategory, saveCategory } from "../../services/adminApi";
import type { Book, Category } from "../../types/book";

export type CategoryRow = Category & { bookCount: number };

async function fetchCategories() {
  const [categories, books] = await Promise.all([getCategories(), getBooks()]);
  return { categories, books };
}

export function useAdminCategories() {
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
    const result = await fetchCategories();
    setCategories(result.categories);
    setBooks(result.books);
  }

  useEffect(() => {
    let active = true;
    fetchCategories()
      .then((result) => {
        if (!active) return;
        setCategories(result.categories);
        setBooks(result.books);
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
    const trimmed = name.trim();
    if (!trimmed) return setError("Enter a category name.");
    if (
      categories.some(
        (item) =>
          item.id !== editing?.id &&
          item.name.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      return setError("This category already exists.");
    }
    setSaving(true);
    setError("");
    try {
      await saveCategory(trimmed, editing?.id);
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
      const latest = await getBooks();
      if (latest.some((book) => book.categoryId === deleting.id)) {
        setError("Move or delete the books in this category first.");
      } else {
        await removeCategory(deleting.id);
        await load();
      }
      setDeleting(null);
    } catch {
      setError("Could not delete category.");
      setDeleting(null);
    } finally {
      setSaving(false);
    }
  }

  const rows = useMemo<CategoryRow[]>(
    () =>
      categories.map((category) => ({
        ...category,
        bookCount: books.filter((book) => book.categoryId === category.id)
          .length,
      })),
    [categories, books],
  );

  return {
    rows,
    editing,
    name,
    setName,
    open,
    setOpen,
    deleting,
    setDeleting,
    loading,
    saving,
    error,
    showForm,
    handleSave,
    handleDelete,
  };
}
