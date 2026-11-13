"use client";

import type { ReactNode } from "react";
import { ThemeModeProvider } from "@/theme/ThemeModeContext";
import { AuthProvider } from "@/auth/AuthContext";
import { CartProvider } from "@/cart/CartContext";
import { CheckoutFlowProvider } from "@/checkout/CheckoutFlowContext";
import { LocaleProvider } from "@/i18n/LocaleContext";
import type { Locale } from "@/i18n/translation";

export default function Providers({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  return (
    <LocaleProvider initialLocale={locale}>
      <ThemeModeProvider>
        <AuthProvider>
          <CartProvider>
            <CheckoutFlowProvider>{children}</CheckoutFlowProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeModeProvider>
    </LocaleProvider>
  );
}
