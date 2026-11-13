"use client";

import { couponColumns } from "./columns/couponColumns";
import { Box, Button, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { PageHeading } from "./AdminCommon";
import LoadError from "./components/LoadError";
import CouponFormDialog from "./components/CouponFormDialog";
import ConfirmDialog from "./components/ConfirmDialog";
import { useAdminCoupons } from "./hooks/useAdminCoupons";
import {
  ADMIN_PAGE_SIZE,
  ADMIN_PAGE_SIZE_OPTIONS,
  ADMIN_TABLE_ROW_HEIGHT,
  adminTableHeight,
} from "./constants";

export default function AdminCoupons() {
  const {
    coupons,
    editing,
    form,
    open,
    setOpen,
    deleting,
    setDeleting,
    loading,
    saving,
    error,
    showForm,
    change,
    handleSave,
    handleDelete,
    toggle,
  } = useAdminCoupons();
  const columns = couponColumns(showForm, setDeleting, toggle);

  return (
    <>
      <PageHeading
        title="Coupons"
        description="Create and manage checkout discount codes."
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => showForm()}
          >
            Add Coupon
          </Button>
        }
      />
      <LoadError loading={loading} error={!open ? error : ""} />
      {!loading && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ height: adminTableHeight(coupons.length) }}>
            <DataGrid
              rows={coupons}
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
      <CouponFormDialog
        open={open}
        editing={Boolean(editing)}
        form={form}
        saving={saving}
        error={error}
        onChange={change}
        onClose={() => setOpen(false)}
        onSave={() => void handleSave()}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete Coupon?"
        busy={saving}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      >
        Delete coupon <strong>{deleting?.code}</strong>?
      </ConfirmDialog>
    </>
  );
}
