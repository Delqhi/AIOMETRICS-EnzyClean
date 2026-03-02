import Link from "next/link";
import { portfolioLinks, withLocale } from "@/components/chrome/nav";
import { t, type Locale } from "@/lib/i18n";
import type { ProjectId } from "@/lib/project";

interface FooterProps {
  locale: Locale;
  projectId: ProjectId;
  contactEmail: string;
}

export default function Footer({ locale, projectId, contactEmail }: FooterProps) {
  const summary =
    locale === "de"
      ? "Enterprise portfolio fuer kontaktlose biometrische KI-Systeme mit durchgaengiger Governance, standardisiertem Delivery-Modell und projektbezogener Umsetzung."
      : "Enterprise portfolio for contactless biometric AI systems with consistent governance, standardized delivery, and project-specific execution.";

  const availability =
    locale === "de"
      ? "Antwortfenster fuer Anfragen: in der Regel unter 48 Stunden."
      : "Inquiry response window: typically below 48 hours.";

  const governanceItems =
    locale === "de"
      ? ["Privacy by design", "Evidence-first engineering", "Centralized lead routing"]
      : ["Privacy by design", "Evidence-first engineering", "Centralized lead routing"];

  return (
    <footer className="chrome-footer" data-project={projectId}>
      <div className="chrome-footer-inner">
        <section className="chrome-footer-intro">
          <div className="chrome-footer-brand">
            <span className="chrome-brand-mark" aria-hidden />
            <div>
              <p className="chrome-footer-brand-title">AIOMETRICS</p>
              <p className="chrome-footer-brand-subtitle">Artificial Biometrics Network</p>
            </div>
          </div>

          <p className="chrome-footer-summary">{summary}</p>

          <div className="chrome-footer-kpi" aria-hidden>
            <article>
              <span>{locale === "de" ? "Program size" : "Program size"}</span>
              <strong>8 websites</strong>
            </article>
            <article>
              <span>{locale === "de" ? "Patent tracks" : "Patent tracks"}</span>
              <strong>7 projects</strong>
            </article>
            <article>
              <span>{locale === "de" ? "Operational model" : "Operational model"}</span>
              <strong>{locale === "de" ? "Shared core" : "Shared core"}</strong>
            </article>
          </div>
        </section>

        <div className="chrome-footer-grid">
          <section>
            <h3>{t(locale, "footerLinks")}</h3>
            <ul>
              <li>
                <Link href={withLocale(locale, "")}>{t(locale, "navHome")}</Link>
              </li>
              <li>
                <Link href={withLocale(locale, "/technology")}>{t(locale, "navTech")}</Link>
              </li>
              <li>
                <Link href={withLocale(locale, "/patent")}>{t(locale, "navPatent")}</Link>
              </li>
              <li>
                <Link href={withLocale(locale, "/faq")}>{t(locale, "navFaq")}</Link>
              </li>
              <li>
                <Link href={withLocale(locale, "/contact")}>{t(locale, "navContact")}</Link>
              </li>
            </ul>
          </section>

          <section>
            <h3>{t(locale, "footerPortfolio")}</h3>
            <ul>
              {portfolioLinks.map((entry) => (
                <li key={entry.id}>
                  <a href={entry.href} target="_blank" rel="noreferrer">
                    {entry.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3>{locale === "de" ? "Governance" : "Governance"}</h3>
            <ul>
              {governanceItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
              <li>{locale === "de" ? "Portfolio release rhythm: monthly" : "Portfolio release rhythm: monthly"}</li>
            </ul>
          </section>

          <section>
            <h3>{t(locale, "footerContact")}</h3>
            <ul>
              <li>
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              </li>
              <li>{availability}</li>
              <li>{locale === "de" ? "Location: Berlin, Germany" : "Location: Berlin, Germany"}</li>
              <li>
                <Link href={withLocale(locale, "/legal/privacy")}>{t(locale, "legalPrivacy")}</Link>
              </li>
              <li>
                <Link href={withLocale(locale, "/legal/terms")}>{t(locale, "legalTerms")}</Link>
              </li>
            </ul>
          </section>
        </div>

        <div className="chrome-footer-bottom">
          <p className="chrome-footnote">© {new Date().getFullYear()} AIOMETRICS. All rights reserved.</p>
          <p className="chrome-footnote chrome-footnote-secondary">
            {locale === "de"
              ? "Enterprise biometrics program mit 8 vernetzten Websites."
              : "Enterprise biometrics program with 8 interconnected websites."}
          </p>
        </div>
      </div>
    </footer>
  );
}
