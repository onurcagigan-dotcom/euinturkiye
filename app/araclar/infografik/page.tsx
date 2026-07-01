"use client";
import { useEffect, useMemo, useState } from "react";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { Project, Sector, Donor, IpaPeriod } from "@/lib/types";

const PERIOD_ORDER: IpaPeriod[] = ["IPA-I", "IPA-II", "IPA-III"];
const PERIOD_COLORS: Record<IpaPeriod, string> = {
  "IPA-I": "#94A3B8",
  "IPA-II": "#0891B2",
  "IPA-III": "#003399",
};

const STATUS_COLORS: Record<Project["status"], string> = {
  devam: "#16A34A",
  tamamlandi: "#94A3B8",
};
const STATUS_LABEL: Record<Project["status"], string> = {
  devam: "Devam Ediyor",
  tamamlandi: "Tamamlandı",
};

/** "€12.5M" → 12.5 */
function parseBudget(b?: string): number {
  if (!b) return 0;
  const cleaned = b.replace("€", "").replace("M", "").trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

const EU_DONOR_ID = "eu"; // Avrupa Birliği projeleri için IPA dönemi anlamlı

export default function InfografikPage() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtreler
  const [filterSector, setFilterSector] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<IpaPeriod | "">("");
  const [filterStatus, setFilterStatus] = useState<Project["status"] | "">("");
  const [filterDonor, setFilterDonor] = useState("");

  // IPA dönemi filtresi yalnızca AB projelerinde anlamlıdır
  // Kullanıcı AB dışı donör seçtiyse IPA filtresini devre dışı bırak
  const isEuDonorSelected = !filterDonor || filterDonor === EU_DONOR_ID;
  const ipaFilterActive = filterPeriod && isEuDonorSelected;

  useEffect(() => {
    const db = getDataProvider();
    Promise.all([db.getProjects(), db.getSectors(), db.getDonors()]).then(([p, s, d]) => {
      setAllProjects(p); setSectors(s); setDonors(d); setLoading(false);
    });
  }, []);

  const projects = useMemo(() => {
    return allProjects.filter((p) => {
      if (filterSector && p.sectorId !== filterSector) return false;
      if (ipaFilterActive && p.ipaPeriod !== filterPeriod) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterDonor && p.donorId !== filterDonor) return false;
      return true;
    });
  }, [allProjects, filterSector, filterPeriod, filterStatus, filterDonor]);

  const filtersActive = !!(filterSector || filterPeriod || filterStatus || filterDonor);
  const clearFilters = () => { setFilterSector(""); setFilterPeriod(""); setFilterStatus(""); setFilterDonor(""); };

  // ── Sektöre göre proje sayısı ve toplam bütçe ──────────────
  const bySector = useMemo(() => {
    return sectors.map((s) => {
      const list = projects.filter((p) => p.sectorId === s.id);
      const budget = list.reduce((sum, p) => sum + parseBudget(p.budget), 0);
      return { sector: s, count: list.length, budget };
    }).sort((a, b) => b.count - a.count);
  }, [sectors, projects]);

  const topSector = bySector[0];

  // ── IPA dönemine göre dağılım ───────────────────────────────
  const byPeriod = useMemo(() => {
    return PERIOD_ORDER.map((period) => {
      const list = projects.filter((p) => p.ipaPeriod === period);
      const budget = list.reduce((sum, p) => sum + parseBudget(p.budget), 0);
      return { period, count: list.length, budget };
    });
  }, [projects]);

  // ── Duruma göre dağılım ──────────────────────────────────────
  const byStatus = useMemo(() => {
    const statuses: Project["status"][] = ["devam", "tamamlandi"];
    return statuses.map((status) => ({
      status, count: projects.filter((p) => p.status === status).length,
    }));
  }, [projects]);

  // ── Donöre göre proje sayısı ──────────────────────────────────
  const byDonor = useMemo(() => {
    return donors.map((d) => {
      const list = projects.filter((p) => p.donorId === d.id);
      const budget = list.reduce((sum, p) => sum + parseBudget(p.budget), 0);
      return { donor: d, count: list.length, budget };
    }).filter((d) => d.count > 0).sort((a, b) => b.count - a.count);
  }, [donors, projects]);

  // ── Yıla göre başlayan proje sayısı (zaman çizelgesi) ────────
  const byStartYear = useMemo(() => {
    const map = new Map<number, number>();
    projects.forEach((p) => {
      if (!p.startDate) return;
      const year = new Date(p.startDate).getFullYear();
      if (isNaN(year)) return;
      map.set(year, (map.get(year) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .filter(([year]) => year >= 2018 && year <= 2030);
  }, [projects]);

  const totalBudget = useMemo(() => projects.reduce((s, p) => s + parseBudget(p.budget), 0), [projects]);
  const totalProjects = projects.length;
  const avgBudget = totalProjects > 0 ? totalBudget / totalProjects : 0;
  const maxSectorCount = Math.max(...bySector.map((s) => s.count), 1);
  const maxYearCount = Math.max(...byStartYear.map(([, c]) => c), 1);
  const ongoingPct = Math.round(((byStatus.find((s) => s.status === "devam")?.count ?? 0) / Math.max(totalProjects, 1)) * 100);

  if (loading) {
    return (
      <PageShell>
        <div className="max-w-6xl mx-auto px-6 py-16 text-center text-slate">Yükleniyor…</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Breadcrumb items={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Dijital Araçlar", href: "/araclar" },
          { label: "İnfografikler" },
        ]} />

        <h1 className="text-2xl font-bold text-ink mb-2">Proje Portföyü İnfografikleri</h1>
        <p className="text-slate text-sm mb-6">
          Sektör, IPA dönemi, donör, bütçe ve zaman dağılımına göre görsel proje analizi. Her veri noktası gerçek portföyden hesaplanır.
        </p>

        {/* ============ Filtre Çubuğu ============ */}
        <div className="bg-white border border-line rounded-2xl p-4 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-mist uppercase tracking-wide">Filtrele</span>
            {filtersActive && (
              <button onClick={clearFilters} className="text-xs text-eu font-semibold hover:underline">Filtreleri Temizle ✕</button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)}
              className="px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
              <option value="">Tüm Sektörler</option>
              {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value as IpaPeriod | "")}
              className={`px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu ${!isEuDonorSelected ? "bg-gray-50 text-mist cursor-not-allowed" : "bg-white"}`}
              disabled={!isEuDonorSelected}>
              <option value="">Tüm IPA Dönemleri</option>
              {PERIOD_ORDER.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {!isEuDonorSelected && (
              <p className="text-xs text-mist col-span-2 -mt-2">IPA dönemi filtresi yalnızca AB projeleri için geçerlidir.</p>
            )}
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as Project["status"] | "")}
              className="px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
              <option value="">Tüm Durumlar</option>
              <option value="devam">Devam Ediyor</option>
              <option value="tamamlandi">Tamamlandı</option>
            </select>
            <select value={filterDonor} onChange={(e) => setFilterDonor(e.target.value)}
              className="px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
              <option value="">Tüm Donörler</option>
              {donors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          {filtersActive && (
            <p className="text-xs text-mist mt-3">
              Filtrelenmiş sonuç: <strong className="text-ink">{totalProjects}</strong> proje (toplam {allProjects.length} projeden)
            </p>
          )}
        </div>

        {totalProjects === 0 ? (
          <div className="bg-surface rounded-2xl p-12 text-center text-mist">
            Bu filtre kombinasyonuna uyan proje bulunamadı.
          </div>
        ) : (
          <>
            {/* ============ Üst özet kartları ============ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <SummaryCard label="Toplam Proje" value={totalProjects.toString()} color="#003399" sub={topSector ? `En büyük sektör: ${topSector.sector.name}` : undefined} />
              <SummaryCard label="Toplam Bütçe" value={`€${totalBudget.toFixed(1)}M`} color="#16A34A" sub={`Ortalama €${avgBudget.toFixed(1)}M/proje`} />
              <SummaryCard label="Aktif Sektör" value={bySector.filter((s) => s.count > 0).length.toString()} color="#7C3AED" sub={`${sectors.length} sektörden`} />
              <SummaryCard label="Devam Eden" value={`%${ongoingPct}`} color="#CA8A04" sub={`${byStatus.find((s) => s.status === "devam")?.count ?? 0} proje aktif uygulamada`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Sektöre göre proje sayısı — gradient çubuk */}
              <Panel
                title="Sektöre Göre Proje Sayısı"
                explainer={topSector ? `Portföyün en yoğun olduğu alan ${topSector.sector.name} — ${topSector.count} proje, toplam €${topSector.budget.toFixed(1)}M bütçe ile.` : undefined}
              >
                <div className="space-y-3.5">
                  {bySector.filter((s) => s.count > 0).map(({ sector, count }) => (
                    <div key={sector.id} className="flex items-center gap-3">
                      <div className="w-36 flex-shrink-0 text-xs text-slate text-right truncate font-medium" title={sector.name}>
                        {sector.name}
                      </div>
                      <div className="flex-1 bg-surface rounded-full h-7 overflow-hidden relative">
                        <div
                          className="h-7 rounded-full flex items-center justify-end pr-2.5 transition-all duration-700 ease-out shadow-sm"
                          style={{
                            width: `${Math.max((count / maxSectorCount) * 100, 8)}%`,
                            background: `linear-gradient(90deg, ${sector.color ?? "#003399"}99, ${sector.color ?? "#003399"})`,
                          }}
                        >
                          <span className="text-white text-xs font-bold">{count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* IPA dönemine göre — donut */}
              <Panel
                title="IPA Dönemine Göre Dağılım"
                explainer={!isEuDonorSelected
                  ? "IPA (Katılım Öncesi Mali Yardım Aracı) dönemi yalnızca Avrupa Birliği projelerine uygulanır. Diğer donörlerin projelerinde IPA dönemi tanımlı değildir. Filtreden 'Avrupa Birliği' seçin."
                  : "Proje portföyünün hangi katılım öncesi mali yardım dönemlerinde finanse edildiğini gösterir. IPA III, AB'nin güncel finansman çerçevesidir."}
              >
                <div className="flex items-center gap-8">
                  <DonutChart
                    data={byPeriod.map((p) => ({ label: p.period, value: p.count, color: PERIOD_COLORS[p.period] }))}
                    centerLabel={totalProjects.toString()}
                    centerSub="proje"
                  />
                  <div className="space-y-2.5 flex-1">
                    {byPeriod.map(({ period, count, budget }) => (
                      <div key={period} className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PERIOD_COLORS[period] }} />
                        <span className="text-ink font-medium flex-1">{period}</span>
                        <span className="text-slate font-semibold">{count}</span>
                        <span className="text-mist text-xs w-16 text-right">€{budget.toFixed(1)}M</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Sektöre göre bütçe — gradient çubuk */}
              <Panel
                title="Sektöre Göre Toplam Bütçe (€M)"
                explainer="Bütçe büyüklüğü ile proje sayısı her zaman örtüşmez — az sayıda büyük ölçekli altyapı projesi, çok sayıda küçük projeden daha fazla kaynak çekebilir."
              >
                <div className="space-y-3.5">
                  {[...bySector].filter((s) => s.budget > 0).sort((a, b) => b.budget - a.budget).map(({ sector, budget }) => {
                    const maxBudget = Math.max(...bySector.map((s) => s.budget), 1);
                    return (
                      <div key={sector.id} className="flex items-center gap-3">
                        <div className="w-36 flex-shrink-0 text-xs text-slate text-right truncate font-medium" title={sector.name}>
                          {sector.name}
                        </div>
                        <div className="flex-1 bg-surface rounded-full h-7 overflow-hidden">
                          <div
                            className="h-7 rounded-full flex items-center justify-end pr-2.5 transition-all duration-700 ease-out shadow-sm"
                            style={{
                              width: `${Math.max((budget / maxBudget) * 100, 10)}%`,
                              background: `linear-gradient(90deg, ${sector.color ?? "#003399"}99, ${sector.color ?? "#003399"})`,
                            }}
                          >
                            <span className="text-white text-xs font-bold">€{budget.toFixed(1)}M</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>

              {/* Duruma göre dağılım — donut */}
              <Panel
                title="Proje Durumuna Göre Dağılım"
                explainer="Portföyün ne kadarının hâlâ aktif uygulamada, ne kadarının tamamlanıp etkisini gösterme aşamasına geçtiğini özetler."
              >
                <div className="flex items-center gap-8">
                  <DonutChart
                    data={byStatus.map((s) => ({ label: STATUS_LABEL[s.status], value: s.count, color: STATUS_COLORS[s.status] }))}
                    centerLabel={`%${ongoingPct}`}
                    centerSub="devam ediyor"
                  />
                  <div className="space-y-2.5 flex-1">
                    {byStatus.map(({ status, count }) => (
                      <div key={status} className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[status] }} />
                        <span className="text-ink font-medium flex-1">{STATUS_LABEL[status]}</span>
                        <span className="text-slate font-semibold">{count}</span>
                        <span className="text-mist text-xs w-10 text-right">%{Math.round((count / Math.max(totalProjects, 1)) * 100)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            </div>

            {/* Donöre göre dağılım */}
            {byDonor.length > 0 && (
              <div className="mb-10">
                <Panel
                  title="Donöre Göre Proje Sayısı"
                  explainer="Çok donörlü portföyün hangi kurumlar tarafından finanse edildiğini gösterir. AB dışındaki donörler ortaklık ve eş-finansman fırsatlarına işaret eder."
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {byDonor.map(({ donor, count, budget }) => {
                      const maxDonorCount = Math.max(...byDonor.map((d) => d.count), 1);
                      const intensity = count / maxDonorCount;
                      return (
                        <div key={donor.id} className="rounded-xl p-4 text-center"
                          style={{ backgroundColor: `rgba(0,51,153,${0.06 + intensity * 0.12})` }}>
                          <div className="text-2xl font-extrabold text-eu">{count}</div>
                          <div className="text-xs font-semibold text-ink mt-1 truncate" title={donor.name}>{donor.name}</div>
                          <div className="text-xs text-mist mt-0.5">€{budget.toFixed(1)}M</div>
                        </div>
                      );
                    })}
                  </div>
                </Panel>
              </div>
            )}

            {/* Zaman çizelgesi — başlangıç yılına göre proje sayısı */}
            <Panel
              title="Başlangıç Yılına Göre Proje Sayısı"
              explainer="Yıllar içindeki proje başlangıç yoğunluğu, portföyün büyüme hızını ve gelecekteki izleme/raporlama yükünün nasıl dağılacağını gösterir."
            >
              {byStartYear.length === 0 ? (
                <p className="text-mist text-sm text-center py-8">Tarih verisi bulunamadı.</p>
              ) : (
                <div className="flex items-end gap-3 h-52 pt-4">
                  {byStartYear.map(([year, count]) => (
                    <div key={year} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group">
                      <span className="text-xs font-bold text-ink opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>
                      <div
                        className="w-full rounded-t-lg transition-all duration-700 ease-out"
                        style={{
                          height: `${Math.max((count / maxYearCount) * 100, 4)}%`,
                          background: "linear-gradient(180deg, #003399, #001f5c)",
                        }}
                      />
                      <span className="text-xs text-mist font-medium">{year}</span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </>
        )}

        <p className="text-xs text-mist mt-8 text-center">
          Veriler demo portföyünden hesaplanmıştır. Bütçe rakamları milyon Euro (€M) cinsindendir.
        </p>
      </div>
    </PageShell>
  );
}

function SummaryCard({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div className="bg-white border border-line rounded-2xl p-5">
      <div className="text-2xl font-extrabold" style={{ color }}>{value}</div>
      <div className="text-xs text-mist mt-1">{label}</div>
      {sub && <div className="text-xs text-slate mt-2 leading-snug">{sub}</div>}
    </div>
  );
}

function Panel({ title, explainer, children }: { title: string; explainer?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-line rounded-2xl p-6">
      <h2 className="font-bold text-ink text-sm mb-1.5">{title}</h2>
      {explainer && <p className="text-xs text-slate leading-relaxed mb-5">{explainer}</p>}
      {!explainer && <div className="mb-5" />}
      {children}
    </div>
  );
}

/** Saf SVG donut chart — harici kütüphane gerektirmez */
function DonutChart({
  data,
  centerLabel,
  centerSub,
}: {
  data: { label: string; value: number; color: string }[];
  centerLabel: string;
  centerSub: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = 60;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;
  const segments = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const fraction = total > 0 ? d.value / total : 0;
      const dashLength = fraction * circumference;
      const segment = {
        ...d,
        dashArray: `${dashLength} ${circumference - dashLength}`,
        dashOffset: -cumulativeOffset,
      };
      cumulativeOffset += dashLength;
      return segment;
    });

  return (
    <div className="relative flex-shrink-0" style={{ width: 160, height: 160 }}>
      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeWidth}
            strokeDasharray={s.dashArray}
            strokeDashoffset={s.dashOffset}
            strokeLinecap="butt"
            style={{ transition: "stroke-dasharray 0.7s ease-out" }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold text-ink">{centerLabel}</span>
        <span className="text-xs text-mist">{centerSub}</span>
      </div>
    </div>
  );
}
