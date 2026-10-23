import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
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
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    setImageError("");
  }, [open, book]);

  async function selectImage(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Choose an image smaller than 5 MB.");
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 600 / bitmap.width, 900 / bitmap.height);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas not supported");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      onChange("image", canvas.toDataURL("image/webp", 0.8));
      setImageError("");
    } catch {
      setImageError("Could not read the image. Try another file.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{book ? "Edit Book" : "Add Book"}</DialogTitle>
      <DialogContent sx={{ pt: "12px !important" }}>
        <Grid container spacing={2}>
          {error && (
            <Grid size={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Title"
              value={form.title}
              onChange={(event) => onChange("title", event.target.value)}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Author"
              value={form.author}
              onChange={(event) => onChange("author", event.target.value)}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
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
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Price ($)"
              type="number"
              value={form.price}
              onChange={(event) =>
                onChange("price", Number(event.target.value))
              }
              slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Stock"
              type="number"
              value={form.stock}
              onChange={(event) =>
                onChange("stock", Number(event.target.value))
              }
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
              required
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Description"
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              multiline
              minRows={3}
              required
            />
          </Grid>

          <Grid size={12}>
            <Box
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void selectImage(event.dataTransfer.files[0]);
              }}
              sx={{
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              {form.image && (
                <Box
                  component="img"
                  src={form.image}
                  alt="Book cover preview"
                  sx={{ width: 65, height: 88, objectFit: "contain" }}
                />
              )}
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Drag your book cover here, or choose an image
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  startIcon={<CloudUploadOutlinedIcon />}
                >
                  {form.image ? "Change Image" : "Choose Image"}
                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      void selectImage(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </Button>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  JPG, PNG or WebP · Max 5 MB
                </Typography>
              </Box>
            </Box>
          </Grid>
          {imageError && (
            <Grid size={12}>
              <Alert severity="error">{imageError}</Alert>
            </Grid>
          )}

          <Grid size={12}>
            <FormControlLabel
              label="Featured book"
              control={
                <Switch
                  checked={form.featured}
                  onChange={(event) =>
                    onChange("featured", event.target.checked)
                  }
                />
              }
            />
          </Grid>
        </Grid>
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
