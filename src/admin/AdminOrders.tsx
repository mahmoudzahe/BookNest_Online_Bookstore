"use client";

import { orderColumns } from "./columns/orderColumns";
import { Box, MenuItem, Paper, Tabs, Tab, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { PageHeading } from "./AdminCommon";
import LoadError from "./components/LoadError";
import OrderDetailsDialog from "./components/OrderDetailsDialog";
import ConfirmDialog from "./components/ConfirmDialog";
import { useAdminOrders } from "./hooks/useAdminOrders";
import {
  ADMIN_PAGE_SIZE,
  ADMIN_PAGE_SIZE_OPTIONS,
  ADMIN_TABLE_ROW_HEIGHT,
  ORDER_STATUSES,
  adminTableHeight,
} from "./constants";
import { T, useI18n } from "@/i18n/LocaleContext";

export default function AdminOrders() {
  const { t } = useI18n();
  const {
    users,
    tab,
    setTab,
    filter,
    setFilter,
    selected,
    setSelected,
    archiving,
    setArchiving,
    status,
    setStatus,
    loading,
    saving,
    error,
    rows,
    activeCount,
    archivedCount,
    openOrder,
    updateStatus,
    updateArchive,
  } = useAdminOrders();
  const columns = orderColumns(users, openOrder, setArchiving, t);

  return (
    <>
      <PageHeading
        title={t("Orders")}
        description={t("Track customer purchases and update their status.")}
      />
      <LoadError loading={loading} error={selected ? "" : error} />
      {!loading && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Tabs
            value={tab}
            onChange={(_event, value: "active" | "archived") => setTab(value)}
            sx={{ mb: 2 }}
          >
            <Tab
              label={t("Active ({count})", { count: activeCount })}
              value="active"
            />
            <Tab
              label={t("Archived ({count})", { count: archivedCount })}
              value="archived"
            />
          </Tabs>
          <TextField
            select
            size="small"
            label={t("Order status")}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            sx={{ mb: 2, minWidth: 180 }}
          >
            <MenuItem value="all">
              <T text="All Orders" />
            </MenuItem>
            {ORDER_STATUSES.map((item) => (
              <MenuItem key={item} value={item}>
                {t(item)}
              </MenuItem>
            ))}
          </TextField>
          <Box
            sx={{
              height: adminTableHeight(rows.length),
              width: "100%",
            }}
          >
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
      <OrderDetailsDialog
        order={selected}
        status={status}
        error={error}
        saving={saving}
        onStatusChange={setStatus}
        onClose={() => setSelected(null)}
        onSave={() => void updateStatus()}
      />
      <ConfirmDialog
        open={Boolean(archiving)}
        busy={saving}
        title={archiving?.archived ? t("Restore Order?") : t("Archive Order?")}
        confirmLabel={archiving?.archived ? t("Restore") : t("Archive")}
        onClose={() => setArchiving(null)}
        onConfirm={() => void updateArchive()}
      >
        {archiving?.archived ? t("Restore") : t("Archive")} <T text="order" />{" "}
        <strong>#{archiving?.id}</strong>
        <T text="? Its status and all order details will be kept." />
      </ConfirmDialog>
    </>
  );
}
