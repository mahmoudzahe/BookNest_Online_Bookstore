"use client";

import {
  ADMIN_PAGE_SIZE,
  ADMIN_PAGE_SIZE_OPTIONS,
  ADMIN_BOOK_ROW_HEIGHT,
  ADMIN_TABLE_FOOTER_HEIGHT,
  ADMIN_TABLE_MIN_ROWS,
} from "./constants";
import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import RestoreIcon from "@mui/icons-material/Restore";
import { useAuth } from "../auth/AuthContext";
import {
  changeUserActive,
  changeUserRole,
  getAdminOrders,
  getAdminUsers,
  setUserArchived,
} from "../services/adminApi";
import type { AuthUser } from "../types/user";
import type { Order } from "../types/order";
import { PageHeading } from "./AdminCommon";
import LoadError from "./components/LoadError";
import ConfirmDialog from "./components/ConfirmDialog";

type UserRow = AuthUser & { orderCount: number };

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [query, setQuery] = useState("");
  const [roleUserId, setRoleUserId] = useState("");
  const [deleting, setDeleting] = useState<AuthUser | null>(null);
  const [changingStatus, setChangingStatus] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const [allUsers, allOrders] = await Promise.all([
      getAdminUsers(),
      getAdminOrders(),
    ]);
    setUsers(allUsers);
    setOrders(allOrders);
  }

  useEffect(() => {
    let active = true;
    Promise.all([getAdminUsers(), getAdminOrders()])
      .then(([allUsers, allOrders]) => {
        if (active) {
          setUsers(allUsers);
          setOrders(allOrders);
        }
      })
      .catch(() => {
        if (active) setError("Could not load users.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function setRole(role: AuthUser["role"]) {
    const selected = users.find((user) => user.id === roleUserId);
    if (
      !selected ||
      selected.id === currentUser?.id ||
      selected.archived ||
      !selected.active
    )
      return;
    setSaving(true);
    setError("");
    try {
      await changeUserRole(selected.id, role);
      await load();
    } catch {
      setError("Could not update the user's role.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAccountStatus() {
    if (
      !changingStatus ||
      changingStatus.id === currentUser?.id ||
      changingStatus.role === "admin"
    )
      return;
    setSaving(true);
    setError("");
    try {
      await changeUserActive(changingStatus.id, !changingStatus.active);
      await load();
      setChangingStatus(null);
    } catch {
      setError("Could not update the account status.");
    } finally {
      setSaving(false);
    }
  }

  async function updateArchive() {
    if (!deleting || deleting.id === currentUser?.id) return;
    setSaving(true);
    setError("");
    try {
      await setUserArchived(deleting.id, !deleting.archived);
      await load();
      if (roleUserId === deleting.id) setRoleUserId("");
      setDeleting(null);
    } catch {
      setError("Could not update the user archive.");
      setDeleting(null);
    } finally {
      setSaving(false);
    }
  }

  const activeUsers = users.filter((user) => !user.archived);
  const archivedUsers = users.filter((user) => user.archived);
  const roleUsers = activeUsers.filter(
    (user) => user.id !== currentUser?.id && user.active,
  );
  const roleUser = roleUsers.find((user) => user.id === roleUserId);
  const rows: UserRow[] = (tab === "active" ? activeUsers : archivedUsers)
    .filter((user) =>
      `${user.firstName} ${user.lastName} ${user.email}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
    )
    .map((user) => ({
      ...user,
      orderCount: orders.filter((order) => order.userId === user.id).length,
    }));

  const columns: GridColDef<UserRow>[] = [
    {
      field: "firstName",
      headerName: "User",
      flex: 2,
      minWidth: 230,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            gap: 1.5,
            minWidth: 0,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 34,
              height: 34,
              fontSize: "0.9rem",
            }}
          >
            {row.firstName.charAt(0).toUpperCase()}
          </Avatar>
          <Box
            sx={{
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="body2"
              noWrap
              sx={{ fontWeight: 700, lineHeight: 1.4 }}
            >
              {row.firstName} {row.lastName}
              {row.id === currentUser?.id ? " (You)" : ""}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ lineHeight: 1.4 }}
            >
              {row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      minWidth: 145,
      valueGetter: (value) => value || "—",
    },
    { field: "orderCount", headerName: "Orders", width: 95, type: "number" },
    {
      field: "active",
      headerName: "Status",
      width: 120,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          variant="outlined"
          label={row.active ? "Active" : "Suspended"}
          color={row.active ? "success" : "warning"}
          sx={{
            borderWidth: 2,
            borderColor: row.active ? "success.main" : "warning.main",
            fontWeight: 700,
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 190,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        const isSelf = row.id === currentUser?.id;
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              gap: 0.5,
            }}
          >
            {!row.archived && (
              <Tooltip
                title={
                  isSelf
                    ? "Cannot suspend your own account"
                    : row.role === "admin"
                      ? "Only customers can be suspended"
                      : ""
                }
              >
                <span>
                  <Button
                    size="small"
                    variant="outlined"
                    color={row.active ? "warning" : "success"}
                    disabled={saving || isSelf || row.role === "admin"}
                    onClick={() => setChangingStatus(row)}
                    sx={{
                      borderWidth: 2,
                      fontWeight: 700,
                      "&:hover": {
                        borderWidth: 2,
                      },
                      "&.Mui-disabled": {
                        border: "2px solid",
                        borderColor: "text.secondary",
                        color: "text.secondary",
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    {row.active ? "Suspend" : "Activate"}
                  </Button>
                </span>
              </Tooltip>
            )}
            <Tooltip
              title={
                isSelf
                  ? "Cannot archive your own account"
                  : row.archived
                    ? "Restore user"
                    : "Archive user"
              }
            >
              <span>
                <IconButton
                  size="small"
                  color={row.archived ? "primary" : "error"}
                  disabled={saving || isSelf}
                  onClick={() => setDeleting(row)}
                  aria-label={row.archived ? "Restore user" : "Archive user"}
                >
                  {row.archived ? (
                    <RestoreIcon fontSize="small" />
                  ) : (
                    <DeleteOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <>
      <PageHeading
        title="Users"
        description="Manage customer accounts and administrator access."
      />
      <LoadError loading={loading} error={error} />
      {!loading && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Tabs
            value={tab}
            onChange={(_event, value: "active" | "archived") => setTab(value)}
            sx={{ mb: 2 }}
          >
            <Tab label={`Active (${activeUsers.length})`} value="active" />
            <Tab
              label={`Archived (${archivedUsers.length})`}
              value="archived"
            />
          </Tabs>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            <TextField
              size="small"
              label="Search users"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              sx={{ minWidth: 210, flex: 1 }}
            />
            {tab === "active" && (
              <>
                <TextField
                  select
                  size="small"
                  label="Change role for"
                  value={roleUserId}
                  onChange={(event) => setRoleUserId(event.target.value)}
                  sx={{ minWidth: 190 }}
                >
                  <MenuItem value="">Select user</MenuItem>
                  {roleUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Role"
                  value={roleUser?.role ?? ""}
                  disabled={!roleUser || saving}
                  onChange={(event) =>
                    void setRole(event.target.value as AuthUser["role"])
                  }
                  sx={{ minWidth: 115 }}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </TextField>
              </>
            )}
          </Box>
          <Box
            sx={{
              height:
                Math.min(
                  ADMIN_PAGE_SIZE,
                  Math.max(rows.length, ADMIN_TABLE_MIN_ROWS),
                ) *
                  ADMIN_BOOK_ROW_HEIGHT +
                ADMIN_TABLE_FOOTER_HEIGHT,
              width: "100%",
            }}
          >
            <DataGrid
              rows={rows}
              columns={columns}
              rowHeight={ADMIN_BOOK_ROW_HEIGHT}
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
      <ConfirmDialog
        open={Boolean(changingStatus)}
        title={
          changingStatus?.active ? "Suspend Account?" : "Activate Account?"
        }
        busy={saving}
        confirmLabel={changingStatus?.active ? "Suspend" : "Activate"}
        confirmColor={changingStatus?.active ? "warning" : "success"}
        onClose={() => setChangingStatus(null)}
        onConfirm={() => void toggleAccountStatus()}
      >
        {changingStatus?.active ? "Suspend" : "Activate"} account{" "}
        <strong>{changingStatus?.email}</strong>? Existing orders will keep
        their status.
      </ConfirmDialog>
      <ConfirmDialog
        open={Boolean(deleting)}
        title={deleting?.archived ? "Restore User?" : "Archive User?"}
        busy={saving}
        confirmLabel={deleting?.archived ? "Restore" : "Archive"}
        onClose={() => setDeleting(null)}
        onConfirm={() => void updateArchive()}
      >
        {deleting?.archived ? "Restore" : "Archive"} account{" "}
        <strong>{deleting?.email}</strong>? Its orders will stay unchanged.
        Archived users cannot log in.
      </ConfirmDialog>
    </>
  );
}
