"use client";
import { useState, useMemo } from "react";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CITIES } from "@/lib/turkiye-cities";

// Demo proje verisi: her ilin kaç projesi var
const PROJECT_COUNTS: Record<string, number> = {
  ankara: 28, istanbul: 22, izmir: 14, konya: 11, bursa: 8,
  gaziantep: 9, antalya: 7, kayseri: 6, mersin: 6, adana: 5,
  samsun: 7, trabzon: 6, erzurum: 5, van: 4, diyarbakir: 6,
  sanliurfa: 5, malatya: 4, eskisehir: 4, denizli: 3, aydin: 3,
  manisa: 3, balikesir: 2, canakkale: 2, tekirdag: 2, edirne: 2,
  kocaeli: 4, sakarya: 2, bolu: 1, bilecik: 1, yalova: 1,
  usak: 1, kutahya: 2, afyonkarahisar: 2, mugla: 3,
  burdur: 1, isparta: 2, hatay: 3, kahramanmaras: 2, osmaniye: 1,
  adiyaman: 2, kilis: 1, mardin: 3, batman: 2, siirt: 1,
  sirnak: 1, hakkari: 1, bitlis: 1, mus: 1, agri: 2,
  igdir: 1, ardahan: 1, kars: 2, erzincan: 2, tunceli: 1,
  bingol: 1, elazig: 2, sivas: 3, yozgat: 1,
  kirsehir: 1, nevsehir: 2, aksaray: 1, nigde: 1,
  corum: 2, amasya: 1, tokat: 2, ordu: 2, giresun: 1,
  rize: 1, artvin: 1, kastamonu: 1, sinop: 1, bartin: 1,
  zonguldak: 1, karabuk: 1, duzce: 1, kirikkale: 1, cankiri: 1,
};

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

// Türkiye sınır koordinatları (lon: 26-45, lat: 36-42)
// SVG viewport: 800x400, mapping: lon 26-45 → x 0-800, lat 42-36 → y 0-400
function projectToSVG(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - 26) / (45 - 26)) * 800;
  const y = ((42 - lat) / (42 - 36)) * 400;
  return { x, y };
}

function maxCount(): number {
  return Math.max(...Object.values(PROJECT_COUNTS), 1);
}

export default function HaritaPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [region, setRegion] = useState("Tümü");

  const filtered = useMemo(() =>
    region === "Tümü" ? CITIES : CITIES.filter(c => c.region === region),
    [region]
  );

  const selectedCity = CITIES.find(c => c.id === selected);
  const hoveredCity = CITIES.find(c => c.id === hovered);
  const activeCity = selectedCity ?? hoveredCity;

  const totalProjects = Object.values(PROJECT_COUNTS).reduce((a, b) => a + b, 0);
  const max = maxCount();

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Breadcrumb items={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Dijital Araçlar", href: "/araclar" },
          { label: "Proje Haritası" },
        ]} />

        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-ink">Proje Haritası</h1>
            <p className="text-slate text-sm mt-1">
              Türkiye&apos;nin 81 iline dağılan <strong>{totalProjects}</strong> proje — ilde projenin büyüklüğünü yansıtır.
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Harita */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-sm">
              {/* Arka plan */}
              <svg
                viewBox="0 0 800 400"
                className="w-full"
                style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 100%)" }}
              >
                {/* Izgara referans çizgileri */}
                {[36, 37, 38, 39, 40, 41, 42].map(lat => {
                  const { y } = projectToSVG(lat, 26);
                  return (
                    <line key={lat} x1="0" y1={y} x2="800" y2={y}
                      stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="4,4" />
                  );
                })}
                {[26, 28, 30, 32, 34, 36, 38, 40, 42, 44].map(lng => {
                  const { x } = projectToSVG(36, lng);
                  return (
                    <line key={lng} x1={x} y1="0" x2={x} y2="400"
                      stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="4,4" />
                  );
                })}

                {/* İl noktaları */}
                {filtered.map(city => {
                  const { x, y } = projectToSVG(city.lat, city.lng);
                  const count = PROJECT_COUNTS[city.id] ?? 0;
                  const r = Math.max(5, Math.sqrt(count / max) * 22);
                  const isSelected = selected === city.id;
                  const isHovered = hovered === city.id;
                  const color = REGION_COLORS[city.region] ?? "#003399";

                  return (
                    <g key={city.id}
                      onClick={() => setSelected(prev => prev === city.id ? null : city.id)}
                      onMouseEnter={() => setHovered(city.id)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ cursor: "pointer" }}>
                      {/* Dış halka */}
                      {(isSelected || isHovered) && (
                        <circle cx={x} cy={y} r={r + 5}
                          fill="none" stroke={color} strokeWidth="2" opacity="0.4" />
                      )}
                      {/* Ana daire */}
                      <circle cx={x} cy={y} r={r}
                        fill={color}
                        opacity={region === "Tümü" || city.region === region ? 0.85 : 0.2}
                        stroke="white" strokeWidth="1.5"
                      />
                      {/* Proje sayısı */}
                      {count > 0 && r > 10 && (
                        <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                          fontSize={Math.min(r * 0.7, 12)} fill="white" fontWeight="700">
                          {count}
                        </text>
                      )}
                      {/* İl adı — büyük şehirler */}
                      {count >= 6 && (
                        <text x={x} y={y + r + 10} textAnchor="middle"
                          fontSize="9" fill="#475569" fontWeight="600">
                          {city.name}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Türkiye yazısı */}
                <text x="400" y="370" textAnchor="middle" fontSize="11" fill="#94A3B8" fontWeight="500">
                  Türkiye İl Proje Dağılımı
                </text>
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
              </div>
            ) : (
              <div className="bg-surface rounded-2xl p-5 mb-4 text-center">
                <p className="text-mist text-sm">Bir ile tıklayın veya üzerine gelin</p>
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
