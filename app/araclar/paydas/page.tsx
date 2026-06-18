"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useFirma } from "@/lib/firma/context";
import { getDataProvider } from "@/lib/data";
import type { Stakeholder, Project, EventItem, EventRsvp, ExpertProfile, NetworkConnection } from "@/lib/types";

const TYPE_LABEL: Record<Stakeholder["type"], string> = { ekip: "Ekip", uzman: "Uzman", tedarikci: "Tedarikçi", kamu: "Kamu", diger: "Diğer" };
const TYPE_COLOR: Record<Stakeholder["type"], string> = { ekip: "bg-blue-100 text-blue-700", uzman: "bg-purple-100 text-purple-700", tedarikci: "bg-orange-100 text-orange-700", kamu: "bg-green-100 text-green-700", diger: "bg-gray-100 text-gray-600" };

type AudienceKind = "proje-paydaslari" | "etkinlik-katilimcilari" | "agim";

export default function PaydasPage() {
  const { current: firma, loading: firmaLoading } = useFirma();
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [myEvents, setMyEvents] = useState<EventItem[]>([]);
  const [rsvpsByEvent, setRsvpsByEvent] = useState<Record<string, EventRsvp[]>>({});
  const [expertProfiles, setExpertProfiles] = useState<ExpertProfile[]>([]);
  const [allTedarikci, setAllTedarikci] = useState<{ id: string; name: string }[]>([]);
  const [network, setNetwork] = useState<NetworkConnection[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", organization: "", role: "", type: "ekip" as Stakeholder["type"], notes: "" });

  const [audienceKind, setAudienceKind] = useState<AudienceKind>("proje-paydaslari");
  const [audienceEventId, setAudienceEventId] = useState<string>("");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!firma) { setDataLoading(false); return; }
    const db = getDataProvider();
    Promise.all([
      db.getProjects(),
      db.getEvents(),
      db.getExpertProfiles(),
      db.getSubscribers(),
      db.getNetworkConnections(firma.id),
    ]).then(async ([allProjects, allEvents, allExperts, allSubs, conns]) => {
      const owned = allProjects.filter((p) => p.ownerSubscriberId === firma.id || p.consortiumMembers?.some((m) => m.subscriberId === firma.id));
      setMyProjects(owned);
      if (owned.length > 0) setActiveProjectId(owned[0].id);

      const myEventList = allEvents.filter((e) => e.organizerSubscriberId === firma.id);
      setMyEvents(myEventList);
      if (myEventList.length > 0) setAudienceEventId(myEventList[0].id);

      const stRes = await Promise.all(owned.map((p) => db.getStakeholders(p.id)));
      setStakeholders(stRes.flat());

      const rsvpRes = await Promise.all(myEventList.map((e) => db.getRsvps(e.id)));
      const map: Record<string, EventRsvp[]> = {};
      myEventList.forEach((e, i) => { map[e.id] = rsvpRes[i]; });
      setRsvpsByEvent(map);

      setExpertProfiles(allExperts.filter((ep) => ep.visible));
      setAllTedarikci(allSubs.filter((s) => s.profileType === "tedarikci" && s.id !== firma.id).map((s) => ({ id: s.id, name: s.organization ?? s.name })));
      setNetwork(conns);
      setDataLoading(false);
    });
  }, [firma]);

  const filtered = stakeholders.filter((s) => s.projectId === activeProjectId);
  const byType = (type: Stakeholder["type"]) => filtered.filter((s) => s.type === type);

  const addStakeholder = async () => {
    if (!form.name || !form.email || !activeProjectId) return;
    const s: Stakeholder = { id: `stk-${Date.now()}`, projectId: activeProjectId, ...form, addedAt: new Date().toISOString() };
    await getDataProvider().saveStakeholder(s);
    setStakeholders((prev) => [...prev, s]);
    setForm({ name: "", email: "", phone: "", organization: "", role: "", type: "ekip", notes: "" });
    setAdding(false);
  };

  const remove = async (id: string) => {
    await getDataProvider().removeStakeholder(id);
    setStakeholders((prev) => prev.filter((s) => s.id !== id));
  };

  const recipients = useMemo(() => {
    if (audienceKind === "proje-paydaslari") {
      return filtered.map((s) => ({ name: s.name, email: s.email }));
    }
    if (audienceKind === "etkinlik-katilimcilari") {
      return (rsvpsByEvent[audienceEventId] ?? []).filter((r) => r.status === "onaylandi").map((r) => ({ name: r.name, email: r.email }));
    }
    return network.map((n) => ({ name: n.targetName, email: "" }));
  }, [audienceKind, filtered, rsvpsByEvent, audienceEventId, network]);

  const sendBulkMessage = () => {
    if (!messageSubject || !messageBody || recipients.length === 0) return;
    setSentNotice(`Mesaj ${recipients.length} alıcıya gönderildi: "${messageSubject}"`);
    setMessageSubject("");
    setMessageBody("");
    setTimeout(() => setSentNotice(null), 5000);
  };

  const addToNetwork = async (targetType: NetworkConnection["targetType"], targetId: string, targetName: string) => {
    if (!firma) return;
    await getDataProvider().addNetworkConnection({ ownerSubscriberId: firma.id, targetType, targetId, targetName });
    setNetwork((prev) => [...prev, { id: `net-${Date.now()}`, ownerSubscriberId: firma.id, targetType, targetId, targetName, addedAt: new Date().toISOString() }]);
  };

  const removeFromNetwork = async (id: string) => {
    await getDataProvider().removeNetworkConnection(id);
    setNetwork((prev) => prev.filter((n) => n.id !== id));
  };

  const isInNetwork = (targetType: NetworkConnection["targetType"], targetId: string) =>
    network.some((n) => n.targetType === targetType && n.targetId === targetId);

  if (firmaLoading || dataLoading) {
    return <PageShell><div className="max-w-4xl mx-auto px-6 py-16 text-center text-slate">Yükleniyor…</div></PageShell>;
  }

  if (!firma) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "Paydaş İletişimi" }]} />
          <h1 className="text-2xl font-bold text-ink mb-3">Paydaş İletişimi</h1>
          <div className="bg-surface rounded-2xl p-8 text-center">
            <p className="text-slate mb-4">Paydaşlarınızı yönetmek ve toplu mesaj göndermek için firma hesabınızla giriş yapmalısınız.</p>
            <Link href="/giris" className="inline-block px-5 py-2.5 bg-eu text-white rounded-lg text-sm font-semibold">Giriş Yap</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "Paydaş İletişimi" }]} />
        <h1 className="text-2xl font-bold text-ink mb-6">Paydaş İletişimi</h1>

        <section className="mb-10">
          <h2 className="font-bold text-ink mb-3">Proje Paydaşları</h2>

          {myProjects.length === 0 ? (
            <p className="text-sm text-mist mb-4">Yürüttüğünüz veya konsorsiyum üyesi olduğunuz bir proje bulunmuyor.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-5">
                {myProjects.map((p) => (
                  <button key={p.id} onClick={() => setActiveProjectId(p.id)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeProjectId === p.id ? "bg-eu text-white" : "bg-surface text-slate hover:bg-line"}`}>
                    {p.title}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-2 mb-5">
                {(Object.keys(TYPE_LABEL) as Stakeholder["type"][]).map((t) => (
                  <div key={t} className={`rounded-xl p-3 text-center ${TYPE_COLOR[t]}`}>
                    <div className="text-xl font-bold">{byType(t).length}</div>
                    <div className="text-xs font-semibold">{TYPE_LABEL[t]}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mb-4">
                <button onClick={() => setAdding(true)} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">+ Paydaş Ekle</button>
              </div>

              {adding && (
                <div className="bg-eu-pale border border-eu/20 rounded-xl p-5 mb-5">
                  <h3 className="font-bold text-ink mb-3">Yeni Paydaş</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ad Soyad *" className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                    <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="E-posta *" type="email" className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                    <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Telefon" className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                    <input value={form.organization} onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))} placeholder="Kurum/Şirket" className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                    <input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="Rol / Unvan" className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                    <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Stakeholder["type"] }))} className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu bg-white">
                      {(Object.entries(TYPE_LABEL) as [Stakeholder["type"], string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addStakeholder} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Ekle</button>
                    <button onClick={() => setAdding(false)} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {filtered.length === 0 ? (
                  <div className="text-center py-8 text-mist text-sm">Bu proje için paydaş eklenmemiş.</div>
                ) : (
                  filtered.map((s) => (
                    <div key={s.id} className="bg-white border border-line rounded-xl p-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[s.type]}`}>{TYPE_LABEL[s.type]}</span>
                        </div>
                        <h3 className="font-bold text-ink">{s.name}</h3>
                        <p className="text-sm text-slate">{s.role}{s.organization && ` — ${s.organization}`}</p>
                        <div className="flex flex-wrap gap-4 mt-1 text-xs text-mist">
                          <span>✉ {s.email}</span>
                          {s.phone && <span>☎ {s.phone}</span>}
                        </div>
                      </div>
                      <button onClick={() => remove(s.id)} className="text-mist hover:text-tr text-xs">Sil</button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </section>

        <section className="mb-10">
          <h2 className="font-bold text-ink mb-1">Toplu Mesaj Gönder</h2>
          <p className="text-sm text-mist mb-4">Bir etkinliğin katılımcılarına, bir projenin paydaşlarına veya ağınızdaki kişilere toplu mesaj gönderin.</p>

          <div className="bg-white border border-line rounded-2xl p-5">
            <div className="flex flex-wrap gap-2 mb-4">
              {([
                { v: "proje-paydaslari", l: "Proje Paydaşları" },
                { v: "etkinlik-katilimcilari", l: "Etkinlik Katılımcıları" },
                { v: "agim", l: "Ağım" },
              ] as { v: AudienceKind; l: string }[]).map((opt) => (
                <button key={opt.v} onClick={() => setAudienceKind(opt.v)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${audienceKind === opt.v ? "bg-ink text-white" : "bg-surface text-slate hover:bg-line"}`}>
                  {opt.l}
                </button>
              ))}
            </div>

            {audienceKind === "etkinlik-katilimcilari" && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-mist mb-1">Etkinlik seçin</label>
                <select value={audienceEventId} onChange={(e) => setAudienceEventId(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                  {myEvents.length === 0 && <option value="">Etkinliğiniz yok</option>}
                  {myEvents.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
              </div>
            )}

            <p className="text-xs text-mist mb-4">
              Hedef alıcı sayısı: <strong className="text-ink">{recipients.length}</strong>
              {audienceKind === "agim" && " (ağınızdaki kişilere e-posta yerine platform içi bildirim gönderilir)"}
            </p>

            <div className="space-y-3">
              <input value={messageSubject} onChange={(e) => setMessageSubject(e.target.value)} placeholder="Konu *"
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              <textarea value={messageBody} onChange={(e) => setMessageBody(e.target.value)} placeholder="Mesaj içeriği *" rows={4}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
            </div>

            <button onClick={sendBulkMessage} disabled={recipients.length === 0}
              className="mt-3 px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
              Gönder ({recipients.length} kişi)
            </button>

            {sentNotice && (
              <div className="mt-3 px-4 py-2.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">{sentNotice}</div>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-bold text-ink mb-1">Ağım</h2>
          <p className="text-sm text-mist mb-4">Birlikte çalıştığınız uzman ve tedarikçileri ağınıza ekleyin; toplu mesaj gönderiminde hızlıca seçebilirsiniz.</p>

          {network.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-mist uppercase tracking-wide mb-2">Ağınızdaki Bağlantılar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {network.map((n) => (
                  <div key={n.id} className="flex items-center justify-between gap-3 p-3 bg-white border border-line rounded-xl">
                    <div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mr-2 ${n.targetType === "uzman" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}>
                        {n.targetType === "uzman" ? "Uzman" : "Tedarikçi"}
                      </span>
                      <span className="text-sm font-medium text-ink">{n.targetName}</span>
                    </div>
                    <button onClick={() => removeFromNetwork(n.id)} className="text-xs text-mist hover:text-tr">Çıkar</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-mist uppercase tracking-wide mb-2">Uzmanlar</h3>
              <div className="space-y-2">
                {expertProfiles.length === 0 ? (
                  <p className="text-sm text-mist">Görüntülenebilir uzman profili bulunmuyor.</p>
                ) : (
                  expertProfiles.map((ep) => {
                    const added = isInNetwork("uzman", ep.id);
                    return (
                      <div key={ep.id} className="flex items-center justify-between gap-3 p-3 bg-white border border-line rounded-xl">
                        <div>
                          <Link href={`/uzmanlar/${ep.id}`} className="text-sm font-semibold text-ink hover:text-eu hover:underline">{ep.name}</Link>
                          <p className="text-xs text-mist">{ep.title}</p>
                        </div>
                        <button
                          onClick={() => (added ? removeFromNetwork(network.find((n) => n.targetType === "uzman" && n.targetId === ep.id)!.id) : addToNetwork("uzman", ep.id, ep.name))}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 ${added ? "bg-surface text-mist" : "bg-eu-pale text-eu"}`}>
                          {added ? "Ağımda ✓" : "+ Ağıma Ekle"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-mist uppercase tracking-wide mb-2">Tedarikçiler</h3>
              <div className="space-y-2">
                {allTedarikci.length === 0 ? (
                  <p className="text-sm text-mist">Görüntülenebilir tedarikçi profili bulunmuyor.</p>
                ) : (
                  allTedarikci.map((t) => {
                    const added = isInNetwork("tedarikci", t.id);
                    return (
                      <div key={t.id} className="flex items-center justify-between gap-3 p-3 bg-white border border-line rounded-xl">
                        <Link href={`/firma/${t.id}`} className="text-sm font-semibold text-ink hover:text-eu hover:underline">{t.name}</Link>
                        <button
                          onClick={() => (added ? removeFromNetwork(network.find((n) => n.targetType === "tedarikci" && n.targetId === t.id)!.id) : addToNetwork("tedarikci", t.id, t.name))}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 ${added ? "bg-surface text-mist" : "bg-eu-pale text-eu"}`}>
                          {added ? "Ağımda ✓" : "+ Ağıma Ekle"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
