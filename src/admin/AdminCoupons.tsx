import { useEffect, useState } from "react";
import {
  Button,
  Chip,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
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
      setError("Code must be 3–20 characters: letters, numbers, - or _.");
      return;
    }
    if (
      !Number.isFinite(form.discountPercent) ||
      form.discountPercent < 1 ||
      form.discountPercent > 100
    ) {
      setError("Discount must be between 1 and 100%.");
      return;
    }
    if (
      coupons.some(
        (coupon) =>
          coupon.id !== editing?.id && coupon.code.toUpperCase() === code,
      )
    ) {
      setError("This coupon code already exists.");
      return;
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
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Enabled</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {coupon.code}
                    </TableCell>
                    <TableCell>{coupon.discountPercent}%</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={coupon.active ? "Active" : "Inactive"}
                        color={coupon.active ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        size="small"
                        checked={coupon.active}
                        onChange={() => void toggle(coupon)}
                        slotProps={{
                          input: { "aria-label": `Enable ${coupon.code}` },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => showForm(coupon)}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleting(coupon)}
                        >
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {coupons.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>No coupons yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
