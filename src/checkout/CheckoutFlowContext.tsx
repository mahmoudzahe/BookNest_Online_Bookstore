import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import type { Coupon, OrderItem, ShippingInformation } from "../types/order";

export interface CheckoutDraft {
  userId: string;
  shipping: ShippingInformation;
  items: OrderItem[];
  coupon: Coupon | null;
  subtotal: number;
  discount: number;
  total: number;
}

type CheckoutFlowContextValue = {
  draft: CheckoutDraft | null;
  saveDraft: (value: CheckoutDraft) => void;
  clearDraft: () => void;
  returningFromPayment: boolean;
};

const CheckoutFlowContext = createContext<CheckoutFlowContextValue | null>(
  null,
);

export function CheckoutFlowProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);
  const returningFromPayment =
    pathname === "/checkout" && previousPathname.current === "/payment";
  const clearDraft = useCallback(() => setDraft(null), []);

  useEffect(() => {
    previousPathname.current = pathname;
  }, [pathname]);

  return (
    <CheckoutFlowContext.Provider
      value={{
        draft,
        saveDraft: setDraft,
        clearDraft,
        returningFromPayment,
      }}
    >
      {children}
    </CheckoutFlowContext.Provider>
  );
}

export function useCheckoutFlow() {
  const context = useContext(CheckoutFlowContext);
  if (!context) {
    throw new Error("useCheckoutFlow must be used within CheckoutFlowProvider");
  }
  return context;
}
