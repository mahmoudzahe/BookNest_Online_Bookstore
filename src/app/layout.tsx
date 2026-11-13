import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import Providers from "./providers";
import LocalizedCacheProvider from "@/i18n/LocalizedCacheProvider";
import { isLocale } from "@/i18n/translation";
import "@/index.css";

export async function generateMetadata(): Promise<Metadata> {
  const value = (await cookies()).get("booknest-locale")?.value;
  const locale = isLocale(value) ? value : "en";
  return {
    title:
      locale === "ar"
        ? "BookNest | متجر الكتب الإلكتروني"
        : "BookNest | Online Bookstore",
    description:
      locale === "ar"
        ? "تصفح الكتب وأدر طلباتك بسهولة عبر BookNest."
        : "Discover books and manage your orders with BookNest.",
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const value = (await cookies()).get("booknest-locale")?.value;
  const locale = isLocale(value) ? value : "en";

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body>
        <LocalizedCacheProvider locale={locale}>
          <Providers locale={locale}>{children}</Providers>
        </LocalizedCacheProvider>
      </body>
    </html>
  );
}
