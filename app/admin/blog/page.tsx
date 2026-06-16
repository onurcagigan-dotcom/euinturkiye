"use client";
import { useState } from "react";
import { useAdmin } from "@/lib/admin/store";
import type { BlogPost } from "@/lib/types";

const CATS = ["AB Politikası", "Fonlar & Finansman", "Proje Haberleri", "Etkinlikler", "Duyurular"];

const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9ğüşıöçğüşöç\s-]/g, "").replace(/[\s]+/g, "-").replace(/[ğ]/g, "g").replace(/[ü]/g, "u").replace(/[ş]/g, "s").replace(/[ı]/g, "i").replace(/[ö]/g, "o").replace(/[ç]/g, "c");

const emptyPost = (): BlogPost => ({
  id: `blog-${Date.now()}`, slug: "", title: "", category: "AB Politikası",
  excerpt: "", content: "", publishedAt: new Date().toISOString(), readMinutes: 3,
});

export default function AdminBlogPage() {
  const { posts, savePost, removePost, projects } = useAdmin();
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const autoSlug = (title: string) => { if (editing && !editing.slug) setEditing(p => p && ({ ...p, slug: slugify(title) })); };
  const save = () => { if (!editing || !editing.title) return; if (!editing.slug) setEditing(p => p && ({ ...p, slug: slugify(p!.title) })); savePost({ ...editing, slug: editing.slug || slugify(editing.title) }); setEditing(null); };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">Blog / Gündem <span className="text-mist font-normal text-lg">({posts.length})</span></h1>
        <button onClick={() => setEditing(emptyPost())} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
          + Yeni Yazı
        </button>
      </div>

      {editing && (
        <div className="bg-white border border-eu/30 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="font-bold text-ink mb-4">{editing.id.startsWith("blog-") && editing.title === "" ? "Yeni Yazı" : "Düzenle"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Başlık *</label>
              <input value={editing.title}
                onChange={e => { const v = e.target.value; setEditing(p => p && ({ ...p, title: v })); autoSlug(v); }}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Slug (URL)</label>
              <input value={editing.slug} onChange={e => setEditing(p => p && ({ ...p, slug: e.target.value }))}
                placeholder="otomatik-olusturulur" className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Kategori</label>
              <select value={editing.category} onChange={e => setEditing(p => p && ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Okuma Süresi (dk)</label>
              <input type="number" value={editing.readMinutes} onChange={e => setEditing(p => p && ({ ...p, readMinutes: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">İlgili Proje</label>
              <select value={editing.projectId ?? ""} onChange={e => setEditing(p => p && ({ ...p, projectId: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                <option value="">— Seçin —</option>
                {projects.map(pr => <option key={pr.id} value={pr.id}>{pr.title}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">Özet</label>
              <textarea value={editing.excerpt} onChange={e => setEditing(p => p && ({ ...p, excerpt: e.target.value }))}
                rows={2} className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-mist mb-1">İçerik</label>
              <textarea value={editing.content} onChange={e => setEditing(p => p && ({ ...p, content: e.target.value }))}
                rows={8} className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none font-mono" />
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
            <h3 className="font-bold text-ink mb-2">Yazıyı sil?</h3>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { removePost(confirmDel); setConfirmDel(null); }} className="px-4 py-2 bg-tr text-white rounded-lg text-sm font-semibold">Sil</button>
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
              <th className="text-left px-4 py-3 font-semibold text-slate">Kategori</th>
              <th className="text-left px-4 py-3 font-semibold text-slate">Yayın Tarihi</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-line hover:bg-surface/50">
                <td className="px-4 py-3 font-medium text-ink max-w-xs truncate">{p.title}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-eu-pale text-eu px-2 py-0.5 rounded-full font-semibold">{p.category}</span>
                </td>
                <td className="px-4 py-3 text-slate text-xs">{new Date(p.publishedAt).toLocaleDateString("tr")}</td>
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
