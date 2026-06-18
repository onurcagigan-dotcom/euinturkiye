import { CITIES } from "./turkiye-cities";
import type { Project } from "./types";

const NAME_TO_SLUG: Record<string, string> = {};
CITIES.forEach((c) => { NAME_TO_SLUG[c.name.toLocaleLowerCase("tr")] = c.id; });

/** Türkçe il adını (örn. "İstanbul") harita slug'una (örn. "istanbul") çevirir. Eşleşme yoksa null döner. */
export function cityNameToSlug(name: string): string | null {
  return NAME_TO_SLUG[name.toLocaleLowerCase("tr")] ?? null;
}

/**
 * Proje listesindeki `locations` alanlarını tarayıp, her ilde kaç proje uygulandığını sayar.
 * "Türkiye geneli" gibi belirli bir ile karşılık gelmeyen değerler dikkate alınmaz.
 */
export function countProjectsByCity(projects: Project[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of projects) {
    const seenInThisProject = new Set<string>();
    for (const loc of p.locations) {
      const slug = cityNameToSlug(loc);
      if (!slug || seenInThisProject.has(slug)) continue;
      seenInThisProject.add(slug);
      counts[slug] = (counts[slug] ?? 0) + 1;
    }
  }
  return counts;
}

/** Belirli bir ilde uygulanan projeleri döner (locations alanında o il adı geçen projeler). */
export function getProjectsByCitySlug(projects: Project[], citySlug: string): Project[] {
  return projects.filter((p) => p.locations.some((loc) => cityNameToSlug(loc) === citySlug));
}
