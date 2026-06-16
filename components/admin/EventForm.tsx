"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/lib/admin/store";
import { PageHeader, Card, Field, Input, Textarea, Select, Button } from "@/components/admin/ui";
import type { EventItem } from "@/lib/types";

const EMPTY: EventItem = {
  id: "", title: "", date: "", location: "", isPublic: true,
};

export function EventForm({ existing }: { existing?: EventItem }) {
  const router = useRouter();
  const { projects, saveEvent } = useAdmin();
  const [form, setForm] = useState<EventItem>(existing ?? EMPTY);
  const set = (patch: Partial<EventItem>) => setForm((f) => ({ ...f, ...patch }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = form.id || `etkinlik-${Date.now()}`;
    saveEvent({ ...form, id });
    router.push("/admin/etkinlikler");
  }

  return (
    <>
      <PageHeader title={existing ? "Etkinliği Düzenle" : "Yeni Etkinlik"} />
      <form onSubmit={submit}>
        <Card>
          <div className="grid gap-4">
            <Field label="Başlık">
              <Input value={form.title} onChange={(e) => set({ title: e.target.value })} required />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Tarih">
                <Input type="date" value={form.date} onChange={(e) => set({ date: e.target.value })} required />
              </Field>
              <Field label="Konum">
                <Input value={form.location} onChange={(e) => set({ location: e.target.value })} required />
              </Field>
            </div>
            <Field label="İlgili Proje (opsiyonel)">
              <Select value={form.projectId ?? ""} onChange={(e) => set({ projectId: e.target.value || undefined })}>
                <option value="">—</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </Select>
            </Field>
            <Field label="Açıklama (opsiyonel)">
              <Textarea value={form.description ?? ""} onChange={(e) => set({ description: e.target.value || undefined })} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isPublic} onChange={(e) => set({ isPublic: e.target.checked })} />
              Herkese açık etkinlik
            </label>
          </div>
          <div className="flex gap-3 mt-6">
            <Button type="submit">{existing ? "Kaydet" : "Oluştur"}</Button>
            <Button variant="ghost" href="/admin/etkinlikler">Vazgeç</Button>
          </div>
        </Card>
      </form>
    </>
  );
}
