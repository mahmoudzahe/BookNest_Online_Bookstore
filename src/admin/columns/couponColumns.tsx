import { Chip, IconButton, Stack, Switch, Tooltip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import type { Coupon } from "../../types/order";

export function couponColumns(
  onEdit: (coupon: Coupon) => void,
  onDelete: (coupon: Coupon) => void,
  onToggle: (coupon: Coupon) => void,
): GridColDef<Coupon>[] {
  return [
    { field: "code", headerName: "Code", minWidth: 135, flex: 1.3 },
    {
      field: "discountPercent",
      headerName: "Discount",
      minWidth: 100,
      flex: 1,
      renderCell: ({ row }) => `${row.discountPercent}%`,
    },
    {
      field: "active",
      headerName: "Status",
      minWidth: 120,
      flex: 1,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={row.active ? "Active" : "Inactive"}
          color={row.active ? "success" : "default"}
        />
      ),
    },
    {
      field: "enabled",
      headerName: "Enabled",
      minWidth: 100,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <Switch
          size="small"
          checked={row.active}
          onChange={() => void onToggle(row)}
          slotProps={{ input: { "aria-label": `Enable ${row.code}` } }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 115,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" sx={{ alignItems: "center", height: "100%" }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => onEdit(row)}
              aria-label={`Edit ${row.code}`}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(row)}
              aria-label={`Delete ${row.code}`}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];
}
