import type { Metadata } from "next";
import Header from "@/components/chrome/Header";
import Footer from "@/components/chrome/Footer";
import HtmlLangSync from "@/components/chrome/HtmlLangSync";
import { locales } from "@/lib/i18n";
import { resolveLocale } from "@/lib/resolve-locale";
import { site } from "@/lib/site";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isGerman = locale === "de";
  const description = isGerman
    ? "EnzyClean zeigt gemischte Haushaltsabfallverarbeitung als business-first Sequenz aus Intake, Bioprozess und belastbarer Rollout-Logik."
    : "EnzyClean frames mixed household waste processing as a business-first sequence across intake, bioprocessing, and rollout proof.";

  return {
    title: {
      absolute: `${site.name} | Mixed household waste sequencing`
    },
    description,
    alternates: {
      canonical: `${site.domain}/${locale}`,
      languages: {
        de: `${site.domain}/de`,
        en: `${site.domain}/en`
      }
    },
    openGraph: {
      title: site.name,
      description,
      url: `${site.domain}/${locale}`,
      siteName: site.name,
      locale: isGerman ? "de_DE" : "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: site.name,
      description
    }
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const skipLinkLabel = locale === "de" ? "Zum Hauptinhalt springen" : "Skip to main content";

  return (
    <div className="site-shell" lang={locale}>
      <HtmlLangSync locale={locale} />
      <a href="#main-content" className="skip-link">
        {skipLinkLabel}
      </a>
      <Header locale={locale} projectId="08-enzyclean" />
      <main id="main-content" className="site-main">
        {children}
      </main>
      <Footer locale={locale} projectId="08-enzyclean" contactEmail={site.email} />
    </div>
  );
}
