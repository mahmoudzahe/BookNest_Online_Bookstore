"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RouterLink from "@/components/NextLink";
import { useAuth } from "@/auth/AuthContext";
import { useI18n } from "@/i18n/LocaleContext";
import { getUserOrders } from "@/services/ordersApi";
import { money } from "@/admin/formatters";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import UserDashboardHero from "@/components/dashboard/UserDashboardHero";
import {
  deliveredBookCount,
  deliveredRevenue,
  orderDate,
} from "@/utils/dashboardAnalytics";
import type { Order } from "@/types/order";

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

function statusColor(status: Order["status"]) {
  switch (status) {
    case "delivered":
      return "success";
    case "shipped":
      return "info";
    case "cancelled":
      return "default";
    default:
      return "warning";
  }
}

export default function UserDashboard() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let active = true;

    getUserOrders(user.id)
      .then((result) => {
        if (active) setOrders(result);
      })
      .catch(() => {
        if (active)
          setError(t("Could not load your dashboard. Please try again."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.id, t]);

  const delivered = orders.filter((order) => order.status === "delivered");
  const onTheWay = orders.filter(
    (order) => order.status === "pending" || order.status === "shipped",
  ).length;
  const stats = [
    {
      label: t("Orders placed"),
      value: String(orders.length),
      icon: <ReceiptLongOutlinedIcon />,
      accent: "blue",
    },
    {
      label: t("Completed spending"),
      value: money(deliveredRevenue(orders)),
      icon: <PaymentsOutlinedIcon />,
      accent: "teal",
    },
    {
      label: t("Books purchased"),
      value: String(deliveredBookCount(delivered)),
      icon: <MenuBookOutlinedIcon />,
      accent: "purple",
    },
    {
      label: t("Orders on the way"),
      value: String(onTheWay),
      icon: <LocalShippingOutlinedIcon />,
      accent: "amber",
    },
  ] as const;

  return (
    <Box sx={{ minHeight: "75vh", bgcolor: "background.default" }}>
      <Container
        maxWidth="xl"
        sx={{ maxWidth: 1320, py: { xs: 3, sm: 5, md: 6 } }}
      >
        <Stack spacing={{ xs: 3, md: 4 }}>
          <UserDashboardHero firstName={user?.firstName} />

          {loading && (
            <Stack sx={{ alignItems: "center", py: 7 }}>
              <CircularProgress aria-label={t("Loading dashboard")} />
            </Stack>
          )}
          {error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && (
            <>
              <Grid container spacing={2.5}>
                {stats.map((stat) => (
                  <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
                    <DashboardStatCard
                      label={stat.label}
                      value={stat.value}
                      icon={stat.icon}
                      accent={stat.accent}
                      href="/my-orders"
                    />
                  </Grid>
                ))}
              </Grid>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 7 }} sx={{ minWidth: 0 }}>
                  <MonthlyRevenueChart
                    orders={orders}
                    locale={locale}
                    title={t("Your spending")}
                    description={t(
                      "Completed purchases over the past six months.",
                    )}
                    emptyMessage={t("No completed purchases in this period.")}
                    seriesLabel={t("Completed spending")}
                    variant="bar"
                  />
                </Grid>
                <Grid size={{ xs: 12, lg: 5 }} sx={{ minWidth: 0 }}>
                  <OrderStatusChart
                    orders={orders}
                    title={t("Your order statuses")}
                    description={t("How your orders are progressing.")}
                    emptyMessage={t("No orders to analyze yet.")}
                    translate={t}
                  />
                </Grid>
              </Grid>

              <Paper
                variant="outlined"
                sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3 }}
              >
                <Stack spacing={2.5}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    sx={{
                      alignItems: { sm: "center" },
                      justifyContent: "space-between",
                      gap: 1.5,
                    }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {t("Latest orders")}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {t("Your most recent purchases and their progress.")}
                      </Typography>
                    </Box>
                    <Button
                      component={RouterLink}
                      href="/my-orders"
                      endIcon={<ArrowForwardRoundedIcon />}
                      sx={{ alignSelf: "flex-start", fontWeight: 700 }}
                    >
                      {t("View all orders")}
                    </Button>
                  </Stack>

                  {orders.length === 0 ? (
                    <Stack
                      spacing={1.25}
                      sx={{
                        alignItems: "center",
                        textAlign: "center",
                        py: { xs: 4, sm: 6 },
                      }}
                    >
                      <AutoStoriesOutlinedIcon
                        sx={{ fontSize: 46, color: "primary.main" }}
                      />
                      <Typography sx={{ fontWeight: 700 }}>
                        {t("You haven't placed an order yet.")}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {t("Discover a new favorite book to get started.")}
                      </Typography>
                      <Button
                        component={RouterLink}
                        href="/books"
                        variant="contained"
                      >
                        {t("Explore books")}
                      </Button>
                    </Stack>
                  ) : (
                    <Stack spacing={1.5}>
                      {orders.slice(0, 4).map((order) => (
                        <Stack
                          key={order.id}
                          direction={{ xs: "column", sm: "row" }}
                          sx={{
                            justifyContent: "space-between",
                            alignItems: { sm: "center" },
                            gap: 1.75,
                            p: { xs: 2, sm: 2.5 },
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2.5,
                            bgcolor: "background.default",
                          }}
                        >
                          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 800 }}>
                              {t("Order #")}
                              {order.id}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                              {orderDate(order.createdAt, locale)}
                              {" • "}
                              {t("Books: {count}", {
                                count: order.items.reduce(
                                  (count, item) => count + item.quantity,
                                  0,
                                ),
                              })}
                            </Typography>
                          </Stack>
                          <Stack
                            direction="row"
                            useFlexGap
                            sx={{
                              flexWrap: "wrap",
                              alignItems: "center",
                              gap: { xs: 1.5, sm: 2.5 },
                            }}
                          >
                            <Chip
                              label={t(order.status)}
                              size="small"
                              color={statusColor(order.status)}
                              sx={{ fontWeight: 700 }}
                            />
                            <Typography sx={{ fontWeight: 800 }}>
                              {money(order.total)}
                            </Typography>
                            <Button
                              component={RouterLink}
                              href={`/my-orders/${order.id}`}
                              size="small"
                            >
                              {t("View details")}
                            </Button>
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Paper>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
