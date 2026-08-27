// Sistem Logo Kütüphanesi
// Önceden yüklenmiş, tüm kullanıcıların erişebildiği kurumsal logolar
// (bakanlıklar, genel müdürlükler, program otoriteleri vb.)
//
// Yeni logo eklemek için: /public/system-logos/ altına dosyayı koyup
// buraya bir kayıt ekleyin.

export interface SystemLogo {
  key: string;
  label: string;
  labelEn: string;
  url: string;
  category: "bakanlik" | "kurum" | "finansman" | "bayrak" | "diger";
}

export const SYSTEM_LOGOS: SystemLogo[] = [
  // ── Bakanlıklar ───────────────────────────────────────────
  { key: "tarim-orman", label: "Tarım ve Orman Bakanlığı", labelEn: "Ministry of Agriculture and Forestry", url: "/system-logos/tarim-orman.svg", category: "bakanlik" },
  { key: "cevre-sehircilik", label: "Çevre, Şehircilik ve İklim Değişikliği Bakanlığı", labelEn: "Ministry of Environment, Urbanisation and Climate Change", url: "/system-logos/cevre-sehircilik.svg", category: "bakanlik" },
  { key: "disisleri-ab", label: "Dışişleri Bakanlığı AB Başkanlığı", labelEn: "Directorate for EU Affairs", url: "/system-logos/disisleri-ab.svg", category: "bakanlik" },

  // ── Kurumlar / Genel Müdürlükler ──────────────────────────
  { key: "su-yonetimi", label: "Su Yönetimi Genel Müdürlüğü", labelEn: "General Directorate of Water Management", url: "/system-logos/su-yonetimi.svg", category: "kurum" },
  { key: "dsi", label: "Devlet Su İşleri (DSİ)", labelEn: "State Hydraulic Works (DSI)", url: "/system-logos/dsi.svg", category: "kurum" },
  { key: "mfib", label: "Merkezi Finans ve İhale Birimi (MFİB)", labelEn: "Central Finance and Contracts Unit (CFCU)", url: "/system-logos/mfib.svg", category: "kurum" },

  // ── AB Finansman logoları (websitesi kütüphanesiyle ortak) ─
  { key: "finanse-tr", label: "AB Finansmanı (TR)", labelEn: "EU Funding (TR)", url: "/logos/finanse-TR.svg", category: "finansman" },
  { key: "finanse-en", label: "AB Finansmanı (EN)", labelEn: "EU Funding (EN)", url: "/logos/finanse-EN.svg", category: "finansman" },
  { key: "es-finanse-tr", label: "AB Eş-Finansmanı (TR)", labelEn: "EU Co-Financing (TR)", url: "/logos/es_-finanse-TR.svg", category: "finansman" },
  { key: "es-finanse-en", label: "AB Eş-Finansmanı (EN)", labelEn: "EU Co-Financing (EN)", url: "/logos/es_-finanse-EN.svg", category: "finansman" },

  // ── Bayraklar ─────────────────────────────────────────────
  { key: "flag-eu", label: "Avrupa Birliği Bayrağı", labelEn: "European Union Flag", url: "/logos/flag-EU.svg", category: "bayrak" },
  { key: "flag-tr", label: "Türkiye Bayrağı", labelEn: "Turkey Flag", url: "/logos/flag-TR.svg", category: "bayrak" },
];

export function getSystemLogo(key: string): SystemLogo | undefined {
  return SYSTEM_LOGOS.find((l) => l.key === key);
}

export const SYSTEM_LOGO_CATEGORIES = [
  { id: "bakanlik", label: "Bakanlıklar" },
  { id: "kurum", label: "Kurumlar" },
  { id: "finansman", label: "AB Finansman" },
  { id: "bayrak", label: "Bayraklar" },
] as const;

// ─── Ortak footer logo çözümleyici ────────────────────────────
// Tüm görünürlük araçları (website, rapor kapağı, antetli) aynı mantığı kullanır.
import type { UserLibraryImage } from "../types";
import { getLibraryLogo } from "./logo-library";

interface AnyFooterLogo {
  source: "system" | "user" | "custom" | "library";
  refKey?: string;
  libraryKey?: string;
  imageUrl?: string;
  dataUrl?: string;
}

/** Footer/alt şerit logosunun görsel kaynağını çöz (tüm araçlarda ortak) */
export function resolveLogoSrc(fl: AnyFooterLogo, userLib: UserLibraryImage[] = []): string | undefined {
  switch (fl.source) {
    case "custom":
      return fl.dataUrl ?? fl.imageUrl;
    case "user":
      if (fl.dataUrl) return fl.dataUrl;
      return userLib.find((u) => u.id === fl.refKey)?.dataUrl;
    case "system":
      return getSystemLogo(fl.refKey ?? "")?.url;
    case "library": {
      // Eski website verisi — finansman/bayrak kütüphanesi
      const lib = getLibraryLogo(fl.libraryKey ?? fl.refKey ?? "");
      return lib?.svgOrUrl ?? fl.imageUrl;
    }
    default:
      return fl.imageUrl ?? fl.dataUrl;
  }
}
