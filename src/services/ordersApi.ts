import { api } from "./api";
import type { Order } from "../types/order";
import { translateInBrowser } from "@/i18n/translation";

export async function getUserOrders(userId: string): Promise<Order[]> {
  const response = await api.get<Order[]>("/orders", { params: { userId } });
  return response.data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getUserOrder(id: string, userId: string): Promise<Order> {
  const response = await api.get<Order>(`/orders/${id}`);
  if (response.data.userId !== userId)
    throw new Error(translateInBrowser("Order not found."));
  return response.data;
}

export async function cancelUserOrder(
  id: string,
  userId: string,
): Promise<Order> {
  const order = await getUserOrder(id, userId);
  if (order.status !== "pending")
    throw new Error(
      translateInBrowser("Only pending orders can be cancelled."),
    );
  const response = await api.patch<Order>(`/orders/${id}`, {
    status: "cancelled",
  });
  return response.data;
}
