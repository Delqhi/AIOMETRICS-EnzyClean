import type { Locale } from "@/lib/i18n";
import type { ProjectId } from "@/lib/project";

export interface NavItem {
  key: "home" | "technology" | "patent" | "faq" | "contact" | "waitlist";
  href: string;
}

export const navItems: NavItem[] = [
  { key: "home", href: "" },
  { key: "technology", href: "/technology" },
  { key: "patent", href: "/patent" },
  { key: "faq", href: "/faq" },
  { key: "contact", href: "/contact" },
  { key: "waitlist", href: "/waitlist" }
];

export interface PortfolioLink {
  id: ProjectId;
  name: string;
  href: string;
}

export const portfolioLinks: PortfolioLink[] = [
  { id: "00-artificial-biometrics", name: "AIOMETRICS", href: "https://artificial-biometrics.com" },
  { id: "01-petvet", name: "PetVat", href: "https://petvat.ai" },
  { id: "02-humanpulse", name: "HumanPulse", href: "https://humanpulse.ai" },
  { id: "03-aquawild", name: "AquaWild", href: "https://aquawild.ai" },
  { id: "04-nutritioncare", name: "NutritionCare", href: "https://nutritioncare.ai" },
  { id: "05-mindsafeguardian", name: "MindSafeGuardian", href: "https://mindsafeguardian.ai" },
  { id: "06-bioroticsync", name: "Biorotic Sync", href: "https://biorotic-sync.ai" },
  { id: "07-spaicelogistic", name: "Spaice Logistic", href: "https://spaice-logistic.ai" }
];

export function withLocale(locale: Locale, path: string): string {
  return `/${locale}${path}`;
}
