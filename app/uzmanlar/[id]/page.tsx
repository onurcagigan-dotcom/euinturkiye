"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useFirma } from "@/lib/firma/context";
import { useLocale } from "@/lib/i18n/context";
import type { ExpertProfile, Project, Subscriber } from "@/lib/types";

export default function UzmanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLocale();
  const { current: firma } = useFirma();
  const [expert, setExpert] = useState<ExpertProfile | null | undefined>(undefined);
  const [projectMap, setProjectMap] = useState<Record<string, Project>>({});
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);

  useEffect(() => {
    const db = getDataProvider();
    db.getExpertProfile(id).then(async (e) => {
      setExpert(e);
      if (!e) return;

      // Subscriber profilini bul
      if (e.subscriberId) {
        const sub = await db.getSubscriber(e.subscriberId);
        setSubscriber(sub);
      }

      // Proje geçmişini yükle
      if (e.projectHistory.length > 0) {
        const entries = await Promise.all(
          e.projectHistory.map(async (ph) => [ph.projectId, await db.getProject(ph.projectId)] as const)
        );
        const map: Record<string, Project> = {};
        entries.forEach(([pid, proj]) => { if (proj) map[pid] = proj; });
        setProjectMap(map);
      }
    });
  }, [id]);

  if (expert === undefined) {
    return <PageShell><div className="max-w-3xl mx-auto px-6 py-16 text-center text-slate">…</div></PageShell>;
  }

  if (expert === null) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-ink mb-2">{t("notfound_title")}</h1>
          <Link href="/uzmanlar" className="text-eu hover:underline">← {t("expert_back")}</Link>
        </div>
      </PageShell>
    );
  }

  const isOwner = firma && firma.id === expert.subscriberId;

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Breadcrumb items={[
          { label: t("breadcrumb_home"), href: "/" },
          { label: t("experts_title"), href: "/uzmanlar" },
          { label: expert.name },
        ]} />

        {/* ── Hero ── */}
        <div className="bg-white border border-line rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-eu flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
              {expert.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h1 className="text-2xl font-extrabold text-ink leading-tight">{expert.name}</h1>
                  <p className="text-slate mt-1">{expert.title}</p>
                </div>
                {isOwner && (
                  <Link href="/firma" className="text-xs text-eu font-semibold hover:underline flex-shrink-0">
                    ✏️ Profilimi Düzenle
                  </Link>
                )}
              </div>

              {/* Kurum bağlantısı */}
              {subscriber && (
                <div className="mt-3 pt-3 border-t border-line">
                  <Link href={`/firma/${subscriber.id}`} className="flex items-center gap-2 text-sm hover:text-eu transition-colors group">
                    <div className="w-7 h-7 rounded-full bg-eu-pale flex items-center justify-center text-eu text-xs font-bold flex-shrink-0 group-hover:bg-eu group-hover:text-white transition-colors">
                      {(subscriber.organization ?? subscriber.name).charAt(0)}
                    </div>
                    <span className="text-ink font-medium">{subscriber.organization ?? subscriber.name}</span>
                    <span className="text-mist text-xs">→</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Uzmanlık etiketleri */}
          {expert.expertise.length > 0 && (
            <div className="mt-4 pt-4 border-t border-line">
              <p className="text-xs font-bold text-mist uppercase tracking-wide mb-2">{t("expert_expertise")}</p>
              <div className="flex flex-wrap gap-2">
                {expert.expertise.map((ex) => (
                  <span key={ex} className="text-sm bg-eu-pale text-eu px-3 py-1 rounded-full font-medium">{ex}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Biyografi ── */}
        {expert.bio && (
          <div className="bg-white border border-line rounded-2xl p-5 mb-5">
            <h2 className="text-sm font-bold text-mist uppercase tracking-wide mb-3">{t("expert_bio")}</h2>
            <p className="text-slate leading-relaxed whitespace-pre-line">{expert.bio}</p>
          </div>
        )}

        {/* ── Proje Geçmişi ── */}
        {expert.projectHistory.length > 0 && (
          <div className="mb-5">
            <h2 className="text-base font-bold text-ink mb-3">{t("expert_history")}</h2>
            <div className="space-y-2">
              {expert.projectHistory.map((ph, i) => {
                const proj = projectMap[ph.projectId];
                return (
                  <div key={i} className="bg-white border border-line rounded-xl p-4">
                    {proj ? (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link href={`/projeler/${proj.id}`} className="font-semibold text-eu hover:underline block truncate">
                            {proj.title}
                          </Link>
                          <p className="text-xs text-mist mt-0.5">{ph.role}</p>
                          {proj.startDate && proj.endDate && (
                            <p className="text-xs text-mist mt-0.5">
                              {new Date(proj.startDate).getFullYear()} – {new Date(proj.endDate).getFullYear()}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            proj.status === "devam" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          }`}>
                            {proj.status === "devam" ? t("status_ongoing") : t("status_completed")}
                          </span>
                          {proj.budget && <p className="text-xs text-mist mt-1">{proj.budget}</p>}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-ink text-sm">{ph.projectId}</p>
                        <p className="text-xs text-mist mt-0.5">{ph.role}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── İletişim CTA ── */}
        <div className="bg-eu-pale border border-eu/20 rounded-2xl p-6 text-center">
          {firma ? (
            <>
              <p className="text-slate text-sm mb-3">{t("expert_contact_cta")}</p>
              {subscriber?.contactEmail && (
                <a href={`mailto:${subscriber.contactEmail}`}
                  className="inline-block px-5 py-2.5 bg-eu text-white font-semibold rounded-lg text-sm hover:bg-blue-800 transition-colors">
                  ✉️ E-posta Gönder
                </a>
              )}
              {subscriber?.contactPhone && (
                <a href={`https://wa.me/${subscriber.contactPhone.replace(/\D/g, "")}?text=Merhaba ${expert.name},`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-block ml-2 px-5 py-2.5 border border-green-600 text-green-700 font-semibold rounded-lg text-sm hover:bg-green-50 transition-colors">
                  WhatsApp
                </a>
              )}
            </>
          ) : (
            <>
              <p className="text-slate text-sm mb-4">{t("expert_contact_cta")}</p>
              <Link href="/giris" className="inline-block px-5 py-2.5 bg-eu text-white font-semibold rounded-lg text-sm hover:bg-blue-800 transition-colors">
                {t("nav_login")}
              </Link>
            </>
          )}
        </div>

        <div className="mt-6">
          <Link href="/uzmanlar" className="text-eu text-sm hover:underline">← {t("expert_back")}</Link>
        </div>
      </div>
    </PageShell>
  );
}
