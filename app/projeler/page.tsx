import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";

export const revalidate = 60;

export default async function ProjelerPage({
  searchParams,
}: {
  searchParams: Promise<{ sektor?: string; donem?: string; durum?: string; ara?: string }>;
}) {
  const params = await searchParams;
  const db = getDataProvider();
  const [projects, sectors, donors] = await Promise.all([
    db.getProjects({
      sectorId: params.sektor,
      ipaPeriod: params.donem as never,
      status: params.durum,
      search: params.ara,
    }),
    db.getSectors(),
    db.getDonors(),
  ]);

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Projeler" }]} />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filtreler */}
          <aside className="w-full md:w-56 flex-shrink-0">
            <h2 className="font-bold text-ink mb-4">Filtreler</h2>

            <div className="mb-6">
              <div className="text-xs uppercase tracking-wide text-mist mb-2 font-semibold">Sektör</div>
              <div className="space-y-1">
                <Link href="/projeler" className={`block text-sm px-3 py-1.5 rounded-lg ${!params.sektor ? "bg-eu text-white font-semibold" : "text-slate hover:bg-surface"}`}>
                  Tümü
                </Link>
                {sectors.map((s) => (
                  <Link key={s.id} href={`/projeler?sektor=${s.id}`}
                    className={`block text-sm px-3 py-1.5 rounded-lg ${params.sektor === s.id ? "bg-eu text-white font-semibold" : "text-slate hover:bg-surface"}`}>
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs uppercase tracking-wide text-mist mb-2 font-semibold">IPA Dönemi</div>
              <div className="space-y-1">
                {(["IPA-I", "IPA-II", "IPA-III", "IPA-IV"] as const).map((p) => (
                  <Link key={p} href={`/projeler?donem=${p}`}
                    className={`block text-sm px-3 py-1.5 rounded-lg ${params.donem === p ? "bg-eu text-white font-semibold" : "text-slate hover:bg-surface"}`}>
                    {p}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-mist mb-2 font-semibold">Durum</div>
              <div className="space-y-1">
                {[{ v: "devam", l: "Devam Ediyor" }, { v: "tamamlandi", l: "Tamamlandı" }, { v: "planlama", l: "Planlama" }].map((d) => (
                  <Link key={d.v} href={`/projeler?durum=${d.v}`}
                    className={`block text-sm px-3 py-1.5 rounded-lg ${params.durum === d.v ? "bg-eu text-white font-semibold" : "text-slate hover:bg-surface"}`}>
                    {d.l}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Liste */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-ink">
                Projeler <span className="text-mist text-lg font-normal">({projects.length})</span>
              </h1>
            </div>

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
                            p.status === "devam" ? "bg-green-100 text-green-700" :
                            p.status === "tamamlandi" ? "bg-gray-100 text-gray-600" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {p.status === "devam" ? "Devam" : p.status === "tamamlandi" ? "Tamamlandı" : "Planlama"}
                          </span>
                        </div>
                        <h2 className="font-bold text-ink text-sm leading-tight mb-1">{p.title}</h2>
                        <p className="text-xs text-slate line-clamp-2">{p.summary}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {p.locations.slice(0, 3).map((l) => (
                            <span key={l} className="text-xs bg-surface text-mist px-2 py-0.5 rounded">📍 {l}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {projects.length === 0 && (
              <div className="text-center py-16 text-slate">
                Bu kriterlere uyan proje bulunamadı.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
