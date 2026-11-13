import { IconButton, Stack, Tooltip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import type { CategoryRow } from "../hooks/useAdminCategories";
import type { Translator } from "@/i18n/translation";

export function categoryColumns(
  onEdit: (row: CategoryRow) => void,
  onDelete: (row: CategoryRow) => void,
  t: Translator,
): GridColDef<CategoryRow>[] {
  return [
    {
      field: "name",
      headerName: t("Category"),
      flex: 2,
      minWidth: 160,
      valueFormatter: (value: string) => t(value),
    },
    {
      field: "bookCount",
      headerName: t("Books"),
      type: "number",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "actions",
      headerName: t("Actions"),
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" sx={{ alignItems: "center", height: "100%" }}>
          <Tooltip title={t("Rename")}>
            <IconButton
              size="small"
              onClick={() => onEdit(row)}
              aria-label={t("Rename {name}", { name: t(row.name) })}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              row.bookCount
                ? t("Cannot delete a category containing books")
                : t("Delete")
            }
          >
            <span>
              <IconButton
                size="small"
                color="error"
                disabled={row.bookCount > 0}
                onClick={() => onDelete(row)}
                aria-label={t("Delete {name}", { name: t(row.name) })}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      ),
    },
  ];
}
