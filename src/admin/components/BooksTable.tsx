import { useMemo } from "react";
import {
  Box,
  Stack,
  Chip,
  IconButton,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import type { Book, Category } from "../../types/book";
import { money } from "../formatters";
import {
  ADMIN_BOOK_ROW_HEIGHT,
  ADMIN_BOOK_TABLE_HEIGHT,
  ADMIN_LOW_STOCK_LIMIT,
  ADMIN_PAGE_SIZE_OPTIONS,
  BOOK_TABLE_COVER_WIDTH,
  BOOK_TABLE_COVER_HEIGHT,
} from "../constants";

interface BooksTableProps {
  books: Book[];
  categories: Category[];
  paginationModel: GridPaginationModel;
  onPaginationChange: (model: GridPaginationModel) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onToggleFeatured: (book: Book) => void;
}

export default function BooksTable({
  books,
  categories,
  paginationModel,
  onPaginationChange,
  onEdit,
  onDelete,
  onToggleFeatured,
}: BooksTableProps) {
  const columns = useMemo<GridColDef<Book>[]>(
    () => [
      {
        field: "title",
        headerName: "Book",
        flex: 2,
        minWidth: 220,
        renderCell: ({ row }) => (
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: "center", height: "100%", minWidth: 0 }}
          >
            <Box
              component="img"
              src={row.image}
              alt=""
              sx={{
                width: BOOK_TABLE_COVER_WIDTH,
                height: BOOK_TABLE_COVER_HEIGHT,
                objectFit: "cover",
                borderRadius: 1,
                flexShrink: 0,
              }}
            />

            <Stack sx={{ justifyContent: "center", minWidth: 0 }}>
              <Typography
                variant="body2"
                noWrap
                className="BookNest-textWeight700"
              >
                {row.title}
              </Typography>

              <Typography variant="caption" color="text.secondary" noWrap>
                {row.author}
              </Typography>
            </Stack>
          </Stack>
        ),
      },
      {
        field: "categoryId",
        headerName: "Category",
        flex: 1,
        minWidth: 140,
        valueGetter: (value) =>
          categories.find((category) => category.id === value)?.name ?? "—",
      },
      {
        field: "price",
        headerName: "Price",
        width: 110,
        type: "number",
        renderCell: ({ row }) => money(row.price),
      },
      {
        field: "stock",
        headerName: "Stock",
        width: 135,
        type: "number",
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={row.stock === 0 ? "Out of stock" : `${row.stock} left`}
            color={
              row.stock === 0
                ? "error"
                : row.stock <= ADMIN_LOW_STOCK_LIMIT
                  ? "warning"
                  : "default"
            }
          />
        ),
      },
      {
        field: "featured",
        headerName: "Featured",
        width: 110,
        type: "boolean",
        sortable: false,
        renderCell: ({ row }) => (
          <Switch
            size="small"
            checked={row.featured}
            onChange={() => onToggleFeatured(row)}
            slotProps={{
              input: {
                "aria-label": `Featured ${row.title}`,
              },
            }}
          />
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 110,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" sx={{ alignItems: "center", height: "100%" }}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                aria-label={`Edit ${row.title}`}
                onClick={() => onEdit(row)}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                aria-label={`Delete ${row.title}`}
                onClick={() => onDelete(row)}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [categories, onDelete, onEdit, onToggleFeatured],
  );

  return (
    <Box sx={{ height: ADMIN_BOOK_TABLE_HEIGHT, width: "100%" }}>
      <DataGrid
        rows={books}
        columns={columns}
        rowHeight={ADMIN_BOOK_ROW_HEIGHT}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationChange}
        pageSizeOptions={ADMIN_PAGE_SIZE_OPTIONS}
        disableRowSelectionOnClick
        disableColumnMenu
        getRowClassName={({ row }) =>
          row.stock <= ADMIN_LOW_STOCK_LIMIT ? "low-stock" : ""
        }
        className="BookNest-adminDataGrid"
      />
    </Box>
  );
}
