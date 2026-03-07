import Link from "next/link";
import { patentIntel, patentResearchUpdatedAt } from "@/lib/patent-intelligence";
import { resolveLocale } from "@/lib/resolve-locale";
import { site } from "@/lib/site";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const de = locale === "de";

  const signals = ["Mixed household intake", "Low-odor routine", "Home pilot readiness", patentIntel.code];
  const stats = [
    { label: "Node", value: "08" },
    { label: "Waste classes", value: "Mixed" },
    { label: "Claim frames", value: String(patentIntel.claimFrames.length).padStart(2, "0") },
    { label: "Evidence links", value: String(patentIntel.evidence.length).padStart(2, "0") }
  ];
  const processSteps = de
    ? [
        {
          step: "Step 01",
          title: "Intake entlasten",
          body: "Die Seite beginnt bei der alltaeglichen Entsorgungsbelastung und nicht bei generischer Green-Tech-Rhetorik."
        },
        {
          step: "Step 02",
          title: "Sequenz sichtbar machen",
          body: "Biochemische Verarbeitung wird als nachvollziehbarer Ablauf gezeigt: Intake, Stabilisierung, Reduktion."
        },
        {
          step: "Step 03",
          title: "Rollout plausibel halten",
          body: "Technologie, Patent und Kontakt fuehren direkt in Pilotfragen fuer Wohnbau, Quartiere und Haushalte."
        }
      ]
    : [
        {
          step: "Step 01",
          title: "Reduce intake friction",
          body: "The page starts with recurring disposal burden instead of generic green-tech rhetoric."
        },
        {
          step: "Step 02",
          title: "Make the sequence visible",
          body: "Biochemical processing reads as a legible flow: intake, stabilization, and reduction."
        },
        {
          step: "Step 03",
          title: "Keep rollout credible",
          body: "Technology, patent logic, and contact move directly into pilot conversations for households and housing operators."
        }
      ];
  const ledger = de
    ? [
        { label: "Primary pain", value: "Entsorgung, Geruch und Mischabfall bleiben ungeliebte Tagesroutine." },
        { label: "Decision frame", value: "EnzyClean wird als Haushalts- und Betreiberworkflow bewertet, nicht als Geraet allein." },
        { label: "Business proof", value: "Pilotfit entsteht ueber Reduktion, Hygiene und Bedienbarkeit." }
      ]
    : [
        { label: "Primary pain", value: "Disposal, odor, and mixed-waste handling remain an unwanted daily routine." },
        { label: "Decision frame", value: "EnzyClean is evaluated as a household and operator workflow, not as hardware alone." },
        { label: "Business proof", value: "Pilot fit emerges through reduction, hygiene, and daily usability." }
      ];
  const fieldNotes = de
    ? [
        {
          stamp: "Operator note 01",
          title: "Human-made statt Appliance-Template",
          body: "Die Startseite arbeitet wie ein Betriebsdossier mit verschobenen Notizen, Beweisspuren und klarer Prozessdramaturgie."
        },
        {
          stamp: "Operator note 02",
          title: "Business-first vor Effekt",
          body: "Jede Sektion beantwortet eine reale Freigabefrage: Warum jetzt, fuer wen, mit welchem Nachweis."
        },
        {
          stamp: "Operator note 03",
          title: "Proof statt Zukunftsrauschen",
          body: "Patent, Marktlogik und Rollout-Gespraech liegen nah beieinander, damit aus Interesse echte Pilotreife wird."
        }
      ]
    : [
        {
          stamp: "Operator note 01",
          title: "Human-made instead of appliance template",
          body: "The homepage behaves like an operating dossier with offset notes, evidence trails, and visible process drama."
        },
        {
          stamp: "Operator note 02",
          title: "Business-first before effect",
          body: "Each section answers a real approval question: why now, for whom, and with what proof."
        },
        {
          stamp: "Operator note 03",
          title: "Proof instead of future noise",
          body: "Patent logic, market fit, and rollout entry stay close together so curiosity can turn into pilot readiness."
        }
      ];
  const pillars = de
    ? [
        {
          title: "Mixed-stream scope",
          body: "Nicht nur Food-Scraps. Der Differenziator liegt in der breiteren Haushaltsperspektive und der geordneten Prozesskette."
        },
        {
          title: "Low-odor routine",
          body: "Nutzerakzeptanz steigt nur, wenn Geruch, Pflege und Rueckmeldelogik im Alltag wirklich kontrolliert sind."
        },
        {
          title: "Sequential control",
          body: "EnzyClean argumentiert ueber Reihenfolge und Steuerung, nicht ueber ein einzelnes Gadget-Feature."
        },
        {
          title: "Pilot-ready narrative",
          body: "Das Produkt muss gleichzeitig fuer Haushalte, Wohnbaupartner und Circularity-Programme lesbar sein."
        }
      ]
    : [
        {
          title: "Mixed-stream scope",
          body: "Not only food scraps. The differentiator is broader household coverage and an ordered process chain."
        },
        {
          title: "Low-odor routine",
          body: "Adoption only grows if odor, maintenance, and feedback loops feel controlled in daily use."
        },
        {
          title: "Sequential control",
          body: "EnzyClean argues through order and control logic, not through a single gadget feature."
        },
        {
          title: "Pilot-ready narrative",
          body: "The product has to read clearly for households, housing operators, and circularity programs at the same time."
        }
      ];

  return (
    <div className="enzyme-home">
      <section className="enzyme-signal-band" aria-label="Program signals">
        {signals.map((signal) => (
          <span key={signal}>{signal}</span>
        ))}
      </section>

      <section className="enzyme-hero surface" id="mission">
        <div className="enzyme-hero-copy">
          <p className="section-kicker">EnzyClean / Waste sequence dossier</p>
          <h1 className="enzyme-hero-title">
            {de ? "Mixed household waste braucht eine lesbare Prozesskette." : "Mixed household waste needs a legible process chain."}
          </h1>
          <p className="enzyme-hero-summary">{site.heroBody}</p>

          <div className="cta-row">
            <Link href={`/${locale}/technology`} className="btn btn-primary">
              {de ? "Technologie ansehen" : "View technology"}
            </Link>
            <Link href={`/${locale}/patent`} className="btn btn-muted">
              {de ? "Patent-Dossier" : "Patent dossier"}
            </Link>
            <Link href={`/${locale}/contact`} className="enzyme-inline-link">
              {de ? "Pilotgespraech oeffnen" : "Open pilot conversation"}
            </Link>
          </div>

          <div className="enzyme-chip-row">
            <span>{`Filed ${patentIntel.filedOn}`}</span>
            <span>{`Research ${patentResearchUpdatedAt}`}</span>
            <span>{patentIntel.code}</span>
          </div>
        </div>

        <aside className="enzyme-glass-panel" aria-label="Decision summary">
          <p className="section-kicker">Decision summary</p>
          <div className="enzyme-stat-grid">
            {stats.map((stat) => (
              <article key={stat.label} className="enzyme-stat-card">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            ))}
          </div>
          <ul className="list enzyme-compact-list">
            {patentIntel.defensibilitySignals.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="enzyme-process-grid" aria-label="Process narrative">
        {processSteps.map((item) => (
          <article key={item.step} className="surface enzyme-process-card">
            <p className="section-kicker">{item.step}</p>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className="enzyme-editorial-grid">
        <article className="surface enzyme-manifest">
          <p className="section-kicker">Program ledger</p>
          <h2>
            {de
              ? "Strategisches Design fuer Bedienroutine, nicht fuer generische Green-Tech-Karten"
              : "Strategic design for daily operation, not generic green-tech cards"}
          </h2>
          <p className="lead">
            {de
              ? "Diese Homepage fuehrt von Haushaltsdruck ueber biochemische Sequenz bis in echte Pilotfragen. Sie will nicht nur informieren, sondern Entscheidungen entlasten."
              : "This homepage moves from household waste pressure through biochemical sequencing into real pilot questions. It is designed to reduce decision friction, not only to inform."}
          </p>
          <div className="enzyme-ledger">
            {ledger.map((item) => (
              <article key={item.label} className="enzyme-ledger-row">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </article>

        <div className="enzyme-note-stack" aria-label="Field notes">
          {fieldNotes.map((item, index) => (
            <article key={item.title} className="surface enzyme-note" data-note={index + 1}>
              <p className="section-kicker">{item.stamp}</p>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="evidence">
        <div className="section-head">
          <p className="section-kicker">Business proof</p>
          <h2 className="section-title">
            {de ? "Was EnzyClean von einem generischen Waste-Gadget trennt" : "What separates EnzyClean from a generic waste gadget"}
          </h2>
        </div>

        <div className="enzyme-proof-grid">
          {pillars.map((item) => (
            <article key={item.title} className="surface card feature-card enzyme-proof-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface enzyme-evidence">
        <div className="section-head">
          <p className="section-kicker">Evidence lane</p>
          <h2 className="section-title">
            {de ? "Normative Quellen und Claim-Realitaet bleiben sichtbar" : "Normative sources and claim reality stay visible"}
          </h2>
          <p className="section-subtitle">
            {de
              ? "Die Seite bleibt nah an Patent, Markttrennung und den Quellen, die den defensibility case tragen."
              : "The page stays close to patent logic, market separation, and the sources that support the defensibility case."}
          </p>
        </div>

        <div className="enzyme-chip-row">
          {patentIntel.evidence.slice(0, 5).map((source) => (
            <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
              {source.label}
            </a>
          ))}
        </div>

        <div className="cta-row">
          <Link href={`/${locale}/patent`} className="btn btn-primary">
            {de ? "Claim-Details lesen" : "Read claim details"}
          </Link>
          <Link href={`/${locale}/waitlist`} className="btn btn-muted">
            {de ? "Warteliste oeffnen" : "Open waitlist"}
          </Link>
        </div>
      </section>
    </div>
  );
}
