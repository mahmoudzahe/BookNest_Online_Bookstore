export interface ShippingInformation {
  fullName: string;
  phone: string;
  address: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
}

export interface OrderItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string | null;
  items: OrderItem[];
  shipping: ShippingInformation;
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

export type NewOrder = Omit<Order, "id">;