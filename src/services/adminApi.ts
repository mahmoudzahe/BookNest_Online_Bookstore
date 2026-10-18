import axios from "axios";
import type { Book, Category } from "../types/book";
import type { Coupon, Order } from "../types/order";
import type { AuthUser, UserRecord } from "../types/user";

const api = axios.create({ baseURL: "http://localhost:3001" });

export type BookInput = Pick<
  Book,
  | "title"
  | "author"
  | "description"
  | "categoryId"
  | "price"
  | "stock"
  | "image"
  | "featured"
>;
export type CouponInput = Pick<Coupon, "code" | "discountPercent" | "active">;

export async function saveBook(data: BookInput, id?: string) {
  if (id) {
    await api.patch(`/books/${id}`, data);
  } else {
    await api.post("/books", {
      ...data,
      rating: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    });
  }
}
export async function removeBook(id: string) {
  await api.delete(`/books/${id}`);
}
export async function setBookFeatured(id: string, featured: boolean) {
  await api.patch(`/books/${id}`, { featured });
}

export async function saveCategory(name: string, id?: string) {
  if (id) await api.patch(`/categories/${id}`, { name });
  else await api.post("/categories", { name });
}
export async function removeCategory(id: string) {
  await api.delete(`/categories/${id}`);
}

export async function getAdminOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>("/orders");
  return response.data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function changeOrderStatus(id: string, status: Order["status"]) {
  await api.patch(`/orders/${id}`, { status });
}

function publicUser({
  id,
  firstName,
  lastName,
  email,
  phone,
  address,
  role,
  active,
}: UserRecord): AuthUser {
  return {
    id,
    firstName,
    lastName,
    email,
    phone,
    address,
    role,
    active: active !== false,
  };
}
export async function getAdminUsers(): Promise<AuthUser[]> {
  const response = await api.get<UserRecord[]>("/users");
  return response.data.map(publicUser);
}
export async function changeUserRole(id: string, role: AuthUser["role"]) {
  await api.patch(`/users/${id}`, { role });
}
export async function changeUserActive(id: string, active: boolean) {
  await api.patch(`/users/${id}`, { active });
}
export async function removeUser(id: string) {
  await api.delete(`/users/${id}`);
}

export async function getAdminCoupons(): Promise<Coupon[]> {
  const response = await api.get<Coupon[]>("/coupons");
  return response.data;
}
export async function saveCoupon(data: CouponInput, id?: string) {
  if (id) await api.patch(`/coupons/${id}`, data);
  else await api.post("/coupons", data);
}
export async function removeCoupon(id: string) {
  await api.delete(`/coupons/${id}`);
}
export async function setCouponActive(id: string, active: boolean) {
  await api.patch(`/coupons/${id}`, { active });
}

export async function getAdminOverview(): Promise<{
  books: Book[];
  categories: Category[];
  users: AuthUser[];
  orders: Order[];
  coupons: Coupon[];
}> {
  const [bookResponse, categoriesResponse, users, orders, coupons] =
    await Promise.all([
      api.get<Book[]>("/books"),
      api.get<Category[]>("/categories"),
      getAdminUsers(),
      getAdminOrders(),
      getAdminCoupons(),
    ]);
  return {
    books: bookResponse.data,
    categories: categoriesResponse.data,
    users,
    orders,
    coupons,
  };
}
