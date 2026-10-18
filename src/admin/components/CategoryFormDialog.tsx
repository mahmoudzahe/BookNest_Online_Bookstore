import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

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
  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>{editing ? "Rename Category" : "Add Category"}</DialogTitle>
      <DialogContent sx={{ pt: "12px !important" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          fullWidth
          label="Category name"
          value={name}
          onChange={(event) => onChange(event.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button disabled={saving} onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={saving} variant="contained" onClick={onSave}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
