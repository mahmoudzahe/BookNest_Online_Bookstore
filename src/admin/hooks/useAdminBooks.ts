import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type { GridPaginationModel } from "@mui/x-data-grid";
import { getBooks, getCategories } from "../../services/booksApi";
import { removeBook, saveBook, setBookFeatured } from "../../services/adminApi";
import type { BookInput } from "../../services/adminApi";
import type { Book, Category } from "../../types/book";
import { ADMIN_PAGE_SIZE } from "../constants";
import { bookSchema } from "../schemas/bookSchema";

const EMPTY_BOOK: BookInput = {
  title: "",
  author: "",
  description: "",
  categoryId: "",
  price: 0,
  stock: 0,
  featured: false,
  image: "",
};

export function useAdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: ADMIN_PAGE_SIZE,
  });
  const [editing, setEditing] = useState<Book | null>(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const {
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<BookInput>({
    resolver: yupResolver(bookSchema),
    defaultValues: EMPTY_BOOK,
  });
  const form = watch();
  const validationError =
    Object.values(errors)
      .map((item) => item?.message)
      .find(Boolean) ?? "";

  const load = useCallback(async (isActive: () => boolean = () => true) => {
    const [loadedBooks, loadedCategories] = await Promise.all([
      getBooks(),
      getCategories(),
    ]);
    if (!isActive()) return;
    setBooks(loadedBooks);
    setCategories(loadedCategories);
  }, []);

  useEffect(() => {
    let active = true;
    void load(() => active)
      .catch(() => {
        if (active) setError("Could not load books. Check JSON Server.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load]);

  const filteredBooks = useMemo(() => {
    const search = query.trim().toLowerCase();
    return books
      .filter((book) =>
        `${book.title} ${book.author}`.toLowerCase().includes(search),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [books, query]);

  const showForm = useCallback(
    (book?: Book) => {
      setEditing(book ?? null);
      reset(
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
          : { ...EMPTY_BOOK },
      );
      setError("");
      setOpen(true);
    },
    [reset],
  );

  function change<K extends keyof BookInput>(key: K, value: BookInput[K]) {
    setValue(key, value as never, { shouldValidate: true, shouldDirty: true });
  }

  const save = handleSubmit(async (values) => {
    setSaving(true);
    setError("");
    try {
      await saveBook(
        {
          ...values,
          title: values.title.trim(),
          author: values.author.trim(),
          description: values.description.trim(),
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
  });

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

  function search(value: string) {
    setQuery(value);
    setPagination((current) => ({ ...current, page: 0 }));
  }

  return {
    books,
    categories,
    query,
    pagination,
    setPagination,
    filteredBooks,
    editing,
    open,
    setOpen,
    deleting,
    setDeleting,
    loading,
    saving,
    error,
    form,
    validationError,
    showForm,
    change,
    save,
    handleDelete,
    toggleFeatured,
    search,
  };
}
