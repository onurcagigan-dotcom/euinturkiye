"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CITIES } from "@/lib/turkiye-cities";
import { TURKEY_MAP_VIEWBOX, TURKEY_MAP_OUTER_TRANSFORM, TURKEY_MAP_CITIES, TURKEY_MAP_LAKES_SVG } from "@/lib/turkey-map-data";
import { countProjectsByCity, getProjectsByCitySlug } from "@/lib/city-projects";
import { getDataProvider } from "@/lib/data";
import type { Project } from "@/lib/types";

const REGIONS = ["Tümü", "Marmara", "Ege", "Akdeniz", "İç Anadolu", "Karadeniz", "Doğu Anadolu", "Güneydoğu Anadolu"];

const REGION_COLORS: Record<string, string> = {
  "Marmara": "#003399",
  "Ege": "#0891b2",
  "Akdeniz": "#0284c7",
  "İç Anadolu": "#7c3aed",
  "Karadeniz": "#16a34a",
  "Doğu Anadolu": "#ea580c",
  "Güneydoğu Anadolu": "#e30a17",
};

function maxCount(counts: Record<string, number>): number {
  const values = Object.values(counts);
  return values.length > 0 ? Math.max(...values, 1) : 1;
}

export default function HaritaPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [region, setRegion] = useState("Tümü");
  const [ipaFilter, setIpaFilter] = useState<"Tümü" | "IPA-I" | "IPA-II" | "IPA-III">("Tümü");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDataProvider().getProjects().then((p) => {
      setProjects(p);
      setLoading(false);
    });
  }, []);

  const filteredProjects = useMemo(
    () => (ipaFilter === "Tümü" ? projects : projects.filter((p) => p.ipaPeriod === ipaFilter)),
    [projects, ipaFilter]
  );

  const PROJECT_COUNTS = useMemo(() => countProjectsByCity(filteredProjects), [filteredProjects]);

  const cityBySlug = useMemo(() => {
    const map: Record<string, typeof CITIES[number]> = {};
    CITIES.forEach((c) => { map[c.id] = c; });
    return map;
  }, []);

  const selectedCity = selected ? cityBySlug[selected] : undefined;
  const hoveredCity = hovered ? cityBySlug[hovered] : undefined;
  const activeCity = selectedCity ?? hoveredCity;

  const activeCityProjects = useMemo(
    () => (activeCity ? getProjectsByCitySlug(filteredProjects, activeCity.id) : []),
    [activeCity, filteredProjects]
  );

  const max = maxCount(PROJECT_COUNTS);

  // Hangi illerin etiketi gösterilsin (büyük/çok projeli iller, küçük illerde isim kalabalık yapar)
  const showLabelThreshold = 0; // 0 = tüm illerde etiket göster

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Breadcrumb items={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Dijital Araçlar", href: "/araclar" },
          { label: "Projeler" },
        ]} />

        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-ink">Projeler</h1>
            <p className="text-slate text-sm mt-1">
              Türkiye&apos;nin 81 iline dağılan <strong>{filteredProjects.length}</strong> proje — bir ile tıklayın veya üzerine gelin.
            </p>
          </div>
          {/* Bölge filtresi */}
          <div className="flex flex-wrap gap-2">
            {REGIONS.map(r => (
              <button key={r} onClick={() => setRegion(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${region === r ? "bg-eu text-white" : "bg-surface text-slate hover:bg-line"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* IPA dönem katmanları */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-semibold text-mist">IPA Dönemi:</span>
          {(["Tümü", "IPA-I", "IPA-II", "IPA-III"] as const).map((p) => (
            <button key={p} onClick={() => setIpaFilter(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                ipaFilter === p ? "bg-ink text-white" : "bg-surface text-slate hover:bg-line"
              }`}>
              {p}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Harita */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-sm p-2">
              <svg
                viewBox={TURKEY_MAP_VIEWBOX}
                className="w-full"
                style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 100%)" }}
              >
                <g transform={TURKEY_MAP_OUTER_TRANSFORM}>
                  {/* Göller */}
                  <g fill="#bfdbfe" dangerouslySetInnerHTML={{ __html: TURKEY_MAP_LAKES_SVG }} />

                  {/* İl sınırları */}
                  {TURKEY_MAP_CITIES.map((city) => {
                    const cityInfo = cityBySlug[city.slug];
                    const count = PROJECT_COUNTS[city.slug] ?? 0;
                    const isSelected = selected === city.slug;
                    const isHovered = hovered === city.slug;
                    const inRegionFilter = region === "Tümü" || cityInfo?.region === region;
                    const regionColor = cityInfo ? (REGION_COLORS[cityInfo.region] ?? "#003399") : "#94A3B8";

                    const intensity = count > 0 ? 0.3 + (count / max) * 0.6 : 0.12;
                    const fillColor = inRegionFilter ? regionColor : "#CBD5E1";
                    const fillOpacity = isSelected || isHovered ? 0.95 : (inRegionFilter ? intensity : 0.2);

                    return (
                      <g key={city.slug}
                        fill={fillColor}
                        fillOpacity={fillOpacity}
                        stroke={isSelected ? "#1E3A8A" : "#fff"}
                        strokeWidth={isSelected ? 2.5 : 1}
                        style={{ transition: "fill-opacity 0.15s, stroke 0.15s", cursor: "pointer" }}
                        onClick={() => setSelected(prev => prev === city.slug ? null : city.slug)}
                        onMouseEnter={() => setHovered(city.slug)}
                        onMouseLeave={() => setHovered(null)}
                        dangerouslySetInnerHTML={{ __html: city.innerSvg }}
                      />
                    );
                  })}

                  {/* İl isimleri */}
                  {TURKEY_MAP_CITIES.map((city) => {
                    const cityInfo = cityBySlug[city.slug];
                    const count = PROJECT_COUNTS[city.slug] ?? 0;
                    if (count < showLabelThreshold) return null;
                    const isActive = selected === city.slug || hovered === city.slug;
                    return (
                      <text key={city.slug}
                        x={city.labelX} y={city.labelY}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={isActive ? 12.5 : 9}
                        fontWeight={isActive ? 800 : 500}
                        fill={isActive ? "#ffffff" : "#475569"}
                        stroke={isActive ? "#1E3A8A" : "none"}
                        strokeWidth={isActive ? 3 : 0}
                        paintOrder="stroke fill"
                        style={{ pointerEvents: "none" }}
                      >
                        {cityInfo?.name ?? city.slug}
                      </text>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* Renk göstergesi */}
            <div className="flex flex-wrap gap-3 mt-4">
              {Object.entries(REGION_COLORS).map(([r, c]) => (
                <div key={r} className="flex items-center gap-1.5 text-xs text-slate">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: c }} />
                  {r}
                </div>
              ))}
            </div>
          </div>

          {/* Yan panel */}
          <div className="lg:col-span-1">
            {/* Seçili / hovered il */}
            {activeCity ? (
              <div className="bg-white border border-eu/30 rounded-2xl p-5 mb-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: REGION_COLORS[activeCity.region] }} />
                  <span className="text-xs text-mist font-semibold">{activeCity.region}</span>
                </div>
                <h2 className="text-xl font-extrabold text-ink">{activeCity.name}</h2>
                <div className="mt-3 text-3xl font-extrabold text-eu">
                  {PROJECT_COUNTS[activeCity.id] ?? 0}
                </div>
                <p className="text-xs text-mist mt-0.5">proje</p>

                <div className="mt-4 bg-surface rounded-xl p-3">
                  <div className="h-2 bg-line rounded-full overflow-hidden">
                    <div className="h-2 bg-eu rounded-full transition-all"
                      style={{ width: `${((PROJECT_COUNTS[activeCity.id] ?? 0) / max) * 100}%` }} />
                  </div>
                  <p className="text-xs text-mist mt-1">Maksimuma oranla</p>
                </div>

                {activeCityProjects.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-line space-y-1.5 max-h-64 overflow-y-auto">
                    {activeCityProjects.slice(0, 15).map((p) => (
                      <Link key={p.id} href={`/projeler/${p.id}`}
                        className="block text-sm text-slate hover:text-eu hover:underline truncate">
                        {p.title}
                        <span className="text-xs text-mist ml-1.5">({p.ipaPeriod})</span>
                      </Link>
                    ))}
                    {activeCityProjects.length > 15 && (
                      <p className="text-xs text-mist pt-1">+{activeCityProjects.length - 15} proje daha</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-surface rounded-2xl p-5 mb-4 text-center">
                <p className="text-mist text-sm">{loading ? "Yükleniyor…" : "Bir ile tıklayın veya üzerine gelin"}</p>
              </div>
            )}

            {/* En çok proje olan iller */}
            <div className="bg-white border border-line rounded-2xl p-5">
              <h3 className="font-bold text-ink text-sm mb-3">En Çok Proje</h3>
              <div className="space-y-2">
                {CITIES
                  .filter(c => (PROJECT_COUNTS[c.id] ?? 0) > 0)
                  .sort((a, b) => (PROJECT_COUNTS[b.id] ?? 0) - (PROJECT_COUNTS[a.id] ?? 0))
                  .slice(0, 10)
                  .map((city, i) => (
                    <button key={city.id}
                      onClick={() => setSelected(prev => prev === city.id ? null : city.id)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${selected === city.id ? "bg-eu-pale" : "hover:bg-surface"}`}>
                      <span className="text-xs text-mist w-4 text-right">{i + 1}</span>
                      <span className="flex-1 text-sm font-medium text-ink">{city.name}</span>
                      <span className="text-sm font-bold text-eu">{PROJECT_COUNTS[city.id]}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
