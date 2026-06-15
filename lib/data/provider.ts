// ============================================================
// DataProvider — Veri Erişim Sözleşmesi
//
// Tüm sayfalar veriye SADECE bu arayüz üzerinden erişir.
// Verinin demo JSON'dan mı yoksa Firestore'dan mı geldiğini
// sayfa kodu BİLMEZ. Kaynak, ortam değişkeniyle seçilir.
//
// Yeni bir kaynak eklemek = bu arayüzü implemente eden
// yeni bir sınıf yazmak. Sayfa kodu hiç değişmez.
// ============================================================

import type {
  Sector,
  Donor,
  Project,
  Listing,
  ListingType,
  EventItem,
  BlogPost,
  NewsItem,
  HomeStats,
} from "../types";

export interface ProjectFilters {
  sectorId?: string;
  donorId?: string;
  ipaPeriod?: string;
  status?: string;
  featured?: boolean;
  search?: string;
}

export interface DataProvider {
  // --- Sektörler ---
  getSectors(): Promise<Sector[]>;
  getSector(id: string): Promise<Sector | null>;

  // --- Donörler ---
  getDonors(): Promise<Donor[]>;
  getDonor(id: string): Promise<Donor | null>;

  // --- Projeler ---
  getProjects(filters?: ProjectFilters): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  getFeaturedProjects(limit?: number): Promise<Project[]>;

  // --- İlanlar ---
  getListings(type?: ListingType): Promise<Listing[]>;
  getListing(id: string): Promise<Listing | null>;

  // --- Etkinlikler ---
  getEvents(onlyUpcoming?: boolean): Promise<EventItem[]>;
  getEvent(id: string): Promise<EventItem | null>;

  // --- Blog / Gündem ---
  getBlogPosts(limit?: number): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | null>;

  // --- Ana sayfa haberleri ---
  getNews(limit?: number): Promise<NewsItem[]>;

  // --- İstatistikler ---
  getHomeStats(): Promise<HomeStats>;
}
