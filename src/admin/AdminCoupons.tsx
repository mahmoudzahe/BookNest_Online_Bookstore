import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Switch,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import {
  getAdminCoupons,
  removeCoupon,
  saveCoupon,
  setCouponActive,
} from "../services/adminApi";
import type { CouponInput } from "../services/adminApi";
import type { Coupon } from "../types/order";
import { LoadError, PageHeading } from "./AdminCommon";
import CouponFormDialog from "./components/CouponFormDialog";
import ConfirmDialog from "./components/ConfirmDialog";

const emptyCoupon: CouponInput = {
  code: "",
  discountPercent: 10,
  active: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponInput>(emptyCoupon);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setCoupons(await getAdminCoupons());
  }

  useEffect(() => {
    let active = true;
    getAdminCoupons()
      .then((items) => {
        if (active) setCoupons(items);
      })
      .catch(() => {
        if (active) setError("Could not load coupons.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function showForm(coupon?: Coupon) {
    setEditing(coupon ?? null);
    setForm(
      coupon
        ? {
            code: coupon.code,
            discountPercent: coupon.discountPercent,
            active: coupon.active,
          }
        : { ...emptyCoupon },
    );
    setError("");
    setOpen(true);
  }

  function change<K extends keyof CouponInput>(key: K, value: CouponInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    const code = form.code.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,20}$/.test(code)) {
      return setError(
        "Code must be 3–20 characters: letters, numbers, - or _.",
      );
    }
    if (
      !Number.isFinite(form.discountPercent) ||
      form.discountPercent < 1 ||
      form.discountPercent > 100
    ) {
      return setError("Discount must be between 1 and 100%.");
    }
    if (
      coupons.some(
        (coupon) =>
          coupon.id !== editing?.id && coupon.code.toUpperCase() === code,
      )
    ) {
      return setError("This coupon code already exists.");
    }
    setSaving(true);
    setError("");
    try {
      await saveCoupon({ ...form, code }, editing?.id);
      await load();
      setOpen(false);
    } catch {
      setError("Could not save coupon.");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(coupon: Coupon) {
    setError("");
    try {
      await setCouponActive(coupon.id, !coupon.active);
      await load();
    } catch {
      setError("Could not update coupon status.");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true);
    setError("");
    try {
      await removeCoupon(deleting.id);
      await load();
      setDeleting(null);
    } catch {
      setError("Could not delete coupon.");
      setDeleting(null);
    } finally {
      setSaving(false);
    }
  }

  const columns: GridColDef<Coupon>[] = [
    { field: "code", headerName: "Code", minWidth: 135, flex: 1.3 },
    {
      field: "discountPercent",
      headerName: "Discount",
      minWidth: 100,
      flex: 1,
      renderCell: ({ row }) => `${row.discountPercent}%`,
    },
    {
      field: "active",
      headerName: "Status",
      minWidth: 120,
      flex: 1,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={row.active ? "Active" : "Inactive"}
          color={row.active ? "success" : "default"}
        />
      ),
    },
    {
      field: "enabled",
      headerName: "Enabled",
      minWidth: 100,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <Switch
          size="small"
          checked={row.active}
          onChange={() => void toggle(row)}
          slotProps={{ input: { "aria-label": `Enable ${row.code}` } }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 115,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: "flex", height: "100%", alignItems: "center" }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => showForm(row)}
              aria-label={`Edit ${row.code}`}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeleting(row)}
              aria-label={`Delete ${row.code}`}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

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
          <Box
            sx={{ height: Math.min(8, Math.max(coupons.length, 2)) * 56 + 110 }}
          >
            <DataGrid
              rows={coupons}
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
