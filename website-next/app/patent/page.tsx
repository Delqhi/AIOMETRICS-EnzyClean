import Link from "next/link";
import PatentModelViewer from "@/components/patent/PatentModelViewer";
import { patent3DScene } from "@/lib/patent-3d";
import { patentIntel, patentResearchUpdatedAt } from "@/lib/patent-intelligence";

export default function PatentPage() {
  return (
    <div className="page-stack">
      <section className="hero hero-depth panel reveal-up" data-reveal>
        <p className="hero-kicker">Patent Intelligence</p>
        <h1>
          {patentIntel.code}
          <span className="hero-emphasis"> {patentIntel.title}</span>
        </h1>
        <p>{patentIntel.claimAnchor}</p>
        <div className="badge-row">
          <span className="badge-chip">Filed {patentIntel.filedOn}</span>
          <span className="badge-chip">Research {patentResearchUpdatedAt}</span>
        </div>
      </section>

      <section className="panel reveal-up" data-reveal>
        <PatentModelViewer
          scene={patent3DScene}
          locale="en"
          showHotspotsDefault
          allowAr={false}
          analyticsContext="patent-root"
        />
      </section>

      <section className="panel reveal-up" data-reveal>
        <div className="section-head">
          <p className="section-kicker">Claim Structure</p>
          <h2>Claim Frames</h2>
          <p>The core technical blocks that define differentiation and protection scope.</p>
        </div>
        <div className="grid three">
          {patentIntel.claimFrames.map((item, index) => (
            <article key={item.title} className="card surface capability-card">
              <span className="capability-index">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel reveal-up" data-reveal>
        <div className="split-grid">
          <article className="surface card board-card">
            <h3>Defensibility Signals</h3>
            <ul className="list-tight">
              {patentIntel.defensibilitySignals.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3 className="list-block-title">Legal Reality Checks</h3>
            <ul className="list-tight">
              {patentIntel.legalRealityChecks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="surface card board-card">
            <h3>Success Drivers</h3>
            <ul className="list-tight">
              {patentIntel.successDrivers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3 className="list-block-title">Risk Checks</h3>
            <ul className="list-tight">
              {patentIntel.riskChecks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="panel reveal-up" data-reveal>
        <div className="section-head">
          <p className="section-kicker">Market Mapping</p>
          <h2>Competitive Separation</h2>
          <p>Who is active in this field and why the claim space is still independent.</p>
        </div>

        <div className="roadmap-grid">
          {patentIntel.competitors.map((item, index) => (
            <article key={item.name} className="surface card roadmap-step">
              <span className="roadmap-id">0{index + 1}</span>
              <h3>{item.name}</h3>
              <p>{item.focus}</p>
              <p>{item.whyNotBlocking}</p>
              <a href={item.href} target="_blank" rel="noreferrer">
                Source
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="panel reveal-up" data-reveal>
        <div className="section-head">
          <p className="section-kicker">Source Trail</p>
          <h2>Primary Evidence</h2>
          <p>External references used for this patent positioning and legal-reality framing.</p>
        </div>
        <div className="badge-row">
          {patentIntel.evidence.map((source) => (
            <a key={source.href} href={source.href} target="_blank" rel="noreferrer" className="badge-chip">
              {source.label}
            </a>
          ))}
        </div>

        <div className="cta-row">
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
          <Link href="/#execution" className="btn btn-muted">
            Execution Loop
          </Link>
        </div>
      </section>
    </div>
  );
}
