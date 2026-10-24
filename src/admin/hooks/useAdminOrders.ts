import { useEffect, useMemo, useState } from "react";
import {
  getAdminOrders,
  getAdminUsers,
  changeOrderStatus,
  setOrderArchived,
} from "../../services/adminApi";
import type { Order } from "../../types/order";
import type { AuthUser } from "../../types/user";

export function useAdminOrders() {
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

  const rows = useMemo(
    () =>
      orders.filter(
        (order) =>
          Boolean(order.archived) === (tab === "archived") &&
          (filter === "all" || order.status === filter),
      ),
    [orders, filter, tab],
  );
  const activeCount = useMemo(
    () => orders.filter((order) => !order.archived).length,
    [orders],
  );
  const archivedCount = orders.length - activeCount;

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

  return {
    orders,
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
  };
}
