import { useEffect, useMemo, useState } from "react";
import { Box, Button, IconButton, Paper, Tooltip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { getBooks, getCategories } from "../services/booksApi";
import { removeCategory, saveCategory } from "../services/adminApi";
import type { Book, Category } from "../types/book";
import { LoadError, PageHeading } from "./AdminCommon";
import CategoryFormDialog from "./components/CategoryFormDialog";
import ConfirmDialog from "./components/ConfirmDialog";

type CategoryRow = Category & { bookCount: number };

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
        if (active) {
          setCategories(allCategories);
          setBooks(allBooks);
        }
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

  const columns: GridColDef<CategoryRow>[] = [
    { field: "name", headerName: "Category", flex: 2, minWidth: 160 },
    {
      field: "bookCount",
      headerName: "Books",
      type: "number",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Tooltip title="Rename">
            <IconButton
              size="small"
              onClick={() => showForm(row)}
              aria-label={`Rename ${row.name}`}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              row.bookCount
                ? "Cannot delete a category containing books"
                : "Delete"
            }
          >
            <span>
              <IconButton
                size="small"
                color="error"
                disabled={row.bookCount > 0}
                onClick={() => setDeleting(row)}
                aria-label={`Delete ${row.name}`}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];

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
          <Box
            sx={{ height: Math.min(8, Math.max(rows.length, 2)) * 56 + 110 }}
          >
            <DataGrid
              rows={rows}
              columns={columns}
              rowHeight={56}
              pageSizeOptions={[8, 16, 24]}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 8 } },
              }}
              disableRowSelectionOnClick
              disableColumnMenu
              sx={{
                border: 0,
                "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700 },
              }}
            />
          </Box>
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
