"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import type { Listing, Project, ListingType } from "@/lib/types";

export default function IlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLocale();
  const [listing, setListing] = useState<Listing | null | undefined>(undefined);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const db = getDataProvider();
    db.getListing(id).then(async (l) => {
      setListing(l);
      if (l?.projectId) setProject(await db.getProject(l.projectId));
    });
  }, [id]);

  const TYPE_LABEL: Record<ListingType, string> = {
    is: t("listings_jobs"), satinalma: t("listings_procurement"), ihale: t("listings_tender"),
  };

  if (listing === undefined) {
    return <PageShell><div className="max-w-2xl mx-auto px-6 py-16 text-center text-slate">…</div></PageShell>;
  }

  if (listing === null) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-ink mb-2">{t("notfound_title")}</h1>
          <Link href="/ilanlar" className="text-eu hover:underline">{t("listing_all_back")}</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Breadcrumb items={[
          { label: t("breadcrumb_home"), href: "/" },
          { label: t("listings_title"), href: "/ilanlar" },
          { label: listing.title },
        ]} />

        <span className="inline-block text-xs font-semibold text-eu bg-eu-pale px-3 py-1.5 rounded-full">
          {TYPE_LABEL[listing.type]}
        </span>

        <h1 className="text-2xl md:text-3xl font-bold text-ink mt-4 leading-tight">{listing.title}</h1>
        <p className="text-slate mt-2">{listing.organization}</p>

        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-slate">
          {listing.location && <span>📍 {listing.location}</span>}
          {listing.deadline && <span className="text-tr font-semibold">{t("listing_deadline")}: {listing.deadline}</span>}
        </div>

        {project && (
          <div className="mt-4 p-3 bg-eu-pale rounded-lg text-sm">
            <span className="text-mist">{t("listing_related_project")}: </span>
            <Link href={`/projeler/${project.id}`} className="text-eu font-semibold hover:underline">
              {project.title}
            </Link>
          </div>
        )}

        {listing.locked ? (
          <div className="mt-8 bg-eu-pale border border-eu/20 rounded-xl p-8 text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h2 className="font-bold text-ink text-lg">{t("listing_locked_title")}</h2>
            <p className="text-slate text-sm mt-2 max-w-md mx-auto">
              {t("listing_locked_sub")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link href="/kayit" className="inline-block px-5 py-2.5 rounded-lg bg-eu text-white font-semibold text-sm">
                {t("listing_view_plans")}
              </Link>
              <Link href="/ilanlar" className="inline-block px-5 py-2.5 rounded-lg border border-line text-slate text-sm">
                {t("listing_back")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <div className="text-ink leading-relaxed whitespace-pre-line">{listing.description}</div>

            {listing.documentUrl && (
              <div className="mt-6 p-4 border border-line rounded-xl flex items-center justify-between">
                <span className="text-sm font-medium text-ink">📎 {t("listing_doc")}</span>
                <a href={listing.documentUrl} target="_blank" rel="noopener noreferrer"
                  className="text-eu text-sm font-semibold hover:underline">
                  {t("listing_download")}
                </a>
              </div>
            )}

            <div className="mt-8 bg-eu-pale rounded-xl p-6">
              <h3 className="font-bold text-ink mb-2">{t("listing_apply")}</h3>
              <p className="text-slate text-sm">
                {t("listing_apply_sub")}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link href="/ilanlar" className="text-eu text-sm hover:underline">← {t("listing_all_back")}</Link>
        </div>
      </div>
    </PageShell>
  );
}
