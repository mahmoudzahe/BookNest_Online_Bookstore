import { useEffect, useState } from "react";
import {
  getAdminCoupons,
  removeCoupon,
  saveCoupon,
  setCouponActive,
} from "../../services/adminApi";
import type { CouponInput } from "../../services/adminApi";
import type { Coupon } from "../../types/order";
import {
  COUPON_CODE_PATTERN,
  COUPON_MIN_DISCOUNT,
  COUPON_MAX_DISCOUNT,
  DEFAULT_COUPON_DISCOUNT,
} from "../constants";

const EMPTY_COUPON: CouponInput = {
  code: "",
  discountPercent: DEFAULT_COUPON_DISCOUNT,
  active: true,
};

export function useAdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponInput>(EMPTY_COUPON);
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
        : { ...EMPTY_COUPON },
    );
    setError("");
    setOpen(true);
  }

  function change<K extends keyof CouponInput>(key: K, value: CouponInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    const code = form.code.trim().toUpperCase();
    if (!COUPON_CODE_PATTERN.test(code))
      return setError(
        "Code must be 3–20 characters: letters, numbers, - or _.",
      );
    if (
      !Number.isFinite(form.discountPercent) ||
      form.discountPercent < COUPON_MIN_DISCOUNT ||
      form.discountPercent > COUPON_MAX_DISCOUNT
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

  return {
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
  };
}
