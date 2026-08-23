"use client";
import { useEffect, useMemo, useState } from "react";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import type { Project, Sector, IpaPeriod } from "@/lib/types";

// ── Sabitler ──────────────────────────────────────────────────
const PERIOD_ORDER: IpaPeriod[] = ["IPA-I", "IPA-II", "IPA-III"];
const PERIOD_COLORS: Record<string, string> = {
  "IPA-I": "#94A3B8", "IPA-II": "#0891B2", "IPA-III": "#003399",
};
const SECTOR_COLORS: string[] = [
  "#003399","#0E7490","#15803D","#7C3AED","#CA8A04","#EA580C","#BE185D","#1D4ED8","#0369A1","#4338CA",
];

// Bütçeyi €M cinsinden al — euBudget öncelikli, yoksa budget string parse
function getBudgetM(p: Project): number {
  if (p.euBudget) return p.euBudget / 1_000_000;
  if (p.budget) {
    const m = p.budget.replace("€","").replace("M","").trim();
    const n = parseFloat(m);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

function fmtM(n: number): string {
  if (n >= 1000) return `€${(n/1000).toFixed(1)}Mrd`;
  if (n >= 1) return `€${n.toFixed(1)}M`;
  return `€${(n*1000).toFixed(0)}K`;
}

// ── Yardımcı bileşenler ───────────────────────────────────────
function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-line rounded-2xl p-5 ${className}`}>
      <h3 className="text-sm font-bold text-ink mb-4">{title}</h3>
      {children}
    </div>
  );
}

function StatBox({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white border border-line rounded-2xl p-5 flex flex-col gap-1">
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
      <div className="text-xs font-bold text-ink">{label}</div>
      {sub && <div className="text-xs text-mist">{sub}</div>}
    </div>
  );
}

// Yatay bar
function HBar({ label, value, max, color, subLabel }: {
  label: string; value: number; max: number; color: string; subLabel?: string;
}) {
  const pct = max > 0 ? Math.max((value / max) * 100, 2) : 0;
  return (
    <div className="flex items-center gap-3 group">
      <div className="w-36 text-xs text-slate truncate flex-shrink-0 text-right" title={label}>{label}</div>
      <div className="flex-1 h-5 bg-surface rounded-full overflow-hidden">
        <div className="h-full rounded-full flex items-center px-2 transition-all"
          style={{ width: `${pct}%`, background: color, minWidth: 24 }}>
          {pct > 15 && <span className="text-white text-[10px] font-bold truncate">{subLabel}</span>}
        </div>
      </div>
      {pct <= 15 && <span className="text-xs text-mist flex-shrink-0 w-16">{subLabel}</span>}
    </div>
  );
}

// Donut segmenti
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, g) => s + g.value, 0) || 1;
  let cumAngle = -90;
  const cx = 80, cy = 80, r = 60, innerR = 38;

  const arcs = segments.filter(s => s.value > 0).map((seg) => {
    const startAngle = cumAngle;
    const sweep = (seg.value / total) * 360;
    cumAngle += sweep;
    const endAngle = cumAngle;
    const toRad = (a: number) => (a * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const ix1 = cx + innerR * Math.cos(toRad(startAngle));
    const iy1 = cy + innerR * Math.sin(toRad(startAngle));
    const ix2 = cx + innerR * Math.cos(toRad(endAngle));
    const iy2 = cy + innerR * Math.sin(toRad(endAngle));
    const large = sweep > 180 ? 1 : 0;
    return { ...seg, path: `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${ix2},${iy2} A${innerR},${innerR} 0 ${large},0 ${ix1},${iy1} Z`, sweep };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="w-32 h-32 flex-shrink-0">
        {arcs.map((arc, i) => (
          <path key={i} d={arc.path} fill={arc.color} stroke="white" strokeWidth="2" />
        ))}
        <circle cx={cx} cy={cy} r={innerR - 4} fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="900" fill="#111">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#94a3b8">proje</text>
      </svg>
      <div className="space-y-1.5 flex-1 min-w-0">
        {arcs.map((arc, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: arc.color }} />
            <span className="text-xs text-slate truncate flex-1">{arc.label}</span>
            <span className="text-xs font-bold text-ink flex-shrink-0">{arc.value}</span>
            <span className="text-[10px] text-mist flex-shrink-0 w-8 text-right">{Math.round((arc.value/total)*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Ana Sayfa ─────────────────────────────────────────────────
export default function InfografikPage() {
  const { locale } = useLocale();
  const db = getDataProvider();
  const isEn = locale === "en";

  const [projects, setProjects] = useState<Project[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [filterSector, setFilterSector] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<IpaPeriod | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([db.getProjects(), db.getSectors()]).then(([p, s]) => {
      // Sadece gerçek IPA projeleri (demo projeler hariç)
      setProjects(p.filter(pr => !pr.id.endsWith("-demo") && pr.donorId === "eu"));
      setSectors(s);
      setLoading(false);
    });
  }, [db]);

  // Filtreli proje seti
  const filtered = useMemo(() => projects.filter((p) => {
    if (filterSector && p.sectorId !== filterSector) return false;
    if (filterPeriod && p.ipaPeriod !== filterPeriod) return false;
    return true;
  }), [projects, filterSector, filterPeriod]);

  // ── Hesaplamalar ───────────────────────────────────────────
  const totalProjects = filtered.length;
  const totalBudgetM = useMemo(() => filtered.reduce((s, p) => s + getBudgetM(p), 0), [filtered]);
  const avgBudgetM = totalProjects > 0 ? totalBudgetM / totalProjects : 0;

  // Sektör bazlı
  const bySector = useMemo(() =>
    sectors.map((s, i) => {
      const list = filtered.filter((p) => p.sectorId === s.id);
      return {
        sector: s,
        color: SECTOR_COLORS[i % SECTOR_COLORS.length],
        count: list.length,
        budgetM: list.reduce((sum, p) => sum + getBudgetM(p), 0),
      };
    }).filter((s) => s.count > 0).sort((a, b) => b.budgetM - a.budgetM),
  [filtered, sectors]);

  // IPA dönemi bazlı
  const byPeriod = useMemo(() =>
    PERIOD_ORDER.map((period) => {
      const list = filtered.filter((p) => p.ipaPeriod === period);
      return {
        period,
        count: list.length,
        budgetM: list.reduce((sum, p) => sum + getBudgetM(p), 0),
        color: PERIOD_COLORS[period],
      };
    }).filter((p) => p.count > 0),
  [filtered]);

  // Durum bazlı
  const byStatus = useMemo(() => {
    const devam = filtered.filter((p) => p.status === "devam");
    const tamam = filtered.filter((p) => p.status === "tamamlandi");
    return [
      { label: "Tamamlandı", value: tamam.length, color: "#94A3B8", budgetM: tamam.reduce((s,p)=>s+getBudgetM(p),0) },
      { label: "Devam Ediyor", value: devam.length, color: "#16A34A", budgetM: devam.reduce((s,p)=>s+getBudgetM(p),0) },
    ].filter(s => s.value > 0);
  }, [filtered]);

  // İl başına proje (top 10)
  const byProvince = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((p) => p.locations?.forEach((l) => { counts[l] = (counts[l] ?? 0) + 1; }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([il, n]) => ({ il, n }));
  }, [filtered]);

  // Sektör başına ortalama bütçe
  const sectorAvgBudget = useMemo(() =>
    [...bySector].sort((a, b) => (b.budgetM/Math.max(b.count,1)) - (a.budgetM/Math.max(a.count,1))),
  [bySector]);

  const maxSectorBudget = Math.max(...bySector.map(s => s.budgetM), 1);
  const maxSectorCount = Math.max(...bySector.map(s => s.count), 1);
  const maxProvince = Math.max(...byProvince.map(p => p.n), 1);

  if (loading) {
    return (
      <PageShell>
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <div className="text-slate animate-pulse">Veriler hesaplanıyor…</div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Breadcrumb items={[
          { label: isEn ? "Home" : "Ana Sayfa", href: "/" },
          { label: isEn ? "Digital Tools" : "Dijital Araçlar", href: "/araclar" },
          { label: isEn ? "Portfolio Infographics" : "Portföy İnfografikleri" },
        ]} />
        <h1 className="text-2xl font-bold text-ink mb-1">Proje Portföyü İnfografikleri</h1>
        <p className="text-slate text-sm mb-6">
          {projects.length} gerçek IPA projesi — sektör, dönem, durum ve coğrafi dağılım analizleri.
        </p>

        {/* Filtreler */}
        <div className="flex flex-wrap gap-3 mb-8 p-4 bg-surface rounded-2xl">
          <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)}
            className="px-3 py-2 border border-line rounded-xl text-sm bg-white focus:outline-none focus:border-eu">
            <option value="">Tüm Sektörler</option>
            {sectors.filter(s => projects.some(p => p.sectorId === s.id)).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value as IpaPeriod | "")}
            className="px-3 py-2 border border-line rounded-xl text-sm bg-white focus:outline-none focus:border-eu">
            <option value="">Tüm IPA Dönemleri</option>
            {PERIOD_ORDER.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {(filterSector || filterPeriod) && (
            <button onClick={() => { setFilterSector(""); setFilterPeriod(""); }}
              className="px-3 py-2 text-xs text-red-500 border border-red-200 rounded-xl hover:bg-red-50">
              ✕ Filtreyi Temizle
            </button>
          )}
          <div className="ml-auto text-xs text-mist self-center">
            {totalProjects} proje gösteriliyor
          </div>
        </div>

        {/* Özet istatistikler */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatBox label="Toplam Proje" value={totalProjects.toString()} color="#003399"
            sub={`${bySector.length} aktif sektör`} />
          <StatBox label="Toplam AB Katkısı" value={fmtM(totalBudgetM)} color="#16A34A"
            sub={`Ort. ${fmtM(avgBudgetM)}/proje`} />
          <StatBox label="En Büyük Sektör" value={bySector[0]?.sector.name.split(" ")[0] ?? "—"} color="#7C3AED"
            sub={bySector[0] ? `${bySector[0].count} proje, ${fmtM(bySector[0].budgetM)}` : undefined} />
          <StatBox label="En Büyük IPA Dönemi"
            value={byPeriod.sort((a,b)=>b.count-a.count)[0]?.period ?? "—"} color="#0891B2"
            sub={byPeriod[0] ? `${byPeriod[0].count} proje` : undefined} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 1. Sektör bazlı proje sayısı */}
          <Card title="Sektör Bazlı Proje Sayısı">
            <div className="space-y-2.5">
              {bySector.map(({ sector, count, color }) => (
                <HBar key={sector.id}
                  label={sector.name.length > 22 ? sector.name.slice(0, 22) + "…" : sector.name}
                  value={count} max={maxSectorCount} color={color}
                  subLabel={`${count} proje`} />
              ))}
            </div>
          </Card>

          {/* 2. Sektör bazlı toplam AB katkısı */}
          <Card title="Sektör Bazlı Toplam AB Katkısı (€M)">
            <div className="space-y-2.5">
              {bySector.map(({ sector, budgetM, color }) => (
                <HBar key={sector.id}
                  label={sector.name.length > 22 ? sector.name.slice(0, 22) + "…" : sector.name}
                  value={budgetM} max={maxSectorBudget} color={color}
                  subLabel={fmtM(budgetM)} />
              ))}
            </div>
          </Card>

          {/* 3. IPA Dönemine göre dağılım — donut */}
          <Card title="IPA Dönemine Göre Dağılım">
            <DonutChart segments={byPeriod.map(p => ({ label: p.period, value: p.count, color: p.color }))} />
            <div className="mt-4 pt-4 border-t border-line grid grid-cols-3 gap-2">
              {byPeriod.map(({ period, count, budgetM, color }) => (
                <div key={period} className="text-center p-2 bg-surface rounded-xl">
                  <div className="w-2.5 h-2.5 rounded-full mx-auto mb-1" style={{ background: color }} />
                  <div className="text-xs font-bold text-ink">{period}</div>
                  <div className="text-sm font-extrabold" style={{ color }}>{count}</div>
                  <div className="text-[10px] text-mist">{fmtM(budgetM)}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* 4. Proje durumu */}
          <Card title="Proje Durumu">
            <DonutChart segments={byStatus} />
            <div className="mt-4 pt-4 border-t border-line grid grid-cols-2 gap-3">
              {byStatus.map((s) => (
                <div key={s.label} className="p-3 bg-surface rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-xs font-semibold text-ink">{s.label}</span>
                  </div>
                  <div className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] text-mist">toplam bütçe: {fmtM(s.budgetM)}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* 5. IPA Dönemine göre bütçe */}
          <Card title="IPA Dönemine Göre Toplam AB Katkısı (€M)">
            <div className="space-y-4">
              {byPeriod.sort((a,b) => b.budgetM - a.budgetM).map(({ period, count, budgetM, color }) => {
                const maxB = Math.max(...byPeriod.map(p => p.budgetM), 1);
                return (
                  <div key={period}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold" style={{ color }}>{period}</span>
                      <span className="text-sm font-extrabold text-ink">{fmtM(budgetM)}</span>
                    </div>
                    <div className="h-6 bg-surface rounded-full overflow-hidden">
                      <div className="h-full rounded-full flex items-center px-3"
                        style={{ width: `${Math.max((budgetM/maxB)*100,2)}%`, background: color }}>
                        <span className="text-white text-xs font-bold">{count} proje</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 6. Sektör başına ortalama bütçe */}
          <Card title="Sektör Başına Ortalama AB Katkısı (€M)">
            <div className="space-y-2.5">
              {sectorAvgBudget.map(({ sector, count, budgetM, color }) => {
                const avg = count > 0 ? budgetM / count : 0;
                const maxAvg = Math.max(...sectorAvgBudget.map(s => s.count > 0 ? s.budgetM/s.count : 0), 1);
                return (
                  <HBar key={sector.id}
                    label={sector.name.length > 22 ? sector.name.slice(0, 22) + "…" : sector.name}
                    value={avg} max={maxAvg} color={color}
                    subLabel={`${fmtM(avg)}/proje`} />
                );
              })}
            </div>
          </Card>

          {/* 7. İl bazlı proje yoğunluğu — TOP 10 */}
          <Card title="İl Bazlı Proje Yoğunluğu (İlk 10)" className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              {byProvince.map(({ il, n }, idx) => (
                <div key={il} className="flex items-center gap-3">
                  <span className="text-xs text-mist w-4 flex-shrink-0 text-right">{idx + 1}</span>
                  <div className="w-24 text-xs text-slate truncate flex-shrink-0">{il}</div>
                  <div className="flex-1 h-4 bg-surface rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${Math.max((n / maxProvince) * 100, 8)}%`,
                      background: `hsl(${220 - idx * 15}, 70%, ${40 + idx * 3}%)`,
                    }} />
                  </div>
                  <span className="text-xs font-bold text-ink w-6 flex-shrink-0">{n}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-mist mt-3">* Bir proje birden fazla ilde yer alabilir.</p>
          </Card>

          {/* 8. Sektör × IPA Dönemi çapraz tablo */}
          <Card title="Sektör × IPA Dönemi (Proje Sayısı)" className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left text-mist font-semibold py-2 pr-4">Sektör</th>
                    {PERIOD_ORDER.map((p) => (
                      <th key={p} className="text-center px-3 py-2 font-semibold" style={{ color: PERIOD_COLORS[p] }}>{p}</th>
                    ))}
                    <th className="text-center px-3 py-2 text-mist font-semibold">Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {bySector.map(({ sector, count, color }) => (
                    <tr key={sector.id} className="hover:bg-surface/50">
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                          <span className="text-slate truncate" style={{ maxWidth: 160 }}>{sector.name}</span>
                        </div>
                      </td>
                      {PERIOD_ORDER.map((period) => {
                        const n = filtered.filter((p) => p.sectorId === sector.id && p.ipaPeriod === period).length;
                        return (
                          <td key={period} className="text-center px-3 py-2">
                            {n > 0 ? (
                              <span className="inline-block w-7 h-7 rounded-lg text-white text-xs font-bold flex items-center justify-center"
                                style={{ background: PERIOD_COLORS[period], opacity: 0.7 + (n/20)*0.3 }}>
                                {n}
                              </span>
                            ) : (
                              <span className="text-line">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="text-center px-3 py-2 font-bold text-ink">{count}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-line">
                    <td className="py-2 pr-4 font-bold text-ink">Toplam</td>
                    {PERIOD_ORDER.map((period) => {
                      const n = filtered.filter((p) => p.ipaPeriod === period).length;
                      return (
                        <td key={period} className="text-center px-3 py-2 font-bold" style={{ color: PERIOD_COLORS[period] }}>
                          {n > 0 ? n : "—"}
                        </td>
                      );
                    })}
                    <td className="text-center px-3 py-2 font-black text-ink">{totalProjects}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

        </div>

        {/* Alt bilgi */}
        <div className="mt-8 bg-surface rounded-2xl p-4 text-center">
          <p className="text-xs text-mist">
            Veriler IPA II proje künyeleri Excel dosyasından alınmıştır. Toplam AB katkısı <strong className="text-ink">{fmtM(projects.reduce((s,p)=>s+getBudgetM(p),0))}</strong> ({projects.length} proje).
          </p>
        </div>
      </div>
    </PageShell>
  );
}
