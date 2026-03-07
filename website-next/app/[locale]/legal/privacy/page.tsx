import { resolveLocale } from "@/lib/resolve-locale";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const de = locale === "de";

  return (
    <section className="surface page-intro">
      <p className="section-kicker">Legal information</p>
      <h1 className="section-title">{de ? "Datenschutz" : "Privacy"}</h1>
      <p className="section-subtitle">
        {de
          ? "EnzyClean verarbeitet nur die Daten, die fuer Kontakt- und Wartelistenanfragen wirklich noetig sind."
          : "EnzyClean processes only the data needed for contact and waitlist requests."}
      </p>

      <ul className="list">
        <li>{de ? "Datensparsamkeit als Standard" : "Data minimization as baseline"}</li>
        <li>{de ? "Verschluesselter Transport und begrenzter Zugriff" : "Encrypted transport and limited access"}</li>
        <li>{de ? "Auskunfts- und Loeschanfragen ueber die Kontaktadresse" : "Access and deletion requests through the contact email"}</li>
      </ul>
    </section>
  );
}
