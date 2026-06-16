import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { ListingType } from "@/lib/types";

export const revalidate = 60;

const TYPE_LABEL: Record<ListingType, string> = {
  is: "İş İlanı",
  satinalma: "Satınalma",
  ihale: "İhale",
};

const TYPE_COLOR: Record<ListingType, string> = {
  is: "bg-blue-100 text-blue-700",
  satinalma: "bg-orange-100 text-orange-700",
  ihale: "bg-purple-100 text-purple-700",
};

export default async function IlanlarPage({
  searchParams,
}: {
  searchParams: Promise<{ tur?: string }>;
}) {
  const params = await searchParams;
  const db = getDataProvider();
  const listings = await db.getListings(params.tur as ListingType | undefined);

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "İlanlar" }]} />

        <h1 className="text-3xl font-extrabold text-ink mb-6">İlanlar</h1>

        {/* Filtre */}
        <div className="flex gap-2 mb-8">
          {[
            { tur: undefined, label: "Tümü" },
            { tur: "is", label: "İş İlanları" },
            { tur: "satinalma", label: "Satınalma" },
            { tur: "ihale", label: "İhale" },
          ].map((f) => (
            <Link key={f.label}
              href={f.tur ? `/ilanlar?tur=${f.tur}` : "/ilanlar"}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                params.tur === f.tur || (!params.tur && !f.tur)
                  ? "bg-eu text-white"
                  : "bg-surface text-slate hover:bg-line"
              }`}>
              {f.label}
            </Link>
          ))}
        </div>

        <div className="space-y-4">
          {listings.map((l) => (
            <Link key={l.id} href={`/ilanlar/${l.id}`}
              className="flex items-start gap-4 p-5 bg-white border border-line rounded-xl hover:border-eu hover:shadow-md transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[l.type]}`}>
                    {TYPE_LABEL[l.type]}
                  </span>
                  {l.locked && <span className="text-mist text-xs">🔒 Abonelik gerektirir</span>}
                </div>
                <h2 className="font-bold text-ink mb-1">{l.title}</h2>
                <p className="text-slate text-sm">{l.organization}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-mist">
                  {l.location && <span>📍 {l.location}</span>}
                  {l.deadline && <span className="text-tr font-semibold">Son başvuru: {l.deadline}</span>}
                </div>
              </div>
              <div className="flex-shrink-0 text-eu font-semibold text-sm">Detay →</div>
            </Link>
          ))}
        </div>

        {listings.length === 0 && (
          <div className="text-center py-16 text-slate">Bu türde ilan bulunamadı.</div>
        )}
      </div>
    </PageShell>
  );
}
