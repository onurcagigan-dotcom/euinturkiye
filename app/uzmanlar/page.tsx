"use client";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useFirma } from "@/lib/firma/context";
import { useLocale } from "@/lib/i18n/context";
import type { ExpertProfile } from "@/lib/types";

// Tedarikçi CV havuzuna erişemez
const BLOCKED_ROLES = ["tedarikci"];

export default function UzmanlarPage() {
  const { t, locale } = useLocale();
  const { current: firma, loading: firmaLoading } = useFirma();
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterExpertise, setFilterExpertise] = useState("");

  useEffect(() => {
    getDataProvider().getExpertProfiles().then((list) => {
      setExperts(list);
      setLoading(false);
    });
  }, []);

  // Erişim kontrolü — tedarikçi giremez
  const isBlocked = !firmaLoading && firma && BLOCKED_ROLES.includes(firma.profileType);

  const allExpertiseTags = useMemo(() => {
    const tags = new Set<string>();
    experts.forEach((e) => e.expertise.forEach((ex) => tags.add(ex)));
    return Array.from(tags).sort();
  }, [experts]);

  const visible = experts.filter((e) => e.visible);
  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr");
    return visible.filter((e) => {
      const matchQ = !q || [e.name, e.title, ...e.expertise].join(" ").toLocaleLowerCase("tr").includes(q);
      const matchEx = !filterExpertise || e.expertise.includes(filterExpertise);
      return matchQ && matchEx;
    });
  }, [visible, search, filterExpertise]);

  if (firmaLoading || loading) {
    return <PageShell><div className="max-w-5xl mx-auto px-6 py-16 text-center text-slate">Yükleniyor…</div></PageShell>;
  }

  if (isBlocked) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: t("experts_title") }]} />
          <h1 className="text-2xl font-bold text-ink mb-3">{t("experts_title")}</h1>
          <div className="bg-white border border-line rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="font-bold text-ink mb-2">Bu Bölüme Erişiminiz Yok</h2>
            <p className="text-slate text-sm max-w-md mx-auto">
              Uzman CV havuzu firma, STK, AB Delegasyonu ve Program Otoritesi üyelerine açıktır.
              Tedarikçi hesabıyla bu bölüme erişilemiyor.
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: t("experts_title") }]} />

        <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-ink">{t("experts_title")}</h1>
            <p className="text-slate text-sm mt-1">{t("experts_sub")}</p>
          </div>
          {!firma && (
            <Link href="/kayit" className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold flex-shrink-0">
              {t("experts_create_button")}
            </Link>
          )}
        </div>

        {/* Filtreler */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t("experts_search")}
            className="flex-1 min-w-[200px] px-4 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:border-eu" />
          <select value={filterExpertise} onChange={(e) => setFilterExpertise(e.target.value)}
            className="px-4 py-2.5 border border-line rounded-xl text-sm bg-white focus:outline-none focus:border-eu">
            <option value="">Tüm Uzmanlık Alanları</option>
            {allExpertiseTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        <p className="text-xs text-mist mb-4">{filtered.length} uzman</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {filtered.map((expert) => (
            <Link key={expert.id} href={`/uzmanlar/${expert.id}`}
              className="bg-white border border-line rounded-xl p-5 hover:border-eu hover:shadow-md transition-all flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-eu flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {expert.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-ink leading-tight truncate">{expert.name}</h2>
                  <p className="text-slate text-xs truncate">{expert.title}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3 flex-1">
                {expert.expertise.slice(0, 4).map((ex) => (
                  <span key={ex} className="text-xs bg-eu-pale text-eu px-2 py-0.5 rounded-full font-medium">{ex}</span>
                ))}
                {expert.expertise.length > 4 && (
                  <span className="text-xs bg-surface text-mist px-2 py-0.5 rounded-full">+{expert.expertise.length - 4}</span>
                )}
              </div>
              {expert.projectHistory.length > 0 && (
                <p className="text-xs text-mist">
                  📁 {expert.projectHistory.length} proje deneyimi
                </p>
              )}
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate">{t("experts_not_found")}</div>
          )}
        </div>

        {/* CTA */}
        {!firma && (
          <div className="bg-eu-pale border border-eu/20 rounded-2xl p-8 text-center">
            <h2 className="font-bold text-ink text-lg mb-2">{t("experts_create_cta")}</h2>
            <p className="text-slate text-sm mb-5 max-w-md mx-auto">{t("experts_create_sub")}</p>
            <Link href="/kayit" className="inline-block px-6 py-2.5 bg-eu text-white font-semibold rounded-xl text-sm hover:bg-blue-800 transition-colors">
              {t("experts_create_button")}
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}
