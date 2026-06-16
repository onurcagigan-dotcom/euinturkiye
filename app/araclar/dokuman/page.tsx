"use client";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { ProjectDocument } from "@/lib/types";

const PROJECTS = [
  { id: "all", name: "Tüm Projeler" },
  { id: "tarim-modern", name: "Tarım Modernizasyon" },
  { id: "genc-istihdam", name: "Genç İstihdam" },
  { id: "cevre-iklim", name: "Çevre & İklim" },
];

const CATS = ["rapor", "sunum", "sozlesme", "diger"] as const;
const CAT_LABEL = { rapor: "Rapor", sunum: "Sunum", sozlesme: "Sözleşme", diger: "Diğer" };
const ACCESS_LABEL = { herkes: "Herkese Açık", uye: "Üyelere", ekip: "Ekip" };
const ACCESS_COLOR = { herkes: "bg-green-100 text-green-700", uye: "bg-blue-100 text-blue-700", ekip: "bg-orange-100 text-orange-700" };

const SEED: ProjectDocument[] = [
  { id: "doc-1", projectId: "tarim-modern", name: "İlerleme Raporu Q1 2026.pdf", category: "rapor", accessLevel: "ekip", fileSize: "2.4 MB", uploadedAt: "2026-04-01T09:00:00Z", downloadCount: 12 },
  { id: "doc-2", projectId: "tarim-modern", name: "Eğitim Materyalleri.pptx", category: "sunum", accessLevel: "uye", fileSize: "8.1 MB", uploadedAt: "2026-03-15T10:00:00Z", downloadCount: 45 },
  { id: "doc-3", projectId: "genc-istihdam", name: "Proje Sözleşmesi.pdf", category: "sozlesme", accessLevel: "ekip", fileSize: "1.2 MB", uploadedAt: "2022-06-01T09:00:00Z", downloadCount: 5 },
  { id: "doc-4", projectId: "cevre-iklim", name: "Çevre Durum Raporu.pdf", category: "rapor", accessLevel: "herkes", fileSize: "3.7 MB", uploadedAt: "2026-05-10T09:00:00Z", downloadCount: 78 },
];

export default function DokumanAraciPage() {
  const [docs, setDocs] = useState<ProjectDocument[]>(SEED);
  const [activeProject, setActiveProject] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "rapor" as typeof CATS[number], accessLevel: "ekip" as "herkes" | "uye" | "ekip", projectId: "tarim-modern" });

  const filtered = activeProject === "all" ? docs : docs.filter((d) => d.projectId === activeProject);

  const addDoc = () => {
    if (!form.name) return;
    setDocs((prev) => [{
      id: `doc-${Date.now()}`, ...form,
      fileSize: "—", uploadedAt: new Date().toISOString(), downloadCount: 0,
    }, ...prev]);
    setShowForm(false);
    setForm({ name: "", category: "rapor", accessLevel: "ekip", projectId: "tarim-modern" });
  };

  const incrementDownload = (id: string) => {
    setDocs((prev) => prev.map((d) => d.id === id ? { ...d, downloadCount: d.downloadCount + 1 } : d));
  };

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "E-Doküman Yönetimi" }]} />

        <h1 className="text-2xl font-bold text-ink mb-6">E-Doküman Yönetimi</h1>

        {/* Proje filtresi */}
        <div className="flex flex-wrap gap-2 mb-6">
          {PROJECTS.map((p) => (
            <button key={p.id} onClick={() => setActiveProject(p.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeProject === p.id ? "bg-eu text-white" : "bg-surface text-slate hover:bg-line"}`}>
              {p.name}
            </button>
          ))}
        </div>

        {/* Ekle butonu */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-mist">{filtered.length} doküman</span>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
            + Doküman Ekle
          </button>
        </div>

        {/* Ekle formu */}
        {showForm && (
          <div className="bg-eu-pale border border-eu/20 rounded-xl p-5 mb-5">
            <h3 className="font-bold text-ink mb-3">Yeni Doküman</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Dosya adı *" className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              <select value={form.projectId} onChange={(e) => setForm(f => ({ ...f, projectId: e.target.value }))}
                className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu bg-white">
                {PROJECTS.filter(p => p.id !== "all").map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value as typeof CATS[number] }))}
                className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu bg-white">
                {CATS.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
              </select>
              <select value={form.accessLevel} onChange={(e) => setForm(f => ({ ...f, accessLevel: e.target.value as "herkes" | "uye" | "ekip" }))}
                className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu bg-white">
                <option value="herkes">Herkese Açık</option>
                <option value="uye">Üyelere</option>
                <option value="ekip">Ekip</option>
              </select>
            </div>
            <p className="text-xs text-mist mb-3">Demo modunda dosya meta-verisi kaydedilir; Firebase bağlanınca gerçek yükleme aktif olur.</p>
            <div className="flex gap-2">
              <button onClick={addDoc} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Kaydet</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
            </div>
          </div>
        )}

        {/* Doküman listesi */}
        <div className="bg-white border border-line rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-line">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate">Dosya Adı</th>
                <th className="text-left px-4 py-3 font-semibold text-slate">Kategori</th>
                <th className="text-left px-4 py-3 font-semibold text-slate">Erişim</th>
                <th className="text-left px-4 py-3 font-semibold text-slate">Boyut</th>
                <th className="text-right px-4 py-3 font-semibold text-slate">İndirme</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-mist">Doküman bulunamadı.</td></tr>
              ) : filtered.map((d) => (
                <tr key={d.id} className="border-t border-line hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">📄 {d.name}</span>
                  </td>
                  <td className="px-4 py-3 text-slate">{CAT_LABEL[d.category]}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ACCESS_COLOR[d.accessLevel]}`}>
                      {ACCESS_LABEL[d.accessLevel]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-mist text-xs">{d.fileSize ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-slate font-semibold">{d.downloadCount}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => incrementDownload(d.id)} className="text-eu text-xs font-semibold hover:underline">İndir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
