// Hazır logo kütüphanesi — /public/logos altındaki gerçek SVG'ler
// Kullanıcı bu logolardan seçim yapar veya kendi logosunu yükler.
//
// Dil-varyantlı logolar: bir logo seçilince (ör. "finanse"), sitenin
// diline göre TR veya EN varyantı otomatik gösterilir.

export interface LibraryLogo {
  key: string;
  label: string;
  labelEn: string;
  /** Varsayılan görsel (TR veya dilden bağımsız) */
  svgOrUrl: string;
  /** Türkçe varyant (dil-duyarlı logolar için) */
  svgTr?: string;
  /** İngilizce varyant (dil-duyarlı logolar için) */
  svgEn?: string;
  category: "finansman" | "bayrak";
}

export const LOGO_LIBRARY: LibraryLogo[] = [
  // ── AB Finansmanı logo setleri (dil-duyarlı) ──────────────
  // "Bu proje Avrupa Birliği tarafından finanse edilmektedir" bandrolleri
  {
    key: "finanse",
    label: "AB Finansmanı (Standart)",
    labelEn: "EU Funding (Standard)",
    svgOrUrl: "/logos/finanse-TR.svg",
    svgTr: "/logos/finanse-TR.svg",
    svgEn: "/logos/finanse-EN.svg",
    category: "finansman",
  },
  {
    key: "es-finanse",
    label: "AB Eş-Finansmanı",
    labelEn: "EU Co-Financing",
    svgOrUrl: "/logos/es_-finanse-TR.svg",
    svgTr: "/logos/es_-finanse-TR.svg",
    svgEn: "/logos/es_-finanse-EN.svg",
    category: "finansman",
  },
  {
    key: "p-es-finanse",
    label: "AB Eş-Finansmanı (Dikey)",
    labelEn: "EU Co-Financing (Portrait)",
    svgOrUrl: "/logos/p-es_-finanse-TR.svg",
    svgTr: "/logos/p-es_-finanse-TR.svg",
    svgEn: "/logos/p-es_-finanse-EN.svg",
    category: "finansman",
  },
  // Çift dilli (TR_EN) varyantlar — dilden bağımsız
  {
    key: "finanse-bilingual",
    label: "AB Finansmanı (Çift Dilli)",
    labelEn: "EU Funding (Bilingual)",
    svgOrUrl: "/logos/finanse-TR_EN.svg",
    category: "finansman",
  },
  {
    key: "es-finanse-bilingual",
    label: "AB Eş-Finansmanı (Çift Dilli)",
    labelEn: "EU Co-Financing (Bilingual)",
    svgOrUrl: "/logos/es_-finanse-TR_EN.svg",
    category: "finansman",
  },
  {
    key: "p-es-finanse-bilingual",
    label: "AB Eş-Finansmanı (Dikey, Çift Dilli)",
    labelEn: "EU Co-Financing (Portrait, Bilingual)",
    svgOrUrl: "/logos/p-es_-finanse-TR_EN.svg",
    category: "finansman",
  },

  // ── Bayraklar ─────────────────────────────────────────────
  {
    key: "flag-eu",
    label: "Avrupa Birliği Bayrağı",
    labelEn: "European Union Flag",
    svgOrUrl: "/logos/flag-EU.svg",
    category: "bayrak",
  },
  {
    key: "flag-tr",
    label: "Türkiye Bayrağı",
    labelEn: "Turkey Flag",
    svgOrUrl: "/logos/flag-TR.svg",
    category: "bayrak",
  },
];

/** Anahtardan logo bul */
export function getLibraryLogo(key: string): LibraryLogo | undefined {
  return LOGO_LIBRARY.find((l) => l.key === key);
}

/** Dile göre doğru varyantı döndür (finanse-TR vs finanse-EN) */
export function getLogoUrlForLocale(logo: LibraryLogo, locale: "tr" | "en"): string {
  if (locale === "en" && logo.svgEn) return logo.svgEn;
  if (locale === "tr" && logo.svgTr) return logo.svgTr;
  return logo.svgOrUrl;
}

export const LOGO_CATEGORIES = [
  { id: "finansman", label: "AB Finansman Logoları" },
  { id: "bayrak", label: "Bayraklar" },
] as const;
