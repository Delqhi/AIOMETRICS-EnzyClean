import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import Link from "next/link";
import "@/app/globals.css";
import "@/app/enterprise.css";
import "@/app/theme.css";
import { site } from "@/lib/site";

const displayFont = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display"
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: {
    default: site.name,
    template: `%s | ${site.name}`
  },
  description: site.heroBody,
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <header className="site-topbar">
          <div className="site-topbar-inner">
            <Link href="/" className="site-brand">
              <span className="site-brand-mark" aria-hidden>
                EC
              </span>
              <span className="site-brand-copy">
                <strong>EnzyClean</strong>
                <small>Sequential Waste Bioprocessing</small>
              </span>
            </Link>

            <nav className="site-nav" aria-label="Primary">
              <Link href="/">Home</Link>
              <Link href="/patent">Patent</Link>
              <Link href="/#evidence">Evidence</Link>
              <Link href="/#execution">Execution</Link>
            </nav>

            <div className="site-topbar-actions">
              <Link href="/patent" className="site-cta">
                Patent Dossier
              </Link>
            </div>
          </div>
        </header>

        <main id="main-content" className="site-main">
          {children}
        </main>

        <footer className="site-footer">
          <div className="site-footer-inner">
            <p className="site-footer-title">{site.name}</p>
            <p className="site-footer-copy">{site.heroBody}</p>
            <div className="site-footer-links">
              <Link href="/patent">Patent</Link>
              <Link href="/#evidence">Evidence</Link>
              <Link href="/#execution">Execution</Link>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
