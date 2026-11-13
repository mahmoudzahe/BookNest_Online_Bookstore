import type { Order } from "@/types/order";
import type { Locale } from "@/i18n/translation";

export const DASHBOARD_MONTHS = 6;

export const ORDER_STATUSES = [
  "pending",
  "shipped",
  "delivered",
  "cancelled",
] as const satisfies readonly Order["status"][];

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type MonthlyRevenue = {
  key: string;
  label: string;
  revenue: number;
};

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function deliveredRevenue(orders: readonly Order[]): number {
  return orders
    .filter((order) => order.status === "delivered")
    .reduce((sum, order) => sum + order.total, 0);
}

export function orderStatusCounts(
  orders: readonly Order[],
): Record<OrderStatus, number> {
  const counts: Record<OrderStatus, number> = {
    pending: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  for (const order of orders) {
    counts[order.status] += 1;
  }

  return counts;
}

export function deliveredBookCount(orders: readonly Order[]): number {
  return orders
    .filter((order) => order.status === "delivered")
    .reduce(
      (total, order) =>
        total + order.items.reduce((count, item) => count + item.quantity, 0),
      0,
    );
}

export function monthlyDeliveredRevenue(
  orders: readonly Order[],
  locale: Locale,
  today: Date = new Date(),
): MonthlyRevenue[] {
  const months = Array.from({ length: DASHBOARD_MONTHS }, (_, index) => {
    const date = new Date(
      today.getFullYear(),
      today.getMonth() - (DASHBOARD_MONTHS - index - 1),
      1,
    );
    return {
      key: monthKey(date),
      label: new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
        month: "short",
      }).format(date),
      revenue: 0,
    };
  });

  const byMonth = new Map(months.map((month) => [month.key, month]));

  for (const order of orders) {
    if (order.status !== "delivered") continue;
    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) continue;
    const month = byMonth.get(monthKey(date));
    if (month) month.revenue += order.total;
  }

  return months;
}

export function orderDate(date: string, locale: Locale): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
    dateStyle: "medium",
  }).format(parsed);
}
