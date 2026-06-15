import type { Sector, Donor } from "../../types";

export const sectors: Sector[] = [
  { id: "yargi", name: "Yargı", icon: "/images/homepage/sectors/yargi.png", projectCount: 38, order: 1 },
  { id: "temel-haklar", name: "Temel Haklar", icon: "/images/homepage/sectors/temel-haklar.png", projectCount: 24, order: 2 },
  { id: "icisleri", name: "İçişleri", icon: "/images/homepage/sectors/icisleri.png", projectCount: 41, order: 3 },
  { id: "sivil-toplum", name: "Sivil Toplum", icon: "/images/homepage/sectors/sivil-toplum.png", projectCount: 112, order: 4 },
  { id: "cevre", name: "Çevre & İklim", icon: "/images/homepage/sectors/cevre.png", projectCount: 56, order: 5 },
  { id: "ulasim", name: "Ulaştırma", icon: "/images/homepage/sectors/ulasim.png", projectCount: 19, order: 6 },
  { id: "enerji", name: "Enerji", icon: "/images/homepage/sectors/enerji.png", projectCount: 14, order: 7 },
  { id: "rekabet", name: "Rekabetçilik", icon: "/images/homepage/sectors/rekabet.png", projectCount: 63, order: 8 },
  { id: "istihdam", name: "İstihdam & Eğitim", icon: "/images/homepage/sectors/istihdam.png", projectCount: 87, order: 9 },
  { id: "tarim", name: "Tarım & Kırsal", icon: "/images/homepage/sectors/tarim.png", projectCount: 45, order: 10 },
];

export const donors: Donor[] = [
  { id: "eu", name: "Avrupa Birliği", shortName: "AB", logo: "/images/homepage/donors/eu.png", type: "eu" },
  { id: "undp", name: "Birleşmiş Milletler Kalkınma Programı", shortName: "UNDP", logo: "/images/homepage/donors/undp.png", type: "other" },
  { id: "wb", name: "Dünya Bankası", shortName: "WB", logo: "/images/homepage/donors/wb.png", type: "other" },
  { id: "kfw", name: "KfW Kalkınma Bankası", shortName: "KfW", logo: "/images/homepage/donors/kfw.png", type: "other" },
  { id: "ka", name: "Kalkınma Ajansları", shortName: "KA", logo: "/images/homepage/donors/ka.png", type: "other" },
];
