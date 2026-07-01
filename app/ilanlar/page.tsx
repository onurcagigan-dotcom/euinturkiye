"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import { useFirma } from "@/lib/firma/context";
import type { Listing, ListingType } from "@/lib/types";

function IlanlarPageInner() {
  const { t } = useLocale();
  const { current: firma } = useFirma();
  const searchParams = useSearchParams();
  const tur = searchParams.get("tur") as ListingType | null;
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    const db = getDataProvider();
    db.getListings(tur ?? undefined).then(setListings);
  }, [tur]);

  const hasSupplierAccess = firma?.plan === "tedarikci";
  const isListingLocked = (l: Listing) =>
    (l.type === "satinalma" && !hasSupplierAccess) || (l.type === "ihale" && !firma);

  const TYPE_LABEL: Record<ListingType, string> = {
    is: t("listings_jobs"), satinalma: t("listings_procurement"), ihale: t("listings_tender"),
  };
  const TYPE_COLOR: Record<ListingType, string> = {
    is: "bg-blue-100 text-blue-700", satinalma: "bg-orange-100 text-orange-700", ihale: "bg-purple-100 text-purple-700",
  };

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: t("listings_title") }]} />

        <h1 className="text-3xl font-extrabold text-ink mb-6">{t("listings_title")}</h1>

        <div className="flex gap-2 mb-8">
          {[
            { tur: undefined, label: t("listings_all") },
            { tur: "is", label: t("listings_jobs") },
            { tur: "satinalma", label: t("listings_procurement") },
            { tur: "ihale", label: t("listings_tender") },
          ].map((f) => (
            <Link key={f.label}
              href={f.tur ? `/ilanlar?tur=${f.tur}` : "/ilanlar"}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                tur === f.tur || (!tur && !f.tur)
                  ? "bg-eu text-white"
                  : "bg-surface text-slate hover:bg-line"
              }`}>
              {f.label}
            </Link>
          ))}
        </div>

        {!tur ? (
          // Tür filtrelenmemişse: iş / satınalma / ihale ayrı sütunlarda
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(["is", "satinalma", "ihale"] as ListingType[]).map((colType) => {
              const colListings = listings.filter((l) => l.type === colType);
              return (
                <div key={colType}>
                  <h2 className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${TYPE_COLOR[colType]}`}>
                    {TYPE_LABEL[colType]}
                  </h2>
                  <div className="space-y-3">
                    {colListings.length === 0 ? (
                      <p className="text-sm text-mist">{t("company_profile_no_listings")}</p>
                    ) : (
                      colListings.map((l) => {
                        const isLocked = isListingLocked(l);
                        return (
                          <Link key={l.id} href={`/ilanlar/${l.id}`}
                            className="block p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-md transition-all">
                            <h3 className="font-bold text-ink text-sm mb-1">{l.title}</h3>
                            <p className="text-slate text-xs">{l.organization}</p>
                            {l.subject && <p className="text-slate text-xs mt-1 line-clamp-2">{l.subject}</p>}
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-mist">
                              {l.location && <span>📍 {l.location}</span>}
                              {l.deadline && <span className="text-tr font-semibold">{l.deadline}</span>}
                              {isLocked && <span>🔒 {t("listings_locked_note")}</span>}
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Belirli bir tür filtrelendiğinde: tek dikey liste
          <div className="space-y-4">
            {listings.map((l) => {
              const isLocked = isListingLocked(l);
              return (
              <Link key={l.id} href={`/ilanlar/${l.id}`}
                className="flex items-start gap-4 p-5 bg-white border border-line rounded-xl hover:border-eu hover:shadow-md transition-all">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[l.type]}`}>
                      {TYPE_LABEL[l.type]}
                    </span>
                    {isLocked && <span className="text-mist text-xs">🔒 {t("listings_locked_note")}</span>}
                  </div>
                  <h2 className="font-bold text-ink mb-1">{l.title}</h2>
                  <p className="text-slate text-sm">{l.organization}</p>
                  {l.subject && <p className="text-slate text-sm mt-1 line-clamp-2">{l.subject}</p>}
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-mist">
                    {l.location && <span>📍 {l.location}</span>}
                    {l.deadline && <span className="text-tr font-semibold">{t("listing_deadline")}: {l.deadline}</span>}
                  </div>
                </div>
                <div className="flex-shrink-0 text-eu font-semibold text-sm">{t("listing_detail")} →</div>
              </Link>
              );
            })}
          </div>
        )}

        {listings.length === 0 && (
          <div className="text-center py-16 text-slate">{t("listings_not_found")}</div>
        )}
      </div>
    </PageShell>
  );
}

export default function IlanlarPage() {
  return (
    <Suspense fallback={null}>
      <IlanlarPageInner />
    </Suspense>
  );
}
