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
      ? "EnzyClean uebersetzt gemischte Haushaltsabfaelle in eine lesbare Sequenz aus Vorpruefung, biochemischer Behandlung und nachvollziehbarer Bedienroutine."
      : "EnzyClean translates mixed household waste into a readable sequence of intake screening, biochemical treatment, and operator-safe daily use.";

  const availability =
    locale === "de"
      ? "Antwortfenster fuer Projektanfragen: meist unter 48 Stunden."
      : "Project inquiry response window: typically below 48 hours.";

  const proofline = ["Mixed-stream intake", "Low-odor operation", "Patent-backed sequencing"];
  const deploymentFit =
    locale === "de"
      ? [
          "Wohnbau- oder Quartierspilot mit klarer Entsorgungsbelastung",
          "Circularity-Programm mit messbarer Reduktionslogik",
          "Haushaltsnahe Testumgebung mit echter Nutzungsroutine"
        ]
      : [
          "Housing or district pilot with visible disposal pressure",
          "Circularity program with measurable reduction logic",
          "Home-like test environment with real usage routines"
        ];
  const evidenceLinks = [
    { href: withLocale(locale, "/technology"), label: t(locale, "navTech") },
    { href: withLocale(locale, "/patent"), label: t(locale, "navPatent") },
    { href: withLocale(locale, "/faq"), label: t(locale, "navFaq") }
  ];
  const newTabLabel = locale === "de" ? "oeffnet in neuem Tab" : "opens in a new tab";

  return (
    <footer className="chrome-footer" data-project={projectId}>
      <div className="chrome-footer-inner">
        <section className="chrome-footer-intro">
          <div className="chrome-footer-brand">
            <span className="chrome-brand-mark" aria-hidden />
            <div>
              <p className="chrome-footer-brand-title">EnzyClean</p>
              <p className="chrome-footer-brand-subtitle">Sequential household waste bioprocessing</p>
            </div>
          </div>

          <p className="chrome-footer-summary">{summary}</p>

          <div className="chrome-footer-proofline" aria-label="Proof line">
            {proofline.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>

          <div className="chrome-footer-kpi" aria-label="Portfolio status">
            <article>
              <span>Websites</span>
              <strong>8 websites</strong>
            </article>
            <article>
              <span>Projects</span>
              <strong>7 projects</strong>
            </article>
            <article>
              <span>Operating model</span>
              <strong>Shared core</strong>
            </article>
          </div>
        </section>

        <div className="chrome-footer-grid">
          <section>
            <h2>{t(locale, "footerLinks")}</h2>
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
            <h2>{locale === "de" ? "Pilot fit" : "Pilot fit"}</h2>
            <ul>
              {deploymentFit.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>{locale === "de" ? "Evidence" : "Evidence"}</h2>
            <ul>
              {evidenceLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              {portfolioLinks.slice(0, 3).map((entry) => (
                <li key={entry.id}>
                  <a href={entry.href} target="_blank" rel="noopener noreferrer" aria-label={`${entry.name} (${newTabLabel})`}>
                    {entry.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>{t(locale, "footerContact")}</h2>
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
          <p className="chrome-footnote">© {new Date().getFullYear()} EnzyClean. All rights reserved.</p>
          <p className="chrome-footnote chrome-footnote-secondary">
            {locale === "de"
              ? "Business-first delivery fuer Haushaltsabfall, Beweisfuehrung und Rollout-Gespraeche."
              : "Business-first delivery for household waste, proof building, and rollout conversations."}
          </p>
        </div>
      </div>
    </footer>
  );
}
