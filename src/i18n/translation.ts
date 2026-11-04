export type Locale = "en" | "ar";

export const LOCALE_COOKIE = "booknest-locale";

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "ar";
}

import { arabic } from "./arabic";

export type TranslationValues = Record<string, string | number>;
export type Translator = (
  message: string,
  values?: TranslationValues,
) => string;

export function translate(
  locale: Locale,
  message: string,
  values: TranslationValues = {},
): string {
  const template = locale === "ar" ? (arabic[message] ?? message) : message;
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (full, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : full,
  );
}

export function translateInBrowser(
  message: string,
  values?: TranslationValues,
) {
  if (typeof document === "undefined") return translate("en", message, values);
  return translate(
    document.documentElement.lang === "ar" ? "ar" : "en",
    message,
    values,
  );
}
