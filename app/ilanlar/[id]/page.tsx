import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { notFoundNever } from "@/lib/not-found-helper";
import type { ListingType } from "@/lib/types";

export const revalidate = 60;

const TYPE_LABEL: Record<ListingType, string> = {
  is: "İş İlanı",
  satinalma: "Satınalma",
  ihale: "İhale",
};

export default async function IlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDataProvider();
  const listing = await db.getListing(id);

  if (!listing) notFoundNever();

  const project = listing.projectId ? await db.getProject(listing.projectId) : null;

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Breadcrumb items={[
          { label: "Ana Sayfa", href: "/" },
          { label: "İlanlar", href: "/ilanlar" },
          { label: listing.title },
        ]} />

        <span className="inline-block text-xs font-semibold text-eu bg-eu-pale px-3 py-1.5 rounded-full">
          {TYPE_LABEL[listing.type]}
        </span>

        <h1 className="text-2xl md:text-3xl font-bold text-ink mt-4 leading-tight">{listing.title}</h1>
        <p className="text-slate mt-2">{listing.organization}</p>

        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-slate">
          {listing.location && <span>📍 {listing.location}</span>}
          {listing.deadline && <span className="text-tr font-semibold">Son başvuru: {listing.deadline}</span>}
        </div>

        {project && (
          <div className="mt-4 p-3 bg-eu-pale rounded-lg text-sm">
            <span className="text-mist">İlgili Proje: </span>
            <Link href={`/projeler/${project.id}`} className="text-eu font-semibold hover:underline">
              {project.title}
            </Link>
          </div>
        )}

        {/* İçerik / abonelik duvarı */}
        {listing.locked ? (
          <div className="mt-8 bg-eu-pale border border-eu/20 rounded-xl p-8 text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h2 className="font-bold text-ink text-lg">Bu ilan detayları aboneliğe özeldir</h2>
            <p className="text-slate text-sm mt-2 max-w-md mx-auto">
              Satınalma ve ihale ilanlarının tüm detaylarını görüntülemek için
              üyelik paketlerimizden birine abone olmanız gerekir.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link href="/kayit" className="inline-block px-5 py-2.5 rounded-lg bg-eu text-white font-semibold text-sm">
                Paketleri İncele
              </Link>
              <Link href="/ilanlar" className="inline-block px-5 py-2.5 rounded-lg border border-line text-slate text-sm">
                İlanlara Dön
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <div className="text-ink leading-relaxed whitespace-pre-line">{listing.description}</div>

            {listing.documentUrl && (
              <div className="mt-6 p-4 border border-line rounded-xl flex items-center justify-between">
                <span className="text-sm font-medium text-ink">📎 İlan Dokümanı</span>
                <a href={listing.documentUrl} target="_blank" rel="noopener noreferrer"
                  className="text-eu text-sm font-semibold hover:underline">
                  İndir
                </a>
              </div>
            )}

            <div className="mt-8 bg-eu-pale rounded-xl p-6">
              <h3 className="font-bold text-ink mb-2">Başvuru</h3>
              <p className="text-slate text-sm">
                Bu ilana başvurmak için ilan sahibi kurumla doğrudan iletişime geçin.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link href="/ilanlar" className="text-eu text-sm hover:underline">← Tüm İlanlara Dön</Link>
        </div>
      </div>
    </PageShell>
  );
}
