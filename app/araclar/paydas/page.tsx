"use client";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { Stakeholder } from "@/lib/types";

const PROJECTS = [
  { id: "tarim-modern", name: "Tarım Modernizasyon" },
  { id: "genc-istihdam", name: "Genç İstihdam" },
  { id: "cevre-iklim", name: "Çevre & İklim" },
];

const TYPE_LABEL = { ekip: "Ekip", uzman: "Uzman", tedarikci: "Tedarikçi", kamu: "Kamu", diger: "Diğer" };
const TYPE_COLOR = { ekip: "bg-blue-100 text-blue-700", uzman: "bg-purple-100 text-purple-700", tedarikci: "bg-orange-100 text-orange-700", kamu: "bg-green-100 text-green-700", diger: "bg-gray-100 text-gray-600" };

const SEED: Stakeholder[] = [
  { id: "stk-1", projectId: "tarim-modern", name: "Dr. Mehmet Çelik", email: "mcelik@tarim.gov.tr", phone: "+90 312 000 0001", organization: "Tarım Bakanlığı", role: "Proje Direktörü", type: "kamu", addedAt: "2023-01-15T09:00:00Z" },
  { id: "stk-2", projectId: "tarim-modern", name: "Sarah Johnson", email: "sjohnson@eu.int", organization: "AB Delegasyonu", role: "Proje Görevlisi", type: "kamu", addedAt: "2023-01-20T09:00:00Z" },
  { id: "stk-3", projectId: "genc-istihdam", name: "Av. Zeynep Arslan", email: "zarslan@hukuk.com", organization: "Arslan Hukuk", role: "Kıdemli Hukuk Uzmanı", type: "uzman", addedAt: "2026-02-01T09:00:00Z" },
  { id: "stk-4", projectId: "tarim-modern", name: "ABC Bilişim Ltd.", email: "info@abcbilisim.com", phone: "+90 212 000 0002", organization: "ABC Bilişim", role: "Yazılım Tedarikçisi", type: "tedarikci", addedAt: "2026-03-15T09:00:00Z" },
];

export default function PaydasPage() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(SEED);
  const [activeProject, setActiveProject] = useState(PROJECTS[0].id);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", organization: "", role: "", type: "ekip" as Stakeholder["type"], notes: "" });

  const filtered = stakeholders.filter((s) => s.projectId === activeProject);
  const byType = (type: Stakeholder["type"]) => filtered.filter((s) => s.type === type);

  const addStakeholder = () => {
    if (!form.name || !form.email) return;
    setStakeholders((prev) => [...prev, {
      id: `stk-${Date.now()}`, projectId: activeProject, ...form,
      addedAt: new Date().toISOString(),
    }]);
    setForm({ name: "", email: "", phone: "", organization: "", role: "", type: "ekip", notes: "" });
    setAdding(false);
  };

  const remove = (id: string) => setStakeholders((prev) => prev.filter((s) => s.id !== id));

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "Paydaş İletişimi" }]} />

        <h1 className="text-2xl font-bold text-ink mb-6">Paydaş İletişimi</h1>

        {/* Proje seçimi */}
        <div className="flex flex-wrap gap-2 mb-6">
          {PROJECTS.map((p) => (
            <button key={p.id} onClick={() => setActiveProject(p.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeProject === p.id ? "bg-eu text-white" : "bg-surface text-slate hover:bg-line"}`}>
              {p.name}
            </button>
          ))}
        </div>

        {/* İstatistik */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {(Object.keys(TYPE_LABEL) as Stakeholder["type"][]).map((t) => (
            <div key={t} className={`rounded-xl p-3 text-center ${TYPE_COLOR[t]}`}>
              <div className="text-xl font-bold">{byType(t).length}</div>
              <div className="text-xs font-semibold">{TYPE_LABEL[t]}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mb-4">
          <button onClick={() => setAdding(true)} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
            + Paydaş Ekle
          </button>
        </div>

        {/* Ekle formu */}
        {adding && (
          <div className="bg-eu-pale border border-eu/20 rounded-xl p-5 mb-5">
            <h3 className="font-bold text-ink mb-3">Yeni Paydaş</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ad Soyad *" className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              <input value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="E-posta *" type="email" className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              <input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Telefon" className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              <input value={form.organization} onChange={(e) => setForm(f => ({ ...f, organization: e.target.value }))} placeholder="Kurum/Şirket" className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              <input value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Rol / Unvan" className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value as Stakeholder["type"] }))} className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu bg-white">
                {(Object.entries(TYPE_LABEL) as [Stakeholder["type"], string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={addStakeholder} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Ekle</button>
              <button onClick={() => setAdding(false)} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
            </div>
          </div>
        )}

        {/* Paydaş listesi */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-mist">Bu proje için paydaş eklenmemiş.</div>
          ) : (
            filtered.map((s) => (
              <div key={s.id} className="bg-white border border-line rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[s.type]}`}>
                      {TYPE_LABEL[s.type]}
                    </span>
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
      </div>
    </PageShell>
  );
}
