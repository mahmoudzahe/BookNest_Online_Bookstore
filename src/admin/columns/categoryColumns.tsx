import { IconButton, Stack, Tooltip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import type { CategoryRow } from "../hooks/useAdminCategories";

export function categoryColumns(
  onEdit: (row: CategoryRow) => void,
  onDelete: (row: CategoryRow) => void,
): GridColDef<CategoryRow>[] {
  return [
    { field: "name", headerName: "Category", flex: 2, minWidth: 160 },
    {
      field: "bookCount",
      headerName: "Books",
      type: "number",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" sx={{ alignItems: "center", height: "100%" }}>
          <Tooltip title="Rename">
            <IconButton
              size="small"
              onClick={() => onEdit(row)}
              aria-label={`Rename ${row.name}`}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              row.bookCount
                ? "Cannot delete a category containing books"
                : "Delete"
            }
          >
            <span>
              <IconButton
                size="small"
                color="error"
                disabled={row.bookCount > 0}
                onClick={() => onDelete(row)}
                aria-label={`Delete ${row.name}`}
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
