"use client";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { HeroCarousel } from "@/components/HeroCarousel";
import { HOME_BANNERS } from "@/lib/home-banners";
import { useLocale } from "@/lib/i18n/context";
import type { Sector, Project, Listing, EventItem, BlogPost, Donor, Campaign, ExpertProfile } from "@/lib/types";

export default function HomePage() {
  const { t, locale } = useLocale();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [donorCounts, setDonorCounts] = useState<Record<string, number>>({});
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [allExperts, setAllExperts] = useState<ExpertProfile[]>([]);

  // Her render'da rastgele 3 uzman seç
  const featuredExperts = useMemo(() => {
    const visible = allExperts.filter((e) => e.visible);
    const shuffled = [...visible].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [allExperts]);

  useEffect(() => {
    const db = getDataProvider();
    Promise.all([
      db.getEvents(),
      db.getListings(),
      db.getBlogPosts(),
      db.getProjects({ featured: true }),
      db.getSectors(),
      db.getDonors(),
      db.getProjects(),
      db.getCampaigns(),
      db.getExpertProfiles(),
    ]).then(([e, l, b, p, sec, don, allProjects, camps, experts]) => {
      setEvents(e); setListings(l); setBlogPosts(b); setFeaturedProjects(p); setSectors(sec);
      setDonors(don);
      const counts: Record<string, number> = {};
      allProjects.forEach((proj) => { counts[proj.donorId] = (counts[proj.donorId] ?? 0) + 1; });
      setDonorCounts(counts);
      setRecentCampaigns(camps.filter((c) => c.status === "gonderildi").slice(0, 3));
      setAllExperts(experts.filter((e) => e.visible));
    });
  }, []);

  const upcoming = events
    .filter((e) => e.isPublic && new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const recentNews = blogPosts.slice(0, 4);

  const statusLabel = (s: Project["status"]) =>
    s === "devam" ? t("status_ongoing") : t("status_completed");

  return (
    <PageShell>
      {/* Hero */}
      {HOME_BANNERS.length > 0 ? (
        <HeroCarousel banners={HOME_BANNERS} searchPlaceholder={t("projects_search_placeholder")} />
      ) : (
      <section className="bg-gradient-to-br from-eu to-blue-900 text-white py-12 px-6">
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
      </section>
      )}

      {/* Sektörler */}
      <section className="py-14 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-ink mb-8">{t("home_sectors")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {sectors.map((s) => (
              <Link key={s.id} href={`/projeler?sektor=${s.id}`}
                className="bg-white rounded-xl border border-line p-4 text-center hover:border-eu hover:shadow-md transition-all">
                {s.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.iconUrl} alt={s.name} className="w-10 h-10 mx-auto mb-3 object-contain" />
                ) : (
                  <div className="w-10 h-10 rounded-full mx-auto mb-3" style={{ backgroundColor: s.color ?? "#003399" }} />
                )}
                <div className="text-sm font-semibold text-ink leading-tight">{s.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Gündem — Donörlerden önce */}
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

      {/* Donörler */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-ink">{t("home_donors")}</h2>
            <Link href="/projeler" className="text-eu text-sm font-semibold hover:underline">
              {locale === "tr" ? "Tüm Donörler" : "All Donors"} →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[...donors]
              .sort((a, b) => (donorCounts[b.id] ?? 0) - (donorCounts[a.id] ?? 0))
              .slice(0, 5)
              .map((d) => (
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {([
              { type: "is" as const, label: t("listings_jobs"), badge: "bg-blue-100 text-blue-700" },
              { type: "satinalma" as const, label: t("listings_procurement"), badge: "bg-orange-100 text-orange-700" },
              { type: "ihale" as const, label: t("listings_tender"), badge: "bg-purple-100 text-purple-700" },
            ]).map((col) => {
              const colListings = listings.filter((l) => l.type === col.type).slice(0, 4);
              return (
                <div key={col.type}>
                  <h3 className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${col.badge}`}>
                    {col.label}
                  </h3>
                  <div className="space-y-3">
                    {colListings.length === 0 ? (
                      <p className="text-sm text-mist">{t("company_profile_no_listings")}</p>
                    ) : (
                      colListings.map((l) => (
                        <Link key={l.id} href={`/ilanlar/${l.id}`}
                          className="block bg-white border border-line rounded-xl p-4 hover:border-eu hover:shadow-md transition-all">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-ink text-sm leading-tight">{l.title}</h4>
                            {l.locked && <span className="text-mist flex-shrink-0">🔒</span>}
                          </div>
                          <p className="text-xs text-mist">{l.organization}</p>
                          {l.deadline && <p className="text-xs text-tr mt-1.5">{t("listing_deadline")}: {l.deadline}</p>}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
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

      {/* Proje Haritası & İnfografik — Öne Çıkan Projelerden Sonra */}
      <section className="py-10 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Link href="/araclar/harita"
              className="bg-white border border-line rounded-2xl p-6 hover:border-eu hover:shadow-md transition-all flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#B45309,#92400e)" }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-ink text-base">{locale === "tr" ? "Proje Haritası" : "Project Map"}</h3>
                <p className="text-slate text-sm mt-1">{locale === "tr" ? "Türkiye'nin il bazlı proje dağılımını keşfedin." : "Explore project distribution across Turkish provinces."}</p>
              </div>
            </Link>
            <Link href="/araclar/infografik"
              className="bg-white border border-line rounded-2xl p-6 hover:border-eu hover:shadow-md transition-all flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#C2410C,#9a3412)" }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-ink text-base">{locale === "tr" ? "Portföy İnfografikleri" : "Portfolio Infographics"}</h3>
                <p className="text-slate text-sm mt-1">{locale === "tr" ? "Sektör, donör ve dönem bazlı portföy analizleri." : "Portfolio analysis by sector, donor, and period."}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
      {/* Dijital Araçlar */}
      <section className="py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-ink mb-2">{t("home_tools")}</h2>
          <p className="text-slate mb-8">{t("home_tools_sub")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: "/araclar/etkinlik", title: locale === "tr" ? "Etkinlik Yönetimi" : "Event Management", desc: locale === "tr" ? "RSVP takibi, gündem ve müsaitlik anketi." : "RSVP tracking, agenda, and availability polls.", color: "#0E7490" },
              { href: "/araclar/dokuman", title: locale === "tr" ? "E-Doküman Yönetimi" : "E-Document Management", desc: locale === "tr" ? "Doküman kütüphanesi, erişim kontrolü, indirme sayacı." : "Document library, access control, download tracking.", color: "#1D7A5F" },
              { href: "/araclar/bulten", title: locale === "tr" ? "Bülten Gönderimi" : "Newsletter Campaigns", desc: locale === "tr" ? "Hedefli e-posta kampanyaları ve istatistikler." : "Targeted email campaigns and statistics.", color: "#7C5710" },
              { href: "/araclar/paydas", title: locale === "tr" ? "Paydaş İletişimi" : "Stakeholder Communication", desc: locale === "tr" ? "Ekip, uzman ve tedarikçi yönetimi." : "Team, expert, and supplier management.", color: "#3730A3" },
              { href: "/araclar/egitim", title: locale === "tr" ? "Eğitim Materyalleri" : "Training Materials", desc: locale === "tr" ? "Firmaların eklediği video ve doküman eğitim materyalleri kütüphanesi." : "Library of training videos and documents added by companies.", color: "#7C3AED" },
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

      {/* Son Bültenler */}
      {recentCampaigns.length > 0 && (
        <section className="py-14 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-ink">{locale === "tr" ? "Son Bültenler" : "Recent Newsletters"}</h2>
                <p className="text-slate text-sm mt-1">{locale === "tr" ? "Platformdaki firmalar tarafından yayınlanan güncel bültenler" : "Latest newsletters published by platform members"}</p>
              </div>
              <Link href="/araclar/bulten" className="text-eu text-sm font-semibold hover:underline">{locale === "tr" ? "Tümü →" : "All →"}</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentCampaigns.map((c) => (
                <Link key={c.id} href={`/bultenler/${c.id}`}
                  className="bg-surface border border-line rounded-xl p-5 hover:border-eu hover:shadow-sm transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-eu flex items-center justify-center text-white text-xs font-bold flex-shrink-0">B</div>
                    <span className="text-xs text-mist">{c.sentAt ? new Date(c.sentAt).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB") : ""}</span>
                  </div>
                  <h3 className="font-bold text-ink text-sm leading-tight mb-2">{c.subject}</h3>
                  <p className="text-xs text-mist line-clamp-2">{c.body.split("\n")[0]}</p>
                  <div className="flex gap-3 mt-3 text-xs text-mist">
                    <span>👁 {c.openCount} açılma</span>
                    <span>📨 {c.recipientCount} kişi</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Öne Çıkan Uzmanlar */}
      {featuredExperts.length > 0 && (
        <section className="py-14 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-ink">{locale === "tr" ? "Uzman Havuzundan" : "From the Expert Pool"}</h2>
                <p className="text-slate text-sm mt-1">{locale === "tr" ? "AB-Türkiye ekosisteminde proje yönetimi, mali yönetim, saha uygulamaları ve teknik konularda deneyimli uzmanlar." : "Experienced experts in project management, financial management, field applications and technical areas in the EU-Turkey ecosystem."}</p>
              </div>
              <Link href="/uzmanlar" className="text-eu text-sm font-semibold hover:underline">{locale === "tr" ? "Tüm Uzmanlar →" : "All Experts →"}</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featuredExperts.map((e) => (
                <Link key={e.id} href={`/uzmanlar/${e.id}`}
                  className="bg-white border border-line rounded-xl p-5 hover:border-eu hover:shadow-sm transition-all flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-eu flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {e.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-ink text-sm">{e.name}</h3>
                    <p className="text-xs text-slate mb-2">{e.title}</p>
                    <div className="flex flex-wrap gap-1">
                      {e.expertise.slice(0, 2).map((ex) => (
                        <span key={ex} className="text-xs bg-eu-pale text-eu px-2 py-0.5 rounded-full">{ex}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
