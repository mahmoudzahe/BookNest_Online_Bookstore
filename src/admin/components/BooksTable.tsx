import { useMemo } from "react";
import {
  Box,
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
import { money } from "../AdminCommon";

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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              height: "100%",
              minWidth: 0,
            }}
          >
            <Box
              component="img"
              src={row.image}
              alt=""
              sx={{
                width: 38,
                height: 48,
                objectFit: "cover",
                borderRadius: 1,
                flexShrink: 0,
              }}
            />

            <Box
              sx={{
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
                {row.title}
              </Typography>

              <Typography variant="caption" color="text.secondary" noWrap>
                {row.author}
              </Typography>
            </Box>
          </Box>
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
              row.stock === 0 ? "error" : row.stock <= 5 ? "warning" : "default"
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
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
          </Box>
        ),
      },
    ],
    [categories, onDelete, onEdit, onToggleFeatured],
  );

  return (
    <Box sx={{ height: 630, width: "100%" }}>
      <DataGrid
        rows={books}
        columns={columns}
        rowHeight={64}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationChange}
        pageSizeOptions={[8, 16, 24]}
        disableRowSelectionOnClick
        disableColumnMenu
        getRowClassName={({ row }) => (row.stock <= 5 ? "low-stock" : "")}
        sx={{
          border: 0,
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 700,
          },
          "& .low-stock": {
            bgcolor: "action.hover",
          },
        }}
      />
    </Box>
  );
}
