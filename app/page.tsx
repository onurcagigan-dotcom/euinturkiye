"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { useLocale } from "@/lib/i18n/context";
import type { Sector, Project, Listing, EventItem, BlogPost, HomeStats, Donor } from "@/lib/types";

export default function HomePage() {
  const { t, locale } = useLocale();
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [donorCounts, setDonorCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const db = getDataProvider();
    Promise.all([
      db.getHomeStats(),
      db.getEvents(),
      db.getListings(),
      db.getBlogPosts(),
      db.getProjects({ featured: true }),
      db.getSectors(),
      db.getDonors(),
      db.getProjects(),
    ]).then(([s, e, l, b, p, sec, don, allProjects]) => {
      setStats(s); setEvents(e); setListings(l); setBlogPosts(b); setFeaturedProjects(p); setSectors(sec);
      setDonors(don);
      const counts: Record<string, number> = {};
      allProjects.forEach((proj) => { counts[proj.donorId] = (counts[proj.donorId] ?? 0) + 1; });
      setDonorCounts(counts);
    });
  }, []);

  const upcoming = events
    .filter((e) => e.isPublic && new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const recentNews = blogPosts.slice(0, 4);

  const statusLabel = (s: Project["status"]) =>
    s === "devam" ? t("status_ongoing") : s === "tamamlandi" ? t("status_completed") : t("status_planning");

  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-gradient-to-br from-eu to-blue-900 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/10 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            {t("home_badge")}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            {t("home_hero_title_1")}<br />
            <span className="text-yellow-300">{t("home_hero_title_2")}</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
            {t("home_hero_sub")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/projeler" className="px-6 py-3 bg-white text-eu font-bold rounded-xl hover:bg-blue-50 transition-colors">
              {t("home_explore")}
            </Link>
            <Link href="/kayit" className="px-6 py-3 bg-yellow-400 text-ink font-bold rounded-xl hover:bg-yellow-300 transition-colors">
              {t("home_signup")}
            </Link>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="max-w-3xl mx-auto mt-14 grid grid-cols-3 gap-4">
          {[
            { label: t("stat_projects"), value: (stats?.projects ?? 0).toLocaleString(locale === "tr" ? "tr" : "en") },
            { label: t("stat_listings"), value: (stats?.openListings ?? 0).toString() },
            { label: t("stat_events"), value: (stats?.upcomingEvents ?? 0).toString() },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-5 text-center">
              <div className="text-3xl font-extrabold">{s.value}</div>
              <div className="text-blue-200 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sektörler */}
      <section className="py-14 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-ink mb-8">{t("home_sectors")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {sectors.map((s) => (
              <Link key={s.id} href={`/projeler?sektor=${s.id}`}
                className="bg-white rounded-xl border border-line p-4 text-center hover:border-eu hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-full mx-auto mb-3" style={{ backgroundColor: s.color ?? "#003399" }} />
                <div className="text-sm font-semibold text-ink leading-tight">{s.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Donörler */}
      <section className="py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-ink mb-8">{t("home_donors")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {donors.map((d) => (
              <Link key={d.id} href={`/projeler?donor=${d.id}`}
                className="bg-white rounded-xl border border-line p-5 text-center hover:border-eu hover:shadow-md transition-all">
                <div className="text-2xl font-extrabold text-eu">{donorCounts[d.id] ?? 0}</div>
                <p className="text-xs text-mist mb-1">{t("home_donor_projects")}</p>
                <div className="text-sm font-semibold text-ink leading-tight">{d.name}</div>
                <p className="text-xs text-mist mt-0.5">{d.country}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Öne Çıkan Projeler */}
      <section className="py-14 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-ink">{t("home_featured")}</h2>
            <Link href="/projeler" className="text-eu text-sm font-semibold hover:underline">{t("home_all_projects")} →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.slice(0, 6).map((p) => (
              <Link key={p.id} href={`/projeler/${p.id}`}
                className="bg-white border border-line rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-2 bg-eu" />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      p.status === "devam" ? "bg-green-100 text-green-700" :
                      p.status === "tamamlandi" ? "bg-gray-100 text-gray-600" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {statusLabel(p.status)}
                    </span>
                    <span className="text-xs text-mist">{p.ipaPeriod}</span>
                  </div>
                  <h3 className="font-bold text-ink mb-2 leading-tight">{p.title}</h3>
                  <p className="text-slate text-sm leading-relaxed line-clamp-2">{p.summary}</p>
                  {p.budget && (
                    <div className="mt-3 text-xs text-eu font-semibold">{p.budget}</div>
                  )}
                  {(p.ownerSubscriberName || (p.consortiumMembers && p.consortiumMembers.length > 0)) && (
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-line">
                      <span className="text-xs">🤝</span>
                      <span className="text-xs text-eu font-medium truncate">
                        {p.ownerSubscriberName ?? t("consortium_title")}
                        {p.consortiumMembers && p.consortiumMembers.length > 0 && ` +${p.consortiumMembers.length}`}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* İlanlar */}
      <section className="py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-ink">{t("home_listings")}</h2>
            <Link href="/ilanlar" className="text-eu text-sm font-semibold hover:underline">{t("home_all_listings")} →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {listings.slice(0, 6).map((l) => (
              <Link key={l.id} href={`/ilanlar/${l.id}`}
                className="bg-white border border-line rounded-xl p-5 hover:border-eu hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    l.type === "is" ? "bg-blue-100 text-blue-700" :
                    l.type === "satinalma" ? "bg-orange-100 text-orange-700" :
                    "bg-purple-100 text-purple-700"
                  }`}>
                    {l.type === "is" ? t("listings_jobs") : l.type === "satinalma" ? t("listings_procurement") : t("listings_tender")}
                  </span>
                  {l.locked && <span className="text-mist">🔒</span>}
                </div>
                <h3 className="font-semibold text-ink text-sm leading-tight mb-1">{l.title}</h3>
                <p className="text-xs text-mist">{l.organization}</p>
                {l.deadline && <p className="text-xs text-tr mt-2">{t("listing_deadline")}: {l.deadline}</p>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Etkinlikler */}
      {upcoming.length > 0 && (
        <section className="py-14 px-6 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-ink">{t("home_upcoming_events")}</h2>
              <Link href="/etkinlikler" className="text-eu text-sm font-semibold hover:underline">{t("home_all_events")} →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcoming.map((e) => {
                const d = new Date(e.date);
                return (
                  <Link key={e.id} href={`/etkinlikler/${e.id}`}
                    className="bg-white border border-line rounded-xl p-5 hover:border-eu hover:shadow-md transition-all flex gap-4">
                    <div className="flex-shrink-0 text-center bg-eu-pale rounded-xl p-3 w-16">
                      <div className="text-2xl font-extrabold text-eu">{d.getDate()}</div>
                      <div className="text-xs text-eu font-semibold uppercase">
                        {d.toLocaleDateString(locale === "tr" ? "tr" : "en", { month: "short" })}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink text-sm leading-tight mb-1">{e.title}</h3>
                      <p className="text-xs text-mist">📍 {e.location}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Gündem */}
      <section className="py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-ink">{t("home_agenda")}</h2>
            <Link href="/gundem" className="text-eu text-sm font-semibold hover:underline">{t("home_all_news")} →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentNews.map((post) => (
              <Link key={post.id} href={`/gundem/${post.slug}`}
                className="bg-white border border-line rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                {post.coverImage ? (
                  <div className="h-32 relative overflow-hidden">
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-eu to-blue-700 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-ink text-sm leading-tight mb-2">{post.title}</h3>
                  <p className="text-xs text-mist">{new Date(post.publishedAt).toLocaleDateString(locale === "tr" ? "tr" : "en")}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Dijital Araçlar */}
      <section className="py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-ink mb-2">{t("home_tools")}</h2>
          <p className="text-slate mb-8">{t("home_tools_sub")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: "/araclar/etkinlik", title: locale === "tr" ? "Etkinlik Yönetimi" : "Event Management", desc: locale === "tr" ? "RSVP takibi, gündem ve müsaitlik anketi." : "RSVP tracking, agenda, and availability polls.", color: "#0E7490" },
              { href: "/araclar/dokuman", title: locale === "tr" ? "E-Doküman Yönetimi" : "E-Document Management", desc: locale === "tr" ? "Doküman kütüphanesi, erişim kontrolü, indirme sayacı." : "Document library, access control, download tracking.", color: "#1D7A5F" },
              { href: "/araclar/bulten", title: locale === "tr" ? "Bülten Gönderimi" : "Newsletter Campaigns", desc: locale === "tr" ? "Hedefli e-posta kampanyaları ve istatistikler." : "Targeted email campaigns and statistics.", color: "#7C5710" },
              { href: "/araclar/paydas", title: locale === "tr" ? "Paydaş İletişimi" : "Stakeholder Communication", desc: locale === "tr" ? "Ekip, uzman ve tedarikçi yönetimi." : "Team, expert, and supplier management.", color: "#3730A3" },
              { href: "/araclar/rapor", title: locale === "tr" ? "Raporlama" : "Reporting", desc: locale === "tr" ? "Portföy analizi ve Excel/CSV dışa aktarım." : "Portfolio analysis and Excel/CSV export.", color: "#0F766E" },
              { href: "/araclar/egitim", title: "E-Learning", desc: locale === "tr" ? "Eğitim videoları ve proje ekibi öğrenim takibi." : "Training videos and team learning progress.", color: "#7C3AED" },
              { href: "/araclar/harita", title: locale === "tr" ? "Proje Haritası" : "Project Map", desc: locale === "tr" ? "İllere göre proje dağılımını görselleştirin." : "Visualize project distribution by province.", color: "#B45309" },
              { href: "/araclar/infografik", title: locale === "tr" ? "İnfografikler" : "Infographics", desc: locale === "tr" ? "Sektör, dönem ve bütçeye göre görsel analiz." : "Visual analysis by sector, period, and budget.", color: "#C2410C" },
              { href: "/uzmanlar", title: locale === "tr" ? "Uzman CV Havuzu" : "Expert CV Pool", desc: locale === "tr" ? "Uzman profillerini yönetin ve proje ekibi kurun." : "Manage expert profiles and build project teams.", color: "#0369A1" },
            ].map((tool) => (
              <Link key={tool.href} href={tool.href}
                className="border border-line rounded-xl overflow-hidden hover:shadow-md transition-all group">
                <div className="h-20 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${tool.color}, ${tool.color}cc)` }}>
                  <span className="text-white text-2xl font-extrabold opacity-30 group-hover:opacity-50 transition-opacity">✦</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-ink text-sm mb-1">{tool.title}</h3>
                  <p className="text-xs text-slate leading-relaxed">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-eu text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-4">{t("home_cta_title")}</h2>
          <p className="text-blue-200 mb-8">
            {t("home_cta_sub")}
          </p>
          <Link href="/kayit" className="inline-block px-8 py-3 bg-yellow-400 text-ink font-bold rounded-xl hover:bg-yellow-300 transition-colors">
            {t("home_cta_button")}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
