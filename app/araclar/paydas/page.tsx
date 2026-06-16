"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import type { Stakeholder, Project, Subscriber } from "@/lib/types";

const TYPES: Record<Stakeholder["type"], { label: string; cls: string }> = {
  ekip: { label: "Ekip", cls: "bg-eu-pale text-eu" },
  uzman: { label: "Uzman", cls: "bg-purple-100 text-purple-700" },
  tedarikci: { label: "Tedarikçi", cls: "bg-amber-100 text-amber-700" },
  kamu: { label: "Kamu", cls: "bg-green-100 text-green-700" },
  diger: { label: "Diğer", cls: "bg-line text-slate" },
};
const TYPE_ORDER: Stakeholder["type"][] = ["ekip", "uzman", "tedarikci", "kamu", "diger"];

const EMPTY: Omit<Stakeholder, "id" | "addedAt"> = {
  name: "", email: "", phone: "", organization: "", role: "", type: "ekip", notes: "",
};

export default function StakeholderToolPage() {
  const db = getDataProvider();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<string>("all");
  const [filterType, setFilterType] = useState<"all" | Stakeholder["type"]>("all");
  const [list, setList] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [editing, setEditing] = useState<Stakeholder | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { db.getProjects().then(setProjects); }, [db]);

  const load = useCallback(() => {
    setLoading(true);
    db.getStakeholders(activeProject === "all" ? undefined : activeProject).then((s) => {
      setList(s); setLoading(false);
    });
  }, [db, activeProject]);
  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditing(null); setForm(EMPTY); setShowForm(true);
  }
  function openEdit(s: Stakeholder) {
    setEditing(s);
    setForm({ name: s.name, email: s.email, phone: s.phone ?? "", organization: s.organization ?? "", role: s.role, type: s.type, notes: s.notes ?? "" });
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const item: Stakeholder = {
      id: editing?.id ?? `stk-${Date.now()}`,
      projectId: activeProject === "all" ? editing?.projectId : activeProject,
      name: form.name, email: form.email,
      phone: form.phone || undefined, organization: form.organization || undefined,
      role: form.role, type: form.type, notes: form.notes || undefined,
      addedAt: editing?.addedAt ?? new Date().toISOString(),
    };
    await db.saveStakeholder(item);
    setShowForm(false); setEditing(null); load();
  }

  async function remove(id: string) {
    if (!confirm("Paydaş silinsin mi?")) return;
    await db.removeStakeholder(id); load();
  }

  async function addToNewsletter(s: Stakeholder) {
    // Paydaşı bülten abonesine dönüştür (e-posta benzersizliği kontrolü)
    const existing = await db.getSubscribers();
    if (existing.some((x) => x.email.toLowerCase() === s.email.toLowerCase())) {
      alert(`${s.email} zaten bülten listesinde.`);
      return;
    }
    const sub: Subscriber = {
      id: `sub-${Date.now()}`,
      email: s.email,
      name: s.name,
      organization: s.organization,
      tags: [s.type], // paydaş türü etiket olur (ekip/uzman/tedarikci/kamu)
      subscribed: true,
      addedAt: new Date().toISOString(),
    };
    await db.saveSubscriber(sub);
    alert(`${s.name} bülten listesine eklendi (etiket: ${s.type}).`);
  }

  function exportCsv() {
    const rows = [
      ["Ad", "Rol", "Tür", "Kurum", "E-posta", "Telefon"],
      ...filtered.map((s) => [s.name, s.role, TYPES[s.type].label, s.organization ?? "", s.email, s.phone ?? ""]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "paydaslar.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = filterType === "all" ? list : list.filter((s) => s.type === filterType);
  const projectName = (id?: string) => id ? projects.find((p) => p.id === id)?.title ?? id : "Genel";

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <PageShell>
      <div className="bg-eu-deep text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <Link href="/araclar" className="text-white/70 text-sm hover:text-white">← Araçlar</Link>
          <h1 className="text-2xl md:text-3xl font-bold mt-3">Paydaş İletişimi</h1>
          <p className="text-white/80 mt-2">Ekip, uzman, tedarikçi ve kamu muhataplarınızı tek rehberde yönetin.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Proje filtresi */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Chip active={activeProject === "all"} onClick={() => setActiveProject("all")} label="Tüm Projeler" />
          {projects.map((p) => (
            <Chip key={p.id} active={activeProject === p.id} onClick={() => setActiveProject(p.id)} label={p.title} />
          ))}
        </div>

        {/* Tür filtresi + aksiyonlar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            <TypeChip active={filterType === "all"} onClick={() => setFilterType("all")} label="Tümü" />
            {TYPE_ORDER.map((t) => (
              <TypeChip key={t} active={filterType === t} onClick={() => setFilterType(t)} label={TYPES[t].label} />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={exportCsv} className="px-4 py-2 rounded-lg border border-line text-sm font-semibold text-ink hover:bg-line/40">CSV İndir</button>
            <button onClick={openNew} className="px-4 py-2 rounded-lg bg-eu text-white text-sm font-semibold">+ Yeni Paydaş</button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={submit} className="bg-white border border-line rounded-xl p-5 mb-6">
            <h3 className="font-bold text-ink mb-4">{editing ? "Paydaşı Düzenle" : "Yeni Paydaş"}</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <input required value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ad Soyad / Kuruluş" className={inp} />
              <input required value={form.role} onChange={(e) => set({ role: e.target.value })} placeholder="Rol / Görev" className={inp} />
              <input required type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="E-posta" className={inp} />
              <input value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="Telefon (ops.)" className={inp} />
              <input value={form.organization} onChange={(e) => set({ organization: e.target.value })} placeholder="Kurum (ops.)" className={inp} />
              <select value={form.type} onChange={(e) => set({ type: e.target.value as Stakeholder["type"] })} className={inp}>
                {TYPE_ORDER.map((t) => <option key={t} value={t}>{TYPES[t].label}</option>)}
              </select>
              <textarea value={form.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Not (ops.)" className={`${inp} sm:col-span-2 min-h-[70px]`} />
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" className="px-5 py-2 rounded-lg bg-eu text-white text-sm font-semibold">{editing ? "Kaydet" : "Ekle"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg text-sm text-slate">Vazgeç</button>
            </div>
          </form>
        )}

        {/* Liste */}
        {loading ? (
          <p className="text-slate">Yükleniyor…</p>
        ) : filtered.length === 0 ? (
          <p className="text-slate text-sm py-10 text-center bg-white border border-line rounded-xl">
            Bu seçimde paydaş yok. Yukarıdan ekleyin.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <div key={s.id} className="bg-white border border-line rounded-xl p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-ink">{s.name}</h3>
                    <p className="text-sm text-slate">{s.role}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${TYPES[s.type].cls}`}>{TYPES[s.type].label}</span>
                </div>
                <div className="mt-3 space-y-1 text-sm text-slate">
                  {s.organization && <p>🏢 {s.organization}</p>}
                  <p>✉️ <a href={`mailto:${s.email}`} className="text-eu hover:underline">{s.email}</a></p>
                  {s.phone && <p>📞 {s.phone}</p>}
                  {activeProject === "all" && <p className="text-xs text-mist">Proje: {projectName(s.projectId)}</p>}
                </div>
                {s.notes && <p className="text-xs text-slate mt-2 italic">{s.notes}</p>}
                <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-line">
                  <button onClick={() => openEdit(s)} className="text-eu text-sm font-semibold hover:underline">Düzenle</button>
                  <button onClick={() => addToNewsletter(s)} className="text-purple-700 text-sm font-semibold hover:underline">Bültene Ekle</button>
                  <button onClick={() => remove(s.id)} className="text-tr text-sm hover:underline">Sil</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <p className="text-sm text-slate mt-4">{filtered.length} paydaş gösteriliyor.</p>
        )}
      </div>
    </PageShell>
  );
}

const inp = "px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-eu/30";

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition ${active ? "bg-eu text-white" : "bg-white border border-line text-slate hover:border-eu/40"}`}>
      {label}
    </button>
  );
}
function TypeChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${active ? "bg-ink text-white" : "bg-white border border-line text-slate hover:border-ink/30"}`}>
      {label}
    </button>
  );
}
