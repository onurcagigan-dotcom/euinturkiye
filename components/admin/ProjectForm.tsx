"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/lib/admin/store";
import { PageHeader, Card, Field, Input, Textarea, Select, Button } from "@/components/admin/ui";
import type { Project, IpaPeriod } from "@/lib/types";

const EMPTY: Project = {
  id: "", title: "", summary: "", sectorId: "", donorId: "eu",
  ipaPeriod: "ipa-3", beneficiary: "", locations: [], status: "devam",
  featured: false,
};

const slugify = (s: string) =>
  s.toLowerCase()
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o")
    .replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function ProjectForm({ existing }: { existing?: Project }) {
  const router = useRouter();
  const { sectors, donors, saveProject } = useAdmin();
  const [form, setForm] = useState<Project>(existing ?? EMPTY);

  const set = (patch: Partial<Project>) => setForm((f) => ({ ...f, ...patch }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = form.id || slugify(form.title) || `proje-${Date.now()}`;
    saveProject({ ...form, id });
    router.push("/admin/projeler");
  }

  return (
    <>
      <PageHeader title={existing ? "Projeyi Düzenle" : "Yeni Proje"} />
      <form onSubmit={submit}>
        <Card>
          <div className="grid gap-4">
            <Field label="Başlık">
              <Input value={form.title} onChange={(e) => set({ title: e.target.value })} required />
            </Field>
            <Field label="Özet">
              <Textarea value={form.summary} onChange={(e) => set({ summary: e.target.value })} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Sektör">
                <Select value={form.sectorId} onChange={(e) => set({ sectorId: e.target.value })} required>
                  <option value="">Seçiniz…</option>
                  {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </Field>
              <Field label="Donör">
                <Select value={form.donorId} onChange={(e) => set({ donorId: e.target.value })}>
                  {donors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="IPA Dönemi">
                <Select value={form.ipaPeriod} onChange={(e) => set({ ipaPeriod: e.target.value as IpaPeriod })}>
                  <option value="ipa-oncesi">IPA Öncesi (2002–2006)</option>
                  <option value="ipa-1">IPA I (2007–2013)</option>
                  <option value="ipa-2">IPA II (2014–2020)</option>
                  <option value="ipa-3">IPA III (2021–2027)</option>
                </Select>
              </Field>
              <Field label="Durum">
                <Select value={form.status} onChange={(e) => set({ status: e.target.value as Project["status"] })}>
                  <option value="planlama">Planlama</option>
                  <option value="devam">Devam ediyor</option>
                  <option value="tamamlandi">Tamamlandı</option>
                </Select>
              </Field>
            </div>
            <Field label="Yararlanıcı Kurum">
              <Input value={form.beneficiary} onChange={(e) => set({ beneficiary: e.target.value })} />
            </Field>
            <Field label="İller (virgülle ayırın)">
              <Input
                value={form.locations.join(", ")}
                onChange={(e) => set({ locations: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
                placeholder="Ankara, İzmir, Bursa"
              />
            </Field>
            <Field label="Bütçe (opsiyonel)">
              <Input value={form.budget ?? ""} onChange={(e) => set({ budget: e.target.value })} placeholder="4.200.000 €" />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Başlangıç Tarihi">
                <Input type="date" value={form.startDate ?? ""} onChange={(e) => set({ startDate: e.target.value || undefined })} />
              </Field>
              <Field label="Bitiş Tarihi">
                <Input type="date" value={form.endDate ?? ""} onChange={(e) => set({ endDate: e.target.value || undefined })} />
              </Field>
            </div>
            <p className="text-xs text-mist -mt-1">
              Başlangıç ve bitiş tarihini girdiğinizde, proje sayfasında otomatik ilerleme çubuğu oluşur.
            </p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set({ featured: e.target.checked })}
              />
              Ana sayfada öne çıkar
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isArchive ?? false}
                onChange={(e) => set({ isArchive: e.target.checked })}
              />
              Arşiv projesi (geçmiş dönem, henüz bir şirkete bağlı değil)
            </label>
            {form.ownerSubscriberId ? (
              <p className="text-xs text-green-700">Bu proje bir aboneye atanmış (sahip: {form.ownerSubscriberId}).</p>
            ) : (
              <p className="text-xs text-mist">Bu proje sahipsiz. Şirketler portföye ekleme talebi gönderebilir; talepleri &quot;Sahiplik Talepleri&quot; sayfasından yönetebilirsiniz.</p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="submit">{existing ? "Kaydet" : "Oluştur"}</Button>
            <Button variant="ghost" href="/admin/projeler">Vazgeç</Button>
          </div>
        </Card>
      </form>
    </>
  );
}
