import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { notFoundNever } from "@/lib/not-found-helper";

const TYPE_LABEL: Record<string, string> = {
  is: "İş İlanı", satinalma: "Satınalma", ihale: "İhale",
};

export default async function ListingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDataProvider();
  const found = await db.getListing(id);
  if (!found) notFoundNever();
  const listing = found;

  const project = listing.projectId ? await db.getProject(listing.projectId) : null;

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href="/ilanlar" className="text-eu text-sm hover:underline">← İlanlar</Link>

        <span className="inline-block text-xs font-semibold text-eu bg-eu-pale px-3 py-1.5 rounded-full mt-6">
          {TYPE_LABEL[listing.type]}
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-ink mt-4 leading-tight">{listing.title}</h1>
        <p className="text-slate mt-2">{listing.organization}</p>

        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-slate">
          {listing.location && <span>📍 {listing.location}</span>}
          {listing.deadline && <span className="text-tr">Son başvuru: {listing.deadline}</span>}
        </div>

        {/* İçerik / abonelik duvarı */}
        {listing.locked ? (
          <div className="mt-8 bg-eu-pale border border-eu/20 rounded-xl p-8 text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h2 className="font-bold text-ink text-lg">Bu ilan detayları aboneliğe özeldir</h2>
            <p className="text-slate text-sm mt-2 max-w-md mx-auto">
              Satınalma ilanlarının tüm detaylarını görüntülemek için üyelik paketlerimizden
              birine abone olmanız gerekir.
            </p>
            <Link href="/kayit" className="inline-block mt-5 px-5 py-2.5 rounded-lg bg-eu text-white font-semibold text-sm">
              Paketleri İncele
            </Link>
          </div>
        ) : (
          <div className="mt-8 text-ink leading-relaxed whitespace-pre-line">
            {listing.description}
          </div>
        )}

        {/* İlgili proje */}
        {project && (
          <div className="mt-10 pt-6 border-t border-line">
            <p className="text-xs uppercase tracking-wide text-mist mb-2">İlgili Proje</p>
            <Link href={`/projeler/${project.id}`} className="text-eu font-semibold hover:underline">
              {project.title} →
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}
