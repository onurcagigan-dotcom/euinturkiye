// Hazır logo kütüphanesi — inline SVG veya public URL
// Kullanıcı bu logolardan seçim yapar veya kendi logosunu yükler

export interface LibraryLogo {
  key: string;
  label: string;
  labelEn: string;
  /** SVG string veya /public altında URL */
  svgOrUrl: string;
  category: "ab" | "tr-kamu" | "uluslararasi" | "finans" | "sektör";
}

// Inline SVG logoları — tam olarak verildiğinde kullanılır
// Şimdilik placeholder SVG'ler; gerçek logolar Onur tarafından sağlanacak
const EU_STAR_SVG = `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="80" fill="#003399"/>
  ${Array.from({length:12},(_,i)=>{
    const a=(i*30-90)*Math.PI/180;
    const cx=60+22*Math.cos(a), cy=40+22*Math.sin(a);
    return `<g transform="translate(${cx},${cy})"><polygon points="0,-4.5 1.1,-1.4 4.3,-1.4 1.7,0.9 2.6,4 0,2 -2.6,4 -1.7,0.9 -4.3,-1.4 -1.1,-1.4" fill="#FFCC00"/></g>`;
  }).join("")}
</svg>`;

export const LOGO_LIBRARY: LibraryLogo[] = [
  // ── AB / IPA ───────────────────────────────────────────────
  {
    key: "eu",
    label: "Avrupa Birliği",
    labelEn: "European Union",
    svgOrUrl: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(EU_STAR_SVG),
    category: "ab",
  },
  {
    key: "eu-ipa",
    label: "IPA – Katılım Öncesi Yardım",
    labelEn: "IPA – Instrument for Pre-Accession Assistance",
    svgOrUrl: "/logo-library/eu-ipa.svg",
    category: "ab",
  },
  {
    key: "eu-delegation-turkey",
    label: "AB Türkiye Delegasyonu",
    labelEn: "EU Delegation to Turkey",
    svgOrUrl: "/logo-library/eu-delegation-turkey.svg",
    category: "ab",
  },

  // ── TR Kamu ────────────────────────────────────────────────
  {
    key: "tr-cumhurbaskanligi",
    label: "T.C. Cumhurbaşkanlığı",
    labelEn: "Republic of Türkiye – Presidency",
    svgOrUrl: "/logo-library/tr-cumhurbaskanligi.svg",
    category: "tr-kamu",
  },
  {
    key: "mfib",
    label: "Merkezi Finans ve İhale Birimi (MFİB)",
    labelEn: "Central Finance and Contracts Unit (CFCU)",
    svgOrUrl: "/logo-library/mfib.svg",
    category: "tr-kamu",
  },
  {
    key: "tcdd",
    label: "TCDD",
    labelEn: "Turkish State Railways (TCDD)",
    svgOrUrl: "/logo-library/tcdd.svg",
    category: "tr-kamu",
  },
  {
    key: "adalet-bakanligi",
    label: "Adalet Bakanlığı",
    labelEn: "Ministry of Justice",
    svgOrUrl: "/logo-library/adalet-bakanligi.svg",
    category: "tr-kamu",
  },
  {
    key: "enerji-bakanligi",
    label: "Enerji ve Tabii Kaynaklar Bakanlığı",
    labelEn: "Ministry of Energy and Natural Resources",
    svgOrUrl: "/logo-library/enerji-bakanligi.svg",
    category: "tr-kamu",
  },
  {
    key: "cevre-bakanligi",
    label: "Çevre, Şehircilik ve İklim Değişikliği Bakanlığı",
    labelEn: "Ministry of Environment, Urbanisation and Climate Change",
    svgOrUrl: "/logo-library/cevre-bakanligi.svg",
    category: "tr-kamu",
  },
  {
    key: "icisleri-bakanligi",
    label: "İçişleri Bakanlığı",
    labelEn: "Ministry of Interior",
    svgOrUrl: "/logo-library/icisleri-bakanligi.svg",
    category: "tr-kamu",
  },
  {
    key: "ulasim-bakanligi",
    label: "Ulaştırma ve Altyapı Bakanlığı",
    labelEn: "Ministry of Transport and Infrastructure",
    svgOrUrl: "/logo-library/ulasim-bakanligi.svg",
    category: "tr-kamu",
  },
  {
    key: "meb",
    label: "Milli Eğitim Bakanlığı",
    labelEn: "Ministry of National Education",
    svgOrUrl: "/logo-library/meb.svg",
    category: "tr-kamu",
  },
  {
    key: "tubitak",
    label: "TÜBİTAK",
    labelEn: "Scientific and Technological Research Council of Türkiye",
    svgOrUrl: "/logo-library/tubitak.svg",
    category: "tr-kamu",
  },

  // ── Uluslararası ──────────────────────────────────────────
  {
    key: "giz",
    label: "GIZ",
    labelEn: "Deutsche Gesellschaft für Internationale Zusammenarbeit",
    svgOrUrl: "/logo-library/giz.svg",
    category: "uluslararasi",
  },
  {
    key: "undp",
    label: "UNDP",
    labelEn: "United Nations Development Programme",
    svgOrUrl: "/logo-library/undp.svg",
    category: "uluslararasi",
  },
  {
    key: "world-bank",
    label: "Dünya Bankası",
    labelEn: "World Bank",
    svgOrUrl: "/logo-library/world-bank.svg",
    category: "uluslararasi",
  },
  {
    key: "council-of-europe",
    label: "Avrupa Konseyi",
    labelEn: "Council of Europe",
    svgOrUrl: "/logo-library/council-of-europe.svg",
    category: "uluslararasi",
  },
];

export function getLibraryLogo(key: string): LibraryLogo | undefined {
  return LOGO_LIBRARY.find((l) => l.key === key);
}

export const LOGO_CATEGORIES = [
  { id: "ab", label: "AB / IPA" },
  { id: "tr-kamu", label: "Türkiye Kamu" },
  { id: "uluslararasi", label: "Uluslararası" },
  { id: "finans", label: "Finans" },
  { id: "sektör", label: "Sektör" },
] as const;
