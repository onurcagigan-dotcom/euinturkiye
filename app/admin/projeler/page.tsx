"use client";
import { useState } from "react";
import { useAdmin } from "@/lib/admin/store";
import type { Project, IpaPeriod } from "@/lib/types";

const SECTORS = [
  { id: "tarim", name: "Tarım & Kırsal Kalkınma" }, { id: "cevre", name: "Çevre & İklim" },
  { id: "egitim", name: "Eğitim & Gençlik" }, { id: "istihdam", name: "İstihdam & Sosyal Politika" },
  { id: "enerji", name: "Enerji & Altyapı" }, { id: "adalet", name: "Adalet & İçişleri" },
  { id: "saglik", name: "Sağlık & Sosyal Hizmetler" }, { id: "rekabet", name: "Rekabetçilik & KOBİ" },
  { id: "bolgesel", name: "Bölgesel Kalkınma" }, { id: "dijital", name: "Dijital Dönüşüm" },
];
const DONORS = [{ id: "eu", name: "Avrupa Birliği" }, { id: "wb", name: "Dünya Bankası" }, { id: "giz", name: "GIZ" }, { id: "usaid", name: "USAID" }, { id: "undp", name: "UNDP" }];
const PERIODS: IpaPeriod[] = ["IPA-I", "IPA-II", "IPA-III", "IPA-IV"];
const STATUS_LABEL = { devam: "Devam Ediyor", tamamlandi: "Tamamlandı", planlama: "Planlama" };

const emptyProject = (): Project => ({
  id: `prj-${Date.now()}`, title: "", summary: "", sectorId: "tarim", donorId: "eu",
  ipaPeriod: "IPA-IV", beneficiary: "", locations: [], status: "devam", featured: false,
});

export default function AdminProjelerPage() {
  const { projects, saveProject, removeProject } = useAdmin();
  const [editing, setEditing] = useState<Project | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const save = () => { if (!editing || !editing.title) return; saveProject(editing); setEditing(null); };
  const del = (id: string) => { removeProject(id); setConfirmDel(null); };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">Projeler <span className="text-mist font-normal text-lg">({projects.length})</span></h1>
        <button onClick={() => setEditing(emptyProject())} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
          + Yeni Proje
        </button>
      </div>

      {/* Form */}
      {editing && (
        <div className="bg-white border border-eu/30 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="font-bold text-ink mb-4">{editing.id.startsWith("prj-") ? "Yeni Proje" : "Düzenle"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Başlık *</label>
              <input value={editing.title} onChange={e => setEditing(p => p && ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Özet</label>
              <textarea value={editing.summary} onChange={e => setEditing(p => p && ({ ...p, summary: e.target.value }))}
                rows={2} className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Sektör</label>
              <select value={editing.sectorId} onChange={e => setEditing(p => p && ({ ...p, sectorId: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu bg-white">
                {SECTORS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Donör</label>
              <select value={editing.donorId} onChange={e => setEditing(p => p && ({ ...p, donorId: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu bg-white">
                {DONORS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">IPA Dönemi</label>
              <select value={editing.ipaPeriod} onChange={e => setEditing(p => p && ({ ...p, ipaPeriod: e.target.value as IpaPeriod }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu bg-white">
                {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Durum</label>
              <select value={editing.status} onChange={e => setEditing(p => p && ({ ...p, status: e.target.value as Project["status"] }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu bg-white">
                {(Object.entries(STATUS_LABEL) as [Project["status"], string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Yararlanıcı</label>
              <input value={editing.beneficiary} onChange={e => setEditing(p => p && ({ ...p, beneficiary: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Uygulama İlleri (virgülle ayır)</label>
              <input value={editing.locations.join(", ")} onChange={e => setEditing(p => p && ({ ...p, locations: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Bütçe</label>
              <input value={editing.budget ?? ""} onChange={e => setEditing(p => p && ({ ...p, budget: e.target.value }))}
                placeholder="€12.5M" className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Başlangıç</label>
              <input type="date" value={editing.startDate ?? ""} onChange={e => setEditing(p => p && ({ ...p, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Bitiş</label>
              <input type="date" value={editing.endDate ?? ""} onChange={e => setEditing(p => p && ({ ...p, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Amaç ve Hedefler</label>
              <textarea value={editing.objective ?? ""} onChange={e => setEditing(p => p && ({ ...p, objective: e.target.value }))}
                rows={2} className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Beklenen Çıktılar</label>
              <textarea value={editing.expectedOutputs ?? ""} onChange={e => setEditing(p => p && ({ ...p, expectedOutputs: e.target.value }))}
                rows={2} className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Faaliyetler</label>
              <textarea value={editing.activities ?? ""} onChange={e => setEditing(p => p && ({ ...p, activities: e.target.value }))}
                rows={2} className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="featured" checked={editing.featured} onChange={e => setEditing(p => p && ({ ...p, featured: e.target.checked }))} className="w-4 h-4 accent-eu" />
              <label htmlFor="featured" className="text-sm text-slate">Ana sayfada öne çıkar</label>
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={save} className="px-5 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Kaydet</button>
            <button onClick={() => setEditing(null)} className="px-5 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
          </div>
        </div>
      )}

      {/* Silme onayı */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-bold text-ink mb-2">Projeyi sil?</h3>
            <p className="text-slate text-sm mb-4">Bu işlem geri alınamaz.</p>
            <div className="flex gap-2">
              <button onClick={() => del(confirmDel)} className="px-4 py-2 bg-tr text-white rounded-lg text-sm font-semibold">Sil</button>
              <button onClick={() => setConfirmDel(null)} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
            </div>
          </div>
        </div>
      )}

      {/* Tablo */}
      <div className="bg-white border border-line rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-surface border-b border-line">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate">Başlık</th>
              <th className="text-left px-4 py-3 font-semibold text-slate">Sektör</th>
              <th className="text-left px-4 py-3 font-semibold text-slate">Dönem</th>
              <th className="text-left px-4 py-3 font-semibold text-slate">Durum</th>
              <th className="text-left px-4 py-3 font-semibold text-slate">Öne Çıkan</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-t border-line hover:bg-surface/50">
                <td className="px-4 py-3 font-medium text-ink max-w-xs truncate">{p.title}</td>
                <td className="px-4 py-3 text-slate text-xs">{SECTORS.find(s => s.id === p.sectorId)?.name ?? p.sectorId}</td>
                <td className="px-4 py-3 text-slate">{p.ipaPeriod}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.status === "devam" ? "bg-green-100 text-green-700" : p.status === "tamamlandi" ? "bg-gray-100 text-gray-600" : "bg-yellow-100 text-yellow-700"}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">{p.featured ? "⭐" : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setEditing({ ...p })} className="text-eu text-xs font-semibold hover:underline">Düzenle</button>
                    <button onClick={() => setConfirmDel(p.id)} className="text-mist text-xs hover:text-tr">Sil</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
