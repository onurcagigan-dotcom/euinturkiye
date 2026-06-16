"use client";

import { useState } from "react";
import { useAdmin } from "@/lib/admin/store";
import { PageHeader, Button, Card, Field, Input, Select } from "@/components/admin/ui";
import type { Donor } from "@/lib/types";

const slugify = (s: string) =>
  s.toLowerCase()
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o")
    .replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const EMPTY = { name: "", shortName: "", type: "other" as Donor["type"], website: "" };

export default function AdminDonors() {
  const { donors, saveDonor, deleteDonor } = useAdmin();
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Donor | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);

  function startEdit(d: Donor) { setEditId(d.id); setDraft({ ...d }); }
  function saveEdit() { if (draft) { saveDonor(draft); setEditId(null); setDraft(null); } }
  function addDonor() {
    if (!form.name.trim() || !form.shortName.trim()) return;
    const id = slugify(form.shortName);
    saveDonor({ id, name: form.name.trim(), shortName: form.shortName.trim(), logo: "", type: form.type, website: form.website || undefined });
    setForm(EMPTY); setAdding(false);
  }

  const TYPE_LABEL: Record<Donor["type"], string> = { eu: "Avrupa Birliği", other: "Diğer Donör" };

  return (
    <>
      <PageHeader title="Donörler" action={<Button onClick={() => setAdding(!adding)}>+ Yeni Donör</Button>} />
      <p className="text-slate text-sm mb-6 -mt-2">
        Donörler projelerin finansman kaynağıdır. &quot;Diğer Donör&quot; olarak işaretlenenler ana sayfadaki &quot;Diğer Donörler&quot; bölümünde gösterilir.
      </p>

      {adding && (
        <Card>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Donör Adı"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Örn: Birleşmiş Milletler Kalkınma Programı" /></Field>
            <Field label="Kısa Ad"><Input value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })} placeholder="Örn: UNDP" /></Field>
            <Field label="Tür">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Donor["type"] })}>
                <option value="eu">Avrupa Birliği</option>
                <option value="other">Diğer Donör</option>
              </Select>
            </Field>
            <Field label="Web Sitesi (ops.)"><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." /></Field>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={addDonor}>Ekle</Button>
            <Button variant="ghost" onClick={() => { setAdding(false); setForm(EMPTY); }}>Vazgeç</Button>
          </div>
        </Card>
      )}

      <div className="bg-white border border-line rounded-xl overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead className="bg-[#f4f6fa] text-left">
            <tr>{["Kısa Ad", "Donör", "Tür", ""].map((h) => (
              <th key={h} className="px-4 py-3 text-xs uppercase tracking-wide text-slate font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {donors.map((d) => (
              <tr key={d.id} className="hover:bg-[#f9fafb]">
                {editId === d.id && draft ? (
                  <>
                    <td className="px-4 py-2 w-28">
                      <input value={draft.shortName} onChange={(e) => setDraft({ ...draft, shortName: e.target.value })} className="w-24 px-2 py-1 rounded border border-line text-sm" />
                    </td>
                    <td className="px-4 py-2">
                      <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-full px-2 py-1 rounded border border-line text-sm" />
                    </td>
                    <td className="px-4 py-2 w-40">
                      <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as Donor["type"] })} className="px-2 py-1 rounded border border-line text-sm">
                        <option value="eu">Avrupa Birliği</option>
                        <option value="other">Diğer Donör</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <button onClick={saveEdit} className="text-eu text-sm font-semibold hover:underline">Kaydet</button>
                      <button onClick={() => { setEditId(null); setDraft(null); }} className="text-slate text-sm hover:underline ml-3">İptal</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium text-ink">{d.shortName}</td>
                    <td className="px-4 py-3 text-slate">{d.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${d.type === "eu" ? "bg-eu-pale text-eu" : "bg-amber-100 text-amber-700"}`}>{TYPE_LABEL[d.type]}</span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => startEdit(d)} className="text-eu text-sm font-semibold hover:underline">Düzenle</button>
                      <button onClick={() => { if (confirm(`"${d.name}" donörü silinsin mi?`)) deleteDonor(d.id); }} className="text-tr text-sm hover:underline ml-3">Sil</button>
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
