"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useFirma } from "@/lib/firma/context";
import { getDataProvider } from "@/lib/data";
import type { Subscriber, SubscriberProfileType, AddressGroup } from "@/lib/types";

const ROLE_LABEL: Record<SubscriberProfileType, string> = {
  firma: "Firma", stk: "STK", tedarikci: "Tedarikçi",
  delegasyon: "AB Delegasyonu", program_otoritesi: "Program Otoritesi",
};
const ROLE_COLOR: Record<SubscriberProfileType, string> = {
  firma: "bg-blue-100 text-blue-700", stk: "bg-green-100 text-green-700",
  tedarikci: "bg-orange-100 text-orange-700", delegasyon: "bg-purple-100 text-purple-700",
  program_otoritesi: "bg-red-100 text-red-700",
};

export default function PaydasPage() {
  const { current: firma, loading: firmaLoading } = useFirma();
  const [allSubscribers, setAllSubscribers] = useState<Subscriber[]>([]);
  const [groups, setGroups] = useState<AddressGroup[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [filterRole, setFilterRole] = useState<SubscriberProfileType | "">("");
  const [msgText, setMsgText] = useState("");
  const [msgSent, setMsgSent] = useState(false);

  useEffect(() => {
    if (!firma) { setDataLoading(false); return; }
    const db = getDataProvider();
    Promise.all([db.getSubscribers(), db.getAddressGroups(firma.id)]).then(([subs, grps]) => {
      setAllSubscribers(subs.filter((s) => s.id !== firma.id));
      setGroups(grps);
      setDataLoading(false);
    });
  }, [firma]);

  if (firmaLoading || dataLoading) {
    return <PageShell><div className="max-w-5xl mx-auto px-6 py-16 text-center text-slate">Yükleniyor…</div></PageShell>;
  }

  if (!firma) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "Paydaş İletişimi" }]} />
          <h1 className="text-2xl font-bold text-ink mb-3">Paydaş İletişimi</h1>
          <div className="bg-white border border-line rounded-2xl p-8 text-center">
            <p className="text-slate mb-4">Adres defterinize erişmek için giriş yapmalısınız.</p>
            <Link href="/giris" className="inline-block px-5 py-2.5 bg-eu text-white rounded-lg text-sm font-semibold">Giriş Yap</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  // Rehber filtreleme
  const directory = allSubscribers;
  const filtered = directory.filter((s) => {
    const q = searchQ.toLocaleLowerCase("tr");
    const match = !q || [s.organization ?? "", s.name, s.email].join(" ").toLocaleLowerCase("tr").includes(q);
    const roleMatch = !filterRole || s.profileType === filterRole;
    return match && roleMatch;
  });

  const activeGroup = groups.find((g) => g.id === activeGroupId);
  const groupMembers = activeGroup
    ? allSubscribers.filter((s) => activeGroup.memberIds.includes(s.id))
    : [];

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    const g: AddressGroup = {
      id: `ag-${Date.now()}`, ownerSubscriberId: firma.id,
      name: newGroupName.trim(), description: newGroupDesc.trim() || undefined,
      memberIds: [], createdAt: new Date().toISOString(),
    };
    await getDataProvider().saveAddressGroup(g);
    setGroups([...groups, g]);
    setNewGroupName(""); setNewGroupDesc("");
    setShowNewGroup(false); setActiveGroupId(g.id);
  };

  const addToGroup = async (subId: string) => {
    if (!activeGroup || activeGroup.memberIds.includes(subId)) return;
    const updated = { ...activeGroup, memberIds: [...activeGroup.memberIds, subId] };
    await getDataProvider().saveAddressGroup(updated);
    setGroups(groups.map((g) => g.id === updated.id ? updated : g));
  };

  const removeFromGroup = async (subId: string) => {
    if (!activeGroup) return;
    const updated = { ...activeGroup, memberIds: activeGroup.memberIds.filter((id) => id !== subId) };
    await getDataProvider().saveAddressGroup(updated);
    setGroups(groups.map((g) => g.id === updated.id ? updated : g));
  };

  const deleteGroup = async (id: string) => {
    if (!confirm("Bu grubu silmek istediğinizden emin misiniz?")) return;
    await getDataProvider().removeAddressGroup(id);
    setGroups(groups.filter((g) => g.id !== id));
    if (activeGroupId === id) setActiveGroupId(null);
  };

  const sendMsg = () => {
    if (!msgText.trim() || groupMembers.length === 0) return;
    setMsgSent(true); setMsgText("");
    setTimeout(() => setMsgSent(false), 3000);
  };

  const exportCSV = () => {
    const list = activeGroup ? groupMembers : filtered;
    const bom = "\uFEFF";
    const rows = list.map((s) =>
      `"${s.organization ?? s.name}","${s.email}","${ROLE_LABEL[s.profileType]}","${s.contactPhone ?? ""}","${s.contactAddress ?? ""}"`
    );
    const blob = new Blob([bom + ["Kuruluş/Ad,E-posta,Rol,Telefon,Adres", ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `adres-defteri-${activeGroup?.name ?? "tum"}.csv`;
    a.click();
  };

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "Paydaş İletişimi" }]} />
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink">Adres Defteri & Paydaş İletişimi</h1>
            <p className="text-slate text-sm mt-0.5">Platformdaki kayıtlı profilleri gruplandırın, mesaj gönderin ve Excel'e aktarın.</p>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 border border-line text-slate rounded-lg text-sm font-semibold hover:bg-surface">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Excel İndir
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Sol: Gruplar */}
          <div className="md:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-ink text-sm">Gruplarım</h3>
              <button onClick={() => setShowNewGroup(true)} className="text-xs text-eu font-semibold hover:underline">+ Yeni Grup</button>
            </div>

            {showNewGroup && (
              <div className="mb-3 space-y-2 p-3 bg-eu-pale border border-eu/20 rounded-xl">
                <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Grup adı *" autoFocus
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu bg-white" />
                <input value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Açıklama (opsiyonel)"
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu bg-white" />
                <div className="flex gap-2">
                  <button onClick={createGroup} className="flex-1 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Oluştur</button>
                  <button onClick={() => setShowNewGroup(false)} className="px-3 py-2 text-mist text-sm border border-line rounded-lg">İptal</button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <button
                onClick={() => setActiveGroupId(null)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${!activeGroupId ? "bg-eu text-white" : "bg-white border border-line text-slate hover:bg-surface"}`}>
                Tüm Rehber <span className={`text-xs ml-1 ${!activeGroupId ? "text-white/70" : "text-mist"}`}>({directory.length})</span>
              </button>
              {groups.map((g) => (
                <div key={g.id} className={`rounded-xl border overflow-hidden ${activeGroupId === g.id ? "border-eu" : "border-line"}`}>
                  <button
                    onClick={() => setActiveGroupId(g.id)}
                    className={`w-full text-left px-3 py-2.5 text-sm font-medium transition-colors ${activeGroupId === g.id ? "bg-eu-pale text-eu" : "bg-white text-slate hover:bg-surface"}`}>
                    <span className="block truncate">{g.name}</span>
                    <span className="text-xs text-mist">{g.memberIds.length} üye</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ: İçerik */}
          <div className="md:col-span-2">
            {!activeGroupId ? (
              /* Tüm rehber */
              <div>
                <div className="flex gap-2 mb-4">
                  <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Ad, kurum veya e-posta ara…"
                    className="flex-1 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                  <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as SubscriberProfileType | "")}
                    className="px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                    <option value="">Tüm Roller</option>
                    {(Object.keys(ROLE_LABEL) as SubscriberProfileType[]).map((r) => (
                      <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-mist mb-3">{filtered.length} profil</p>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filtered.map((s) => (
                    <div key={s.id} className="bg-white border border-line rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-ink truncate">{s.organization ?? s.name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ${ROLE_COLOR[s.profileType]}`}>{ROLE_LABEL[s.profileType]}</span>
                        </div>
                        <p className="text-xs text-mist">{s.email}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/firma/${s.id}`} className="text-xs text-mist hover:text-eu">Profil</Link>
                        {s.contactPhone && (
                          <a href={`https://wa.me/${s.contactPhone.replace(/\D/g, "")}?text=Merhaba`} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-green-700 font-semibold hover:underline">WA</a>
                        )}
                        {groups.length > 0 && (
                          <select onChange={(e) => { if (e.target.value) { setActiveGroupId(e.target.value); addToGroup(s.id); } e.target.value = ""; }}
                            className="text-xs border border-line rounded px-1 py-0.5 bg-white text-slate focus:outline-none max-w-[120px]">
                            <option value="">+ Gruba Ekle</option>
                            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <p className="text-center py-8 text-mist text-sm">Arama kriterine uyan profil bulunamadı.</p>
                  )}
                </div>
              </div>
            ) : (
              /* Grup detayı */
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-ink">{activeGroup?.name}</h3>
                    {activeGroup?.description && <p className="text-xs text-mist mt-0.5">{activeGroup.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => exportCSV()} className="text-xs font-semibold border border-line text-slate px-3 py-1.5 rounded-lg hover:bg-surface">CSV İndir</button>
                    <button onClick={() => deleteGroup(activeGroupId)} className="text-xs text-mist hover:text-tr">Sil</button>
                  </div>
                </div>

                {groupMembers.length === 0 ? (
                  <div className="bg-white border border-line rounded-xl p-6 text-center">
                    <p className="text-sm text-mist mb-2">Bu grupta henüz kimse yok.</p>
                    <button onClick={() => setActiveGroupId(null)} className="text-xs text-eu font-semibold hover:underline">
                      Tüm rehbere git ve üye ekle →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 mb-5 max-h-[300px] overflow-y-auto">
                    {groupMembers.map((s) => (
                      <div key={s.id} className="bg-white border border-line rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-ink truncate">{s.organization ?? s.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ${ROLE_COLOR[s.profileType]}`}>{ROLE_LABEL[s.profileType]}</span>
                          </div>
                          <p className="text-xs text-mist">{s.email}{s.contactPhone ? ` · ${s.contactPhone}` : ""}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {s.contactPhone && (
                            <a href={`https://wa.me/${s.contactPhone.replace(/\D/g, "")}?text=Merhaba ${s.name},`} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-green-700 font-semibold hover:underline flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.105 1.523 5.824L.057 24l6.336-1.4A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.49-5.184-1.349l-.372-.22-3.86.853.87-3.773-.242-.388A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                              </svg>
                              WA
                            </a>
                          )}
                          <button onClick={() => removeFromGroup(s.id)} className="text-xs text-mist hover:text-tr">Çıkar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Toplu mesaj */}
                {groupMembers.length > 0 && (
                  <div className="bg-surface rounded-2xl p-5">
                    <h4 className="text-sm font-bold text-ink mb-3">Gruba Toplu Mesaj</h4>
                    <p className="text-xs text-mist mb-3">
                      Bu mesaj <strong>{groupMembers.length}</strong> kişiye platform içi mesaj olarak gönderilecektir.
                      Telefonu olan üyelere WhatsApp bağlantısını yukarıdan tek tek kullanabilirsiniz.
                    </p>
                    <textarea value={msgText} onChange={(e) => setMsgText(e.target.value)} rows={4}
                      placeholder={`${groupMembers.length} kişiye gönderilecek mesaj…`}
                      className="w-full px-3 py-2 border border-line rounded-lg text-sm resize-none focus:outline-none focus:border-eu mb-3" />
                    <button onClick={sendMsg} disabled={!msgText.trim()}
                      className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold disabled:opacity-40">
                      Gönder ({groupMembers.length} kişi)
                    </button>
                    {msgSent && <p className="text-green-700 text-xs font-semibold mt-2 inline-block ml-3">✓ Mesaj iletildi.</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
