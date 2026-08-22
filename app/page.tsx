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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Avrupa Birliği */}
            <Link href="/projeler?donor=eu"
              className="bg-white rounded-2xl border border-line p-6 flex flex-col items-center gap-3 hover:border-eu hover:shadow-md transition-all group">
              {/* EU yıldız çemberi — SVG inline */}
              <svg viewBox="0 0 120 80" className="w-28 h-auto" role="img" aria-label="Avrupa Birliği">
                <rect width="120" height="80" fill="#003399" rx="6" />
                {Array.from({length:12},(_,i)=>{
                  const a=(i*30-90)*Math.PI/180;
                  const cx=60+22*Math.cos(a), cy=40+22*Math.sin(a);
                  return (
                    <g key={i} transform={`translate(${cx},${cy})`}>
                      <polygon points="0,-4.5 1.1,-1.4 4.3,-1.4 1.7,0.9 2.6,4 0,2 -2.6,4 -1.7,0.9 -4.3,-1.4 -1.1,-1.4" fill="#FFCC00" />
                    </g>
                  );
                })}
              </svg>
              <div className="text-center">
                <div className="text-lg font-extrabold text-eu">{donorCounts["eu"] ?? 0}</div>
                <div className="text-xs text-mist">{locale === "tr" ? "proje" : "projects"}</div>
              </div>
            </Link>

            {/* GIZ */}
            <Link href="/projeler?donor=giz"
              className="bg-white rounded-2xl border border-line p-6 flex flex-col items-center gap-3 hover:border-eu hover:shadow-md transition-all group">
              <svg viewBox="0 0 120 80" className="w-28 h-auto" role="img" aria-label="GIZ">
                <rect width="120" height="80" fill="#fff" rx="6" />
                {/* GIZ logosu — tipografik */}
                <rect x="8" y="20" width="104" height="40" rx="4" fill="#007A3D" />
                <text x="60" y="48" textAnchor="middle" fontSize="22" fontWeight="900" fill="white" fontFamily="Arial, sans-serif" letterSpacing="3">GIZ</text>
              </svg>
              <div className="text-center">
                <div className="text-lg font-extrabold text-eu">{donorCounts["giz"] ?? 0}</div>
                <div className="text-xs text-mist">{locale === "tr" ? "proje" : "projects"}</div>
              </div>
            </Link>

            {/* Dünya Bankası */}
            <Link href="/projeler?donor=wb"
              className="bg-white rounded-2xl border border-line p-6 flex flex-col items-center gap-3 hover:border-eu hover:shadow-md transition-all group">
              <svg viewBox="0 0 120 80" className="w-28 h-auto" role="img" aria-label="Dünya Bankası">
                <rect width="120" height="80" fill="#fff" rx="6" />
                <circle cx="60" cy="40" r="28" fill="none" stroke="#009FDA" strokeWidth="3" />
                <ellipse cx="60" cy="40" rx="14" ry="28" fill="none" stroke="#009FDA" strokeWidth="2" />
                <line x1="32" y1="40" x2="88" y2="40" stroke="#009FDA" strokeWidth="2" />
                <line x1="35" y1="28" x2="85" y2="28" stroke="#009FDA" strokeWidth="1.5" />
                <line x1="35" y1="52" x2="85" y2="52" stroke="#009FDA" strokeWidth="1.5" />
              </svg>
              <div className="text-center">
                <div className="text-lg font-extrabold text-eu">{donorCounts["wb"] ?? 0}</div>
                <div className="text-xs text-mist">{locale === "tr" ? "proje" : "projects"}</div>
              </div>
            </Link>

            {/* UNDP */}
            <Link href="/projeler?donor=undp"
              className="bg-white rounded-2xl border border-line p-6 flex flex-col items-center gap-3 hover:border-eu hover:shadow-md transition-all group">
              <svg viewBox="0 0 120 80" className="w-28 h-auto" role="img" aria-label="UNDP">
                <rect width="120" height="80" fill="#fff" rx="6" />
                <rect x="8" y="20" width="104" height="40" rx="4" fill="#009EDB" />
                <text x="60" y="47" textAnchor="middle" fontSize="19" fontWeight="900" fill="white" fontFamily="Arial, sans-serif" letterSpacing="2">UNDP</text>
              </svg>
              <div className="text-center">
                <div className="text-lg font-extrabold text-eu">{donorCounts["undp"] ?? 0}</div>
                <div className="text-xs text-mist">{locale === "tr" ? "proje" : "projects"}</div>
              </div>
            </Link>
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

            {/* Harita kartı */}
            <div className="bg-white border border-line rounded-2xl overflow-hidden hover:shadow-md transition-all group">
              {/* Mini harita görseli */}
              <div className="relative h-40 overflow-hidden bg-gradient-to-br from-blue-50 to-eu-pale">
                <svg viewBox="0 0 800 400" className="w-full h-full opacity-60" style={{ position: "absolute", inset: 0 }}>
                  {/* Türkiye ikonlaştırılmış şekli */}
                  <ellipse cx="400" cy="200" rx="340" ry="130" fill="#2563eb" fillOpacity="0.08" stroke="#2563eb" strokeOpacity="0.2" strokeWidth="1" />
                  {/* Proje lokasyon noktaları - gerçek iller */}
                  {[
                    [200,160,"Edirne"],[310,185,"İstanbul"],[380,165,"Ankara"],[290,230,"İzmir"],
                    [460,230,"Konya"],[530,190,"Kayseri"],[590,175,"Sivas"],[650,185,"Erzurum"],
                    [480,280,"Adana"],[540,290,"Gaziantep"],[610,250,"Diyarbakır"],[700,200,"Van"],
                    [420,150,"Bursa"],[350,240,"Denizli"],[580,210,"Malatya"],[670,165,"Trabzon"],
                  ].map(([x,y,il],i) => (
                    <g key={i}>
                      <circle cx={x} cy={y} r="5" fill="#2563eb" fillOpacity="0.7">
                        <animate attributeName="r" values="5;7;5" dur={`${1.5+i*0.1}s`} repeatCount="indefinite" />
                      </circle>
                      <circle cx={x} cy={y} r="9" fill="none" stroke="#2563eb" strokeWidth="1" strokeOpacity="0.3" />
                    </g>
                  ))}
                  <text x="400" y="360" textAnchor="middle" fontSize="13" fill="#2563eb" fillOpacity="0.5" fontWeight="600">
                    {locale === "tr" ? "81 İl Kapsamında IPA Projeleri" : "IPA Projects Across 81 Provinces"}
                  </text>
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
                <div className="absolute bottom-3 left-4 flex gap-3">
                  {[
                    { label: locale === "tr" ? "İl" : "Province", val: "81" },
                    { label: locale === "tr" ? "Proje" : "Project", val: "499+" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 text-center shadow-sm">
                      <div className="text-xs font-bold text-eu">{s.val}</div>
                      <div className="text-xs text-slate">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-ink text-base mb-1">{locale === "tr" ? "Proje Haritası" : "Project Map"}</h3>
                  <p className="text-slate text-sm leading-relaxed">
                    {locale === "tr"
                      ? "Türkiye'nin 81 ilinde yürütülen AB destekli IPA projelerinin coğrafi dağılımını keşfedin. Doğu sınırından Trakya'ya kadar geniş bir coğrafyada 14 sektörde aktif proje."
                      : "Explore the geographical distribution of EU-funded IPA projects across all 81 provinces of Turkey."}
                  </p>
                </div>
                <Link href="/araclar/harita"
                  className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-eu hover:underline whitespace-nowrap mt-1">
                  {locale === "tr" ? "Haritayı Aç" : "Open Map"}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* İnfografik kartı */}
            <div className="bg-white border border-line rounded-2xl overflow-hidden hover:shadow-md transition-all group">
              {/* Mini bar chart */}
              <div className="relative h-40 overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 p-4">
                <div className="flex items-end gap-1.5 h-full pb-6">
                  {[
                    { label:"Ulaşım", val:275, color:"#1d4ed8" },
                    { label:"İçişleri", val:160, color:"#0e7490" },
                    { label:"Çevre", val:140, color:"#15803d" },
                    { label:"Enerji", val:40, color:"#ca8a04" },
                    { label:"Rekabet", val:50, color:"#7c3aed" },
                    { label:"Yargı", val:30, color:"#b45309" },
                    { label:"Haklar", val:28, color:"#be185d" },
                  ].map((s,i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                      <div
                        className="w-full rounded-t-sm transition-all"
                        style={{
                          background: s.color,
                          height: `${Math.round((s.val/275)*80)}%`,
                          opacity: 0.85,
                          minHeight: "8px",
                        }}
                      />
                      <span className="text-[9px] text-slate truncate w-full text-center">{s.label}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-3 right-4 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 shadow-sm text-center">
                  <div className="text-xs font-bold text-eu">€1.2 Milyar+</div>
                  <div className="text-xs text-slate">IPA II Toplam</div>
                </div>
              </div>
              <div className="p-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-ink text-base mb-1">{locale === "tr" ? "Portföy İnfografikleri" : "Portfolio Infographics"}</h3>
                  <p className="text-slate text-sm leading-relaxed">
                    {locale === "tr"
                      ? "IPA II döneminde €1,2 milyar+ AB katkısı. Halkalı-Kapıkule demiryolu tek başına €275 milyon. Sektör, donör ve dönem bazlı detaylı portföy analizi."
                      : "Over €1.2 billion EU contribution in IPA II. Detailed portfolio analysis by sector, donor, and period."}
                  </p>
                </div>
                <Link href="/araclar/infografik"
                  className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-eu hover:underline whitespace-nowrap mt-1">
                  {locale === "tr" ? "Tümünü Gör" : "See All"}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>

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
