import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import type { Book, Category } from "../../types/book";
import type { BookInput } from "../../services/adminApi";

interface BookFormDialogProps {
  open: boolean;
  book: Book | null;
  categories: Category[];
  form: BookInput;
  error: string;
  saving: boolean;
  onChange: <K extends keyof BookInput>(key: K, value: BookInput[K]) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function BookFormDialog({
  open,
  book,
  categories,
  form,
  error,
  saving,
  onChange,
  onSave,
  onClose,
}: BookFormDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{book ? "Edit Book" : "Add Book"}</DialogTitle>
      <DialogContent
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
          pt: "12px !important",
        }}
      >
        {error && (
          <Alert severity="error" sx={{ gridColumn: "1 / -1" }}>
            {error}
          </Alert>
        )}
        <TextField
          label="Title"
          value={form.title}
          onChange={(event) => onChange("title", event.target.value)}
          required
        />
        <TextField
          label="Author"
          value={form.author}
          onChange={(event) => onChange("author", event.target.value)}
          required
        />
        <TextField
          select
          label="Category"
          value={form.categoryId}
          onChange={(event) => onChange("categoryId", event.target.value)}
          required
        >
          <MenuItem value="">Select category</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Image URL"
          value={form.image}
          onChange={(event) => onChange("image", event.target.value)}
          required
        />
        <TextField
          label="Price ($)"
          type="number"
          value={form.price}
          onChange={(event) => onChange("price", Number(event.target.value))}
          slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
          required
        />
        <TextField
          label="Stock"
          type="number"
          value={form.stock}
          onChange={(event) => onChange("stock", Number(event.target.value))}
          slotProps={{ htmlInput: { min: 0, step: 1 } }}
          required
        />
        <TextField
          label="Description"
          value={form.description}
          onChange={(event) => onChange("description", event.target.value)}
          multiline
          minRows={3}
          required
          sx={{ gridColumn: "1 / -1" }}
        />
        <FormControlLabel
          label="Featured book"
          control={
            <Switch
              checked={form.featured}
              onChange={(event) => onChange("featured", event.target.checked)}
            />
          }
          sx={{ gridColumn: "1 / -1" }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save Book"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
