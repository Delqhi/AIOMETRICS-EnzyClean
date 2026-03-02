import Link from "next/link";
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

const projectLabelById: Record<ProjectId, string> = {
  "00-artificial-biometrics": "AIOMETRICS Main NGO",
  "01-petvet": "PetVat mini:home:max",
  "02-humanpulse": "Human Fitness Pulse",
  "03-aquawild": "Aqua Wild Station",
  "04-nutritioncare": "Auto Nutrition Care",
  "05-mindsafeguardian": "Mind Safe Guardian",
  "06-bioroticsync": "Biorotic Sync",
  "07-spaicelogistic": "Spaice Logistic"
};

interface HeaderProps {
  locale: Locale;
  projectId: ProjectId;
}

export default function Header({ locale, projectId }: HeaderProps) {
  const activeProjectLabel = locale === "de" ? "Aktives Projekt" : "Active project";

  return (
    <header className="chrome-header" data-project={projectId}>
      <div className="chrome-header-main">
        <div className="chrome-brand-wrap">
          <Link href={withLocale(locale, "")} className="chrome-brand">
            <span className="chrome-brand-mark" aria-hidden />
            <span className="chrome-brand-copy">
              <span className="chrome-brand-title">AIOMETRICS</span>
              <span className="chrome-brand-subtitle">Artificial Biometrics Network</span>
            </span>
          </Link>

          <p className="chrome-project-tag">
            <span>{activeProjectLabel}:</span> {projectLabelById[projectId]}
          </p>
        </div>

        <nav className="chrome-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link key={item.key} href={withLocale(locale, item.href)} className="chrome-nav-link">
              {t(locale, navLabelByKey[item.key])}
            </Link>
          ))}
        </nav>

        <div className="chrome-actions">
          <div className="chrome-locale" aria-label="Language">
            <Link href={withLocale("de", "")} data-active={locale === "de"}>
              DE
            </Link>
            <Link href={withLocale("en", "")} data-active={locale === "en"}>
              EN
            </Link>
          </div>

          <Link className="chrome-cta" href={withLocale(locale, "/waitlist")}>
            {t(locale, "navWaitlist")}
          </Link>
        </div>
      </div>
    </header>
  );
}
