"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense } from "react";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProjectProgressBar } from "@/components/ProjectProgressBar";
import { useLocale } from "@/lib/i18n/context";
import type { Project, Sector, Donor, IpaPeriod } from "@/lib/types";

function ProjelerPageInner() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  const sektor = searchParams.get("sektor") ?? undefined;
  const donorId = searchParams.get("donor") ?? undefined;
  const donem = searchParams.get("donem") ?? undefined;
  const durum = searchParams.get("durum") ?? undefined;
  const ara = searchParams.get("ara") ?? "";

  const [searchInput, setSearchInput] = useState(ara);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // URL'deki ?ara= değiştiğinde input'u senkronize et (geri/ileri tuşları için)
  useEffect(() => { setSearchInput(ara); }, [ara]);

  const updateSearchParam = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("ara", value); else params.delete("ara");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateSearchParam(value), 350);
  };

  useEffect(() => {
    setLoading(true);
    const db = getDataProvider();
    Promise.all([
      db.getProjects({ sectorId: sektor, donorId, ipaPeriod: donem as IpaPeriod | undefined, status: durum, search: ara || undefined }),
      db.getSectors(),
      db.getDonors(),
    ]).then(([p, s, d]) => { setProjects(p); setSectors(s); setDonors(d); setLoading(false); });
  }, [sektor, donorId, donem, durum, ara]);

  const statusLabel = (s: Project["status"]) =>
    s === "devam" ? t("status_ongoing") : t("status_completed");

  // Filtre linklerinde mevcut arama metnini koruyarak href üretir
  const filterHref = (key: "sektor" | "donor" | "donem" | "durum", value?: string) => {
    const params = new URLSearchParams();
    if (ara) params.set("ara", ara);
    if (key !== "sektor" && sektor) params.set("sektor", sektor);
    if (key !== "donor" && donorId) params.set("donor", donorId);
    if (key !== "donem" && donem) params.set("donem", donem);
    if (key !== "durum" && durum) params.set("durum", durum);
    if (value) params.set(key, value);
    const qs = params.toString();
    return qs ? `/projeler?${qs}` : "/projeler";
  };

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: t("projects_title") }]} />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filtreler */}
          <aside className="w-full md:w-56 flex-shrink-0">
            <h2 className="font-bold text-ink mb-4">{t("projects_filters")}</h2>

            <div className="mb-6">
              <div className="text-xs uppercase tracking-wide text-mist mb-2 font-semibold">{t("projects_sector")}</div>
              <div className="space-y-1">
                <Link href={filterHref("sektor")} className={`block text-sm px-3 py-1.5 rounded-lg ${!sektor ? "bg-eu text-white font-semibold" : "text-slate hover:bg-surface"}`}>
                  {t("projects_all")}
                </Link>
                {sectors.map((s) => (
                  <Link key={s.id} href={filterHref("sektor", s.id)}
                    className={`block text-sm px-3 py-1.5 rounded-lg ${sektor === s.id ? "bg-eu text-white font-semibold" : "text-slate hover:bg-surface"}`}>
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs uppercase tracking-wide text-mist mb-2 font-semibold">{t("projects_donor")}</div>
              <div className="space-y-1">
                <Link href={filterHref("donor")} className={`block text-sm px-3 py-1.5 rounded-lg ${!donorId ? "bg-eu text-white font-semibold" : "text-slate hover:bg-surface"}`}>
                  {t("projects_all")}
                </Link>
                {donors.map((d) => (
                  <Link key={d.id} href={filterHref("donor", d.id)}
                    className={`block text-sm px-3 py-1.5 rounded-lg ${donorId === d.id ? "bg-eu text-white font-semibold" : "text-slate hover:bg-surface"}`}>
                    {d.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs uppercase tracking-wide text-mist mb-2 font-semibold">{t("projects_period")}</div>
              <div className="space-y-1">
                {(["IPA-I", "IPA-II", "IPA-III"] as const).map((p) => (
                  <Link key={p} href={filterHref("donem", p)}
                    className={`block text-sm px-3 py-1.5 rounded-lg ${donem === p ? "bg-eu text-white font-semibold" : "text-slate hover:bg-surface"}`}>
                    {p}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-mist mb-2 font-semibold">{t("projects_status")}</div>
              <div className="space-y-1">
                {[{ v: "devam", l: t("status_ongoing") }, { v: "tamamlandi", l: t("status_completed") }].map((d) => (
                  <Link key={d.v} href={filterHref("durum", d.v)}
                    className={`block text-sm px-3 py-1.5 rounded-lg ${durum === d.v ? "bg-eu text-white font-semibold" : "text-slate hover:bg-surface"}`}>
                    {d.l}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Liste */}
          <div className="flex-1">
            {/* Arama kutusu */}
            <div className="relative mb-5">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mist" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t("projects_search_placeholder")}
                className="w-full pl-10 pr-10 py-3 border border-line rounded-xl text-sm focus:outline-none focus:border-eu focus:ring-2 focus:ring-eu/10 transition-all"
              />
              {searchInput && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mist hover:text-ink"
                  aria-label="Temizle"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-ink">
                {t("projects_title")} <span className="text-mist text-lg font-normal">({projects.length})</span>
              </h1>
              {ara && (
                <span className="text-sm text-slate">
                  {t("projects_search_results_for")} <strong className="text-ink">&quot;{ara}&quot;</strong>
                </span>
              )}
            </div>

            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((p) => {
                  const sector = sectors.find((s) => s.id === p.sectorId);
                  return (
                    <Link key={p.id} href={`/projeler/${p.id}`}
                      className="bg-white border border-line rounded-xl p-5 hover:border-eu hover:shadow-md transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: sector?.color ?? "#003399" }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-mist">{p.ipaPeriod}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              p.status === "devam" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                            }`}>
                              {statusLabel(p.status)}
                            </span>
                          </div>
                          <h2 className="font-bold text-ink text-sm leading-tight mb-1">{p.title}</h2>
                          <p className="text-xs text-slate line-clamp-2">{p.summary}</p>
                          {p.startDate && p.endDate && (
                            <ProjectProgressBar
                              project={p}
                              variant="compact"
                              labels={{
                                notStarted: t("progress_not_started"),
                                completed: t("progress_completed"),
                                daysRemaining: t("progress_days_remaining"),
                                needsUpdate: t("progress_needs_update"),
                              }}
                            />
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {p.locations.slice(0, 3).map((l) => (
                              <span key={l} className="text-xs bg-surface text-mist px-2 py-0.5 rounded">📍 {l}</span>
                            ))}
                          </div>
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
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {!loading && projects.length === 0 && (
              <div className="text-center py-16 text-slate">
                {t("projects_not_found")}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default function ProjelerPage() {
  return (
    <Suspense fallback={null}>
      <ProjelerPageInner />
    </Suspense>
  );
}
