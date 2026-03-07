import { resolveLocale } from "@/lib/resolve-locale";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function TermsPage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const de = locale === "de";

  return (
    <section className="surface page-intro">
      <p className="section-kicker">Legal information</p>
      <h1 className="section-title">{de ? "Nutzungsbedingungen" : "Terms"}</h1>
      <p className="section-subtitle">
        {de
          ? "Diese Website dient der Projektkommunikation, Pilotqualifizierung und dem evidenzbasierten Produktueberblick."
          : "This website is intended for project communication, pilot qualification, and an evidence-backed product overview."}
      </p>

      <ul className="list">
        <li>{de ? "Keine verbindliche Leistungszusage ohne explizite Projektfreigabe" : "No binding service commitment without explicit project approval"}</li>
        <li>{de ? "Patent-, Technologie- und Marktinformationen koennen sich mit neuen Nachweisen aktualisieren" : "Patent, technology, and market information may be updated as new evidence appears"}</li>
        <li>{de ? "Kontaktaufnahmen werden projektspezifisch qualifiziert" : "Inbound requests are qualified on a project-specific basis"}</li>
      </ul>
    </section>
  );
}
