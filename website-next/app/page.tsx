import Link from "next/link";
import { patentIntel, patentResearchUpdatedAt } from "@/lib/patent-intelligence";
import { site } from "@/lib/site";

const executionLoop = [
  {
    title: "Technical Claim",
    body: "Protect the workflow chain, not just one hardware component."
  },
  {
    title: "Market Separation",
    body: "Map active competitors and explain where the claim boundary stays independent."
  },
  {
    title: "Risk Control",
    body: "Name legal and engineering risks early and track mitigation as part of delivery."
  },
  {
    title: "Commercial Narrative",
    body: "Translate patent strength into language that non-technical teams and investors can act on."
  }
];

export default function HomePage() {
  return (
    <div className="page-stack project-canvas">
      <div className="project-signal-band reveal-up" data-reveal>
        {site.signals.map((signal) => (
          <span key={signal}>{signal}</span>
        ))}
        <span>{patentIntel.code}</span>
      </div>

      <section className="hero hero-depth panel hero-prime reveal-up" data-reveal>
        <div className="hero-aura hero-aura-a" aria-hidden />
        <div className="hero-aura hero-aura-b" aria-hidden />

        <div className="hero-grid-2">
          <div className="hero-copy">
            <p className="hero-kicker">Patent Website Command</p>
            <h1>
              {site.heroTitle}
              <span className="hero-emphasis"> {site.heroHighlight}</span>
            </h1>
            <p>{patentIntel.summary}</p>

            <div className="cta-row">
              <Link href="/patent" className="btn btn-primary">
                Open Patent Intelligence
              </Link>
              <Link href="/waitlist" className="btn btn-muted">
                Join Waitlist
              </Link>
            </div>

            <div className="badge-row">
              <span className="badge-chip">Filed {patentIntel.filedOn}</span>
              <span className="badge-chip">Research {patentResearchUpdatedAt}</span>
              <span className="badge-chip">{patentIntel.code}</span>
            </div>
          </div>

          <aside className="surface card hero-console reveal-right reveal-delay-1" data-reveal>
            <p className="console-label">Team Conviction in 60 Seconds</p>
            <ul className="console-list">
              {patentIntel.defensibilitySignals.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="console-stats">
              {site.stats.map((stat) => (
                <article key={stat.label} className="console-stat">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="panel reveal-up" data-reveal>
        <div className="section-head">
          <h2>Patent Moat Frames</h2>
          <p>Concrete claim blocks your team can explain without legal jargon.</p>
        </div>

        <div className="grid three capability-grid">
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
          <article className="surface card">
            <h3>Competitive Landscape</h3>
            <ul className="stack-list">
              {patentIntel.competitors.map((item) => (
                <li key={item.name}>
                  <strong>{item.name}</strong>
                  <p>{item.focus}</p>
                  <p>{item.whyNotBlocking}</p>
                  <a href={item.href} target="_blank" rel="noreferrer">
                    Source
                  </a>
                </li>
              ))}
            </ul>
          </article>

          <article className="surface card">
            <h3>Success and Risk Board</h3>
            <ul className="list-tight">
              {patentIntel.successDrivers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3 style={{ marginTop: "0.9rem" }}>Risk Checks</h3>
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
          <h2>Legal Reality and Evidence</h2>
          <p>No hype claims: this section keeps the team honest and decision-ready.</p>
        </div>

        <ul className="list-tight">
          {patentIntel.legalRealityChecks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="badge-row">
          {patentIntel.evidence.map((source) => (
            <a key={source.href} href={source.href} target="_blank" rel="noreferrer" className="badge-chip">
              {source.label}
            </a>
          ))}
        </div>
      </section>

      <section className="panel reveal-up" data-reveal>
        <div className="section-head">
          <h2>Execution Loop</h2>
          <p>How this patent website converts defensibility into real product momentum.</p>
        </div>

        <div className="roadmap-grid">
          {executionLoop.map((item, index) => (
            <article key={item.title} className="surface card roadmap-step">
              <span className="roadmap-id">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>

        <div className="cta-row">
          <Link href="/patent" className="btn btn-primary">
            Deep Patent Page
          </Link>
          <Link href="/investors" className="btn btn-muted">
            Investor Brief
          </Link>
        </div>
      </section>
    </div>
  );
}
