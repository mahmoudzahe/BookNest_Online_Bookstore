import { useEffect, useState } from "react";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { Link as RouterLink } from "react-router-dom";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PeopleIcon from "@mui/icons-material/People";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import type { Order } from "../types/order";
import { getAdminOverview } from "../services/adminApi";
import { LoadError, PageHeading, money } from "./AdminCommon";

const orderColumns: GridColDef<Order>[] = [
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
        label={row.status}
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

export default function AdminDashboard() {
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getAdminOverview>
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAdminOverview()
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active)
          setError("Could not load store statistics. Check JSON Server.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const lowStock = (data?.books ?? [])
    .filter((book) => book.stock <= 5)
    .sort((a, b) => a.stock - b.stock);
  const recentOrders = (data?.orders ?? [])
    .filter((order) => !order.archived)
    .slice(0, 5);
  const deliveredRevenue = (data?.orders ?? [])
    .filter((order) => order.status === "delivered")
    .reduce((total, order) => total + order.total, 0);

  const stats = [
    {
      label: "Total Books",
      count: String(data?.books.length ?? 0),
      icon: <MenuBookOutlinedIcon />,
      link: "/admin/books",
    },
    {
      label: "Total Orders",
      count: String(
        data?.orders.filter((order) => !order.archived).length ?? 0,
      ),
      icon: <ReceiptLongOutlinedIcon />,
      link: "/admin/orders",
    },
    {
      label: "Customers",
      count: String(
        data?.users.filter((user) => user.role === "user" && !user.archived)
          .length ?? 0,
      ),
      icon: <PeopleIcon />,
      link: "/admin/users",
    },
    {
      label: "Delivered Revenue",
      count: money(deliveredRevenue),
      icon: <PaymentsOutlinedIcon />,
      link: "/admin/orders",
    },
  ];

  return (
    <>
      <PageHeading
        title="Overview"
        description="A quick look at your bookstore performance."
      />
      <LoadError error={error} loading={loading} />

      {data && (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2.5,
              mb: 3,
            }}
          >
            {stats.map((stat) => (
              <Paper
                key={stat.label}
                component={RouterLink}
                to={stat.link}
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  textDecoration: "none",
                  color: "text.primary",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 1,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "text.secondary",
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: "2rem", md: "2.3rem" },
                      fontWeight: 800,
                      mt: 0.75,
                      lineHeight: 1.2,
                    }}
                  >
                    {stat.count}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: "action.hover",
                    color: "primary.main",
                    p: 1.2,
                    borderRadius: 2,
                  }}
                >
                  {stat.icon}
                </Box>
              </Paper>
            ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", xl: "1.5fr 1fr" },
              gap: 3,
            }}
          >
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 3, minWidth: 0 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Recent Orders
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  height: 60 + Math.max(1, recentOrders.length) * 52,
                }}
              >
                <DataGrid
                  rows={recentOrders}
                  columns={orderColumns}
                  rowHeight={52}
                  columnHeaderHeight={52}
                  hideFooter
                  disableRowSelectionOnClick
                  disableColumnMenu
                  sx={{
                    border: 0,
                    "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700 },
                  }}
                  localeText={{ noRowsLabel: "No orders yet." }}
                />
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Low Stock Books
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Book</TableCell>
                      <TableCell align="right">In stock</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStock.slice(0, 7).map((book) => (
                      <TableRow key={book.id}>
                        <TableCell>{book.title}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={book.stock}
                            size="small"
                            color={book.stock === 0 ? "error" : "warning"}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {lowStock.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2}>
                          Stock levels look good.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </>
      )}
    </>
  );
}
