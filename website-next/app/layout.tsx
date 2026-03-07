import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import "@/app/enterprise.css";
import "@/app/theme.css";
import "@/components/chrome/chrome.css";
import { site } from "@/lib/site";

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

export const viewport: Viewport = {
  themeColor: "#132519",
  colorScheme: "light"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
