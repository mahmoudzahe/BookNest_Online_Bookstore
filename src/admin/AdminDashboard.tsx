"use client";

import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { DataGrid } from "@mui/x-data-grid";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PeopleIcon from "@mui/icons-material/People";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import { deliveredRevenue } from "@/utils/dashboardAnalytics";
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
import { T, useI18n } from "@/i18n/LocaleContext";
import { useAdminOverview } from "./hooks/useAdminOverview";
import {
  dashboardOrderColumns,
  dashboardStockColumns,
} from "./columns/dashboardColumns";

const MonthlyRevenueChart = dynamic(
  () =>
    import("@/components/dashboard/DashboardCharts").then(
      (module) => module.MonthlyRevenueChart,
    ),
  { ssr: false },
);

const OrderStatusChart = dynamic(
  () =>
    import("@/components/dashboard/DashboardCharts").then(
      (module) => module.OrderStatusChart,
    ),
  { ssr: false },
);

function dashboardTableHeight(rowCount: number): number {
  return ADMIN_TABLE_HEADER_HEIGHT + Math.max(1, rowCount) * ADMIN_TABLE_ROW_HEIGHT;
}

export default function AdminDashboard() {
  const { t, locale } = useI18n();
  const { data, loading, error } = useAdminOverview(t);

  const orders = (data?.orders ?? []).filter((order) => !order.archived);
  const lowStock = (data?.books ?? [])
    .filter((book) => book.stock <= ADMIN_LOW_STOCK_LIMIT)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, ADMIN_LOW_STOCK_DISPLAY_LIMIT);
  const recentOrders = orders.slice(0, ADMIN_RECENT_ORDERS_LIMIT);

  const stats = [
    {
      label: t("Total Books"),
      count: String(data?.books.length ?? 0),
      icon: <MenuBookOutlinedIcon />,
      link: "/admin/books",
      accent: "teal",
    },
    {
      label: t("Total Orders"),
      count: String(orders.length),
      icon: <ReceiptLongOutlinedIcon />,
      link: "/admin/orders",
      accent: "blue",
    },
    {
      label: t("Customers"),
      count: String(
        data?.users.filter((user) => user.role === "user" && !user.archived)
          .length ?? 0,
      ),
      icon: <PeopleIcon />,
      link: "/admin/users",
      accent: "purple",
    },
    {
      label: t("Delivered Revenue"),
      count: money(deliveredRevenue(orders)),
      icon: <PaymentsOutlinedIcon />,
      link: "/admin/orders",
      accent: "amber",
    },
  ] as const;

  return (
    <>
      <PageHeading
        title={t("Overview")}
        description={t("A quick look at your bookstore performance.")}
      />
      <LoadError error={error} loading={loading} />
      {data && (
        <Stack spacing={3}>
          <Grid container spacing={2.5}>
            {stats.map((stat) => (
              <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
                <DashboardStatCard
                  label={stat.label}
                  value={stat.count}
                  icon={stat.icon}
                  href={stat.link}
                  accent={stat.accent}
                />
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 7 }} sx={{ minWidth: 0 }}>
              <MonthlyRevenueChart
                orders={orders}
                locale={locale}
                title={t("Revenue trend")}
                description={t(
                  "Revenue from delivered orders over the past six months.",
                )}
                emptyMessage={t("No delivered sales in this period.")}
                seriesLabel={t("Delivered Revenue")}
                variant="line"
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 5 }} sx={{ minWidth: 0 }}>
              <OrderStatusChart
                orders={orders}
                title={t("Order breakdown")}
                description={t("Current orders grouped by status.")}
                emptyMessage={t("No order activity to display.")}
                translate={t}
              />
            </Grid>
          </Grid>
          <Grid container columns={{ xs: 12, xl: 5 }} spacing={3}>
            <Grid size={{ xs: 12, xl: 3 }} sx={{ minWidth: 0 }}>
              <Paper variant="outlined" className="BookNest-dashboardPanel">
                <Stack spacing={2}>
                  <Typography variant="h6" className="BookNest-textWeight700">
                    <T text="Recent Orders" />
                  </Typography>
                  <Box sx={{ width: "100%", height: dashboardTableHeight(recentOrders.length) }}>
                    <DataGrid
                      rows={recentOrders}
                      columns={dashboardOrderColumns.map((col) => ({
                        ...col,
                        headerName: t(col.headerName ?? ""),
                      }))}
                      rowHeight={ADMIN_TABLE_ROW_HEIGHT}
                      columnHeaderHeight={ADMIN_TABLE_HEADER_HEIGHT}
                      hideFooter
                      disableRowSelectionOnClick
                      disableColumnMenu
                      className="BookNest-adminDataGrid"
                      localeText={{ noRowsLabel: t("No orders yet.") }}
                    />
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, xl: 2 }} sx={{ minWidth: 0 }}>
              <Paper variant="outlined" className="BookNest-dashboardPanel">
                <Stack spacing={2}>
                  <Typography variant="h6" className="BookNest-textWeight700">
                    <T text="Low Stock Books" />
                  </Typography>
                  <Box sx={{ width: "100%", height: dashboardTableHeight(lowStock.length) }}>
                    <DataGrid
                      rows={lowStock}
                      columns={dashboardStockColumns.map((col) => ({
                        ...col,
                        headerName: t(col.headerName ?? ""),
                      }))}
                      rowHeight={ADMIN_TABLE_ROW_HEIGHT}
                      columnHeaderHeight={ADMIN_TABLE_HEADER_HEIGHT}
                      hideFooter
                      disableRowSelectionOnClick
                      disableColumnMenu
                      className="BookNest-adminDataGrid"
                      localeText={{ noRowsLabel: t("Stock levels look good.") }}
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
