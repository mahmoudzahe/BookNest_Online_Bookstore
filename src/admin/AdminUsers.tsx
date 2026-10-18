import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { useAuth } from "../auth/AuthContext";
import {
  changeUserActive,
  changeUserRole,
  getAdminOrders,
  getAdminUsers,
  removeUser,
} from "../services/adminApi";
import type { AuthUser } from "../types/user";
import type { Order } from "../types/order";
import { LoadError, PageHeading } from "./AdminCommon";
import ConfirmDialog from "./components/ConfirmDialog";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
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
        if (!active) return;
        setUsers(allUsers);
        setOrders(allOrders);
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

  async function setRole(user: AuthUser, role: AuthUser["role"]) {
    if (user.id === currentUser?.id) return;

    setError("");
    setSaving(true);
    try {
      await changeUserRole(user.id, role);
      await load();
    } catch {
      setError("Could not update the user's role.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAccountStatus() {
    if (!changingStatus || changingStatus.id === currentUser?.id) return;
    if (changingStatus.role === "admin") return;

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

  async function deleteAccount() {
    if (!deleting || deleting.id === currentUser?.id) return;

    setSaving(true);
    setError("");
    try {
      const latestOrders = await getAdminOrders();
      if (latestOrders.some((order) => order.userId === deleting.id)) {
        setError(
          "This user has orders and cannot be deleted without affecting order history.",
        );
        setDeleting(null);
        return;
      }
      await removeUser(deleting.id);
      await load();
      setDeleting(null);
    } catch {
      setError("Could not delete the user.");
      setDeleting(null);
    } finally {
      setSaving(false);
    }
  }

  const displayedUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );

  return (
    <>
      <PageHeading
        title="Users"
        description="Manage customer accounts and administrator access."
      />
      <LoadError loading={loading} error={error} />

      {!loading && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <TextField
            size="small"
            label="Search users"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            sx={{ mb: 2, minWidth: { xs: "100%", sm: 300 } }}
          />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Orders</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedUsers.map((user) => {
                  const count = orders.filter(
                    (order) => order.userId === user.id,
                  ).length;
                  const isSelf = user.id === currentUser?.id;

                  return (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            minWidth: 200,
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
                            {user.firstName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 600 }}>
                              {user.firstName} {user.lastName}
                              {isSelf ? " (You)" : ""}
                            </Typography>
                            <Typography
                              color="text.secondary"
                              variant="caption"
                            >
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{user.phone || "—"}</TableCell>
                      <TableCell>{count}</TableCell>
                      <TableCell>
                        {isSelf ? (
                          <Chip size="small" label={user.role} />
                        ) : (
                          <TextField
                            select
                            size="small"
                            value={user.role}
                            disabled={saving || !user.active}
                            onChange={(event) =>
                              void setRole(
                                user,
                                event.target.value as AuthUser["role"],
                              )
                            }
                            sx={{ minWidth: 108 }}
                          >
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                          </TextField>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={user.active ? "Active" : "Suspended"}
                          color={user.active ? "success" : "warning"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 1,
                          }}
                        >
                          <Tooltip
                            title={
                              isSelf
                                ? "Cannot suspend your own account"
                                : user.role === "admin"
                                  ? "Only customer accounts can be suspended"
                                  : ""
                            }
                          >
                            <span>
                              <Button
                                size="small"
                                variant="outlined"
                                color={user.active ? "warning" : "success"}
                                disabled={
                                  saving || isSelf || user.role === "admin"
                                }
                                onClick={() => setChangingStatus(user)}
                              >
                                {user.active ? "Suspend" : "Activate"}
                              </Button>
                            </span>
                          </Tooltip>
                          <Tooltip
                            title={
                              isSelf
                                ? "Cannot delete your own account"
                                : count
                                  ? "Cannot delete a user with orders"
                                  : "Delete"
                            }
                          >
                            <span>
                              <IconButton
                                color="error"
                                size="small"
                                disabled={isSelf || count > 0 || saving}
                                onClick={() => setDeleting(user)}
                              >
                                <DeleteOutlinedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {displayedUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>No users found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <ConfirmDialog
        open={Boolean(changingStatus)}
        title={
          changingStatus?.active ? "Suspend Account?" : "Activate Account?"
        }
        busy={saving}
        confirmLabel={changingStatus?.active ? "Suspend" : "Activate"}
        busyLabel="Saving..."
        confirmColor={changingStatus?.active ? "warning" : "success"}
        onClose={() => setChangingStatus(null)}
        onConfirm={() => void toggleAccountStatus()}
      >
        {changingStatus?.active ? "Suspend" : "Activate"} account{" "}
        <strong>{changingStatus?.email}</strong>? All existing orders will keep
        their current status.
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete User?"
        busy={saving}
        onClose={() => setDeleting(null)}
        onConfirm={() => void deleteAccount()}
      >
        Delete account <strong>{deleting?.email}</strong>? This cannot be
        undone.
      </ConfirmDialog>
    </>
  );
}
