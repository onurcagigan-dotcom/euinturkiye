"use client";
import { TURKEY_MAP_VIEWBOX, TURKEY_MAP_OUTER_TRANSFORM, TURKEY_MAP_CITIES, TURKEY_MAP_LAKES_SVG } from "@/lib/turkey-map-data";
import { cityNameToSlug } from "@/lib/city-projects";
import { CITIES } from "@/lib/turkiye-cities";

interface Props {
  /** Projenin locations alanı (Türkçe il adları, örn. ["Ankara", "Konya"]) */
  locations: string[];
}

/**
 * Bir projenin uygulandığı illeri Türkiye haritası üzerinde vurgulayan, salt-okunur, kompakt harita.
 * "Türkiye geneli" gibi belirli bir ile karşılık gelmeyen değerler dikkate alınmaz.
 */
export function ProjectLocationMap({ locations }: Props) {
  const activeSlugs = new Set(
    locations.map((l) => cityNameToSlug(l)).filter((s): s is string => Boolean(s))
  );

  if (activeSlugs.size === 0) return null;

  const nameBySlug: Record<string, string> = {};
  CITIES.forEach((c) => { nameBySlug[c.id] = c.name; });

  return (
    <div className="bg-white border border-line rounded-2xl overflow-hidden p-2">
      <svg
        viewBox={TURKEY_MAP_VIEWBOX}
        className="w-full"
        style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 100%)" }}
      >
        <g transform={TURKEY_MAP_OUTER_TRANSFORM}>
          <g fill="#bfdbfe" dangerouslySetInnerHTML={{ __html: TURKEY_MAP_LAKES_SVG }} />
          {TURKEY_MAP_CITIES.map((city) => {
            const isActive = activeSlugs.has(city.slug);
            return (
              <g key={city.slug}
                fill={isActive ? "#003399" : "#E2E8F0"}
                fillOpacity={isActive ? 0.9 : 0.5}
                stroke="#fff"
                strokeWidth={isActive ? 1.5 : 0.75}
                dangerouslySetInnerHTML={{ __html: city.innerSvg }}
              />
            );
          })}
          {TURKEY_MAP_CITIES.filter((city) => activeSlugs.has(city.slug)).map((city) => (
            <text key={city.slug}
              x={city.labelX} y={city.labelY}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={13} fontWeight={700} fill="#fff"
              style={{ pointerEvents: "none" }}
            >
              {nameBySlug[city.slug] ?? city.slug}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}
