import axios from "axios";
import type { Coupon, NewOrder, Order } from "../types/order";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

export async function findCoupon(code: string): Promise<Coupon | null> {
  const response = await api.get<Coupon[]>("/coupons", {
    params: {
      code: code.trim().toUpperCase(),
    },
  });

  return response.data.find((coupon) => coupon.active) ?? null;
}

export async function createOrder(order: NewOrder): Promise<Order> {
  const response = await api.post<Order>("/orders", order);
  return response.data;
}

export async function getOrder(id: string): Promise<Order> {
  const response = await api.get<Order>(`/orders/${id}`);
  return response.data;
}