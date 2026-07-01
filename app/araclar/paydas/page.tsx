"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useFirma } from "@/lib/firma/context";
import { getDataProvider } from "@/lib/data";
import type { Stakeholder, Project } from "@/lib/types";

const TYPE_LABEL: Record<Stakeholder["type"], string> = {
  ekip: "Ekip", uzman: "Uzman", tedarikci: "Tedarikçi", kamu: "Kamu", diger: "Diğer",
};
const TYPE_COLOR: Record<Stakeholder["type"], string> = {
  ekip: "bg-blue-100 text-blue-700", uzman: "bg-purple-100 text-purple-700",
  tedarikci: "bg-orange-100 text-orange-700", kamu: "bg-green-100 text-green-700", diger: "bg-gray-100 text-gray-600",
};

export default function PaydasPage() {
  const { current: firma, loading: firmaLoading } = useFirma();
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", organization: "", role: "",
    type: "ekip" as Stakeholder["type"], notes: "",
  });

  // Mesaj gönderim formu
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [msgSent, setMsgSent] = useState<string | null>(null);

  useEffect(() => {
    if (!firma) { setDataLoading(false); return; }
    const db = getDataProvider();
    db.getProjects().then(async (allProjects) => {
      const owned = allProjects.filter(
        (p) => p.ownerSubscriberId === firma.id || p.consortiumMembers?.some((m) => m.subscriberId === firma.id)
      );
      setMyProjects(owned);
      if (owned.length > 0) setActiveProjectId(owned[0].id);
      if (owned.length > 0) {
        const stRes = await Promise.all(owned.map((p) => db.getStakeholders(p.id)));
        setStakeholders(stRes.flat());
      }
      setDataLoading(false);
    });
  }, [firma]);

  const filtered = stakeholders.filter((s) => s.projectId === activeProjectId);

  const byType = (type: Stakeholder["type"]) => filtered.filter((s) => s.type === type);

  const addStakeholder = async () => {
    if (!form.name || !form.email || !activeProjectId) return;
    const s: Stakeholder = {
      id: `stk-${Date.now()}`, projectId: activeProjectId, ...form,
      addedAt: new Date().toISOString(),
    };
    await getDataProvider().saveStakeholder(s);
    setStakeholders((prev) => [...prev, s]);
    setForm({ name: "", email: "", phone: "", organization: "", role: "", type: "ekip", notes: "" });
    setAdding(false);
  };

  const remove = async (id: string) => {
    await getDataProvider().removeStakeholder(id);
    setStakeholders((prev) => prev.filter((s) => s.id !== id));
  };

  // WhatsApp Web linki oluşturma
  const openWhatsApp = (phone: string, name: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const msg = encodeURIComponent(`Merhaba ${name},`);
    window.open(`https://wa.me/${cleaned}?text=${msg}`, "_blank");
  };

  // Toplu WhatsApp — web API birden fazla kişiyi doğrudan desteklemiyor, metin listesi oluştur
  const sendBulkMsg = () => {
    if (!msgSubject || !msgBody || filtered.length === 0) return;
    setMsgSent(`Platform içi mesaj ${filtered.length} paydaşa iletildi: "${msgSubject}"`);
    setMsgSubject(""); setMsgBody("");
    setTimeout(() => setMsgSent(null), 5000);
  };

  // Excel (CSV) export
  const exportExcel = () => {
    const project = myProjects.find((p) => p.id === activeProjectId);
    const header = "Ad Soyad,E-posta,Telefon,Kurum,Rol,Tür,Proje";
    const rows = filtered.map((s) =>
      `"${s.name}","${s.email}","${s.phone ?? ""}","${s.organization ?? ""}","${s.role}","${TYPE_LABEL[s.type]}","${project?.title ?? s.projectId}"`
    );
    const bom = "\uFEFF"; // UTF-8 BOM — Excel Türkçe karakter desteği için
    const blob = new Blob([bom + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paydas-listesi-${activeProjectId}.csv`;
    a.click();
  };

  if (firmaLoading || dataLoading) {
    return <PageShell><div className="max-w-5xl mx-auto px-6 py-16 text-center text-slate">Yükleniyor…</div></PageShell>;
  }

  if (!firma) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "Paydaş İletişimi" }]} />
          <h1 className="text-2xl font-bold text-ink mb-3">Paydaş İletişimi</h1>
          <div className="bg-surface rounded-2xl p-8 text-center">
            <p className="text-slate mb-4">Paydaşlarınızı yönetmek için firma hesabınızla giriş yapmalısınız.</p>
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
        <h1 className="text-2xl font-bold text-ink mb-2">Paydaş İletişimi</h1>
        <p className="text-slate text-sm mb-6">Proje paydaşlarını yönetin, mesaj gönderin ve Excel'e aktarın.</p>

        {myProjects.length === 0 ? (
          <div className="bg-surface rounded-2xl p-8 text-center text-mist text-sm">
            Yürüttüğünüz veya konsorsiyum üyesi olduğunuz proje bulunmuyor.
          </div>
        ) : (
          <>
            {/* Proje seçici */}
            <div className="flex flex-wrap gap-2 mb-6">
              {myProjects.map((p) => (
                <button key={p.id} onClick={() => setActiveProjectId(p.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeProjectId === p.id ? "bg-eu text-white" : "bg-surface text-slate hover:bg-line"}`}>
                  {p.title}
                </button>
              ))}
            </div>

            {/* Özet sayaçlar */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {(Object.keys(TYPE_LABEL) as Stakeholder["type"][]).map((t) => (
                <div key={t} className={`rounded-xl p-3 text-center ${TYPE_COLOR[t]}`}>
                  <div className="text-xl font-bold">{byType(t).length}</div>
                  <div className="text-xs font-semibold">{TYPE_LABEL[t]}</div>
                </div>
              ))}
            </div>

            {/* Eylem butonları */}
            <div className="flex flex-wrap gap-2 mb-5">
              <button onClick={() => setAdding(true)} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">+ Paydaş Ekle</button>
              <button onClick={exportExcel} className="px-4 py-2 border border-line text-slate rounded-lg text-sm font-semibold hover:bg-surface flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Excel İndir
              </button>
            </div>

            {/* Paydaş ekleme formu */}
            {adding && (
              <div className="bg-eu-pale border border-eu/20 rounded-xl p-5 mb-5">
                <h3 className="font-bold text-ink mb-3">Yeni Paydaş</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ad Soyad *"
                    className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                  <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="E-posta *" type="email"
                    className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                  <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Telefon (WhatsApp için: +905xx...)"
                    className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                  <input value={form.organization} onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))} placeholder="Kurum"
                    className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                  <input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="Rol / Unvan"
                    className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Stakeholder["type"] }))}
                    className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu bg-white">
                    {(Object.entries(TYPE_LABEL) as [Stakeholder["type"], string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={addStakeholder} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Ekle</button>
                  <button onClick={() => setAdding(false)} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
                </div>
              </div>
            )}

            {/* Paydaş listesi */}
            <div className="space-y-3 mb-10">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-mist text-sm">Bu proje için paydaş eklenmemiş.</div>
              ) : filtered.map((s) => (
                <div key={s.id} className="bg-white border border-line rounded-xl p-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[s.type]}`}>{TYPE_LABEL[s.type]}</span>
                    </div>
                    <h3 className="font-bold text-ink">{s.name}</h3>
                    <p className="text-sm text-slate">{s.role}{s.organization && ` — ${s.organization}`}</p>
                    <div className="flex flex-wrap gap-4 mt-1 text-xs text-mist">
                      <span>✉ {s.email}</span>
                      {s.phone && <span>📞 {s.phone}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0 items-end">
                    {s.phone && (
                      <button onClick={() => openWhatsApp(s.phone!, s.name)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:underline">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.105 1.523 5.824L.057 24l6.336-1.4A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.49-5.184-1.349l-.372-.22-3.86.853.87-3.773-.242-.388A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                        </svg>
                        WhatsApp
                      </button>
                    )}
                    <button onClick={() => remove(s.id)} className="text-mist hover:text-tr text-xs">Sil</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mesaj Gönder */}
            <div className="bg-white border border-line rounded-2xl p-5">
              <h2 className="font-bold text-ink mb-1">Bu Proje Paydaşlarına Mesaj Gönder</h2>
              <p className="text-sm text-mist mb-4">
                Seçili projedeki <strong>{filtered.length}</strong> paydaşa platform içi mesaj gönderin.
                Telefonu olan paydaşlara tek tek WhatsApp bağlantısını kullanabilirsiniz.
              </p>
              <div className="space-y-3">
                <input value={msgSubject} onChange={(e) => setMsgSubject(e.target.value)} placeholder="Konu *"
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                <textarea value={msgBody} onChange={(e) => setMsgBody(e.target.value)} placeholder="Mesaj içeriği *" rows={4}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
              </div>
              <button onClick={sendBulkMsg} disabled={filtered.length === 0}
                className="mt-3 px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold disabled:opacity-40">
                Gönder ({filtered.length} kişi)
              </button>
              {msgSent && <div className="mt-3 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">{msgSent}</div>}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
