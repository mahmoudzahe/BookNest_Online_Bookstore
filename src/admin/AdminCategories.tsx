import { categoryColumns } from "./columns/categoryColumns";
import { Box, Button, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { PageHeading } from "./AdminCommon";
import LoadError from "./components/LoadError";
import CategoryFormDialog from "./components/CategoryFormDialog";
import ConfirmDialog from "./components/ConfirmDialog";
import { useAdminCategories } from "./hooks/useAdminCategories";
import {
  ADMIN_PAGE_SIZE,
  ADMIN_PAGE_SIZE_OPTIONS,
  ADMIN_TABLE_ROW_HEIGHT,
  adminTableHeight,
} from "./constants";

export default function AdminCategories() {
  const {
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
  } = useAdminCategories();
  const columns = categoryColumns(showForm, setDeleting);

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
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ height: adminTableHeight(rows.length) }}>
            <DataGrid
              rows={rows}
              columns={columns}
              rowHeight={ADMIN_TABLE_ROW_HEIGHT}
              pageSizeOptions={ADMIN_PAGE_SIZE_OPTIONS}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: ADMIN_PAGE_SIZE },
                },
              }}
              disableRowSelectionOnClick
              disableColumnMenu
              className="BookNest-adminDataGrid"
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
