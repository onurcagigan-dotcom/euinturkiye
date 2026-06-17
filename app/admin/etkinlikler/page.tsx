"use client";
import { useState } from "react";
import { useAdmin } from "@/lib/admin/store";
import type { EventItem } from "@/lib/types";

const emptyEvent = (): EventItem => ({
  id: `etk-${Date.now()}`, title: "", date: "", location: "", isPublic: true,
});

export default function AdminEtkinliklerPage() {
  const { events, saveEvent, removeEvent, projects } = useAdmin();
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const save = () => { if (!editing || !editing.title || !editing.date) return; saveEvent(editing); setEditing(null); };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">Etkinlikler <span className="text-mist font-normal text-lg">({events.length})</span></h1>
        <button onClick={() => setEditing(emptyEvent())} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
          + Yeni Etkinlik
        </button>
      </div>

      {editing && (
        <div className="bg-white border border-eu/30 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="font-bold text-ink mb-4">{editing.id.startsWith("etk-") && editing.title === "" ? "Yeni Etkinlik" : "Düzenle"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Başlık *</label>
              <input value={editing.title} onChange={e => setEditing(ev => ev && ({ ...ev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Tarih & Saat *</label>
              <input type="datetime-local" value={editing.date.replace("Z", "")} onChange={e => setEditing(ev => ev && ({ ...ev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Konum</label>
              <input value={editing.location} onChange={e => setEditing(ev => ev && ({ ...ev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Kapasite</label>
              <input type="number" value={editing.capacity ?? ""} onChange={e => setEditing(ev => ev && ({ ...ev, capacity: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">İlgili Proje</label>
              <select value={editing.projectId ?? ""} onChange={e => setEditing(ev => ev && ({ ...ev, projectId: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                <option value="">— Seçin —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Açıklama</label>
              <textarea value={editing.description ?? ""} onChange={e => setEditing(ev => ev && ({ ...ev, description: e.target.value }))}
                rows={3} className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="public" checked={editing.isPublic} onChange={e => setEditing(ev => ev && ({ ...ev, isPublic: e.target.checked }))} className="w-4 h-4 accent-eu" />
              <label htmlFor="public" className="text-sm text-slate">Herkese açık etkinlik</label>
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
            <h3 className="font-bold text-ink mb-2">Etkinliği sil?</h3>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { removeEvent(confirmDel); setConfirmDel(null); }} className="px-4 py-2 bg-tr text-white rounded-lg text-sm font-semibold">Sil</button>
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
              <th className="text-left px-4 py-3 font-semibold text-slate">Tarih</th>
              <th className="text-left px-4 py-3 font-semibold text-slate">Konum</th>
              <th className="text-left px-4 py-3 font-semibold text-slate">Erişim</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-t border-line hover:bg-surface/50">
                <td className="px-4 py-3 font-medium text-ink max-w-xs truncate">{e.title}</td>
                <td className="px-4 py-3 text-slate text-xs">{new Date(e.date).toLocaleDateString("tr")}</td>
                <td className="px-4 py-3 text-slate text-xs truncate max-w-[160px]">{e.location}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${e.isPublic ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {e.isPublic ? "Herkese Açık" : "Davetli"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setEditing({ ...e })} className="text-eu text-xs font-semibold hover:underline">Düzenle</button>
                    <button onClick={() => setConfirmDel(e.id)} className="text-mist text-xs hover:text-tr">Sil</button>
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
