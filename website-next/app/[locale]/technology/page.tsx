import { patentIntel } from "@/lib/patent-intelligence";
import { resolveLocale } from "@/lib/resolve-locale";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function TechnologyPage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const de = locale === "de";

  const stages = de
    ? [
        {
          title: "Intake classification",
          body: "Der Prozess beginnt mit nachvollziehbarer Erfassung gemischter Haushaltsstroeme statt mit enger Food-Scrap-Logik."
        },
        {
          title: "Sequential bioprocessing",
          body: "EnzyClean baut auf geordnete Uebergaenge zwischen Stabilisierung, Geruchsreduktion und eigentlicher Aufbereitung."
        },
        {
          title: "Operator-safe feedback",
          body: "Nutzer sehen, wann ein Zyklus stabil laeuft, wann Eingriffe noetig sind und was im Alltag plausibel bleibt."
        }
      ]
    : [
        {
          title: "Intake classification",
          body: "The system starts with legible classification of mixed household streams instead of narrow food-scrap logic."
        },
        {
          title: "Sequential bioprocessing",
          body: "EnzyClean depends on ordered transitions between stabilization, odor reduction, and actual processing."
        },
        {
          title: "Operator-safe feedback",
          body: "Users need to see when a cycle is stable, when intervention matters, and what remains plausible in daily use."
        }
      ];
  const controlPlanes = de
    ? [
        {
          title: "Waste-class fit",
          body: "Die Technologie muss fuer reale Mischsituationen im Haushalt lesbar bleiben."
        },
        {
          title: "Hygiene and safety",
          body: "Sicherheits- und Reinigungslogik sind Teil des Produkts, nicht nur Betriebsanweisung."
        },
        {
          title: "Reduction proof",
          body: "Outcome-Messung und geruchsarme Nutzung muessen in Pilotgespraechen belegbar sein."
        }
      ]
    : [
        {
          title: "Waste-class fit",
          body: "The technology has to remain credible for real mixed-household inputs."
        },
        {
          title: "Hygiene and safety",
          body: "Safety and cleaning logic are part of the product, not an afterthought."
        },
        {
          title: "Reduction proof",
          body: "Outcome measurement and low-odor use have to be defensible in pilot conversations."
        }
      ];
  const rolloutFrames = de
    ? [
        {
          title: "Haushalts-Piloten",
          body: "Fruehe Tests muessen Alltag, Geruchsbild und einfache Wartung glaubwuerdig machen."
        },
        {
          title: "Wohnbau / Quartier",
          body: "Die Story wird staerker, wenn EnzyClean als Infrastruktur fuer wiederkehrende Entsorgungsprobleme erscheint."
        },
        {
          title: "Circularity-Partner",
          body: "Rollout gewinnt, sobald Waste-Reduction und dokumentierte Routine in dieselbe Metrik passen."
        }
      ]
    : [
        {
          title: "Household pilots",
          body: "Early tests have to prove daily usability, odor control, and simple maintenance."
        },
        {
          title: "Housing / district pilots",
          body: "The story becomes stronger when EnzyClean reads as infrastructure for recurring disposal problems."
        },
        {
          title: "Circularity partners",
          body: "Rollout gains traction when waste reduction and documented routine fit into the same metric frame."
        }
      ];

  return (
    <>
      <section className="surface page-intro">
        <p className="section-kicker">Technology architecture</p>
        <h1 className="section-title">
          {de ? "Sequenz, Steuerung und Haushaltsfit muessen als ein System auftreten." : "Sequence, control, and household fit have to read like one system."}
        </h1>
        <p className="section-subtitle">
          {de
            ? "EnzyClean positioniert sich ueber geordnete Prozesslogik und alltagstaugliche Bedienbarkeit, nicht ueber Appliance-Spektakel."
            : "EnzyClean positions itself through ordered process logic and daily usability, not through appliance spectacle."}
        </p>
      </section>

      <section className="section grid three">
        {stages.map((item) => (
          <article key={item.title} className="surface card feature-card">
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className="section grid two">
        <article className="surface card">
          <h2>Control planes</h2>
          <ul className="stat-list">
            {controlPlanes.map((item) => (
              <li key={item.title} className="stat-item">
                <span>{item.title}</span>
                <strong>{item.body}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="surface card">
          <h2>Claim pressure</h2>
          <ul className="list">
            {patentIntel.claimFrames.map((item) => (
              <li key={item.title}>
                <strong>{item.title}:</strong> {item.body}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="section grid three">
        {rolloutFrames.map((item) => (
          <article key={item.title} className="surface card">
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        ))}
      </section>
    </>
  );
}
