// ============================================================
// Ana Sayfa (Faz 1) — tam tasarım, dinamik demo veri
// Tüm içerik getDataProvider() üzerinden gelir.
// ============================================================

import { getDataProvider } from "@/lib/data";
import { Navbar } from "@/components/Navbar";
import { HeroCarousel } from "@/components/HeroCarousel";
import {
  NewsSection, SectorsSection, EventsSection, FeaturedProjects,
  ListingsSection, BlogSection, ToolsSection, Footer,
} from "@/components/sections";

export default async function HomePage() {
  const db = getDataProvider();

  const [stats, news, sectors, events, featured, listings, posts] = await Promise.all([
    db.getHomeStats(),
    db.getNews(4),
    db.getSectors(),
    db.getEvents(true),
    db.getFeaturedProjects(4),
    db.getListings(),
    db.getBlogPosts(3),
  ]);

  // Sektör id -> ad eşlemesi (proje kartlarındaki etiket için)
  const sectorNames: Record<string, string> = {};
  sectors.forEach((s) => (sectorNames[s.id] = s.name));

  return (
    <>
      <Navbar />
      <HeroCarousel stats={stats} />
      <NewsSection items={news} />
      <SectorsSection sectors={sectors} />
      <EventsSection events={events} />
      <FeaturedProjects projects={featured} sectorNames={sectorNames} />
      <ListingsSection listings={listings} />
      <BlogSection posts={posts} />
      <ToolsSection />
      <Footer />
    </>
  );
}
