import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell, PageBanner } from "@/components/PageShell";
import type { ListingType } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  is: "İş İlanları", satinalma: "Satınalma", ihale: "İhale",
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tur?: string }>;
}) {
  const { tur } = await searchParams;
  const db = getDataProvider();
  const validType = (["is", "satinalma", "ihale"] as const).includes(tur as ListingType)
    ? (tur as ListingType)
    : undefined;

  const listings = await db.getListings(validType);

  return (
    <PageShell>
      <PageBanner
        kicker="Açık İlanlar"
        title="İş, Satınalma ve İhale"
        desc="Projelere ait güncel iş ilanları, satınalma duyuruları ve ihaleler."
      />
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Tür filtre çipleri */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Chip href="/ilanlar" active={!validType} label="Tümü" />
          <Chip href="/ilanlar?tur=is" active={validType === "is"} label="İş İlanları" />
          <Chip href="/ilanlar?tur=satinalma" active={validType === "satinalma"} label="Satınalma" />
          <Chip href="/ilanlar?tur=ihale" active={validType === "ihale"} label="İhale" />
        </div>

        {listings.length === 0 ? (
          <p className="text-slate py-12 text-center">İlan bulunamadı.</p>
        ) : (
          <div className="space-y-4">
            {listings.map((l) => (
              <Link
                key={l.id}
                href={`/ilanlar/${l.id}`}
                className="block bg-white border border-line rounded-xl p-5 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink">{l.title}</span>
                      {l.locked && <span title="Abonelik gerekli">🔒</span>}
                    </div>
                    <p className="text-sm text-slate mt-1">{l.organization}</p>
                    {l.location && <p className="text-xs text-mist mt-1">{l.location}</p>}
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-eu bg-eu-pale px-3 py-1.5 rounded-full">
                    {TYPE_LABEL[l.type]}
                  </span>
                </div>
                {l.deadline && (
                  <p className="text-xs text-tr mt-3">Son başvuru: {l.deadline}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function Chip({ href, active, label }: { href: string; active: boolean; label: string }) {
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
