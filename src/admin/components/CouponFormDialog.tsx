import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
} from "@mui/material";
import type { CouponInput } from "../../services/adminApi";

interface CouponFormDialogProps {
  open: boolean;
  editing: boolean;
  form: CouponInput;
  saving: boolean;
  error: string;
  onChange: <K extends keyof CouponInput>(
    key: K,
    value: CouponInput[K],
  ) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function CouponFormDialog({
  open,
  editing,
  form,
  saving,
  error,
  onChange,
  onClose,
  onSave,
}: CouponFormDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{editing ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {error && (
            <Grid size={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
          <Grid size={12}>
            <TextField
              fullWidth
              label="Coupon Code"
              value={form.code}
              onChange={(event) =>
                onChange("code", event.target.value.toUpperCase())
              }
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Discount (%)"
              type="number"
              value={form.discountPercent}
              onChange={(event) =>
                onChange("discountPercent", Number(event.target.value))
              }
              slotProps={{ htmlInput: { min: 1, max: 100, step: 1 } }}
            />
          </Grid>
          <Grid size={12}>
            <FormControlLabel
              label="Active"
              control={
                <Switch
                  checked={form.active}
                  onChange={(event) => onChange("active", event.target.checked)}
                />
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button disabled={saving} onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" disabled={saving} onClick={onSave}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
