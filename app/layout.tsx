import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EU in Türkiye — AB Proje Portföy Platformu",
  description: "Türkiye'deki AB finansmanlı projelerin kapsamlı portalı. Projeler, ilanlar, etkinlikler ve dijital araçlar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
