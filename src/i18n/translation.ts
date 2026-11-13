import { ar } from "./ar";
import { en, type TranslationKey } from "./en";

export type Locale = "en" | "ar";

export const LOCALE_COOKIE = "booknest-locale";

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "ar";
}

export type TranslationValues = Record<string, string | number>;
export type Translator = (
  message: string,
  values?: TranslationValues,
) => string;

const keyByEnglish = new Map<string, TranslationKey>(
  Object.entries(en).map(([key, message]) => [message, key as TranslationKey]),
);

export function translate(
  locale: Locale,
  message: string,
  values: TranslationValues = {},
): string {
  const key = keyByEnglish.get(message);
  const template = key ? (locale === "ar" ? ar[key] : en[key]) : message;

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (full, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : full,
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
