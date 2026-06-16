import { getDataProvider } from "@/lib/data";
import { PageShell, PageBanner } from "@/components/PageShell";
import { ProjectsView } from "./ProjectsView";
import Link from "next/link";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ sektor?: string }>;
}) {
  const { sektor } = await searchParams;
  const db = getDataProvider();

  const [sectors, donors, projects] = await Promise.all([
    db.getSectors(),
    db.getDonors(),
    db.getProjects(sektor ? { sectorId: sektor } : undefined),
  ]);

  const activeSector = sektor ? sectors.find((s) => s.id === sektor) : null;

  return (
    <PageShell>
      <PageBanner
        kicker="Portföy"
        title={activeSector ? `${activeSector.name} Projeleri` : "Tüm Projeler"}
        desc="Türkiye'deki AB destekli projelerin tümünü sektöre göre keşfedin."
      />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Sektör filtre çipleri */}
        <div className="flex flex-wrap gap-2 mb-8">
          <FilterChip href="/projeler" active={!sektor} label="Tümü" />
          {sectors.map((s) => (
            <FilterChip key={s.id} href={`/projeler?sektor=${s.id}`} active={sektor === s.id} label={s.name} />
          ))}
        </div>

        <ProjectsView
          projects={projects}
          sectors={sectors}
          donors={donors}
          lockedSector={sektor}
        />
      </div>
    </PageShell>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
        active ? "bg-eu text-white" : "bg-white border border-line text-slate hover:border-eu/40"
      }`}
    >
      {label}
    </Link>
  );
}
