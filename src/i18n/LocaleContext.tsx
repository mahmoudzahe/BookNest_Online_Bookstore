"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  translate,
  type Locale,
  type TranslationValues,
  LOCALE_COOKIE,
} from "./translation";

type LocaleContextValue = {
  locale: Locale;
  direction: "ltr" | "rtl";
  changeLocale: (next: Locale) => void;
  t: (message: string, values?: TranslationValues) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const value = useMemo<LocaleContextValue>(
    () => ({
      locale: initialLocale,
      direction: initialLocale === "ar" ? "rtl" : "ltr",
      t: (message, variables) => translate(initialLocale, message, variables),
      changeLocale: (next) => {
        if (next === initialLocale) return;
        document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
        window.location.reload();
      },
    }),
    [initialLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useI18n(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useI18n must be used within LocaleProvider");
  return value;
}

export function T({
  text,
  values,
}: {
  text: string;
  values?: TranslationValues;
}) {
  const { t } = useI18n();
  return <>{t(text, values)}</>;
}
