import { resolveLocale } from "@/lib/resolve-locale";
import { site } from "@/lib/site";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function WaitlistPage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const de = locale === "de";

  const readinessPoints = de
    ? [
        "echte Mischabfall-Situation statt Labor-Demo",
        "Interesse an Geruchs- und Routineverbesserung",
        "Bereitschaft, Outcome und Wartungsaufwand zu dokumentieren"
      ]
    : [
        "real mixed-waste context instead of a lab demo",
        "clear interest in odor and routine improvement",
        "willingness to document outcomes and maintenance effort"
      ];

  return (
    <section className="section grid two">
      <article className="surface card">
        <p className="section-kicker">Early access intake</p>
        <h1 className="section-title">{de ? "Warteliste" : "Waitlist"}</h1>
        <p className="lead">
          {de
            ? "Die Warteliste ist fuer Teams gedacht, die EnzyClean nicht nur beobachten, sondern in einen strukturierten Pilot ueberfuehren wollen."
            : "The waitlist is intended for teams that want to move EnzyClean from interest into a structured pilot."}
        </p>

        <ul className="list">
          {readinessPoints.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="callout">
          <p>
            {de
              ? "Je klarer Pilotort, Nutzungshaeufigkeit und Reduktionsziel beschrieben sind, desto schneller wird das Vorhaben eingeordnet."
              : "The clearer the pilot site, usage frequency, and reduction goal are described, the faster the opportunity can be qualified."}
          </p>
        </div>
      </article>

      <article className="surface card">
        <h2>{de ? "Naechster Schritt" : "Next step"}</h2>
        <p className="lead">
          {de
            ? "Sende eine kurze Nachricht mit Pilotort, Team, Zeitfenster und gewuenschtem Evidenznachweis."
            : "Send a short note with pilot location, team, timing, and the proof you want to validate."}
        </p>

        <div className="cta-row">
          <a href={`mailto:${site.email}?subject=EnzyClean%20Waitlist`} className="btn btn-primary">
            {de ? "Zur Warteliste melden" : "Join waitlist"}
          </a>
          <a href={`mailto:${site.email}`} className="btn btn-muted">
            {de ? "Direkt schreiben" : "Email directly"}
          </a>
        </div>
      </article>
    </section>
  );
}
