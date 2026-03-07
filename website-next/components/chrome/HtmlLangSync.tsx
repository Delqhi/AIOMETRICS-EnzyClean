"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n";

interface HtmlLangSyncProps {
  locale: Locale;
}

export default function HtmlLangSync({ locale }: HtmlLangSyncProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
