"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import type { ExpertProfile } from "@/lib/types";

export default function UzmanlarPage() {
  const { t } = useLocale();
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getDataProvider().getExpertProfiles().then(setExperts);
  }, []);

  const visible = experts.filter((e) => e.visible);
  const q = search.trim().toLowerCase();
  const filtered = q
    ? visible.filter((e) =>
        e.name.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.expertise.some((ex) => ex.toLowerCase().includes(q))
      )
    : visible;

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: t("experts_title") }]} />

        <h1 className="text-3xl font-extrabold text-ink mb-2">{t("experts_title")}</h1>
        <p className="text-slate mb-6">{t("experts_sub")}</p>

        <input
          type="text" value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("experts_search")}
          className="w-full md:w-96 px-4 py-2.5 border border-line rounded-xl text-sm mb-8 focus:outline-none focus:border-eu"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {filtered.map((expert) => (
            <Link key={expert.id} href={`/uzmanlar/${expert.id}`}
              className="bg-white border border-line rounded-xl p-5 hover:border-eu hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-eu-pale flex items-center justify-center text-eu font-bold text-lg mb-3">
                {expert.name.charAt(0)}
              </div>
              <h2 className="font-bold text-ink leading-tight">{expert.name}</h2>
              <p className="text-slate text-sm mb-3">{expert.title}</p>
              <div className="flex flex-wrap gap-1.5">
                {expert.expertise.slice(0, 3).map((ex) => (
                  <span key={ex} className="text-xs bg-surface text-mist px-2 py-0.5 rounded-full">{ex}</span>
                ))}
              </div>
              {expert.projectHistory.length > 0 && (
                <p className="text-xs text-mist mt-3">
                  {expert.projectHistory.length} {expert.projectHistory.length === 1 ? "proje" : "proje"}
                </p>
              )}
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate mb-12">{t("experts_not_found")}</div>
        )}

        {/* CTA: Profil oluştur */}
        <div className="bg-eu-pale border border-eu/20 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3">👤</div>
          <h2 className="font-bold text-ink text-lg mb-2">{t("experts_create_cta")}</h2>
          <p className="text-slate text-sm mb-5 max-w-md mx-auto">{t("experts_create_sub")}</p>
          <Link href="/kayit" className="inline-block px-6 py-2.5 bg-eu text-white font-semibold rounded-xl text-sm hover:bg-blue-800 transition-colors">
            {t("experts_create_button")}
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
