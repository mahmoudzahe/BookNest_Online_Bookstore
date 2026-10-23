import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Tabs,
  Tab,
  TextField,
  Tooltip,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import RestoreIcon from "@mui/icons-material/Restore";
import {
  getAdminOrders,
  getAdminUsers,
  changeOrderStatus,
  setOrderArchived,
} from "../services/adminApi";
import type { Order } from "../types/order";
import type { AuthUser } from "../types/user";
import { LoadError, PageHeading, money } from "./AdminCommon";
import OrderDetailsDialog, {
  orderStatuses,
} from "./components/OrderDetailsDialog";
import ConfirmDialog from "./components/ConfirmDialog";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [archiving, setArchiving] = useState<Order | null>(null);
  const [status, setStatus] = useState<Order["status"]>("pending");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getAdminOrders(), getAdminUsers()])
      .then(([allOrders, allUsers]) => {
        if (active) {
          setOrders(allOrders);
          setUsers(allUsers);
        }
      })
      .catch(() => {
        if (active) setError("Could not load orders.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(
    () =>
      orders.filter(
        (order) =>
          Boolean(order.archived) === (tab === "archived") &&
          (filter === "all" || order.status === filter),
      ),
    [orders, filter, tab],
  );

  function openOrder(order: Order) {
    setSelected(order);
    setStatus(order.status);
    setError("");
  }

  async function updateStatus() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      await changeOrderStatus(selected.id, status);
      setOrders(await getAdminOrders());
      setSelected(null);
    } catch {
      setError("Could not change the order status.");
    } finally {
      setSaving(false);
    }
  }

  async function updateArchive() {
    if (!archiving) return;
    setSaving(true);
    setError("");
    try {
      await setOrderArchived(archiving.id, !archiving.archived);
      setOrders(await getAdminOrders());
      setArchiving(null);
    } catch {
      setError("Could not update order archive.");
      setArchiving(null);
    } finally {
      setSaving(false);
    }
  }

  const columns: GridColDef<Order>[] = [
    {
      field: "id",
      headerName: "Order ID",
      flex: 1.2,
      minWidth: 155,
      renderCell: ({ row }) => `#${row.id}`,
    },
    {
      field: "customer",
      headerName: "Customer",
      flex: 1.2,
      minWidth: 155,
      valueGetter: (_value, row) => {
        const customer = users.find((user) => user.id === row.userId);
        return customer
          ? `${customer.firstName} ${customer.lastName}`
          : row.shipping.fullName;
      },
    },
    {
      field: "createdAt",
      headerName: "Date",
      minWidth: 125,
      flex: 1,
      renderCell: ({ row }) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      flex: 1,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={row.status}
          color={
            row.status === "delivered"
              ? "success"
              : row.status === "cancelled"
                ? "error"
                : "default"
          }
        />
      ),
    },
    {
      field: "total",
      headerName: "Total",
      minWidth: 110,
      type: "number",
      flex: 0.8,
      renderCell: ({ row }) => money(row.total),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 140,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Button size="small" onClick={() => openOrder(row)}>
            View
          </Button>
          <Tooltip title={row.archived ? "Restore order" : "Archive order"}>
            <IconButton
              size="small"
              color={row.archived ? "primary" : "error"}
              aria-label={row.archived ? "Restore order" : "Archive order"}
              onClick={() => setArchiving(row)}
            >
              {row.archived ? (
                <RestoreIcon fontSize="small" />
              ) : (
                <DeleteOutlineIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <>
      <PageHeading
        title="Orders"
        description="Track customer purchases and update their status."
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
              label={`Active (${orders.filter((order) => !order.archived).length})`}
              value="active"
            />
            <Tab
              label={`Archived (${orders.filter((order) => order.archived).length})`}
              value="archived"
            />
          </Tabs>
          <TextField
            select
            size="small"
            label="Order status"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            sx={{ mb: 2, minWidth: 180 }}
          >
            <MenuItem value="all">All Orders</MenuItem>
            {orderStatuses.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
          <Box
            sx={{
              height: Math.min(8, Math.max(rows.length, 2)) * 56 + 110,
              width: "100%",
            }}
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
        title={archiving?.archived ? "Restore Order?" : "Archive Order?"}
        confirmLabel={archiving?.archived ? "Restore" : "Archive"}
        onClose={() => setArchiving(null)}
        onConfirm={() => void updateArchive()}
      >
        {archiving?.archived ? "Restore" : "Archive"} order{" "}
        <strong>#{archiving?.id}</strong>? Its status and all order details will
        be kept.
      </ConfirmDialog>
    </>
  );
}
