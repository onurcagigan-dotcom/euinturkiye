"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProjectProgressBar } from "@/components/ProjectProgressBar";
import { useLocale } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";
import type { Subscriber, Project, Listing, SubscriberProfileType } from "@/lib/types";

const PROFILE_TYPE_KEY: Record<SubscriberProfileType, TranslationKey> = {
  firma: "company_profile_type_firma",
  stk: "company_profile_type_stk",
  tedarikci: "company_profile_type_tedarikci",
  delegasyon: "company_profile_type_delegasyon",
  program_otoritesi: "company_profile_type_program_otoritesi",
};

const PROFILE_TYPE_COLOR: Record<SubscriberProfileType, string> = {
  firma: "bg-blue-100 text-blue-700",
  stk: "bg-green-100 text-green-700",
  tedarikci: "bg-orange-100 text-orange-700",
  delegasyon: "bg-purple-100 text-purple-700",
  program_otoritesi: "bg-red-100 text-red-700",
};

export default function FirmaProfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLocale();
  const [subscriber, setSubscriber] = useState<Subscriber | null | undefined>(undefined);
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [memberProjects, setMemberProjects] = useState<Project[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    const db = getDataProvider();
    db.getSubscriber(id).then(async (s) => {
      setSubscriber(s);
      if (!s) return;
      const [allProjects, allListings] = await Promise.all([
        db.getProjects(),
        db.getListings(),
      ]);
      setOwnedProjects(allProjects.filter((p) => p.ownerSubscriberId === s.id));
      setMemberProjects(allProjects.filter((p) =>
        p.consortiumMembers?.some((m) => m.subscriberId === s.id)
      ));
      setListings(allListings.filter((l) => l.publisherSubscriberId === s.id));
    });
  }, [id]);

  if (subscriber === undefined) {
    return <PageShell><div className="max-w-4xl mx-auto px-6 py-16 text-center text-slate">…</div></PageShell>;
  }

  if (subscriber === null || subscriber.profilePublic === false) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-ink mb-2">{t("company_profile_not_found")}</h1>
          <Link href="/" className="text-eu hover:underline">{t("breadcrumb_home")}</Link>
        </div>
      </PageShell>
    );
  }

  const jobListings = listings.filter((l) => l.type === "is");
  const procurementListings = listings.filter((l) => l.type === "satinalma");
  const tenderListings = listings.filter((l) => l.type === "ihale");

  const displayName = subscriber.organization || subscriber.name;

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Breadcrumb items={[
          { label: t("breadcrumb_home"), href: "/" },
          { label: displayName },
        ]} />

        {/* Başlık */}
        <div className="flex items-start gap-5 mb-6">
          {subscriber.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={subscriber.logoUrl} alt={displayName}
              className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border border-line" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-eu-pale flex items-center justify-center text-eu font-bold text-3xl flex-shrink-0">
              {displayName.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-ink leading-tight">{displayName}</h1>
            <span className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-semibold ${PROFILE_TYPE_COLOR[subscriber.profileType]}`}>
              {t(PROFILE_TYPE_KEY[subscriber.profileType])}
            </span>
          </div>
        </div>

        {/* Hakkında */}
        {subscriber.shortBio && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-mist uppercase tracking-wide mb-3">{t("company_profile_about")}</h2>
            <p className="text-slate leading-relaxed">{subscriber.shortBio}</p>
          </div>
        )}

        {/* İletişim */}
        {(subscriber.contactAddress || subscriber.contactPhone || subscriber.contactEmail || subscriber.socialLinks) && (
          <div className="mb-8 bg-surface rounded-2xl p-5">
            <h2 className="text-sm font-bold text-mist uppercase tracking-wide mb-3">{t("company_profile_contact")}</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate mb-3">
              {subscriber.contactAddress && <span>📍 {subscriber.contactAddress}</span>}
              {subscriber.contactPhone && <span>📞 {subscriber.contactPhone}</span>}
              {subscriber.contactEmail && <span>✉️ {subscriber.contactEmail}</span>}
            </div>
            {subscriber.socialLinks && (
              <div className="flex flex-wrap gap-3">
                {subscriber.socialLinks.website && (
                  <a href={subscriber.socialLinks.website} target="_blank" rel="noopener noreferrer"
                    className="text-eu text-sm font-medium hover:underline">🌐 Website</a>
                )}
                {subscriber.socialLinks.linkedin && (
                  <a href={subscriber.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                    className="text-eu text-sm font-medium hover:underline">LinkedIn</a>
                )}
                {subscriber.socialLinks.twitter && (
                  <a href={subscriber.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                    className="text-eu text-sm font-medium hover:underline">X / Twitter</a>
                )}
                {subscriber.socialLinks.instagram && (
                  <a href={subscriber.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                    className="text-eu text-sm font-medium hover:underline">Instagram</a>
                )}
                {subscriber.socialLinks.facebook && (
                  <a href={subscriber.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                    className="text-eu text-sm font-medium hover:underline">Facebook</a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Yürüttüğü projeler */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-mist uppercase tracking-wide mb-3">{t("company_profile_projects_owner")}</h2>
          {ownedProjects.length === 0 ? (
            <p className="text-sm text-mist">{t("company_profile_no_projects")}</p>
          ) : (
            <div className="space-y-3">
              {ownedProjects.map((p) => (
                <Link key={p.id} href={`/projeler/${p.id}`}
                  className="block p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="font-semibold text-ink text-sm">{p.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                      p.status === "devam" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {p.status === "devam" ? t("status_ongoing") : t("status_completed")}
                    </span>
                  </div>
                  {p.startDate && p.endDate && (
                    <ProjectProgressBar project={p} variant="compact" labels={{
                      notStarted: t("progress_not_started"), completed: t("progress_completed"),
                      daysRemaining: t("progress_days_remaining"), needsUpdate: t("progress_needs_update"),
                    }} />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Konsorsiyum üyesi olduğu projeler */}
        {memberProjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-mist uppercase tracking-wide mb-3">{t("company_profile_projects_member")}</h2>
            <div className="space-y-3">
              {memberProjects.map((p) => (
                <Link key={p.id} href={`/projeler/${p.id}`}
                  className="block p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all">
                  <span className="font-semibold text-ink text-sm">{p.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* İş ilanları */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-mist uppercase tracking-wide mb-3">{t("company_profile_listings_jobs")}</h2>
          {jobListings.length === 0 ? (
            <p className="text-sm text-mist">{t("company_profile_no_listings")}</p>
          ) : (
            <div className="space-y-2">
              {jobListings.map((l) => (
                <Link key={l.id} href={`/ilanlar/${l.id}`}
                  className="flex items-center justify-between gap-3 p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all">
                  <span className="font-semibold text-ink text-sm">{l.title}</span>
                  {l.deadline && <span className="text-xs text-mist flex-shrink-0">{l.deadline}</span>}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Satınalma ilanları */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-mist uppercase tracking-wide mb-3">{t("company_profile_listings_procurement")}</h2>
          {procurementListings.length === 0 ? (
            <p className="text-sm text-mist">{t("company_profile_no_listings")}</p>
          ) : (
            <div className="space-y-2">
              {procurementListings.map((l) => (
                <Link key={l.id} href={`/ilanlar/${l.id}`}
                  className="flex items-center justify-between gap-3 p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all">
                  <span className="font-semibold text-ink text-sm">{l.title}</span>
                  {l.deadline && <span className="text-xs text-mist flex-shrink-0">{l.deadline}</span>}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* İhale ilanları — sadece delegasyon/program_otoritesi profillerinde gösterilir */}
        {(subscriber.profileType === "delegasyon" || subscriber.profileType === "program_otoritesi") && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-mist uppercase tracking-wide mb-3">{t("company_profile_listings_tender")}</h2>
            {tenderListings.length === 0 ? (
              <p className="text-sm text-mist">{t("company_profile_no_listings")}</p>
            ) : (
              <div className="space-y-2">
                {tenderListings.map((l) => (
                  <Link key={l.id} href={`/ilanlar/${l.id}`}
                    className="flex items-center justify-between gap-3 p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all">
                    <span className="font-semibold text-ink text-sm">{l.title}</span>
                    {l.deadline && <span className="text-xs text-mist flex-shrink-0">{l.deadline}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <Link href="/" className="text-eu text-sm hover:underline">← {t("company_profile_back")}</Link>
        </div>
      </div>
    </PageShell>
  );
}
