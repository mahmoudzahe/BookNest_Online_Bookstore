"use client";

import type { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { prefixer } from "stylis";
import rtlPlugin from "@mui/stylis-plugin-rtl";
import type { Locale } from "./translation";

const ltrOptions = { key: "mui" };
const rtlOptions = { key: "muirtl", stylisPlugins: [prefixer, rtlPlugin] };

export default function LocalizedCacheProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  return (
    <AppRouterCacheProvider options={locale === "ar" ? rtlOptions : ltrOptions}>
      {children}
    </AppRouterCacheProvider>
  );
}
