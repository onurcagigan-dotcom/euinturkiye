"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/lib/admin/store";
import { PageHeader, Card, Field, Input, Textarea, Select, Button } from "@/components/admin/ui";
import type { Listing, ListingType } from "@/lib/types";

const EMPTY: Listing = {
  id: "", type: "is", title: "", organization: "", locked: false, description: "",
};

export function ListingForm({ existing }: { existing?: Listing }) {
  const router = useRouter();
  const { projects, saveListing } = useAdmin();
  const [form, setForm] = useState<Listing>(existing ?? EMPTY);
  const set = (patch: Partial<Listing>) => setForm((f) => ({ ...f, ...patch }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = form.id || `ilan-${Date.now()}`;
    saveListing({ ...form, id });
    router.push("/admin/ilanlar");
  }

  return (
    <>
      <PageHeader title={existing ? "İlanı Düzenle" : "Yeni İlan"} />
      <form onSubmit={submit}>
        <Card>
          <div className="grid gap-4">
            <Field label="Başlık">
              <Input value={form.title} onChange={(e) => set({ title: e.target.value })} required />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Tür">
                <Select value={form.type} onChange={(e) => set({ type: e.target.value as ListingType })}>
                  <option value="is">İş İlanı</option>
                  <option value="satinalma">Satınalma</option>
                  <option value="ihale">İhale</option>
                </Select>
              </Field>
              <Field label="Kurum">
                <Input value={form.organization} onChange={(e) => set({ organization: e.target.value })} required />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="İlgili Proje (opsiyonel)">
                <Select value={form.projectId ?? ""} onChange={(e) => set({ projectId: e.target.value || undefined })}>
                  <option value="">—</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </Select>
              </Field>
              <Field label="Son Başvuru (opsiyonel)">
                <Input type="date" value={form.deadline ?? ""} onChange={(e) => set({ deadline: e.target.value || undefined })} />
              </Field>
            </div>
            <Field label="Konum (opsiyonel)">
              <Input value={form.location ?? ""} onChange={(e) => set({ location: e.target.value || undefined })} />
            </Field>
            <Field label="Açıklama">
              <Textarea value={form.description} onChange={(e) => set({ description: e.target.value })} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.locked} onChange={(e) => set({ locked: e.target.checked })} />
              Detaylar abonelik gerektirsin (🔒)
            </label>
          </div>
          <div className="flex gap-3 mt-6">
            <Button type="submit">{existing ? "Kaydet" : "Oluştur"}</Button>
            <Button variant="ghost" href="/admin/ilanlar">Vazgeç</Button>
          </div>
        </Card>
      </form>
    </>
  );
}
