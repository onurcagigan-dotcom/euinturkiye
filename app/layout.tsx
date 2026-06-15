import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "euinturkiye.com — AB ve Türkiye Mali İşbirliği Projeleri Portalı",
  description:
    "Türkiye'deki AB faaliyetleri ve çok-donörlü proje portföyü platformu, dijital araçlar seti.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
