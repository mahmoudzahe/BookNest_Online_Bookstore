"use client";

import { useEffect, useState } from "react";
import { Box, Chip, Grid, Paper, Stack, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import RouterLink from "../components/NextLink";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PeopleIcon from "@mui/icons-material/People";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import type { Order } from "../types/order";
import type { Book } from "../types/book";
import { getAdminOverview } from "../services/adminApi";
import { PageHeading } from "./AdminCommon";
import LoadError from "./components/LoadError";
import { money } from "./formatters";
import {
  ADMIN_LOW_STOCK_LIMIT,
  ADMIN_LOW_STOCK_DISPLAY_LIMIT,
  ADMIN_RECENT_ORDERS_LIMIT,
  ADMIN_TABLE_HEADER_HEIGHT,
  ADMIN_TABLE_ROW_HEIGHT,
} from "./constants";

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

const stockColumns: GridColDef<Book>[] = [
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
    .filter((book) => book.stock <= ADMIN_LOW_STOCK_LIMIT)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, ADMIN_LOW_STOCK_DISPLAY_LIMIT);
  const recentOrders = (data?.orders ?? [])
    .filter((order) => !order.archived)
    .slice(0, ADMIN_RECENT_ORDERS_LIMIT);
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
        <Stack spacing={3}>
          <Grid container spacing={2.5}>
            {stats.map((stat) => (
              <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Paper
                  className="BookNest-dashboardStat"
                  component={RouterLink}
                  href={stat.link}
                  variant="outlined"
                >
                  <Stack spacing={1}>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      className="BookNest-textWeight600"
                    >
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" className="BookNest-textWeight800">
                      {stat.count}
                    </Typography>
                  </Stack>
                  <Box className="BookNest-dashboardStatIcon">{stat.icon}</Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Grid container columns={{ xs: 12, xl: 5 }} spacing={3}>
            <Grid size={{ xs: 12, xl: 3 }} sx={{ minWidth: 0 }}>
              <Paper variant="outlined" className="BookNest-dashboardPanel">
                <Stack spacing={2}>
                  <Typography variant="h6" className="BookNest-textWeight700">
                    Recent Orders
                  </Typography>
                  <Box
                    sx={{
                      width: "100%",
                      height:
                        ADMIN_TABLE_HEADER_HEIGHT +
                        Math.max(1, recentOrders.length) *
                          ADMIN_TABLE_ROW_HEIGHT,
                    }}
                  >
                    <DataGrid
                      rows={recentOrders}
                      columns={orderColumns}
                      rowHeight={ADMIN_TABLE_ROW_HEIGHT}
                      columnHeaderHeight={ADMIN_TABLE_HEADER_HEIGHT}
                      hideFooter
                      disableRowSelectionOnClick
                      disableColumnMenu
                      className="BookNest-adminDataGrid"
                      localeText={{ noRowsLabel: "No orders yet." }}
                    />
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, xl: 2 }} sx={{ minWidth: 0 }}>
              <Paper variant="outlined" className="BookNest-dashboardPanel">
                <Stack spacing={2}>
                  <Typography variant="h6" className="BookNest-textWeight700">
                    Low Stock Books
                  </Typography>
                  <Box
                    sx={{
                      width: "100%",
                      height:
                        ADMIN_TABLE_HEADER_HEIGHT +
                        Math.max(1, lowStock.length) * ADMIN_TABLE_ROW_HEIGHT,
                    }}
                  >
                    <DataGrid
                      rows={lowStock}
                      columns={stockColumns}
                      rowHeight={ADMIN_TABLE_ROW_HEIGHT}
                      columnHeaderHeight={ADMIN_TABLE_HEADER_HEIGHT}
                      hideFooter
                      disableRowSelectionOnClick
                      disableColumnMenu
                      className="BookNest-adminDataGrid"
                      localeText={{ noRowsLabel: "Stock levels look good." }}
                    />
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      )}
    </>
  );
}
