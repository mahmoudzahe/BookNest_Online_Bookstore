import { Chip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { T } from "@/i18n/LocaleContext";
import type { Order } from "@/types/order";
import type { Book } from "@/types/book";
import { money } from "../formatters";

export const dashboardOrderColumns: GridColDef<Order>[] = [
  {
    field: "id",
    headerName: "Order",
    minWidth: 140,
    flex: 1,
    renderCell: ({ row }) => `#${row.id}`,
  },
  {
    field: "createdAt",
    headerName: "Date",
    minWidth: 125,
    flex: 1,
    renderCell: ({ row }) => new Date(row.createdAt).toLocaleDateString(),
  },
  {
    field: "status",
    headerName: "Status",
    minWidth: 115,
    flex: 1,
    renderCell: ({ row }) => (
      <Chip
        size="small"
        label={<T text={row.status} />}
        color={
          row.status === "delivered"
            ? "success"
            : row.status === "cancelled"
              ? "error"
              : "default"
        }
      />
    ),
  },
  {
    field: "total",
    headerName: "Total",
    type: "number",
    minWidth: 105,
    flex: 0.75,
    renderCell: ({ row }) => money(row.total),
  },
];

export const dashboardStockColumns: GridColDef<Book>[] = [
  { field: "title", headerName: "Book", flex: 2, minWidth: 165 },
  {
    field: "stock",
    headerName: "In stock",
    type: "number",
    flex: 1,
    minWidth: 90,
    renderCell: ({ row }) => (
      <Chip
        label={row.stock}
        size="small"
        color={row.stock === 0 ? "error" : "warning"}
      />
    ),
  },
];
