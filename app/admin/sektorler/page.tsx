"use client";

import { useState } from "react";
import { useAdmin } from "@/lib/admin/store";
import { PageHeader, Button, Card, Field, Input } from "@/components/admin/ui";
import type { Sector } from "@/lib/types";

const slugify = (s: string) =>
  s.toLowerCase()
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o")
    .replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AdminSectors() {
  const { sectors, saveSector, deleteSector } = useAdmin();
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Sector | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const sorted = [...sectors].sort((a, b) => a.order - b.order);

  function startEdit(s: Sector) { setEditId(s.id); setDraft({ ...s }); }
  function saveEdit() { if (draft) { saveSector(draft); setEditId(null); setDraft(null); } }
  function addSector() {
    if (!newName.trim()) return;
    const id = slugify(newName);
    saveSector({ id, name: newName.trim(), icon: `/images/homepage/sectors/${id}.png`, projectCount: 0, order: sectors.length + 1 });
    setNewName(""); setAdding(false);
  }

  return (
    <>
      <PageHeader title="Sektörler" action={<Button onClick={() => setAdding(!adding)}>+ Yeni Sektör</Button>} />
      <p className="text-slate text-sm mb-6 -mt-2">
        Sektörler, proje portföyünün sınıflandırma temelidir. Proje sayıları ana sayfadaki sektör kartlarında gösterilir.
      </p>

      {adding && (
        <Card>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Field label="Sektör Adı">
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Örn: Sağlık" />
              </Field>
            </div>
            <Button onClick={addSector}>Ekle</Button>
            <Button variant="ghost" onClick={() => { setAdding(false); setNewName(""); }}>Vazgeç</Button>
          </div>
          <p className="text-xs text-mist mt-2">Not: İkon görseli /images/homepage/sectors/ altına eklenmelidir.</p>
        </Card>
      )}

      <div className="bg-white border border-line rounded-xl overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead className="bg-[#f4f6fa] text-left">
            <tr>{["Sıra", "Sektör", "Proje Sayısı", ""].map((h) => (
              <th key={h} className="px-4 py-3 text-xs uppercase tracking-wide text-slate font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sorted.map((s) => (
              <tr key={s.id} className="hover:bg-[#f9fafb]">
                {editId === s.id && draft ? (
                  <>
                    <td className="px-4 py-2 w-20">
                      <input type="number" value={draft.order} onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })}
                        className="w-16 px-2 py-1 rounded border border-line text-sm" />
                    </td>
                    <td className="px-4 py-2">
                      <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        className="w-full px-2 py-1 rounded border border-line text-sm" />
                    </td>
                    <td className="px-4 py-2 w-32">
                      <input type="number" value={draft.projectCount} onChange={(e) => setDraft({ ...draft, projectCount: Number(e.target.value) })}
                        className="w-24 px-2 py-1 rounded border border-line text-sm" />
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <button onClick={saveEdit} className="text-eu text-sm font-semibold hover:underline">Kaydet</button>
                      <button onClick={() => { setEditId(null); setDraft(null); }} className="text-slate text-sm hover:underline ml-3">İptal</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-slate">{s.order}</td>
                    <td className="px-4 py-3 font-medium text-ink">{s.name}</td>
                    <td className="px-4 py-3 text-slate">{s.projectCount}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => startEdit(s)} className="text-eu text-sm font-semibold hover:underline">Düzenle</button>
                      <button onClick={() => { if (confirm(`"${s.name}" sektörü silinsin mi?`)) deleteSector(s.id); }} className="text-tr text-sm hover:underline ml-3">Sil</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
