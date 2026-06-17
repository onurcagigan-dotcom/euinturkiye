"use client";
import { useEffect, useMemo, useState } from "react";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { Project, Sector, IpaPeriod } from "@/lib/types";

const PERIOD_ORDER: IpaPeriod[] = ["IPA-I", "IPA-II", "IPA-III", "IPA-IV"];
const PERIOD_COLORS: Record<IpaPeriod, string> = {
  "IPA-I": "#94A3B8",
  "IPA-II": "#0891B2",
  "IPA-III": "#003399",
  "IPA-IV": "#7C3AED",
};

const STATUS_COLORS: Record<Project["status"], string> = {
  devam: "#16A34A",
  tamamlandi: "#94A3B8",
  planlama: "#CA8A04",
};
const STATUS_LABEL: Record<Project["status"], string> = {
  devam: "Devam Ediyor",
  tamamlandi: "Tamamlandı",
  planlama: "Planlama",
};

/** "€12.5M" → 12.5 */
function parseBudget(b?: string): number {
  if (!b) return 0;
  const cleaned = b.replace("€", "").replace("M", "").trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export default function InfografikPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDataProvider();
    Promise.all([db.getProjects(), db.getSectors()]).then(([p, s]) => {
      setProjects(p); setSectors(s); setLoading(false);
    });
  }, []);

  // ── Sektöre göre proje sayısı ve toplam bütçe ──────────────
  const bySector = useMemo(() => {
    return sectors.map((s) => {
      const list = projects.filter((p) => p.sectorId === s.id);
      const budget = list.reduce((sum, p) => sum + parseBudget(p.budget), 0);
      return { sector: s, count: list.length, budget };
    }).sort((a, b) => b.count - a.count);
  }, [sectors, projects]);

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
    const statuses: Project["status"][] = ["devam", "tamamlandi", "planlama"];
    return statuses.map((status) => ({
      status, count: projects.filter((p) => p.status === status).length,
    }));
  }, [projects]);

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
  const maxSectorCount = Math.max(...bySector.map((s) => s.count), 1);
  const maxYearCount = Math.max(...byStartYear.map(([, c]) => c), 1);

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
        <p className="text-slate text-sm mb-8">
          Sektör, IPA dönemi, bütçe ve zaman dağılımına göre görsel proje analizi.
        </p>

        {/* Üst özet kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <SummaryCard label="Toplam Proje" value={totalProjects.toString()} color="#003399" />
          <SummaryCard label="Toplam Bütçe" value={`€${totalBudget.toFixed(1)}M`} color="#16A34A" />
          <SummaryCard label="Aktif Sektör" value={bySector.filter(s => s.count > 0).length.toString()} color="#7C3AED" />
          <SummaryCard label="Devam Eden" value={(byStatus.find(s => s.status === "devam")?.count ?? 0).toString()} color="#CA8A04" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Sektöre göre proje sayısı — yatay çubuk */}
          <Panel title="Sektöre Göre Proje Sayısı">
            <div className="space-y-3">
              {bySector.map(({ sector, count }) => (
                <div key={sector.id} className="flex items-center gap-3">
                  <div className="w-32 flex-shrink-0 text-xs text-slate text-right truncate" title={sector.name}>
                    {sector.name}
                  </div>
                  <div className="flex-1 bg-surface rounded-full h-6 overflow-hidden relative">
                    <div
                      className="h-6 rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${(count / maxSectorCount) * 100}%`, backgroundColor: sector.color ?? "#003399", minWidth: count > 0 ? "28px" : "0" }}
                    >
                      <span className="text-white text-xs font-bold">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* IPA dönemine göre — pasta grafik (SVG) */}
          <Panel title="IPA Dönemine Göre Dağılım">
            <div className="flex items-center gap-8">
              <DonutChart
                data={byPeriod.map(p => ({ label: p.period, value: p.count, color: PERIOD_COLORS[p.period] }))}
                centerLabel={totalProjects.toString()}
                centerSub="proje"
              />
              <div className="space-y-2 flex-1">
                {byPeriod.map(({ period, count, budget }) => (
                  <div key={period} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PERIOD_COLORS[period] }} />
                    <span className="text-ink font-medium flex-1">{period}</span>
                    <span className="text-slate">{count}</span>
                    <span className="text-mist text-xs">€{budget.toFixed(1)}M</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Sektöre göre bütçe — yatay çubuk */}
          <Panel title="Sektöre Göre Toplam Bütçe (€M)">
            <div className="space-y-3">
              {[...bySector].sort((a, b) => b.budget - a.budget).map(({ sector, budget }) => {
                const maxBudget = Math.max(...bySector.map(s => s.budget), 1);
                return (
                  <div key={sector.id} className="flex items-center gap-3">
                    <div className="w-32 flex-shrink-0 text-xs text-slate text-right truncate" title={sector.name}>
                      {sector.name}
                    </div>
                    <div className="flex-1 bg-surface rounded-full h-6 overflow-hidden">
                      <div
                        className="h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(budget / maxBudget) * 100}%`, backgroundColor: sector.color ?? "#003399", minWidth: budget > 0 ? "40px" : "0" }}
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
          <Panel title="Proje Durumuna Göre Dağılım">
            <div className="flex items-center gap-8">
              <DonutChart
                data={byStatus.map(s => ({ label: STATUS_LABEL[s.status], value: s.count, color: STATUS_COLORS[s.status] }))}
                centerLabel={`${Math.round(((byStatus.find(s => s.status === "devam")?.count ?? 0) / Math.max(totalProjects, 1)) * 100)}%`}
                centerSub="devam ediyor"
              />
              <div className="space-y-2 flex-1">
                {byStatus.map(({ status, count }) => (
                  <div key={status} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[status] }} />
                    <span className="text-ink font-medium flex-1">{STATUS_LABEL[status]}</span>
                    <span className="text-slate">{count}</span>
                    <span className="text-mist text-xs">{Math.round((count / Math.max(totalProjects, 1)) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        {/* Zaman çizelgesi — başlangıç yılına göre proje sayısı */}
        <Panel title="Başlangıç Yılına Göre Proje Sayısı">
          {byStartYear.length === 0 ? (
            <p className="text-mist text-sm text-center py-8">Tarih verisi bulunamadı.</p>
          ) : (
            <div className="flex items-end gap-3 h-48 pt-4">
              {byStartYear.map(([year, count]) => (
                <div key={year} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                  <span className="text-xs font-bold text-ink">{count}</span>
                  <div
                    className="w-full bg-eu rounded-t-lg transition-all"
                    style={{ height: `${Math.max((count / maxYearCount) * 100, 4)}%`, backgroundColor: "#003399" }}
                  />
                  <span className="text-xs text-mist font-medium">{year}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <p className="text-xs text-mist mt-8 text-center">
          Veriler demo portföyünden hesaplanmıştır. Bütçe rakamları milyon Euro (€M) cinsindendir.
        </p>
      </div>
    </PageShell>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white border border-line rounded-2xl p-5">
      <div className="text-2xl font-extrabold" style={{ color }}>{value}</div>
      <div className="text-xs text-mist mt-1">{label}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-line rounded-2xl p-6">
      <h2 className="font-bold text-ink text-sm mb-5">{title}</h2>
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
  const strokeWidth = 22;
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
