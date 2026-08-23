"use client";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { HeroCarousel } from "@/components/HeroCarousel";
import { HOME_BANNERS } from "@/lib/home-banners";
import { useLocale } from "@/lib/i18n/context";
import type { Sector, Project, Listing, EventItem, BlogPost, Donor, Campaign, ExpertProfile } from "@/lib/types";
import { TOOLS, ToolIcon } from "@/lib/tools-config";

export default function HomePage() {
  const { t, locale } = useLocale();
  const isEn = locale === "en";
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
                <div className="text-sm font-semibold text-ink leading-tight">{isEn ? (s.nameEn ?? s.name) : s.name}</div>
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
            {[
              { id: "eu",   name: "Avrupa Birliği",  nameEn: "European Union",  img: "/donor-logos/eu.svg",   alt: "EU" },
              { id: "giz",  name: "GIZ",              nameEn: "GIZ",             img: "/donor-logos/giz.svg",  alt: "GIZ" },
              { id: "wb",   name: "Dünya Bankası",    nameEn: "World Bank",      img: "/donor-logos/wb.svg",   alt: "World Bank" },
              { id: "undp", name: "UNDP",             nameEn: "UNDP",            img: "/donor-logos/undp.svg", alt: "UNDP" },
            ].filter((d) => (donorCounts[d.id] ?? 0) > 0).map((d) => (
              <Link key={d.id} href={`/projeler?donor=${d.id}`}
                className="bg-white rounded-2xl border border-line p-6 flex flex-col items-center gap-3 hover:border-eu hover:shadow-md transition-all group">
                {/* Logo placeholder — Onur gerçek logolar verecek */}
                <div className="w-28 h-16 flex items-center justify-center relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.img}
                    alt={d.alt}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      // Görsel yoksa yer tutucu göster
                      const t = e.currentTarget;
                      t.style.display = "none";
                      const next = t.nextElementSibling as HTMLElement | null;
                      if (next) next.style.display = "flex";
                    }}
                  />
                  {/* Fallback — logo dosyası gelene kadar */}
                  <div className="hidden items-center justify-center w-full h-full rounded-lg bg-eu-pale border-2 border-dashed border-eu/20">
                    <span className="text-xs font-bold text-eu/50">{d.alt}</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-extrabold text-eu">{donorCounts[d.id] ?? 0}</div>
                  <div className="text-xs text-mist">{locale === "tr" ? "proje" : "projects"}</div>
                </div>
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

      {/* Proje Haritası & İnfografik — tek sütun, tam genişlik */}
      <section className="py-10 px-6 bg-surface">
        <div className="max-w-7xl mx-auto space-y-5">

          {/* Harita kartı */}
          <div className="bg-white border border-line rounded-2xl overflow-hidden hover:shadow-md transition-all">
            <div className="grid grid-cols-1 md:grid-cols-5">
              {/* Sol: Türkiye haritası — il noktaları ile */}
              <div className="md:col-span-3 relative h-56 md:h-64 bg-gradient-to-br from-blue-50 to-eu-pale overflow-hidden">
                <svg viewBox="0 0 900 380" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
                  {/* Türkiye anakarası */}
                  <path d="M 80 190 Q 110 130 170 118 Q 210 108 250 105 Q 290 98 330 100 Q 365 93 395 88 Q 425 83 455 88 Q 485 90 515 86 Q 548 80 578 88 Q 608 86 638 95 Q 668 90 698 102 Q 728 112 755 128 Q 782 145 805 168 Q 822 188 818 212 Q 812 232 795 248 Q 778 260 758 262 Q 738 260 718 252 Q 698 242 675 250 Q 655 258 632 252 Q 612 244 592 252 Q 572 260 550 256 Q 528 250 508 258 Q 488 266 468 258 Q 448 250 428 258 Q 408 266 385 256 Q 362 246 340 253 Q 318 260 295 252 Q 272 243 250 248 Q 228 253 208 244 Q 188 233 168 238 Q 148 242 128 232 Q 105 220 90 208 Q 82 200 80 190 Z"
                    fill="#003399" fillOpacity="0.1" stroke="#003399" strokeOpacity="0.25" strokeWidth="1.5"/>
                  {[
                    [175,185,7],[285,172,10],[378,168,11],[268,218,8],[470,215,7],[538,186,7],
                    [598,174,6],[680,180,8],[473,262,8],[543,268,9],[618,246,7],[718,208,6],
                    [414,152,7],[344,236,6],[583,206,8],[663,162,8],[232,198,6],[508,154,6],
                    [438,248,5],[598,226,6],[348,158,5],[488,188,5],[568,245,5],
                  ].map(([x,y,r],i) => (
                    <g key={i}>
                      <circle cx={x} cy={y} r={r+4} fill="#003399" fillOpacity="0.06"/>
                      <circle cx={x} cy={y} r={r} fill="#003399" fillOpacity="0.65">
                        <animate attributeName="opacity" values="0.65;0.35;0.65" dur={`${2.2+i*0.12}s`} repeatCount="indefinite"/>
                      </circle>
                    </g>
                  ))}
                  <text x="450" y="345" textAnchor="middle" fontSize="12" fill="#003399" fillOpacity="0.35" fontWeight="600">
                    {"IPA II — 165 Proje · Türkiye Geneli"}
                  </text>
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent pointer-events-none"/>
                <div className="absolute bottom-3 left-4 flex gap-2 z-10">
                  {[
                    { val: "165", label: locale === "tr" ? "Proje" : "Projects" },
                    { val: "10", label: locale === "tr" ? "Sektör" : "Sectors" },
                    { val: "€1.4Mrd", label: locale === "tr" ? "AB Katkısı" : "EU Funds" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/95 backdrop-blur-sm rounded-xl px-2.5 py-1.5 shadow-sm text-center border border-white/80">
                      <div className="text-xs font-extrabold text-eu leading-none">{s.val}</div>
                      <div className="text-[9px] text-slate mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Sağ: Metin */}
              <div className="md:col-span-2 p-6 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-eu uppercase tracking-widest mb-2">
                    {locale === "tr" ? "Coğrafi Dağılım" : "Geographic Distribution"}
                  </div>
                  <h3 className="font-bold text-ink text-xl mb-3">
                    {locale === "tr" ? "Proje Haritası" : "Project Map"}
                  </h3>
                  <p className="text-slate text-sm leading-relaxed">
                    {locale === "tr"
                      ? "Yargıdan çevreye, enerjiden ulaştırmaya — Türkiye'nin tüm bölgelerinde yürütülen AB destekli IPA projelerinin coğrafi dağılımını etkileşimli haritada keşfedin."
                      : "From judiciary to environment, energy to transport — explore the geographic spread of EU-funded IPA projects across all regions of Turkey."}
                  </p>
                </div>
                <Link href="/araclar/harita"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white bg-eu px-4 py-2.5 rounded-xl hover:bg-blue-800 transition-colors w-fit">
                  {locale === "tr" ? "Haritayı Aç" : "Open Map"}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* İnfografik kartı */}
          <div className="bg-white border border-line rounded-2xl overflow-hidden hover:shadow-md transition-all">
            <div className="grid grid-cols-1 md:grid-cols-5">
              {/* Sol: Gerçek veri infografik */}
              <div className="md:col-span-3 relative h-56 md:h-64 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
                <svg viewBox="0 0 560 240" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
                  {/* Sektör bazlı AB katkısı bar chart — gerçek veriler */}
                  {[
                    { label: locale === "tr" ? "Ulaşım" : "Transport",    val: 290.9, color: "#1d4ed8" },
                    { label: locale === "tr" ? "Çevre" : "Environment",   val: 270.7, color: "#15803d" },
                    { label: locale === "tr" ? "Rekabet" : "Competition", val: 212.7, color: "#7c3aed" },
                    { label: locale === "tr" ? "İçişleri" : "Interior",   val: 201.7, color: "#0e7490" },
                    { label: locale === "tr" ? "İstihdam" : "Employment", val: 260.2, color: "#ea580c" },
                    { label: locale === "tr" ? "Enerji" : "Energy",       val:  37.7, color: "#ca8a04" },
                    { label: locale === "tr" ? "Yargı" : "Justice",       val:  24.1, color: "#b45309" },
                    { label: locale === "tr" ? "Haklar" : "Rights",       val:  31.1, color: "#be185d" },
                    { label: locale === "tr" ? "Tarım" : "Agriculture",   val:  37.5, color: "#166534" },
                    { label: locale === "tr" ? "Sivil T." : "Civil Soc.", val:  19.1, color: "#4338ca" },
                  ].map((s, i) => {
                    const maxVal = 290.9;
                    const barH = Math.max((s.val / maxVal) * 140, 8);
                    const x = 28 + i * 53;
                    const y = 185 - barH;
                    return (
                      <g key={i}>
                        <rect x={x} y={y} width={40} height={barH} rx="3" fill={s.color} fillOpacity="0.82"/>
                        <text x={x+20} y={y-5} textAnchor="middle" fontSize="8.5" fill={s.color} fontWeight="700">
                          {s.val >= 100 ? `€${Math.round(s.val)}M` : `€${s.val.toFixed(0)}M`}
                        </text>
                        <text x={x+20} y="202" textAnchor="middle" fontSize="8" fill="#64748b">
                          {s.label.length > 7 ? s.label.slice(0,7) + "." : s.label}
                        </text>
                      </g>
                    );
                  })}
                  {/* Yatay çizgi */}
                  <line x1="20" y1="186" x2="540" y2="186" stroke="#e2e8f0" strokeWidth="1"/>
                  <text x="280" y="225" textAnchor="middle" fontSize="9" fill="#94a3b8">
                    {locale === "tr" ? "IPA II Sektör Bazlı AB Katkısı (€M)" : "IPA II EU Contribution by Sector (€M)"}
                  </text>
                </svg>
                {/* Toplam rozet */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm border border-white/80 text-center">
                  <div className="text-sm font-extrabold text-eu leading-none">€1.39Mrd</div>
                  <div className="text-[9px] text-slate mt-0.5">{locale === "tr" ? "IPA II Toplam" : "IPA II Total"}</div>
                </div>
              </div>
              {/* Sağ: Metin */}
              <div className="md:col-span-2 p-6 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-eu uppercase tracking-widest mb-2">
                    {locale === "tr" ? "Portföy Analizi" : "Portfolio Analysis"}
                  </div>
                  <h3 className="font-bold text-ink text-xl mb-3">
                    {locale === "tr" ? "Portföy İnfografikleri" : "Portfolio Infographics"}
                  </h3>
                  <p className="text-slate text-sm leading-relaxed">
                    {locale === "tr"
                      ? "IPA II döneminde 165 proje, 10 sektör, €1,2 milyar+ AB katkısı. Halkalı-Kapıkule demiryolu tek başına €275 milyon. Sektör ve bütçe dağılımını görselleştirin."
                      : "165 projects, 10 sectors, €1.2B+ EU contribution in IPA II. Halkalı-Kapıkule railway alone: €275M. Visualise sector and budget distribution."}
                  </p>
                </div>
                <Link href="/araclar/infografik"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white bg-eu px-4 py-2.5 rounded-xl hover:bg-blue-800 transition-colors w-fit">
                  {locale === "tr" ? "İnfografikleri Gör" : "View Infographics"}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {TOOLS.map((tool) => (
              <Link key={tool.id} href={tool.href}
                className="border border-line rounded-xl overflow-hidden hover:shadow-md hover:border-eu/40 transition-all group bg-white">
                <div className="h-14 flex items-center justify-center"
                  style={{ background: `${tool.color}12`, borderBottom: `2px solid ${tool.color}25` }}>
                  <span style={{ color: tool.color }}>
                    <ToolIcon svgPath={tool.svgPath} className="w-6 h-6" />
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-ink text-xs mb-1 leading-tight">
                    {locale === "en" ? tool.labelEn : tool.label}
                  </h3>
                  <p className="text-[11px] text-slate leading-relaxed line-clamp-2">
                    {locale === "en" ? tool.descEn : tool.desc}
                  </p>
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
