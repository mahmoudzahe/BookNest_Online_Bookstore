import {
  Box,
  Chip,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import type { Book, Category } from "../../types/book";
import { money } from "../AdminCommon";

interface BooksTableProps {
  books: Book[];
  categories: Category[];
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onToggleFeatured: (book: Book) => void;
}

export default function BooksTable({
  books,
  categories,
  onEdit,
  onDelete,
  onToggleFeatured,
}: BooksTableProps) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Book</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Featured</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {books.map((book) => (
            <TableRow
              key={book.id}
              hover
              sx={{ bgcolor: book.stock <= 5 ? "action.hover" : undefined }}
            >
              <TableCell>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    minWidth: 200,
                  }}
                >
                  <Box
                    component="img"
                    src={book.image}
                    alt=""
                    sx={{
                      width: 38,
                      height: 52,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {book.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {book.author}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                {categories.find((category) => category.id === book.categoryId)
                  ?.name ?? "—"}
              </TableCell>
              <TableCell align="right">{money(book.price)}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={
                    book.stock === 0 ? "Out of stock" : `${book.stock} left`
                  }
                  color={
                    book.stock === 0
                      ? "error"
                      : book.stock <= 5
                        ? "warning"
                        : "default"
                  }
                />
              </TableCell>
              <TableCell>
                <Switch
                  size="small"
                  checked={book.featured}
                  onChange={() => onToggleFeatured(book)}
                  slotProps={{
                    input: { "aria-label": `Featured ${book.title}` },
                  }}
                />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => onEdit(book)}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(book)}
                  >
                    <DeleteOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {books.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>No books found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
