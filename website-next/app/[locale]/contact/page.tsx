import Link from "next/link";
import { resolveLocale } from "@/lib/resolve-locale";
import { site } from "@/lib/site";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ContactPage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const de = locale === "de";

  const partnerFits = de
    ? [
        "Wohnbau oder Quartierspilot mit klarer Entsorgungsbelastung",
        "Circularity-Programm mit Reduktions- und Hygieneziel",
        "Haushaltsnahe Testumgebung mit echter Nutzungsroutine"
      ]
    : [
        "Housing or district pilot with clear disposal pressure",
        "Circularity program with reduction and hygiene targets",
        "Home-like pilot environment with real usage routines"
      ];

  return (
    <section className="section grid two">
      <article className="surface card">
        <p className="section-kicker">Pilot desk</p>
        <h1 className="section-title">{de ? "Kontakt" : "Contact"}</h1>
        <p className="lead">
          {de
            ? "EnzyClean priorisiert Gespraeche, die in echte Pilotfreigaben, Betreiberfragen oder Rollout-Scoping fuehren."
            : "EnzyClean prioritizes conversations that can move into real pilot approvals, operator questions, or rollout scoping."}
        </p>

        <ul className="list">
          <li>
            <strong>Email:</strong> <a href={`mailto:${site.email}`}>{site.email}</a>
          </li>
          <li>
            <strong>Response window:</strong> {de ? "typisch unter 48 Stunden" : "typically below 48 hours"}
          </li>
          <li>
            <strong>{de ? "Standort" : "Location"}:</strong> Berlin, Germany
          </li>
        </ul>

        <div className="callout">
          <p>
            {de
              ? "Bitte Use Case, Pilotgroesse, Entsorgungsproblem und den gewuenschten Erfolgsnachweis direkt mitschicken."
              : "Include use case, pilot scope, disposal problem, and the success proof you want to validate."}
          </p>
        </div>
      </article>

      <article className="surface card">
        <h2>{de ? "Gute Projektstarts" : "Strong project starts"}</h2>
        <ul className="list">
          {partnerFits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="cta-row">
          <a href={`mailto:${site.email}?subject=EnzyClean%20Pilot`} className="btn btn-primary">
            {de ? "Pilot anfragen" : "Request pilot"}
          </a>
          <Link href={`/${locale}/waitlist`} className="btn btn-muted">
            {de ? "Warteliste" : "Waitlist"}
          </Link>
        </div>
      </article>
    </section>
  );
}
