"use client";

import { Button, Paper, Stack, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { PageHeading } from "./AdminCommon";
import LoadError from "./components/LoadError";
import BooksTable from "./components/BooksTable";
import BookFormDialog from "./components/BookFormDialog";
import ConfirmDialog from "./components/ConfirmDialog";
import { useAdminBooks } from "./hooks/useAdminBooks";

export default function AdminBooks() {
  const admin = useAdminBooks();

  return (
    <>
      <PageHeading
        title="Books"
        description={`${admin.books.length} books in your catalog.`}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => admin.showForm()}
          >
            Add Book
          </Button>
        }
      />
      <LoadError
        loading={admin.loading}
        error={!admin.open ? admin.error : ""}
      />
      {!admin.loading && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack sx={{ mb: 2 }}>
            <TextField
              size="small"
              label="Search title or author"
              value={admin.query}
              onChange={(event) => admin.search(event.target.value)}
            />
          </Stack>
          <BooksTable
            books={admin.filteredBooks}
            categories={admin.categories}
            paginationModel={admin.pagination}
            onPaginationChange={admin.setPagination}
            onEdit={admin.showForm}
            onDelete={admin.setDeleting}
            onToggleFeatured={(book) => void admin.toggleFeatured(book)}
          />
        </Paper>
      )}
      <BookFormDialog
        open={admin.open}
        book={admin.editing}
        categories={admin.categories}
        form={admin.form}
        error={admin.error || admin.validationError}
        saving={admin.saving}
        onChange={admin.change}
        onClose={() => admin.setOpen(false)}
        onSave={() => void admin.save()}
      />
      <ConfirmDialog
        open={Boolean(admin.deleting)}
        title="Delete Book?"
        busy={admin.saving}
        onClose={() => admin.setDeleting(null)}
        onConfirm={() => void admin.handleDelete()}
      >
        Are you sure you want to delete <strong>{admin.deleting?.title}</strong>
        ? This cannot be undone.
      </ConfirmDialog>
    </>
  );
}
