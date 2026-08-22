"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import { useFirma } from "@/lib/firma/context";
import { getDataProvider } from "@/lib/data";
import type { InstitutionProfile, Subscriber } from "@/lib/types";

const TYPE_LABELS: Record<InstitutionProfile["institutionType"], string> = {
  kamu: "Kamu Kurumu", ozel: "Özel Sektör", stk: "STK / Vakıf", uluslararasi: "Uluslararası Kuruluş",
};
const TYPE_COLORS: Record<InstitutionProfile["institutionType"], string> = {
  kamu: "bg-blue-100 text-blue-700", ozel: "bg-purple-100 text-purple-700",
  stk: "bg-green-100 text-green-700", uluslararasi: "bg-eu-pale text-eu",
};

export default function KurumlarPage() {
  const { locale } = useLocale();
  const { current: subscriber } = useFirma();
  const db = getDataProvider();
  const isEn = locale === "en";

  const [institutions, setInstitutions] = useState<InstitutionProfile[]>([]);
  const [suppliers, setSuppliers] = useState<Subscriber[]>([]);
  const [tab, setTab] = useState<"kurumlar" | "tedarikci" | "firmalar">("kurumlar");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("hepsi");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [inst, subs] = await Promise.all([
        db.getInstitutionProfiles(),
        db.getSubscribers(),
      ]);
      setInstitutions(inst);
      setSuppliers(subs.filter((s) => s.profileType === "tedarikci" || s.profilePublic));
      setLoading(false);
    })();
  }, [db]);

  const filteredInst = institutions.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.name.toLowerCase().includes(q) || (i.description ?? "").toLowerCase().includes(q);
    const matchType = typeFilter === "hepsi" || i.institutionType === typeFilter;
    return matchSearch && matchType;
  });

  const filteredSuppliers = suppliers.filter((s) => {
    const q = search.toLowerCase();
    return !q || (s.name ?? "").toLowerCase().includes(q) || (s.organization ?? "").toLowerCase().includes(q) || (s.shortBio ?? "").toLowerCase().includes(q);
  });

  const filteredFirms = suppliers.filter((s) => {
    const q = search.toLowerCase();
    return (s.profileType === "firma" || s.profileType === "stk") && (!q || (s.name ?? "").toLowerCase().includes(q) || (s.organization ?? "").toLowerCase().includes(q));
  });

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Breadcrumb items={[
          { label: isEn ? "Home" : "Ana Sayfa", href: "/" },
          { label: isEn ? "Directory" : "Dizin" },
        ]} />

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-ink mb-2">
            {isEn ? "Institutions & Suppliers Directory" : "Şirketler, Tedarikçiler ve Kurumlar"}
          </h1>
          <p className="text-slate">
            {isEn
              ? "Explore firms, suppliers, NGOs and public institutions active in the EU-Turkey project ecosystem."
              : "AB-Türkiye proje ekosisteminde aktif firma, tedarikçi, STK ve kamu kurumlarını keşfedin."}
          </p>
        </div>

        {/* Tab seçimi */}
        <div className="flex gap-1 bg-surface rounded-xl p-1 mb-6 w-fit">
          {([
            { id: "kurumlar", label: isEn ? "Institutions" : "Kurumlar" },
            { id: "tedarikci", label: isEn ? "Suppliers" : "Tedarikçiler" },
            { id: "firmalar", label: isEn ? "Firms & NGOs" : "Firma & STK" },
          ] as const).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t.id ? "bg-white text-eu shadow-sm" : "text-slate hover:text-ink"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Arama & Filtreler */}
        <div className="flex gap-3 mb-6">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={isEn ? "Search by name or description…" : "İsim veya açıklamada ara…"}
            className="flex-1 px-4 py-2.5 border border-line rounded-xl text-sm bg-white focus:outline-none focus:border-eu" />
          {tab === "kurumlar" && (
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2.5 border border-line rounded-xl text-sm bg-white focus:outline-none focus:border-eu">
              <option value="hepsi">Tüm Türler</option>
              <option value="kamu">Kamu</option>
              <option value="ozel">Özel</option>
              <option value="stk">STK</option>
              <option value="uluslararasi">Uluslararası</option>
            </select>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-surface rounded-xl animate-pulse" />)}
          </div>
        ) : tab === "kurumlar" ? (
          filteredInst.length === 0 ? (
            <div className="bg-surface rounded-2xl p-12 text-center text-slate">Kurum bulunamadı.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInst.map((inst) => (
                <div key={inst.id} className="bg-white border border-line rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-eu-pale flex items-center justify-center flex-shrink-0">
                      <span className="text-eu text-lg">🏛️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-ink text-sm leading-tight">{inst.name}</h3>
                      {inst.shortName && inst.shortName !== inst.name && (
                        <p className="text-xs text-mist">{inst.shortName}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold w-fit ${TYPE_COLORS[inst.institutionType]}`}>
                    {TYPE_LABELS[inst.institutionType]}
                  </span>
                  {inst.description && (
                    <p className="text-xs text-slate leading-relaxed line-clamp-3">{inst.description}</p>
                  )}
                  <div className="space-y-1 mt-auto">
                    {inst.contactEmail && (
                      <p className="text-xs text-mist truncate">✉️ {inst.contactEmail}</p>
                    )}
                    {inst.website && (
                      <a href={inst.website} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-eu hover:underline truncate block">🔗 {inst.website.replace("https://","").replace("http://","")}</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === "tedarikci" ? (
          filteredSuppliers.filter(s => s.profileType === "tedarikci").length === 0 ? (
            <div className="bg-surface rounded-2xl p-12 text-center text-slate">Tedarikçi bulunamadı.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuppliers.filter(s => s.profileType === "tedarikci").map((s) => (
                <Link key={s.id} href={`/firma/${s.id}`}
                  className="bg-white border border-line rounded-xl p-5 hover:shadow-md hover:border-eu transition-all flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-eu-pale flex items-center justify-center flex-shrink-0">
                      <span className="text-eu text-lg">⚙️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-ink text-sm">{s.organization ?? s.name}</h3>
                      <p className="text-xs text-mist">{s.name}</p>
                    </div>
                  </div>
                  {s.shortBio && <p className="text-xs text-slate line-clamp-2">{s.shortBio}</p>}
                  {(s.supplierGoods?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-mist mb-1">Sağlanan Mallar</p>
                      <div className="flex flex-wrap gap-1">
                        {s.supplierGoods!.slice(0,3).map((g) => (
                          <span key={g} className="text-xs bg-surface text-slate px-2 py-0.5 rounded-full">{g}</span>
                        ))}
                        {(s.supplierGoods!.length > 3) && <span className="text-xs text-mist">+{s.supplierGoods!.length-3}</span>}
                      </div>
                    </div>
                  )}
                  {(s.supplierServices?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-mist mb-1">Verilen Hizmetler</p>
                      <div className="flex flex-wrap gap-1">
                        {s.supplierServices!.slice(0,3).map((sv) => (
                          <span key={sv} className="text-xs bg-eu-pale text-eu px-2 py-0.5 rounded-full">{sv}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )
        ) : (
          filteredFirms.length === 0 ? (
            <div className="bg-surface rounded-2xl p-12 text-center text-slate">Firma bulunamadı.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFirms.map((s) => (
                <Link key={s.id} href={`/firma/${s.id}`}
                  className="bg-white border border-line rounded-xl p-5 hover:shadow-md hover:border-eu transition-all flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-eu-pale flex items-center justify-center flex-shrink-0">
                      <span className="text-eu text-lg">{s.profileType === "stk" ? "🤝" : "🏢"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-ink text-sm">{s.organization ?? s.name}</h3>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${s.profileType === "stk" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        {s.profileType === "stk" ? "STK" : "Firma"}
                      </span>
                    </div>
                  </div>
                  {s.shortBio && <p className="text-xs text-slate line-clamp-2">{s.shortBio}</p>}
                  {(s.services?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {s.services!.slice(0,3).map((sv) => (
                        <span key={sv} className="text-xs bg-surface text-slate px-2 py-0.5 rounded-full">{sv}</span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )
        )}

        {/* Admin2 uyarısı */}
        {subscriber?.isAdmin2 && (
          <div className="mt-8 bg-eu-pale border border-eu/20 rounded-xl p-4 flex items-center gap-3">
            <span className="text-eu">🛡️</span>
            <p className="text-sm text-eu">
              Admin2 yetkisiyle kurum profili ekleyip düzenleyebilirsiniz.
              <Link href="/admin/kurumlar" className="font-semibold underline ml-1">Admin Paneline Git →</Link>
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
