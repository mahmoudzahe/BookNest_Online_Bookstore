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
  Stack,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import type { Book, Category } from "../../types/book";
import type { BookInput } from "../../services/adminApi";
import {
  BOOK_IMAGE_ACCEPT,
  BOOK_COVER_PREVIEW_WIDTH,
  BOOK_COVER_PREVIEW_HEIGHT,
} from "../constants";
import { prepareBookCover } from "../imageUtils";

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
    try {
      const image = await prepareBookCover(file);
      onChange("image", image);
      setImageError("");
    } catch (error) {
      setImageError(
        error instanceof Error
          ? error.message
          : "Could not read the image. Try another file.",
      );
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
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
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
            <Stack
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void selectImage(event.dataTransfer.files[0]);
              }}
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
              }}
            >
              {form.image && (
                <Box
                  component="img"
                  src={form.image}
                  alt="Book cover preview"
                  sx={{
                    width: BOOK_COVER_PREVIEW_WIDTH,
                    height: BOOK_COVER_PREVIEW_HEIGHT,
                    objectFit: "contain",
                  }}
                />
              )}
              <Stack spacing={1} sx={{ alignItems: "center" }}>
                <Typography variant="body2">
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
                    accept={BOOK_IMAGE_ACCEPT}
                    onChange={(event) => {
                      void selectImage(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  JPG, PNG or WebP · Max 5 MB
                </Typography>
              </Stack>
            </Stack>
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
