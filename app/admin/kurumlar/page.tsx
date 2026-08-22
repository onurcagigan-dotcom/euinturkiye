"use client";
import { useState, useEffect, useCallback } from "react";
import { getDataProvider } from "@/lib/data";
import type { InstitutionProfile } from "@/lib/types";

const TYPE_OPTS = [
  { value: "kamu", label: "Kamu Kurumu" },
  { value: "ozel", label: "Özel Sektör" },
  { value: "stk", label: "STK / Vakıf" },
  { value: "uluslararasi", label: "Uluslararası Kuruluş" },
] as const;

const EMPTY: Omit<InstitutionProfile, "id" | "createdAt" | "updatedAt"> = {
  createdBySubscriberId: "sub-8",
  name: "", shortName: "", institutionType: "kamu",
  description: "", website: "", contactName: "", contactTitle: "",
  contactPhone: "", contactEmail: "", address: "",
};

export default function AdminKurumlarPage() {
  const db = getDataProvider();
  const [institutions, setInstitutions] = useState<InstitutionProfile[]>([]);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editing, setEditing] = useState<InstitutionProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setInstitutions(await db.getInstitutionProfiles());
    setLoading(false);
  }, [db]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!editing || !editing.name.trim()) { alert("Kurum adı gereklidir."); return; }
    await db.saveInstitutionProfile(editing);
    await load();
    setMode("list");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kurumu silmek istediğinizden emin misiniz?")) return;
    await db.removeInstitutionProfile(id);
    await load();
  };

  const newInst = (): InstitutionProfile => ({
    ...EMPTY,
    id: `inst-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const set = (patch: Partial<InstitutionProfile>) => setEditing((p) => p ? { ...p, ...patch } : p);

  if (mode !== "list" && editing) {
    return (
      <div className="p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setMode("list")} className="text-sm text-slate hover:text-ink">← Geri</button>
          <h2 className="text-xl font-bold text-ink">{mode === "create" ? "Yeni Kurum Profili" : "Kurum Düzenle"}</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Kurum Adı *</label>
              <input value={editing.name} onChange={(e) => set({ name: e.target.value })}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Kısa Ad / Kısaltma</label>
              <input value={editing.shortName ?? ""} onChange={(e) => set({ shortName: e.target.value })}
                placeholder="Ör. TCDD, MFİB"
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Kurum Türü</label>
              <select value={editing.institutionType} onChange={(e) => set({ institutionType: e.target.value as InstitutionProfile["institutionType"] })}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                {TYPE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Açıklama</label>
              <textarea value={editing.description ?? ""} onChange={(e) => set({ description: e.target.value })}
                rows={3} className="w-full px-3 py-2 border border-line rounded-lg text-sm resize-none focus:outline-none focus:border-eu" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Web Sitesi</label>
              <input value={editing.website ?? ""} onChange={(e) => set({ website: e.target.value })}
                placeholder="https://..." className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
          </div>
          <p className="text-xs font-bold text-mist uppercase tracking-wide">İletişim Bilgileri</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">İletişim Kişisi</label>
              <input value={editing.contactName ?? ""} onChange={(e) => set({ contactName: e.target.value })}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Unvan</label>
              <input value={editing.contactTitle ?? ""} onChange={(e) => set({ contactTitle: e.target.value })}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Telefon</label>
              <input value={editing.contactPhone ?? ""} onChange={(e) => set({ contactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">E-posta</label>
              <input type="email" value={editing.contactEmail ?? ""} onChange={(e) => set({ contactEmail: e.target.value })}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Adres</label>
              <input value={editing.address ?? ""} onChange={(e) => set({ address: e.target.value })}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="px-5 py-2.5 bg-eu text-white rounded-xl text-sm font-semibold hover:bg-blue-800">
              {mode === "create" ? "Oluştur" : "Kaydet"}
            </button>
            <button onClick={() => setMode("list")} className="px-5 py-2.5 border border-line text-slate rounded-xl text-sm">İptal</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-ink">Kurum Profilleri</h2>
        <button onClick={() => { setEditing(newInst()); setMode("create"); }}
          className="px-4 py-2 bg-eu text-white rounded-xl text-sm font-semibold hover:bg-blue-800">
          + Yeni Kurum
        </button>
      </div>
      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-surface rounded-lg animate-pulse" />)}</div>
      ) : institutions.length === 0 ? (
        <div className="bg-surface rounded-xl p-10 text-center text-slate">Henüz kurum profili yok.</div>
      ) : (
        <div className="bg-white border border-line rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs text-mist uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Kurum</th>
                <th className="px-4 py-3 text-left">Tür</th>
                <th className="px-4 py-3 text-left">İletişim</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {institutions.map((inst) => (
                <tr key={inst.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">{inst.name}</div>
                    {inst.shortName && <div className="text-xs text-mist">{inst.shortName}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-eu-pale text-eu">{TYPE_OPTS.find(o => o.value === inst.institutionType)?.label}</span>
                  </td>
                  <td className="px-4 py-3 text-mist">{inst.contactEmail ?? inst.contactPhone ?? "—"}</td>
                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    <button onClick={() => { setEditing(inst); setMode("edit"); }}
                      className="px-3 py-1 border border-line rounded-lg text-xs hover:bg-surface">Düzenle</button>
                    <button onClick={() => handleDelete(inst.id)}
                      className="px-3 py-1 border border-red-200 text-red-500 rounded-lg text-xs hover:bg-red-50">Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
