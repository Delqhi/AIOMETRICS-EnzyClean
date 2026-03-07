"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { usePathname } from "next/navigation";
import { navItems, withLocale } from "@/components/chrome/nav";
import { t, type Locale } from "@/lib/i18n";
import type { ProjectId } from "@/lib/project";

const navLabelByKey = {
  home: "navHome",
  technology: "navTech",
  patent: "navPatent",
  faq: "navFaq",
  contact: "navContact",
  waitlist: "navWaitlist"
} as const;

interface HeaderProps {
  locale: Locale;
  projectId: ProjectId;
}

function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }

  return path;
}

function localizedPath(path: string, targetLocale: Locale): string {
  const normalized = normalizePath(path || "/");
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `/${targetLocale}`;
  }

  if (segments[0] === "de" || segments[0] === "en") {
    segments[0] = targetLocale;
    return `/${segments.join("/")}`;
  }

  return `/${[targetLocale, ...segments].join("/")}`;
}

export default function Header({ locale, projectId }: HeaderProps) {
  const pathname = usePathname();
  const currentPath = normalizePath(pathname ?? `/${locale}`);
  const [openPath, setOpenPath] = useState<string | null>(null);
  const navId = useId();
  const menuOpen = openPath === currentPath;

  const statusLabel = "Process mode";
  const statusValue = locale === "de" ? "Mixed-stream ready" : "Mixed-stream ready";
  const badgeLabel = locale === "de" ? "Low odor / Home fit / Proof" : "Low odor / Home fit / Proof";
  const menuLabel = locale === "de" ? "Menue" : "Menu";

  const links = navItems.map((item) => {
    const href = withLocale(locale, item.href);
    const isActive =
      item.href === "" ? currentPath === `/${locale}` || currentPath === "/" : currentPath.startsWith(href);

    return {
      href,
      isActive,
      key: item.key,
      label: t(locale, navLabelByKey[item.key])
    };
  });

  return (
    <header className="chrome-header" data-project={projectId}>
      <div className="chrome-header-shell">
        <div className="chrome-header-main">
          <div className="chrome-brand-wrap">
            <Link href={withLocale(locale, "")} className="chrome-brand">
              <span className="chrome-brand-mark" aria-hidden />
              <span className="chrome-brand-copy">
                <span className="chrome-brand-title">EnzyClean</span>
                <span className="chrome-brand-subtitle">AIOMETRICS waste sequencing system</span>
              </span>
            </Link>

            <p className="chrome-project-tag">
              <span>{statusLabel}:</span> {statusValue}
            </p>
          </div>

          <button
            type="button"
            className="chrome-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls={navId}
            onClick={() => setOpenPath(menuOpen ? null : currentPath)}
          >
            <span aria-hidden>{menuOpen ? "−" : "+"}</span>
            {menuLabel}
          </button>

          <div id={navId} className="chrome-nav-shell" data-open={menuOpen}>
            <nav className="chrome-nav" aria-label="Primary">
              {links.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="chrome-nav-link"
                  data-active={item.isActive}
                  aria-current={item.isActive ? "page" : undefined}
                  onClick={() => setOpenPath(null)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="chrome-actions">
              <p className="chrome-pilot-badge">{badgeLabel}</p>

              <div className="chrome-locale" aria-label="Language">
                <Link
                  href={localizedPath(currentPath, "de")}
                  data-active={locale === "de"}
                  aria-current={locale === "de" ? "page" : undefined}
                  onClick={() => setOpenPath(null)}
                >
                  DE
                </Link>
                <Link
                  href={localizedPath(currentPath, "en")}
                  data-active={locale === "en"}
                  aria-current={locale === "en" ? "page" : undefined}
                  onClick={() => setOpenPath(null)}
                >
                  EN
                </Link>
              </div>

              <Link className="chrome-cta" href={withLocale(locale, "/waitlist")} onClick={() => setOpenPath(null)}>
                {t(locale, "navWaitlist")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
