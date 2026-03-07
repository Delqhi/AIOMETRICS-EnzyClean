import { resolveLocale } from "@/lib/resolve-locale";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function FaqPage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const de = locale === "de";

  const faqs = de
    ? [
        {
          q: "Ist EnzyClean nur ein Food-Recycler?",
          a: "Nein. Die Logik ist auf gemischte Haushaltsabfaelle und ihre geordnete Behandlung ausgelegt."
        },
        {
          q: "Warum ist die Sequenz so wichtig?",
          a: "Die Reihenfolge von Intake, Stabilisierung und Verarbeitung entscheidet ueber Geruch, Sicherheit und Reduktion."
        },
        {
          q: "Was macht den Ansatz verteidigbar?",
          a: "Der Schutz sitzt in der Prozesskette und der gemischten Materiallogik, nicht in einem Einzelteil."
        },
        {
          q: "Wer sollte zuerst mit EnzyClean sprechen?",
          a: "Haushaltspiloten, Wohnbaupartner und Circularity-Teams mit messbarem Reduktionsziel."
        }
      ]
    : [
        {
          q: "Is EnzyClean only a food recycler?",
          a: "No. The concept is designed around mixed household waste and its ordered treatment path."
        },
        {
          q: "Why is sequence so important?",
          a: "The order of intake, stabilization, and processing determines odor, safety, and reduction quality."
        },
        {
          q: "What makes the approach defensible?",
          a: "Protection lives in the process chain and mixed-material logic, not in one isolated part."
        },
        {
          q: "Who should talk to EnzyClean first?",
          a: "Household pilots, housing operators, and circularity teams with measurable reduction goals."
        }
      ];

  return (
    <>
      <section className="surface page-intro">
        <p className="section-kicker">Program clarity</p>
        <h1 className="section-title">FAQ</h1>
        <p className="section-subtitle">
          {de
            ? "Die wichtigsten Fragen zu Produktlogik, Pilotfit und Beweisfuehrung."
            : "Answers to the main questions around product logic, pilot fit, and proof."}
        </p>
      </section>

      <section className="section grid two">
        {faqs.map((item) => (
          <article key={item.q} className="surface card feature-card">
            <h2>{item.q}</h2>
            <p>{item.a}</p>
          </article>
        ))}
      </section>
    </>
  );
}
