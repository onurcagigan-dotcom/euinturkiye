"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/lib/admin/store";
import { PageHeader, Card, Field, Input, Textarea, Button } from "@/components/admin/ui";
import type { BlogPost } from "@/lib/types";

const EMPTY: BlogPost = {
  id: "", slug: "", title: "", category: "", excerpt: "", content: "",
  publishedAt: new Date().toISOString().slice(0, 10), readMinutes: 5,
};

const slugify = (s: string) =>
  s.toLowerCase()
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o")
    .replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function BlogForm({ existing }: { existing?: BlogPost }) {
  const router = useRouter();
  const { saveBlogPost } = useAdmin();
  const [form, setForm] = useState<BlogPost>(existing ?? EMPTY);
  const set = (patch: Partial<BlogPost>) => setForm((f) => ({ ...f, ...patch }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = form.id || `yazi-${Date.now()}`;
    const slug = form.slug || slugify(form.title);
    saveBlogPost({ ...form, id, slug });
    router.push("/admin/blog");
  }

  return (
    <>
      <PageHeader title={existing ? "Yazıyı Düzenle" : "Yeni Yazı"} />
      <form onSubmit={submit}>
        <Card>
          <div className="grid gap-4">
            <Field label="Başlık">
              <Input value={form.title} onChange={(e) => set({ title: e.target.value })} required />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Kategori">
                <Input value={form.category} onChange={(e) => set({ category: e.target.value })} placeholder="IPA III, Görünürlük…" />
              </Field>
              <Field label="Yayın Tarihi">
                <Input type="date" value={form.publishedAt} onChange={(e) => set({ publishedAt: e.target.value })} />
              </Field>
            </div>
            <Field label="Özet">
              <Textarea value={form.excerpt} onChange={(e) => set({ excerpt: e.target.value })} />
            </Field>
            <Field label="İçerik">
              <Textarea value={form.content} onChange={(e) => set({ content: e.target.value })} />
            </Field>
            <Field label="Okuma Süresi (dakika)">
              <Input type="number" min={1} value={form.readMinutes} onChange={(e) => set({ readMinutes: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="flex gap-3 mt-6">
            <Button type="submit">{existing ? "Kaydet" : "Oluştur"}</Button>
            <Button variant="ghost" href="/admin/blog">Vazgeç</Button>
          </div>
        </Card>
      </form>
    </>
  );
}
