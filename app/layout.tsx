import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/firebase/auth-context";

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
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
