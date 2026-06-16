// ============================================================
// Ana Sayfa (Faz 1+4) — tam tasarım, dinamik demo veri
// Tüm içerik getDataProvider() üzerinden gelir.
// ============================================================

import { getDataProvider } from "@/lib/data";
import { Navbar } from "@/components/Navbar";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ProjectsMap } from "@/components/ProjectsMap";
import {
  NewsSection, SectorsSection, EventsSection, FeaturedProjects,
  ListingsSection, BlogSection, ToolsSection, OtherDonorsSection, Footer,
} from "@/components/sections";

export default async function HomePage() {
  const db = getDataProvider();

  const [stats, news, sectors, events, featured, allProjects, listings, posts, donors] = await Promise.all([
    db.getHomeStats(),
    db.getNews(4),
    db.getSectors(),
    db.getEvents(true),
    db.getFeaturedProjects(4),
    db.getProjects(),
    db.getListings(),
    db.getBlogPosts(3),
    db.getDonors(),
  ]);

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
      <ProjectsMap projects={allProjects} sectors={sectors} donors={donors} />
      <ListingsSection listings={listings} />
      <BlogSection posts={posts} />
      <ToolsSection />
      <OtherDonorsSection donors={donors} />
      <Footer />
    </>
  );
}
