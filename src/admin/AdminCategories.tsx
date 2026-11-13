"use client";

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
import { T, useI18n } from "@/i18n/LocaleContext";

export default function AdminCategories() {
  const { t, locale } = useI18n();
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
  const columns = categoryColumns(showForm, setDeleting, t);

  return (
    <>
      <PageHeading
        title={t("Categories")}
        description={t("Organize books into collections.")}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => showForm()}
          >
            <T text="Add Category" />
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
              sx={
                locale === "ar"
                  ? {
                      '& .MuiDataGrid-cell[data-field="name"]': {
                        fontFamily: '"Segoe UI", Arial, sans-serif',
                        fontSize: "0.95rem",
                        fontWeight: 400,
                      },
                      '& .MuiDataGrid-columnHeader[data-field="name"] .MuiDataGrid-columnHeaderTitle':
                        {
                          fontFamily: '"Segoe UI", Arial, sans-serif',
                          fontSize: "0.95rem",
                          fontWeight: 600,
                        },
                    }
                  : undefined
              }
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
        title={t("Delete Category?")}
        busy={saving}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      >
        <T text="Delete" /> <strong>{t(deleting?.name ?? "")}</strong>?
      </ConfirmDialog>
    </>
  );
}
