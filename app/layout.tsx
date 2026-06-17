import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n/context";
import { FirmaProvider } from "@/lib/firma/context";

export const metadata: Metadata = {
  title: {
    template: "%s | EU in Türkiye",
    default: "EU in Türkiye — AB Proje Portföy Platformu",
  },
  description:
    "Türkiye'deki AB finansmanlı projelerin kapsamlı portalı. IPA fonları, projeler, ilanlar, etkinlikler ve dijital araçlar.",
  keywords: ["AB projeler", "IPA", "Türkiye", "EU", "hibe", "satınalma", "ihale"],
  openGraph: {
    title: "EU in Türkiye",
    description: "Türkiye'deki AB finansmanlı projelerin portföy platformu",
    type: "website",
    locale: "tr_TR",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <LocaleProvider>
          <FirmaProvider>{children}</FirmaProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
