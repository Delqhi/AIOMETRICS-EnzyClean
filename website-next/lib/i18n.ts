export const locales = ["de", "en"] as const;

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

const ui = {
  de: {
    navHome: "Start",
    navTech: "Technologie",
    navPatent: "Patent",
    navFaq: "FAQ",
    navContact: "Kontakt",
    navWaitlist: "Warteliste",
    footerPortfolio: "Portfolio",
    footerLinks: "Schnellzugriff",
    footerContact: "Kontakt",
    legalPrivacy: "Datenschutz",
    legalTerms: "Nutzungsbedingungen"
  },
  en: {
    navHome: "Home",
    navTech: "Technology",
    navPatent: "Patent",
    navFaq: "FAQ",
    navContact: "Contact",
    navWaitlist: "Waitlist",
    footerPortfolio: "Portfolio",
    footerLinks: "Quick links",
    footerContact: "Contact",
    legalPrivacy: "Privacy",
    legalTerms: "Terms"
  }
} as const;

export type UiKey = keyof (typeof ui)["de"];

export function t(locale: Locale, key: UiKey): string {
  return ui[locale][key];
}
