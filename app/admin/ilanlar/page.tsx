"use client";
import { useState } from "react";
import { useAdmin } from "@/lib/admin/store";
import type { Listing, ListingType } from "@/lib/types";

const TYPE_LABEL: Record<ListingType, string> = { is: "İş İlanı", satinalma: "Satınalma", ihale: "İhale" };

const emptyListing = (): Listing => ({
  id: `ilan-${Date.now()}`, type: "is", title: "", organization: "", location: "",
  deadline: "", locked: false, description: "",
});

export default function AdminIlanlarPage() {
  const { listings, saveListing, removeListing, projects } = useAdmin();
  const [editing, setEditing] = useState<Listing | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const save = () => { if (!editing || !editing.title) return; saveListing(editing); setEditing(null); };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">İlanlar <span className="text-mist font-normal text-lg">({listings.length})</span></h1>
        <button onClick={() => setEditing(emptyListing())} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
          + Yeni İlan
        </button>
      </div>

      {editing && (
        <div className="bg-white border border-eu/30 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="font-bold text-ink mb-4">{editing.id.startsWith("ilan-") ? "Yeni İlan" : "Düzenle"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Başlık *</label>
              <input value={editing.title} onChange={e => setEditing(l => l && ({ ...l, title: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Tür</label>
              <select value={editing.type} onChange={e => setEditing(l => l && ({ ...l, type: e.target.value as ListingType }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                {(Object.entries(TYPE_LABEL) as [ListingType, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Kurum</label>
              <input value={editing.organization} onChange={e => setEditing(l => l && ({ ...l, organization: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Lokasyon</label>
              <input value={editing.location ?? ""} onChange={e => setEditing(l => l && ({ ...l, location: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Son Başvuru</label>
              <input type="date" value={editing.deadline ?? ""} onChange={e => setEditing(l => l && ({ ...l, deadline: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">İlgili Proje</label>
              <select value={editing.projectId ?? ""} onChange={e => setEditing(l => l && ({ ...l, projectId: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                <option value="">— Seçin —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="locked" checked={editing.locked} onChange={e => setEditing(l => l && ({ ...l, locked: e.target.checked }))} className="w-4 h-4 accent-eu" />
              <label htmlFor="locked" className="text-sm text-slate">🔒 Abonelik gerektirir</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Açıklama</label>
              <textarea value={editing.description} onChange={e => setEditing(l => l && ({ ...l, description: e.target.value }))}
                rows={4} className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={save} className="px-5 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Kaydet</button>
            <button onClick={() => setEditing(null)} className="px-5 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-ink mb-2">İlanı sil?</h3>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { removeListing(confirmDel); setConfirmDel(null); }} className="px-4 py-2 bg-tr text-white rounded-lg text-sm font-semibold">Sil</button>
              <button onClick={() => setConfirmDel(null)} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-line rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="bg-surface border-b border-line">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate">Başlık</th>
              <th className="text-left px-4 py-3 font-semibold text-slate">Tür</th>
              <th className="text-left px-4 py-3 font-semibold text-slate">Son Başvuru</th>
              <th className="text-left px-4 py-3 font-semibold text-slate">Kilitli</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id} className="border-t border-line hover:bg-surface/50">
                <td className="px-4 py-3 font-medium text-ink max-w-xs truncate">{l.title}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${l.type === "is" ? "bg-blue-100 text-blue-700" : l.type === "satinalma" ? "bg-orange-100 text-orange-700" : "bg-purple-100 text-purple-700"}`}>
                    {TYPE_LABEL[l.type]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate text-xs">{l.deadline ?? "—"}</td>
                <td className="px-4 py-3 text-center">{l.locked ? "🔒" : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setEditing({ ...l })} className="text-eu text-xs font-semibold hover:underline">Düzenle</button>
                    <button onClick={() => setConfirmDel(l.id)} className="text-mist text-xs hover:text-tr">Sil</button>
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
