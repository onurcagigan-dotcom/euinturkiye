// Dijital araçlar — tek kaynak.
// Firma paneli, araçlar sayfası ve ana sayfa buradan okur.

import type { SubscriberProfileType } from "./types";

export interface ToolConfig {
  id: string;
  href: string;
  label: string;
  labelEn: string;
  desc: string;
  descEn: string;
  color: string;
  /** SVG path (d="...") — tek kaynak, her yerde aynı ikon */
  svgPath: string;
  roles: SubscriberProfileType[];
}

export const TOOLS: ToolConfig[] = [
  {
    id: "etkinlik",
    href: "/araclar/etkinlik",
    label: "Etkinlik Yönetimi",
    labelEn: "Event Management",
    desc: "RSVP, gündem, müsaitlik anketi, PDF davetiye",
    descEn: "RSVP, agenda, availability polls, PDF invite",
    color: "#0E7490",
    svgPath: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z",
    roles: ["firma", "stk", "delegasyon", "program_otoritesi", "admin2"],
  },
  {
    id: "dokuman",
    href: "/araclar/dokuman",
    label: "E-Doküman Yönetimi",
    labelEn: "E-Document Library",
    desc: "Doküman kütüphanesi, erişim kontrolü, indirme sayacı",
    descEn: "Document library, access control, download tracking",
    color: "#1D7A5F",
    svgPath: "M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z",
    roles: ["firma", "stk", "delegasyon", "program_otoritesi", "admin2"],
  },
  {
    id: "bulten",
    href: "/araclar/bulten",
    label: "Bülten Gönderimi",
    labelEn: "Newsletter Campaigns",
    desc: "Hedefli e-posta kampanyaları ve istatistikler",
    descEn: "Targeted email campaigns and open-rate statistics",
    color: "#7C5710",
    svgPath: "M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75",
    roles: ["firma", "stk", "delegasyon", "program_otoritesi", "admin2"],
  },
  {
    id: "paydas",
    href: "/araclar/paydas",
    label: "Paydaş İletişimi",
    labelEn: "Stakeholder Communication",
    desc: "Adres defteri, toplu mesaj, WhatsApp",
    descEn: "Address book, bulk messaging, WhatsApp",
    color: "#3730A3",
    svgPath: "M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46",
    roles: ["firma", "stk", "delegasyon", "program_otoritesi", "admin2"],
  },
  {
    id: "egitim",
    href: "/araclar/egitim",
    label: "Eğitim Materyalleri",
    labelEn: "Training Materials",
    desc: "Video ve doküman eğitim kütüphanesi",
    descEn: "Video and document training library",
    color: "#7C3AED",
    svgPath: "M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5",
    roles: ["firma", "stk", "delegasyon", "program_otoritesi", "admin2", "tedarikci"],
  },
  {
    id: "uzmanlar",
    href: "/uzmanlar",
    label: "Uzman CV Havuzu",
    labelEn: "Expert CV Pool",
    desc: "Uzman profilleri, proje ekibi kurma",
    descEn: "Expert profiles, build project teams",
    color: "#0369A1",
    svgPath: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
    roles: ["firma", "stk", "delegasyon", "program_otoritesi", "admin2"],
  },
  {
    id: "anket",
    href: "/araclar/anket",
    label: "Anket Oluşturucu",
    labelEn: "Survey Builder",
    desc: "Çoktan seçmeli / açık uçlu anket ve dashboard",
    descEn: "Multiple choice, open-ended surveys and results dashboard",
    color: "#0891B2",
    svgPath: "M9 12h3.75M9 15h3.75M9 18h3.75M16.5 3.75A2.25 2.25 0 0 1 18.75 6v12A2.25 2.25 0 0 1 16.5 20.25h-9A2.25 2.25 0 0 1 5.25 18V6A2.25 2.25 0 0 1 7.5 3.75m2.25 0h4.5m-4.5 0a.75.75 0 0 0-.75.75v.75h6V4.5a.75.75 0 0 0-.75-.75m-4.5 0h4.5",
    roles: ["firma", "stk", "delegasyon", "program_otoritesi", "admin2"],
  },
  {
    id: "harita",
    href: "/araclar/harita",
    label: "Proje Haritası",
    labelEn: "Project Map",
    desc: "İl bazlı proje dağılımı görselleştirme",
    descEn: "Visualise project distribution by province",
    color: "#B45309",
    svgPath: "M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0Z",
    roles: ["firma", "stk", "delegasyon", "program_otoritesi", "admin2", "tedarikci"],
  },
  {
    id: "infografik",
    href: "/araclar/infografik",
    label: "Portföy İnfografikleri",
    labelEn: "Portfolio Infographics",
    desc: "Sektör, IPA dönemi, bütçe bazlı görsel analiz",
    descEn: "Visual analysis by sector, IPA period and budget",
    color: "#C2410C",
    svgPath: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
    roles: ["firma", "stk", "delegasyon", "program_otoritesi", "admin2", "tedarikci"],
  },
  {
    id: "rehber",
    href: "/kurumlar",
    label: "Rehber",
    labelEn: "Directory",
    desc: "Firma, STK, tedarikçi ve kurum profilleri",
    descEn: "Firms, NGOs, suppliers and institution profiles",
    color: "#4338CA",
    svgPath: "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25",
    roles: ["firma", "stk", "delegasyon", "program_otoritesi", "admin2", "tedarikci"],
  },
  {
    id: "website",
    href: "/firma?tab=projeler",
    label: "Proje Web Sitesi",
    labelEn: "Project Website",
    desc: "4 şablon, 3 header versiyonu, footer logoları",
    descEn: "4 templates, 3 header versions, footer logo library",
    color: "#1E3A8A",
    svgPath: "M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418",
    roles: ["firma", "stk", "delegasyon", "program_otoritesi", "admin2"],
  },
  {
    id: "gorunurluk",
    href: "/araclar/gorunurluk",
    label: "Görünürlük Materyali Üretimi",
    labelEn: "Visibility Material Production",
    desc: "AB görünürlük kurallarına uygun rapor kapağı ve materyal üretimi",
    descEn: "Produce report covers and materials compliant with EU visibility rules",
    color: "#0F766E",
    svgPath: "M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z",
    roles: ["firma", "stk", "delegasyon", "program_otoritesi", "admin2"],
  },
  {
    id: "antetli",
    href: "/araclar/antetli",
    label: "Antetli Grubu",
    labelEn: "Letterheads",
    desc: "AB kurallarına uygun antetli kağıt — Word, PDF, Excel çıktısı",
    descEn: "EU-compliant letterheads — Word, PDF, Excel output",
    color: "#B45309",
    svgPath: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
    roles: ["firma", "stk", "delegasyon", "program_otoritesi", "admin2"],
  },
  {
    id: "ihaleler",
    href: "/ilanlar?tur=ihale",
    label: "Program İhaleleri",
    labelEn: "Programme Tenders",
    desc: "İhale ilanı oluşturma ve yönetimi",
    descEn: "Create and manage tender listings",
    color: "#9D174D",
    svgPath: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
    roles: ["admin2"],
  },
];

/** Tek SVG ikon bileşeni — tüm alanlarda kullan */
export function ToolIcon({ svgPath, className = "w-5 h-5" }: { svgPath: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={svgPath} />
    </svg>
  );
}
