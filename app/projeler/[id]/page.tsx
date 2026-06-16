import Link from "next/link";
import { notFoundNever } from "@/lib/not-found-helper";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { projectProgress } from "@/lib/project-progress";
import { OwnershipRequestBox } from "./OwnershipRequestBox";

const IPA_LABEL: Record<string, string> = {
  "ipa-oncesi": "IPA Öncesi (2002–2006)",
  "ipa-1": "IPA I (2007–2013)",
  "ipa-2": "IPA II (2014–2020)",
  "ipa-3": "IPA III (2021–2027)",
};
const STATUS_LABEL: Record<string, string> = {
  planlama: "Planlama", devam: "Devam ediyor", tamamlandi: "Tamamlandı",
};

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDataProvider();
  const found = await db.getProject(id);
  if (!found) notFoundNever();
  const project = found;

  const [sector, donor, allListings, allEvents] = await Promise.all([
    db.getSector(project.sectorId),
    db.getDonor(project.donorId),
    db.getListings(),
    db.getEvents(),
  ]);

  const relatedListings = allListings.filter((l) => l.projectId === project.id);
  const relatedEvents = allEvents.filter((e) => e.projectId === project.id);

  return (
    <PageShell>
      {/* Başlık bandı */}
      <div className="bg-eu-deep text-white">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <Link href="/projeler" className="text-white/70 text-sm hover:text-white">← Projeler</Link>
          <span className="inline-block text-xs font-semibold text-eu-deep bg-[#FFCC00] px-3 py-1 rounded-full mt-4">
            {sector?.name ?? project.sectorId}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mt-3 leading-tight">{project.title}</h1>
          <p className="text-white/80 mt-3 max-w-2xl">{project.summary}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Künye */}
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5 bg-white border border-line rounded-xl p-6">
          <Info label="Yararlanıcı" value={project.beneficiary} />
          <Info label="Donör" value={donor?.name ?? project.donorId} />
          <Info label="IPA Dönemi" value={IPA_LABEL[project.ipaPeriod]} />
          <Info label="Durum" value={STATUS_LABEL[project.status]} />
          <Info label="İller" value={project.locations.join(", ")} />
          {project.budget && <Info label="Bütçe" value={project.budget} />}
          {project.startDate && <Info label="Başlangıç" value={project.startDate} />}
          {project.endDate && <Info label="Bitiş" value={project.endDate} />}
        </div>

        {/* İlerleme çubuğu */}
        {(() => {
          const prog = projectProgress(project);
          return (
            <div className="bg-white border border-line rounded-xl p-6 mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-ink uppercase tracking-wide">Proje İlerlemesi</h2>
                <span className="text-sm font-semibold text-eu">%{prog.percent}</span>
              </div>
              <div className="w-full bg-eu-pale rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${prog.percent >= 100 ? "bg-green-500" : "bg-eu"}`}
                  style={{ width: `${prog.percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-slate">{prog.label}</span>
                {prog.daysLeft !== null && prog.daysLeft > 0 && (
                  <span className="text-slate">{prog.daysLeft} gün kaldı</span>
                )}
              </div>
              {!prog.hasTimeline && (
                <p className="text-xs text-mist mt-2">
                  Daha hassas ilerleme için başlangıç ve bitiş tarihi tanımlanmalıdır.
                </p>
              )}
            </div>
          );
        })()}

        {/* Sahipsiz arşiv projesi: portföye ekleme talebi */}
        {!project.ownerSubscriberId && (
          <OwnershipRequestBox projectId={project.id} projectTitle={project.title} />
        )}

        {/* İlgili ilanlar */}
        {relatedListings.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold text-ink mb-4">Bu Projenin İlanları</h2>
            <div className="space-y-3">
              {relatedListings.map((l) => (
                <div key={l.id} className="bg-white border border-line rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{l.title}</span>
                    {l.locked && <span title="Abonelik gerekli">🔒</span>}
                  </div>
                  <p className="text-sm text-slate mt-1">{l.organization}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* İlgili etkinlikler */}
        {relatedEvents.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold text-ink mb-4">Bu Projenin Etkinlikleri</h2>
            <div className="space-y-3">
              {relatedEvents.map((e) => (
                <div key={e.id} className="bg-white border border-line rounded-lg p-4">
                  <span className="font-medium text-ink">{e.title}</span>
                  <p className="text-sm text-slate mt-1">{e.date} · {e.location}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-mist">{label}</p>
      <p className="text-ink font-medium mt-0.5">{value}</p>
    </div>
  );
}
