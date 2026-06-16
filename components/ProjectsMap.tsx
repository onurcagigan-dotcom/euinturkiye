"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CITY_POINTS } from "@/lib/geo/cities";
import type { Project, Sector, Donor, IpaPeriod } from "@/lib/types";

// Türkiye'nin sadeleştirilmiş sınır şekli (görsel temsil)
const TR_PATH =
  "M70,180 L130,150 L180,120 L210,90 L250,85 L300,95 L340,80 L400,85 L470,75 " +
  "L540,80 L600,75 L660,70 L720,80 L780,100 L840,120 L890,150 L910,180 L890,210 " +
  "L850,240 L800,250 L740,260 L690,290 L630,320 L570,330 L520,320 L470,330 " +
  "L420,320 L370,315 L320,320 L270,300 L220,280 L180,270 L140,260 L100,230 L70,200 Z";

const IPA_LABEL: Record<IpaPeriod, string> = {
  "ipa-oncesi": "IPA Öncesi", "ipa-1": "IPA I", "ipa-2": "IPA II", "ipa-3": "IPA III",
};

export function ProjectsMap({
  projects, sectors, donors, embedded = false, lockedSector,
}: {
  projects: Project[]; sectors: Sector[]; donors: Donor[];
  embedded?: boolean;        // true: başlık/bölüm sarması olmadan, sade
  lockedSector?: string;     // dışarıdan sabit sektör (projeler sayfası filtresi)
}) {
  const [sectorF, setSectorF] = useState(lockedSector ?? "all");
  const [periodF, setPeriodF] = useState("all");
  const [donorF, setDonorF] = useState("all");
  const [activeCity, setActiveCity] = useState<string | null>(null);

  // lockedSector değişirse (URL filtresi) içeriği eşitle
  const effectiveSector = lockedSector ?? sectorF;

  // Filtrelenmiş projeler
  const filtered = useMemo(() => projects.filter((p) =>
    (effectiveSector === "all" || p.sectorId === effectiveSector) &&
    (periodF === "all" || p.ipaPeriod === periodF) &&
    (donorF === "all" || p.donorId === donorF)
  ), [projects, effectiveSector, periodF, donorF]);

  // İl bazında proje sayısı (sadece koordinatı olan iller)
  const cityProjects = useMemo(() => {
    const map: Record<string, Project[]> = {};
    filtered.forEach((p) => {
      p.locations.forEach((loc) => {
        if (CITY_POINTS[loc]) {
          (map[loc] ??= []).push(p);
        }
      });
    });
    return map;
  }, [filtered]);

  const maxCount = Math.max(1, ...Object.values(cityProjects).map((a) => a.length));
  const sectorName = (id: string) => sectors.find((s) => s.id === id)?.name ?? id;

  const activeList = activeCity ? cityProjects[activeCity] ?? [] : [];

  const inner = (
    <>
      {/* Filtreler */}
      <div className={`grid gap-3 mb-6 ${lockedSector ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {!lockedSector && (
          <Filter label="Sektör" value={sectorF} onChange={(v) => { setSectorF(v); setActiveCity(null); }}
            options={[["all", "Tüm Sektörler"], ...sectors.map((s) => [s.id, s.name] as [string, string])]} />
        )}
        <Filter label="Dönem" value={periodF} onChange={(v) => { setPeriodF(v); setActiveCity(null); }}
          options={[["all", "Tüm Dönemler"], ["ipa-3", "IPA III"], ["ipa-2", "IPA II"], ["ipa-1", "IPA I"], ["ipa-oncesi", "IPA Öncesi"]]} />
        <Filter label="Donör" value={donorF} onChange={(v) => { setDonorF(v); setActiveCity(null); }}
          options={[["all", "Tüm Donörler"], ...donors.map((d) => [d.id, d.name] as [string, string])]} />
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Harita */}
        <div className="bg-eu-pale/40 border border-line rounded-2xl p-4">
          <svg viewBox="0 0 1000 420" className="w-full h-auto">
            <path d={TR_PATH} fill="#dce6f5" stroke="#b9cce8" strokeWidth="2" />
            {Object.entries(CITY_POINTS).map(([city, pos]) => {
              const list = cityProjects[city] ?? [];
              const count = list.length;
              if (count === 0) {
                return <circle key={city} cx={pos.x} cy={pos.y} r={2.5} fill="#c4cdda" />;
              }
              const r = 6 + (count / maxCount) * 16;
              const isActive = activeCity === city;
              return (
                <g key={city} className="cursor-pointer" onClick={() => setActiveCity(isActive ? null : city)}>
                  <circle cx={pos.x} cy={pos.y} r={r} fill={isActive ? "#003399" : "#0047c4"} fillOpacity={isActive ? 0.95 : 0.65}
                    stroke="#fff" strokeWidth="1.5" />
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">{count}</text>
                  <text x={pos.x} y={pos.y - r - 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1a2b4a">{city}</text>
                </g>
              );
            })}
          </svg>
          <p className="text-xs text-mist text-center mt-2">
            Daire büyüklüğü o ildeki proje sayısıyla orantılıdır. Detay için bir ile tıklayın.
          </p>
        </div>

        {/* Yan panel */}
        <aside className="bg-white border border-line rounded-2xl p-5">
          {activeCity ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-ink">{activeCity}</h3>
                <button onClick={() => setActiveCity(null)} className="text-xs text-slate hover:text-ink">✕ kapat</button>
              </div>
              <p className="text-sm text-slate mb-4">{activeList.length} proje</p>
              <div className="space-y-3">
                {activeList.map((p) => (
                  <Link key={p.id} href={`/projeler/${p.id}`} className="block border border-line rounded-lg p-3 hover:border-eu/40">
                    <span className="text-[10px] font-semibold text-eu bg-eu-pale px-2 py-0.5 rounded-full">{sectorName(p.sectorId)}</span>
                    <p className="text-sm font-medium text-ink mt-1.5 leading-snug">{p.title}</p>
                    <p className="text-xs text-mist mt-1">{IPA_LABEL[p.ipaPeriod]}</p>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className="font-bold text-ink mb-3">Özet</h3>
              <Summary label="Görüntülenen proje" value={filtered.length} />
              <Summary label="Pilot il" value={Object.keys(cityProjects).length} />
              <div className="mt-4 pt-4 border-t border-line">
                <p className="text-xs text-slate leading-relaxed">
                  Haritadaki bir ile tıklayarak o ildeki projeleri görüntüleyebilirsiniz.
                  Filtreleri kullanarak portföyü daraltın.
                </p>
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );

  if (embedded) {
    return <div>{inner}</div>;
  }

  return (
    <section id="harita" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <p className="text-eu font-semibold tracking-widest text-xs uppercase">Coğrafi Dağılım</p>
          <h2 className="text-2xl md:text-3xl font-bold mt-2 text-ink">Projeler Haritada</h2>
          <p className="text-slate mt-2">Sisteme kayıtlı projelerin pilot illerdeki dağılımını sektör, dönem ve donöre göre filtreleyin.</p>
        </div>
        {inner}
      </div>
    </section>
  );
}

function Filter({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: [string, string][];
}) {
  return (
    <label className="block">
      <span className="block text-xs text-slate mb-1">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-eu/30 bg-white">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate">{label}</span>
      <span className="text-xl font-bold text-eu">{value}</span>
    </div>
  );
}
