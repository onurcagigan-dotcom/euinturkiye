// ============================================================
// DemoDataProvider — JSON tabanlı veri sağlayıcı.
// Firebase olmadan tüm sistemi çalıştırır.
// DataProvider arayüzünü birebir uygular.
// ============================================================

import type { DataProvider, ProjectFilters } from "../provider";
import type { ListingType } from "../../types";
import { sectors, donors } from "./sectors";
import { projects, listings, events, blogPosts, news } from "./content";

// Demo'da küçük bir gecikme ekleyerek gerçek async davranışı taklit ediyoruz
const delay = <T>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), 0));

export class DemoDataProvider implements DataProvider {
  // --- Sektörler ---
  getSectors = () => delay([...sectors].sort((a, b) => a.order - b.order));
  getSector = (id: string) => delay(sectors.find((s) => s.id === id) ?? null);

  // --- Donörler ---
  getDonors = () => delay(donors);
  getDonor = (id: string) => delay(donors.find((d) => d.id === id) ?? null);

  // --- Projeler ---
  getProjects = (filters?: ProjectFilters) => {
    let result = [...projects];
    if (filters?.sectorId) result = result.filter((p) => p.sectorId === filters.sectorId);
    if (filters?.donorId) result = result.filter((p) => p.donorId === filters.donorId);
    if (filters?.ipaPeriod) result = result.filter((p) => p.ipaPeriod === filters.ipaPeriod);
    if (filters?.status) result = result.filter((p) => p.status === filters.status);
    if (filters?.featured !== undefined) result = result.filter((p) => p.featured === filters.featured);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)
      );
    }
    return delay(result);
  };
  getProject = (id: string) => delay(projects.find((p) => p.id === id) ?? null);
  getFeaturedProjects = (limit = 4) =>
    delay(projects.filter((p) => p.featured).slice(0, limit));

  // --- İlanlar ---
  getListings = (type?: ListingType) =>
    delay(type ? listings.filter((l) => l.type === type) : listings);
  getListing = (id: string) => delay(listings.find((l) => l.id === id) ?? null);

  // --- Etkinlikler ---
  getEvents = (onlyUpcoming = false) => {
    let result = [...events].sort((a, b) => a.date.localeCompare(b.date));
    if (onlyUpcoming) {
      const today = new Date().toISOString().slice(0, 10);
      result = result.filter((e) => e.date >= today);
    }
    return delay(result);
  };
  getEvent = (id: string) => delay(events.find((e) => e.id === id) ?? null);

  // --- Blog ---
  getBlogPosts = (limit?: number) => {
    const sorted = [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return delay(limit ? sorted.slice(0, limit) : sorted);
  };
  getBlogPost = (slug: string) => delay(blogPosts.find((b) => b.slug === slug) ?? null);

  // --- Haberler ---
  getNews = (limit = 4) => {
    const sorted = [...news].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return delay(sorted.slice(0, limit));
  };

  // --- İstatistikler ---
  getHomeStats = () => {
    const totalProjects = sectors.reduce((sum, s) => sum + s.projectCount, 0);
    const today = new Date().toISOString().slice(0, 10);
    return delay({
      projects: totalProjects,
      openListings: listings.length,
      upcomingEvents: events.filter((e) => e.date >= today).length,
    });
  };
}
