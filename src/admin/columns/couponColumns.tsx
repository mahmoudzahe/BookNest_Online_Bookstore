import { Chip, IconButton, Stack, Switch, Tooltip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import type { Coupon } from "../../types/order";
import type { Translator } from "@/i18n/translation";

export function couponColumns(
  onEdit: (coupon: Coupon) => void,
  onDelete: (coupon: Coupon) => void,
  onToggle: (coupon: Coupon) => void,
  t: Translator,
): GridColDef<Coupon>[] {
  return [
    { field: "code", headerName: t("Code"), minWidth: 135, flex: 1.3 },
    {
      field: "discountPercent",
      headerName: t("Discount"),
      minWidth: 100,
      flex: 1,
      renderCell: ({ row }) => `${row.discountPercent}%`,
    },
    {
      field: "active",
      headerName: t("Status"),
      minWidth: 120,
      flex: 1,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={row.active ? t("Active") : t("Inactive")}
          color={row.active ? "success" : "default"}
          sx={{
            border: "2px solid",
            borderColor: row.active ? "success.dark" : "text.secondary",
            fontWeight: 700,
          }}
        />
      ),
    },
    {
      field: "enabled",
      headerName: t("Enabled"),
      minWidth: 100,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <Switch
          size="small"
          checked={row.active}
          onChange={() => void onToggle(row)}
          slotProps={{
            input: { "aria-label": t("Enable {code}", { code: row.code }) },
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: t("Actions"),
      width: 115,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" sx={{ alignItems: "center", height: "100%" }}>
          <Tooltip title={t("Edit")}>
            <IconButton
              size="small"
              onClick={() => onEdit(row)}
              aria-label={t("Edit {code}", { code: row.code })}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("Delete")}>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(row)}
              aria-label={t("Delete {code}", { code: row.code })}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];
}
