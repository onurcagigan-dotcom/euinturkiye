// ============================================================
// euinturkiye.com — Veri Tipleri
// Firestore koleksiyonlarıyla birebir uyumlu.
// Hem demo (JSON) hem canlı (Firestore) aynı tipleri kullanır.
// ============================================================

/** IPA dönemleri */
export type IpaPeriod = "ipa-oncesi" | "ipa-1" | "ipa-2" | "ipa-3";

/** 10 AB sektörü (slug = id) */
export interface Sector {
  id: string;          // "yargi", "cevre" ...
  name: string;        // "Yargı"
  icon: string;        // görsel yolu: images/homepage/sectors/yargi.png
  projectCount: number;
  order: number;
}

/** Donör kurumlar (AB, UNDP, WB, KfW, Kalkınma Ajansları ...) */
export interface Donor {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  type: "eu" | "other";  // AB mi, diğer donör mü
  website?: string;
}

/** Projeler */
export interface Project {
  id: string;
  title: string;
  summary: string;
  sectorId: string;
  donorId: string;
  ipaPeriod: IpaPeriod;
  beneficiary: string;      // yararlanıcı kurum
  locations: string[];      // iller
  budget?: string;
  startDate?: string;
  endDate?: string;
  status: "devam" | "tamamlandi" | "planlama";
  featured: boolean;        // ana sayfa vitrininde mi
  coverImage?: string;
}

/** İlan tipleri: iş / satınalma / ihale */
export type ListingType = "is" | "satinalma" | "ihale";

export interface Listing {
  id: string;
  type: ListingType;
  title: string;
  organization: string;
  projectId?: string;
  location?: string;
  deadline?: string;
  locked: boolean;          // satınalma detayı abonelik gerektirir
  description: string;
}

/** Etkinlikler */
export interface EventItem {
  id: string;
  title: string;
  date: string;             // ISO
  location: string;
  projectId?: string;
  isPublic: boolean;        // herkese açık mı
  description?: string;
}

/** Blog / Gündem yazıları */
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  publishedAt: string;
  readMinutes: number;
}

/** Gündem (ana sayfa haber kartları) */
export interface NewsItem {
  id: string;
  kind: "haber" | "duyuru";
  title: string;
  excerpt: string;
  source: string;
  publishedAt: string;
}

/** Ana sayfa canlı sayaçları */
export interface HomeStats {
  projects: number;
  openListings: number;
  upcomingEvents: number;
}
