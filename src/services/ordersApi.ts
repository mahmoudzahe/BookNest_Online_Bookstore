import axios from "axios";
import type { Order } from "../types/order";

const api = axios.create({ baseURL: "http://localhost:3001" });

export async function getUserOrders(userId: string): Promise<Order[]> {
  const response = await api.get<Order[]>("/orders", { params: { userId } });
  return response.data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getUserOrder(id: string, userId: string): Promise<Order> {
  const response = await api.get<Order>(`/orders/${id}`);
  if (response.data.userId !== userId) throw new Error("Order not found.");
  return response.data;
}

export async function cancelUserOrder(
  id: string,
  userId: string,
): Promise<Order> {
  const order = await getUserOrder(id, userId);
  if (order.status !== "pending")
    throw new Error("Only pending orders can be cancelled.");
  const response = await api.patch<Order>(`/orders/${id}`, {
    status: "cancelled",
  });
  return response.data;
}
