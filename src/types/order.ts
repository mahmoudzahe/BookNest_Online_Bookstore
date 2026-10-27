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

export type PaymentMethod = "cash_on_delivery" | "card_demo";

export interface Order {
  id: string;
  userId: string | null;
  items: OrderItem[];
  shipping: ShippingInformation;
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  paymentMethod?: PaymentMethod;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  archived?: boolean;
}

export type NewOrder = Omit<Order, "id">;
