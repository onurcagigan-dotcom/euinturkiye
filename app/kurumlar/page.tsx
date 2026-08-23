"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import { useFirma } from "@/lib/firma/context";
import { getDataProvider } from "@/lib/data";
import type { InstitutionProfile, Subscriber, AddressGroup } from "@/lib/types";

const TYPE_LABELS: Record<InstitutionProfile["institutionType"], string> = {
  kamu: "Kamu Kurumu", ozel: "Özel Sektör", stk: "STK / Vakıf", uluslararasi: "Uluslararası Kuruluş",
};
const TYPE_COLORS: Record<InstitutionProfile["institutionType"], string> = {
  kamu: "bg-blue-100 text-blue-700", ozel: "bg-purple-100 text-purple-700",
  stk: "bg-green-100 text-green-700", uluslararasi: "bg-eu-pale text-eu",
};

// ─── "Adres Defterine Ekle" butonu ──────────────────────────
function AddToAddressBook({
  targetSubscriberId,
  targetName,
  groups,
  onGroupsChange,
}: {
  targetSubscriberId: string;
  targetName: string;
  groups: AddressGroup[];
  onGroupsChange: (groups: AddressGroup[]) => void;
}) {
  const db = getDataProvider();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  // Bu kişi hangi gruplarda zaten var?
  const alreadyInGroups = groups.filter((g) => g.memberIds.includes(targetSubscriberId));

  const handleAdd = async (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group || group.memberIds.includes(targetSubscriberId)) return;
    setAdding(groupId);
    const updated = { ...group, memberIds: [...group.memberIds, targetSubscriberId] };
    await db.saveAddressGroup(updated);
    onGroupsChange(groups.map((g) => g.id === groupId ? updated : g));
    setAdding(null);
    setAdded(groupId);
    setTimeout(() => { setAdded(null); setOpen(false); }, 1200);
  };

  if (groups.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
          alreadyInGroups.length > 0
            ? "border-green-300 bg-green-50 text-green-700"
            : "border-line bg-white text-slate hover:border-eu hover:text-eu"
        }`}
        title="Adres defterine ekle"
      >
        {alreadyInGroups.length > 0 ? (
          <><span>✓</span> Defterde var</>
        ) : (
          <><span>+</span> Deftere ekle</>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-line rounded-xl shadow-xl min-w-[200px] overflow-hidden">
            <div className="px-3 py-2 border-b border-line">
              <p className="text-xs font-bold text-ink">Grup Seç</p>
              <p className="text-[10px] text-mist truncate">{targetName}</p>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {groups.map((g) => {
                const inGroup = g.memberIds.includes(targetSubscriberId);
                const isAdding = adding === g.id;
                const isAdded = added === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!inGroup) handleAdd(g.id); }}
                    disabled={inGroup || !!adding}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 text-xs transition-colors ${
                      inGroup ? "text-green-700 bg-green-50 cursor-default" :
                      isAdded ? "text-green-700 bg-green-50" :
                      "text-slate hover:bg-eu-pale hover:text-eu"
                    }`}
                  >
                    <span className="flex-shrink-0 w-4 text-center">
                      {isAdding ? "⏳" : inGroup || isAdded ? "✓" : "+"}
                    </span>
                    <span className="flex-1 truncate">{g.name}</span>
                    {inGroup && <span className="text-[9px] text-green-600">Ekli</span>}
                  </button>
                );
              })}
            </div>
            <div className="px-3 py-2 border-t border-line">
              <Link href="/firma?tab=adres" className="text-[10px] text-eu hover:underline">
                Yeni grup oluştur →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────
export default function KurumlarPage() {
  const { locale } = useLocale();
  const { current: subscriber } = useFirma();
  const db = getDataProvider();
  const isEn = locale === "en";

  const [institutions, setInstitutions] = useState<InstitutionProfile[]>([]);
  const [allSubs, setAllSubs] = useState<Subscriber[]>([]);
  const [tab, setTab] = useState<"kurumlar" | "tedarikci" | "firmalar">("kurumlar");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("hepsi");
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<AddressGroup[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [inst, subs] = await Promise.all([
        db.getInstitutionProfiles(),
        db.getSubscribers(),
      ]);
      setInstitutions(inst);
      setAllSubs(subs);
      setLoading(false);
    })();
  }, [db]);

  // Giriş yapılmışsa adres gruplarını yükle
  useEffect(() => {
    if (!subscriber) return;
    db.getAddressGroups(subscriber.id).then(setGroups);
  }, [subscriber, db]);

  const handleGroupsChange = useCallback((updated: AddressGroup[]) => {
    setGroups(updated);
  }, []);

  // Tab'a göre filtrelenmiş listeler
  const firmalar = allSubs.filter((s) => s.profileType === "firma" || s.profileType === "stk");
  const tedarikcilar = allSubs.filter((s) => s.profileType === "tedarikci");

  const filterSub = (s: Subscriber) => {
    const q = search.toLowerCase();
    return !q || (s.organization ?? s.name).toLowerCase().includes(q) || (s.shortBio ?? "").toLowerCase().includes(q);
  };

  const filterInst = (i: InstitutionProfile) => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.name.toLowerCase().includes(q) || (i.description ?? "").toLowerCase().includes(q);
    const matchType = typeFilter === "hepsi" || i.institutionType === typeFilter;
    return matchSearch && matchType;
  };

  const filteredInst = institutions.filter(filterInst);
  const filteredTedarikci = tedarikcilar.filter(filterSub);
  const filteredFirmalar = firmalar.filter(filterSub);

  // Bir subscriber kartı
  function SubCard({ s }: { s: Subscriber }) {
    const icon = s.profileType === "stk" ? "🤝" : s.profileType === "tedarikci" ? "⚙️" : "🏢";
    const badge = s.profileType === "stk" ? "bg-green-100 text-green-700" :
                  s.profileType === "tedarikci" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700";
    const label = s.profileType === "stk" ? "STK" : s.profileType === "tedarikci" ? "Tedarikçi" : "Firma";

    return (
      <div className="bg-white border border-line rounded-xl p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-eu-pale flex items-center justify-center flex-shrink-0 text-lg">{icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-ink text-sm leading-tight truncate">{s.organization ?? s.name}</h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${badge}`}>{label}</span>
          </div>
        </div>
        {s.shortBio && <p className="text-xs text-slate leading-relaxed line-clamp-2">{s.shortBio}</p>}
        {s.profileType === "tedarikci" && (s.supplierGoods?.length || s.supplierServices?.length) ? (
          <div className="space-y-1">
            {(s.supplierGoods ?? []).slice(0, 2).map((g) => (
              <span key={g} className="inline-block text-[10px] bg-surface text-slate px-2 py-0.5 rounded-full mr-1">{g}</span>
            ))}
            {(s.supplierServices ?? []).slice(0, 2).map((sv) => (
              <span key={sv} className="inline-block text-[10px] bg-eu-pale text-eu px-2 py-0.5 rounded-full mr-1">{sv}</span>
            ))}
          </div>
        ) : null}
        {/* Footer: profil linki + adres defteri */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-line/60">
          <Link href={`/firma/${s.id}`} className="text-[10px] text-eu font-semibold hover:underline">
            Profili gör →
          </Link>
          {subscriber && subscriber.id !== s.id && (
            <AddToAddressBook
              targetSubscriberId={s.id}
              targetName={s.organization ?? s.name}
              groups={groups}
              onGroupsChange={handleGroupsChange}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Breadcrumb items={[
          { label: isEn ? "Home" : "Ana Sayfa", href: "/" },
          { label: isEn ? "Directory" : "Rehber" },
        ]} />

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-ink mb-1">{isEn ? "Directory" : "Rehber"}</h1>
            <p className="text-slate text-sm">
              {isEn
                ? "Firms, NGOs, suppliers and institutions in the EU-Turkey ecosystem."
                : "AB-Türkiye ekosistemindeki firma, STK, tedarikçi ve kurumlar."}
            </p>
          </div>
          {subscriber && groups.length > 0 && (
            <div className="text-xs text-mist bg-surface px-3 py-2 rounded-xl flex items-center gap-1.5 flex-shrink-0">
              <span>📋</span>
              <span>{groups.length} grubunuz var — kartlardaki <strong>+ Deftere ekle</strong> butonunu kullanın</span>
            </div>
          )}
          {subscriber && groups.length === 0 && (
            <Link href="/firma?tab=adres" className="text-xs text-eu font-semibold hover:underline flex-shrink-0">
              + Adres grubu oluştur
            </Link>
          )}
        </div>

        {/* Tab */}
        <div className="flex gap-1 bg-surface rounded-xl p-1 mb-5 w-fit">
          {([
            { id: "kurumlar", label: isEn ? "Institutions" : "Kurumlar" },
            { id: "tedarikci", label: isEn ? "Suppliers" : "Tedarikçiler" },
            { id: "firmalar",  label: isEn ? "Firms & NGOs" : "Firma & STK" },
          ] as const).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t.id ? "bg-white text-eu shadow-sm" : "text-slate hover:text-ink"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Arama + filtre */}
        <div className="flex gap-3 mb-6">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={isEn ? "Search…" : "Ara…"}
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
                <div key={inst.id} className="bg-white border border-line rounded-xl p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-eu-pale flex items-center justify-center text-lg flex-shrink-0">🏛️</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-ink text-sm leading-tight">{inst.name}</h3>
                      {inst.shortName && inst.shortName !== inst.name && (
                        <p className="text-[10px] text-mist">{inst.shortName}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold w-fit ${TYPE_COLORS[inst.institutionType]}`}>
                    {TYPE_LABELS[inst.institutionType]}
                  </span>
                  {inst.description && (
                    <p className="text-xs text-slate leading-relaxed line-clamp-3">{inst.description}</p>
                  )}
                  <div className="space-y-1 mt-auto pt-2 border-t border-line/60">
                    {inst.contactEmail && <p className="text-[10px] text-mist truncate">✉️ {inst.contactEmail}</p>}
                    {inst.website && (
                      <a href={inst.website} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-eu hover:underline truncate block">
                        🔗 {inst.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    )}
                    {/* Kurumun platform subscriber'ı varsa adres defterine ekle */}
                    {inst.subscriberId && subscriber && subscriber.id !== inst.subscriberId && (
                      <div className="pt-1">
                        <AddToAddressBook
                          targetSubscriberId={inst.subscriberId}
                          targetName={inst.name}
                          groups={groups}
                          onGroupsChange={handleGroupsChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === "tedarikci" ? (
          filteredTedarikci.length === 0 ? (
            <div className="bg-surface rounded-2xl p-12 text-center text-slate">Tedarikçi bulunamadı.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTedarikci.map((s) => <SubCard key={s.id} s={s} />)}
            </div>
          )
        ) : (
          filteredFirmalar.length === 0 ? (
            <div className="bg-surface rounded-2xl p-12 text-center text-slate">Firma bulunamadı.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFirmalar.map((s) => <SubCard key={s.id} s={s} />)}
            </div>
          )
        )}

        {/* Giriş yapılmamışsa uyarı */}
        {!subscriber && (
          <div className="mt-8 bg-eu-pale border border-eu/20 rounded-xl p-4 flex items-center gap-3">
            <span className="text-eu text-lg">💡</span>
            <p className="text-sm text-eu">
              {isEn
                ? "Log in to add contacts to your address book."
                : "Adres defterinize kişi eklemek için giriş yapın."}
              {" "}
              <Link href="/giris" className="font-semibold underline">
                {isEn ? "Log in" : "Giriş Yap"}
              </Link>
            </p>
          </div>
        )}

        {/* Admin2 uyarısı */}
        {subscriber?.isAdmin2 && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-amber-600">🛡️</span>
            <p className="text-sm text-amber-800">
              Admin2 yetkisiyle kurum profili ekleyip düzenleyebilirsiniz.{" "}
              <Link href="/admin/kurumlar" className="font-semibold underline">Admin Paneline Git →</Link>
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
