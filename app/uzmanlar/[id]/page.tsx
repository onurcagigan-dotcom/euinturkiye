"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import type { ExpertProfile, Project } from "@/lib/types";

export default function UzmanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLocale();
  const [expert, setExpert] = useState<ExpertProfile | null | undefined>(undefined);
  const [projects, setProjects] = useState<Record<string, Project>>({});

  useEffect(() => {
    const db = getDataProvider();
    db.getExpertProfile(id).then(async (e) => {
      setExpert(e);
      if (e && e.projectHistory.length > 0) {
        const entries = await Promise.all(
          e.projectHistory.map(async (ph) => [ph.projectId, await db.getProject(ph.projectId)] as const)
        );
        const map: Record<string, Project> = {};
        entries.forEach(([pid, proj]) => { if (proj) map[pid] = proj; });
        setProjects(map);
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
          <Link href="/uzmanlar" className="text-eu hover:underline">{t("expert_back")}</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Breadcrumb items={[
          { label: t("breadcrumb_home"), href: "/" },
          { label: t("experts_title"), href: "/uzmanlar" },
          { label: expert.name },
        ]} />

        {/* Başlık */}
        <div className="flex items-start gap-5 mb-8">
          <div className="w-20 h-20 rounded-full bg-eu-pale flex items-center justify-center text-eu font-bold text-3xl flex-shrink-0">
            {expert.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-ink leading-tight">{expert.name}</h1>
            <p className="text-slate mt-1">{expert.title}</p>
          </div>
        </div>

        {/* Uzmanlık alanları */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-mist uppercase tracking-wide mb-3">{t("expert_expertise")}</h2>
          <div className="flex flex-wrap gap-2">
            {expert.expertise.map((ex) => (
              <span key={ex} className="text-sm bg-eu-pale text-eu px-3 py-1.5 rounded-full font-medium">{ex}</span>
            ))}
          </div>
        </div>

        {/* Hakkında */}
        {expert.bio && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-mist uppercase tracking-wide mb-3">{t("expert_bio")}</h2>
            <p className="text-slate leading-relaxed">{expert.bio}</p>
          </div>
        )}

        {/* Proje geçmişi */}
        {expert.projectHistory.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-bold text-mist uppercase tracking-wide mb-3">{t("expert_history")}</h2>
            <div className="space-y-3">
              {expert.projectHistory.map((ph, i) => {
                const proj = projects[ph.projectId];
                return (
                  <div key={i} className="flex items-center justify-between p-4 bg-white border border-line rounded-xl">
                    <div>
                      {proj ? (
                        <Link href={`/projeler/${proj.id}`} className="font-semibold text-ink hover:text-eu transition-colors">
                          {proj.title}
                        </Link>
                      ) : (
                        <span className="font-semibold text-ink">{ph.projectId}</span>
                      )}
                      <p className="text-xs text-mist mt-0.5">{ph.role}</p>
                    </div>
                    {proj && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        proj.status === "devam" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {proj.status === "devam" ? t("status_ongoing") : t("status_completed")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* İletişim CTA */}
        <div className="bg-eu-pale border border-eu/20 rounded-xl p-6 text-center">
          <p className="text-slate text-sm mb-4">{t("expert_contact_cta")}</p>
          <Link href="/kayit" className="inline-block px-5 py-2.5 bg-eu text-white font-semibold rounded-lg text-sm hover:bg-blue-800 transition-colors">
            {t("nav_signup")}
          </Link>
        </div>

        <div className="mt-8">
          <Link href="/uzmanlar" className="text-eu text-sm hover:underline">← {t("expert_back")}</Link>
        </div>
      </div>
    </PageShell>
  );
}
