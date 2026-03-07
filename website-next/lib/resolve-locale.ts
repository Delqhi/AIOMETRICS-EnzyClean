import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";

export function resolveLocale(value: string): Locale {
  if (!isLocale(value)) {
    notFound();
  }

  return value;
}
