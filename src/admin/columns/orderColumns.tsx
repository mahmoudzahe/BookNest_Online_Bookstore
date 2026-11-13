import { Button, Chip, IconButton, Stack, Tooltip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import RestoreIcon from "@mui/icons-material/Restore";
import type { Order } from "../../types/order";
import type { AuthUser } from "../../types/user";
import { money } from "../formatters";
import { T } from "@/i18n/LocaleContext";
import type { Translator } from "@/i18n/translation";

export function orderColumns(
  users: AuthUser[],
  onView: (order: Order) => void,
  onArchive: (order: Order) => void,
  t: Translator,
): GridColDef<Order>[] {
  return [
    {
      field: "id",
      headerName: t("Order ID"),
      flex: 1.2,
      minWidth: 155,
      renderCell: ({ row }) => `#${row.id}`,
    },
    {
      field: "customer",
      headerName: t("Customer"),
      flex: 1.2,
      minWidth: 155,
      valueGetter: (_value, row) => {
        const customer = users.find((user) => user.id === row.userId);
        return customer
          ? `${customer.firstName} ${customer.lastName}`
          : row.shipping.fullName;
      },
    },
    {
      field: "createdAt",
      headerName: t("Date"),
      minWidth: 125,
      flex: 1,
      renderCell: ({ row }) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      field: "status",
      headerName: t("Status"),
      minWidth: 120,
      flex: 1,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={t(row.status)}
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
      headerName: t("Total"),
      minWidth: 110,
      type: "number",
      flex: 0.8,
      renderCell: ({ row }) => money(row.total),
    },
    {
      field: "actions",
      headerName: t("Actions"),
      minWidth: 140,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" sx={{ alignItems: "center", height: "100%" }}>
          <Button size="small" onClick={() => onView(row)}>
            <T text="View" />
          </Button>
          <Tooltip
            title={row.archived ? t("Restore order") : t("Archive order")}
          >
            <IconButton
              size="small"
              color={row.archived ? "primary" : "error"}
              aria-label={
                row.archived ? t("Restore order") : t("Archive order")
              }
              onClick={() => onArchive(row)}
            >
              {row.archived ? (
                <RestoreIcon fontSize="small" />
              ) : (
                <DeleteOutlineIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];
}
