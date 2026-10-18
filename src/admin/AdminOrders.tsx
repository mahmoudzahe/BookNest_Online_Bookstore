import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Chip,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import {
  getAdminOrders,
  getAdminUsers,
  changeOrderStatus,
} from "../services/adminApi";
import type { Order } from "../types/order";
import type { AuthUser } from "../types/user";
import { LoadError, PageHeading, money } from "./AdminCommon";
import OrderDetailsDialog, {
  orderStatuses,
} from "./components/OrderDetailsDialog";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [status, setStatus] = useState<Order["status"]>("pending");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getAdminOrders(), getAdminUsers()])
      .then(([allOrders, allUsers]) => {
        if (!active) return;
        setOrders(allOrders);
        setUsers(allUsers);
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

  const displayedOrders = useMemo(
    () =>
      filter === "all"
        ? orders
        : orders.filter((order) => order.status === filter),
    [orders, filter],
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

  return (
    <>
      <PageHeading
        title="Orders"
        description="Track customer purchases and update their status."
      />
      <LoadError loading={loading} error={selected ? "" : error} />

      {!loading && (
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
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
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedOrders.map((order) => {
                  const customer = users.find(
                    (user) => user.id === order.userId,
                  );
                  return (
                    <TableRow key={order.id} hover>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>
                        {customer
                          ? `${customer.firstName} ${customer.lastName}`
                          : order.shipping.fullName}
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={order.status}
                          color={
                            order.status === "delivered"
                              ? "success"
                              : order.status === "cancelled"
                                ? "error"
                                : "default"
                          }
                        />
                      </TableCell>
                      <TableCell align="right">{money(order.total)}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => openOrder(order)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {displayedOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>No orders found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
    </>
  );
}
