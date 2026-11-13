import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Stack,
} from "@mui/material";
import { T, useI18n } from "@/i18n/LocaleContext";

interface CategoryFormDialogProps {
  open: boolean;
  editing: boolean;
  name: string;
  error: string;
  saving: boolean;
  onChange: (name: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function CategoryFormDialog({
  open,
  editing,
  name,
  error,
  saving,
  onChange,
  onClose,
  onSave,
}: CategoryFormDialogProps) {
  const { t } = useI18n();
  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>
        {editing ? t("Rename Category") : t("Add Category")}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            autoFocus
            fullWidth
            label={t("Category name")}
            value={name}
            onChange={(event) => onChange(event.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button disabled={saving} onClick={onClose}>
          <T text="Cancel" />
        </Button>
        <Button disabled={saving} variant="contained" onClick={onSave}>
          {saving ? t("Saving...") : t("Save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
