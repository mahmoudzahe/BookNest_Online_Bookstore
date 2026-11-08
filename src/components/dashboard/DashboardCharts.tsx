"use client";

import type { ReactNode } from "react";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import DonutLargeOutlinedIcon from "@mui/icons-material/DonutLargeOutlined";
import type { Order } from "@/types/order";
import type { Locale } from "@/i18n/translation";
import { money } from "@/admin/formatters";
import {
  monthlyDeliveredRevenue,
  ORDER_STATUSES,
  orderStatusCounts,
} from "@/utils/dashboardAnalytics";
import {
  REVENUE_CHART_HEIGHT,
  REVENUE_AXIS_WIDTH,
  REVENUE_BAR_CORNER_RADIUS,
  ORDER_STATUS_CHART_HEIGHT,
  ORDER_STATUS_CHART_INNER_RADIUS,
  ORDER_STATUS_CHART_OUTER_RADIUS,
  ORDER_STATUS_CHART_PADDING_ANGLE,
  ORDER_STATUS_CHART_CORNER_RADIUS,
} from "./chartConstants";

function ChartPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        height: "100%",
        p: { xs: 2.25, md: 3 },
        borderRadius: 3,
        minWidth: 0,
      }}
    >
      <Stack spacing={2.25}>
        <Stack spacing={0.45}>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.35 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>
        <Divider />
        {children}
      </Stack>
    </Paper>
  );
}

function ChartEmpty({
  label,
  kind,
}: {
  label: string;
  kind: "revenue" | "status";
}) {
  const theme = useTheme();
  const Icon =
    kind === "revenue" ? QueryStatsOutlinedIcon : DonutLargeOutlinedIcon;

  return (
    <Stack
      role="status"
      spacing={1.5}
      sx={{
        alignItems: "center",
        justifyContent: "center",
        minHeight: 285,
        bgcolor: alpha(theme.palette.primary.main, 0.035),
        borderRadius: 2.5,
        p: 3,
        textAlign: "center",
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "center",
          color: "primary.main",
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          borderRadius: "50%",
          width: 58,
          height: 58,
        }}
      >
        <Icon fontSize="large" />
      </Stack>
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
    </Stack>
  );
}

export function MonthlyRevenueChart({
  orders,
  locale,
  title,
  description,
  emptyMessage,
  seriesLabel,
  variant,
}: {
  orders: Order[];
  locale: Locale;
  title: string;
  description: string;
  emptyMessage: string;
  seriesLabel: string;
  variant: "bar" | "line";
}) {
  const theme = useTheme();
  const data = monthlyDeliveredRevenue(orders, locale);
  const values = data.map((month) => month.revenue);
  const hasRevenue = values.some((value) => value > 0);
  const series = [
    {
      id: "delivered-revenue",
      data: values,
      label: seriesLabel,
      color: theme.dashboard.revenueColor,
      valueFormatter: (value: number | null) => money(value ?? 0),
    },
  ];

  return (
    <ChartPanel title={title} description={description}>
      {!hasRevenue ? (
        <ChartEmpty label={emptyMessage} kind="revenue" />
      ) : (
        <Box sx={{ width: "100%", minWidth: 0 }}>
          {variant === "bar" ? (
            <BarChart
              height={REVENUE_CHART_HEIGHT}
              xAxis={[
                { scaleType: "band", data: data.map((month) => month.label) },
              ]}
              yAxis={[{ width: REVENUE_AXIS_WIDTH }]}
              series={series}
              grid={{ horizontal: true }}
              borderRadius={REVENUE_BAR_CORNER_RADIUS}
              hideLegend
            />
          ) : (
            <LineChart
              height={REVENUE_CHART_HEIGHT}
              xAxis={[
                { scaleType: "point", data: data.map((month) => month.label) },
              ]}
              yAxis={[{ width: REVENUE_AXIS_WIDTH }]}
              series={series}
              grid={{ horizontal: true }}
              hideLegend
            />
          )}
        </Box>
      )}
    </ChartPanel>
  );
}

export function OrderStatusChart({
  orders,
  title,
  description,
  emptyMessage,
  translate,
}: {
  orders: Order[];
  title: string;
  description: string;
  emptyMessage: string;
  translate: (message: string) => string;
}) {
  const theme = useTheme();
  const counts = orderStatusCounts(orders);
  const entries = ORDER_STATUSES.filter((status) => counts[status] > 0);
  const data = entries.map((status) => ({
    id: status,
    value: counts[status],
    label: translate(status),
    color: theme.dashboard.statusColors[status],
  }));

  return (
    <ChartPanel title={title} description={description}>
      {data.length === 0 ? (
        <ChartEmpty label={emptyMessage} kind="status" />
      ) : (
        <Stack spacing={1} sx={{ minWidth: 0, alignItems: "center" }}>
          <Box sx={{ width: "100%" }}>
            <PieChart
              height={ORDER_STATUS_CHART_HEIGHT}
              series={[
                {
                  data,
                  innerRadius: ORDER_STATUS_CHART_INNER_RADIUS,
                  outerRadius: ORDER_STATUS_CHART_OUTER_RADIUS,
                  paddingAngle: ORDER_STATUS_CHART_PADDING_ANGLE,
                  cornerRadius: ORDER_STATUS_CHART_CORNER_RADIUS,
                },
              ]}
              hideLegend
            />
          </Box>
          <Stack
            direction="row"
            useFlexGap
            sx={{
              flexWrap: "wrap",
              justifyContent: "center",
              columnGap: 2,
              rowGap: 1,
              width: "100%",
              pb: 1,
            }}
          >
            {data.map((entry) => (
              <Stack
                key={entry.id}
                direction="row"
                spacing={0.75}
                sx={{ alignItems: "center" }}
              >
                <Box
                  sx={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    bgcolor: entry.color,
                    boxShadow: `0 0 0 3px ${alpha(entry.color, 0.14)}`,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {entry.label}
                  <Box
                    component="span"
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: 800,
                      mx: 0.5,
                    }}
                  >
                    {entry.value}
                  </Box>
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      )}
    </ChartPanel>
  );
}
