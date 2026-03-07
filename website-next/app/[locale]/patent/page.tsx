import Link from "next/link";
import PatentModelViewer from "@/components/patent/PatentModelViewer";
import { patent3DScene } from "@/lib/patent-3d";
import { patentIntel, patentResearchUpdatedAt } from "@/lib/patent-intelligence";
import { resolveLocale } from "@/lib/resolve-locale";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function PatentPage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const de = locale === "de";

  return (
    <div className="dossier-home dossier-patent-page">
      <section className="dossier-signal-band" aria-label="Patent signals">
        <span>{patentIntel.code}</span>
        <span>{`Filed ${patentIntel.filedOn}`}</span>
        <span>{`Research ${patentResearchUpdatedAt}`}</span>
        <span>3D claim map</span>
      </section>

      <section className="dossier-hero dossier-patent-hero">
        <div className="dossier-hero-copy">
          <p className="dossier-eyebrow">EnzyClean / Patent intelligence</p>
          <h1>
            {patentIntel.code}
            <span>{patentIntel.title}</span>
          </h1>
          <p className="dossier-summary">{patentIntel.claimAnchor}</p>
          <div className="dossier-actions">
            <Link href="#viewer" className="dossier-btn dossier-btn-primary">
              {de ? "3D claim map oeffnen" : "Open 3D claim map"}
            </Link>
            <Link href="#evidence" className="dossier-btn dossier-btn-secondary">
              {de ? "Evidenz pruefen" : "Review evidence"}
            </Link>
          </div>
          <div className="dossier-chip-row">
            <span>{patentIntel.claimFrames.length} claim frames</span>
            <span>{patentIntel.competitors.length} competitor references</span>
            <span>{patentIntel.evidence.length} evidence links</span>
          </div>
        </div>

        <aside className="dossier-console" aria-label="Defensibility summary">
          <p className="dossier-panel-label">Defensibility summary</p>
          <ul>
            {patentIntel.defensibilitySignals.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="dossier-section" id="viewer">
        <div className="dossier-section-head">
          <p>Claim map</p>
          <h2>{de ? "Interaktive technische Pruefung" : "Interactive technical inspection"}</h2>
        </div>
        <div className="dossier-console dossier-patent-viewer">
          <PatentModelViewer
            scene={patent3DScene}
            locale={locale}
            showHotspotsDefault
            allowAr={false}
            analyticsContext={`patent-${locale}`}
          />
        </div>
      </section>

      <section className="dossier-section">
        <div className="dossier-section-head">
          <p>Claim architecture</p>
          <h2>{de ? "Geschuetzte Systemschichten" : "Protected system layers"}</h2>
        </div>
        <div className="dossier-card-grid dossier-patent-grid">
          {patentIntel.claimFrames.map((item, index) => (
            <article key={item.title} className="dossier-card dossier-card-angled">
              <span className="dossier-index">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dossier-section dossier-section-split">
        <article className="dossier-card">
          <p className="dossier-panel-label">Legal reality checks</p>
          <ul className="dossier-list-tight">
            {patentIntel.legalRealityChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="dossier-card">
          <p className="dossier-panel-label">Success drivers</p>
          <ul className="dossier-list-tight">
            {patentIntel.successDrivers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Risk checks</h3>
          <ul className="dossier-list-tight">
            {patentIntel.riskChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="dossier-section" id="evidence">
        <div className="dossier-section-head">
          <p>Competitive landscape</p>
          <h2>{de ? "Wer aktiv ist und warum der Moat trotzdem traegt" : "Who is active and why the moat still holds"}</h2>
        </div>
        <div className="dossier-card-grid dossier-patent-grid">
          {patentIntel.competitors.map((item, index) => (
            <article key={item.name} className="dossier-card dossier-card-angled">
              <span className="dossier-index">0{index + 1}</span>
              <h3>{item.name}</h3>
              <p>{item.focus}</p>
              <p>{item.whyNotBlocking}</p>
              <a href={item.href} target="_blank" rel="noreferrer">
                Source
              </a>
            </article>
          ))}
        </div>
        <div className="dossier-chip-row">
          {patentIntel.evidence.map((source) => (
            <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
              {source.label}
            </a>
          ))}
        </div>
      </section>

      <section className="dossier-section dossier-patent-cta">
        <div className="dossier-section-head">
          <p>Next action</p>
          <h2>{de ? "Vom Dossier in den Rollout wechseln" : "Move from dossier to rollout"}</h2>
        </div>
        <div className="dossier-actions">
          <Link href={`/${locale}`} className="dossier-btn dossier-btn-primary">
            {de ? "Zurueck zur Startseite" : "Back to home"}
          </Link>
          <Link href={`/${locale}/contact`} className="dossier-btn dossier-btn-secondary">
            {de ? "Pilotgespraech starten" : "Start pilot conversation"}
          </Link>
        </div>
      </section>
    </div>
  );
}
