"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProjectProgressBar } from "@/components/ProjectProgressBar";
import { useLocale } from "@/lib/i18n/context";
import { useFirma } from "@/lib/firma/context";
import type { Subscriber, Project, Listing, SubscriberProfileType } from "@/lib/types";

const ROLE_LABEL: Record<SubscriberProfileType, string> = {
  firma: "Firma", stk: "STK", tedarikci: "Tedarikçi",
  delegasyon: "AB Delegasyonu", program_otoritesi: "Program Otoritesi",
  admin2: "Admin2",
};
const ROLE_COLOR: Record<SubscriberProfileType, string> = {
  firma: "bg-blue-100 text-blue-700", stk: "bg-green-100 text-green-700",
  tedarikci: "bg-orange-100 text-orange-700", delegasyon: "bg-purple-100 text-purple-700",
  program_otoritesi: "bg-red-100 text-red-700", admin2: "bg-gray-100 text-gray-700",
};

export default function FirmaProfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLocale();
  const { current: firma } = useFirma();
  const [subscriber, setSubscriber] = useState<Subscriber | null | undefined>(undefined);
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [memberProjects, setMemberProjects] = useState<Project[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    const db = getDataProvider();
    db.getSubscriber(id).then(async (s) => {
      setSubscriber(s);
      if (!s) return;
      const [allProjects, allListings] = await Promise.all([db.getProjects(), db.getListings()]);
      setOwnedProjects(allProjects.filter((p) => p.ownerSubscriberId === s.id));
      setMemberProjects(allProjects.filter((p) =>
        p.ownerSubscriberId !== s.id && p.consortiumMembers?.some((m) => m.subscriberId === s.id)
      ));
      setListings(allListings.filter((l) => l.publisherSubscriberId === s.id && l.isActive !== false));
    });
  }, [id]);

  if (subscriber === undefined) {
    return <PageShell><div className="max-w-4xl mx-auto px-6 py-16 text-center text-slate">…</div></PageShell>;
  }
  if (!subscriber || subscriber.profilePublic === false) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-ink mb-2">{t("company_profile_not_found")}</h1>
          <Link href="/" className="text-eu hover:underline">{t("breadcrumb_home")}</Link>
        </div>
      </PageShell>
    );
  }

  const displayName = subscriber.organization || subscriber.name;
  const jobListings = listings.filter((l) => l.type === "is");
  const procurementListings = listings.filter((l) => l.type === "satinalma");
  const tenderListings = listings.filter((l) => l.type === "ihale");
  const isOrgProfile = ["firma", "stk"].includes(subscriber.profileType);
  const isOwner = firma?.id === subscriber.id;

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: displayName }]} />

        {/* ── Hero başlığı ── */}
        <div className="bg-white border border-line rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-5">
            {subscriber.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={subscriber.logoUrl} alt={displayName} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border border-line" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-eu flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                {displayName.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-extrabold text-ink leading-tight">{displayName}</h1>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${ROLE_COLOR[subscriber.profileType]}`}>
                    {ROLE_LABEL[subscriber.profileType]}
                  </span>
                </div>
                {/* Sahip ise düzenleme butonu */}
                {isOwner && (
                  <Link href="/firma?tab=profil"
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-line text-slate rounded-lg text-xs font-semibold hover:border-eu hover:text-eu transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                    </svg>
                    Profili Düzenle
                  </Link>
                )}
              </div>
              {subscriber.shortBio && (
                <p className="text-slate text-sm leading-relaxed mt-2">{subscriber.shortBio}</p>
              )}
              {subscriber.mission && (
                <p className="text-slate text-sm leading-relaxed mt-2 italic">"{subscriber.mission}"</p>
              )}
            </div>
          </div>

          {/* Proje rozetleri */}
          {(ownedProjects.length > 0 || memberProjects.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-line">
              {ownedProjects.filter((p) => p.status === "devam").length > 0 && (
                <span className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 text-xs font-semibold text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {ownedProjects.filter((p) => p.status === "devam").length} Aktif Proje
                </span>
              )}
              {ownedProjects.filter((p) => p.status === "tamamlandi").length > 0 && (
                <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600">
                  ✓ {ownedProjects.filter((p) => p.status === "tamamlandi").length} Tamamlanan
                </span>
              )}
              {memberProjects.length > 0 && (
                <span className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 text-xs font-semibold text-blue-700">
                  🤝 {memberProjects.length} Konsorsiyum Üyeliği
                </span>
              )}
            </div>
          )}

          {/* Kuruluş bilgileri */}
          {isOrgProfile && (subscriber.foundedYear || subscriber.employeeCount) && (
            <div className="flex flex-wrap gap-5 mt-4 pt-4 border-t border-line text-sm text-slate">
              {subscriber.foundedYear && (
                <span>🗓️ <strong className="text-ink">{subscriber.foundedYear}</strong> yılında kuruldu</span>
              )}
              {subscriber.employeeCount && (
                <span>👥 <strong className="text-ink">{subscriber.employeeCount}</strong> çalışan</span>
              )}
            </div>
          )}

          {/* Hizmetler */}
          {(isOrgProfile || subscriber.profileType === "tedarikci") && subscriber.services && subscriber.services.length > 0 && (
            <div className="mt-4 pt-4 border-t border-line">
              <p className="text-xs font-bold text-mist uppercase tracking-wide mb-2">
                {subscriber.profileType === "stk" ? "Faaliyet Alanları" : subscriber.profileType === "tedarikci" ? "Sunulan Hizmetler" : "Hizmetler & Uzmanlık"}
              </p>
              <div className="flex flex-wrap gap-2">
                {subscriber.services.map((s) => (
                  <span key={s} className="text-xs bg-eu-pale text-eu px-2.5 py-1 rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* İletişim & Sosyal */}
          {(subscriber.contactAddress || subscriber.contactPhone || subscriber.contactEmail || subscriber.socialLinks) && (
            <div className="mt-4 pt-4 border-t border-line">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate mb-3">
                {subscriber.contactAddress && <span>📍 {subscriber.contactAddress}</span>}
                {subscriber.contactPhone && <span>📞 {subscriber.contactPhone}</span>}
                {subscriber.contactEmail && <a href={`mailto:${subscriber.contactEmail}`} className="text-eu hover:underline">✉️ {subscriber.contactEmail}</a>}
              </div>
              {subscriber.socialLinks && (
                <div className="flex flex-wrap gap-3">
                  {subscriber.socialLinks.website && (
                    <a href={subscriber.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-eu text-sm font-medium hover:underline">🌐 Website</a>
                  )}
                  {subscriber.socialLinks.linkedin && (
                    <a href={subscriber.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-eu text-sm font-medium hover:underline">in LinkedIn</a>
                  )}
                  {subscriber.socialLinks.twitter && (
                    <a href={subscriber.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-eu text-sm font-medium hover:underline">𝕏 Twitter</a>
                  )}
                  {subscriber.socialLinks.instagram && (
                    <a href={subscriber.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-eu text-sm font-medium hover:underline">📷 Instagram</a>
                  )}
                  {subscriber.socialLinks.facebook && (
                    <a href={subscriber.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-eu text-sm font-medium hover:underline">Facebook</a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Projeler ── */}
        {(ownedProjects.length > 0 || memberProjects.length > 0) && (
          <div className="mb-6">
            <h2 className="text-base font-bold text-ink mb-3">Projeler</h2>
            {ownedProjects.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-mist uppercase tracking-wide mb-2">{t("company_profile_projects_owner")}</p>
                <div className="space-y-2">
                  {ownedProjects.map((p) => (
                    <Link key={p.id} href={`/projeler/${p.id}`}
                      className="block p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="font-semibold text-ink text-sm">{p.title}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-mist">{p.ipaPeriod}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.status === "devam" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {p.status === "devam" ? t("status_ongoing") : t("status_completed")}
                          </span>
                        </div>
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
              </div>
            )}
            {memberProjects.length > 0 && (
              <div>
                <p className="text-xs font-bold text-mist uppercase tracking-wide mb-2">{t("company_profile_projects_member")}</p>
                <div className="space-y-2">
                  {memberProjects.map((p) => (
                    <Link key={p.id} href={`/projeler/${p.id}`}
                      className="flex items-center justify-between p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all">
                      <span className="font-semibold text-ink text-sm">{p.title}</span>
                      <span className="text-xs text-mist flex-shrink-0">{p.ownerSubscriberName}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── İlanlar ── */}
        {listings.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-bold text-ink mb-3">Aktif İlanlar</h2>
            {[
              { list: jobListings, label: "İş İlanları", color: "bg-blue-100 text-blue-700" },
              { list: procurementListings, label: "Satınalma İlanları", color: "bg-orange-100 text-orange-700" },
              { list: tenderListings, label: "İhale İlanları", color: "bg-purple-100 text-purple-700" },
            ].filter(({ list }) => list.length > 0).map(({ list, label, color }) => (
              <div key={label} className="mb-4">
                <p className="text-xs font-bold text-mist uppercase tracking-wide mb-2">{label}</p>
                <div className="space-y-2">
                  {list.map((l) => (
                    <Link key={l.id} href={`/ilanlar/${l.id}`}
                      className="flex items-center justify-between gap-3 p-4 bg-white border border-line rounded-xl hover:border-eu hover:shadow-sm transition-all">
                      <div className="min-w-0">
                        <span className="font-semibold text-ink text-sm block truncate">{l.title}</span>
                        {l.subject && <span className="text-xs text-mist">{l.subject}</span>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {l.budget && <span className="text-xs font-semibold text-eu">{l.budget}</span>}
                        {l.deadline && (
                          <span className="text-xs text-mist">Son: {new Date(l.deadline).toLocaleDateString("tr-TR")}</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {ownedProjects.length === 0 && memberProjects.length === 0 && listings.length === 0 && (
          <div className="bg-white border border-line rounded-2xl p-8 text-center text-mist text-sm">
            Henüz yayınlanmış proje veya ilan bulunmuyor.
          </div>
        )}
      </div>
    </PageShell>
  );
}
