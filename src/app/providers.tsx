"use client";

import type { ReactNode } from "react";
import { ThemeModeProvider } from "@/theme/ThemeModeContext";
import { AuthProvider } from "@/auth/AuthContext";
import { CartProvider } from "@/cart/CartContext";
import { CheckoutFlowProvider } from "@/checkout/CheckoutFlowContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <CartProvider>
          <CheckoutFlowProvider>{children}</CheckoutFlowProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeModeProvider>
  );
}
