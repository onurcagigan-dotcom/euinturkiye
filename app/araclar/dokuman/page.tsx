"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { uploadFile } from "@/lib/tools/upload";
import { PageShell } from "@/components/PageShell";
import type { DocItem, Project } from "@/lib/types";

const ACCESS: Record<DocItem["access"], { label: string; cls: string; icon: string }> = {
  "ozel": { label: "Özel", cls: "bg-red-100 text-red-600", icon: "🔒" },
  "ekip": { label: "Ekip", cls: "bg-amber-100 text-amber-700", icon: "👥" },
  "herkese-acik": { label: "Herkese Açık", cls: "bg-green-100 text-green-700", icon: "🌐" },
};

const CATEGORIES = ["Rapor", "Sözleşme", "Sunum", "Görünürlük", "Mali", "Diğer"];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DocumentToolPage() {
  const db = getDataProvider();
  const fileInput = useRef<HTMLInputElement>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<string>("all");
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Yükleme formu
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [access, setAccess] = useState<DocItem["access"]>("ekip");

  useEffect(() => {
    db.getProjects().then(setProjects);
  }, [db]);

  const load = useCallback(() => {
    setLoading(true);
    db.getDocs(activeProject === "all" ? undefined : activeProject).then((d) => {
      setDocs(d);
      setLoading(false);
    });
  }, [db, activeProject]);
  useEffect(() => { load(); }, [load]);

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const projectId = activeProject === "all" ? undefined : activeProject;
      const path = `documents/${projectId ?? "genel"}/${Date.now()}-${file.name}`;
      const res = await uploadFile(file, path);
      const item: DocItem = {
        id: `doc-${Date.now()}`,
        projectId,
        name: file.name,
        category,
        sizeBytes: res.sizeBytes,
        mimeType: res.mimeType,
        url: res.url,
        access,
        uploadedAt: new Date().toISOString(),
        downloads: 0,
      };
      await db.saveDoc(item);
      load();
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function remove(id: string) {
    if (!confirm("Doküman silinsin mi?")) return;
    await db.removeDoc(id);
    load();
  }

  async function download(d: DocItem) {
    await db.incrementDownload(d.id);
    if (d.url) {
      window.open(d.url, "_blank");
    } else {
      alert("Demo modunda dosya içeriği yoktur. Sistem canlıya alındığında gerçek dosya indirilir.");
    }
    load();
  }

  async function toggleLearning(d: DocItem) {
    if (!d.isLearning) {
      // Öğrenmeye eklerken konu ve sektör iste
      const topic = prompt("Öğrenme konu başlığı:", d.learningTopic ?? d.category);
      if (topic === null) return;
      const sectorId = prompt(
        "Sektör kodu (örn: yargi, istihdam, cevre — boş bırakılabilir):",
        d.learningSectorId ?? (activeProject !== "all" ? "" : "")
      );
      await db.saveDoc({ ...d, isLearning: true, learningTopic: topic || undefined, learningSectorId: sectorId || undefined });
    } else {
      await db.saveDoc({ ...d, isLearning: false });
    }
    load();
  }

  const projectName = (id?: string) =>
    id ? projects.find((p) => p.id === id)?.title ?? id : "Genel";

  return (
    <PageShell>
      <div className="bg-eu-deep text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <Link href="/araclar" className="text-white/70 text-sm hover:text-white">← Araçlar</Link>
          <h1 className="text-2xl md:text-3xl font-bold mt-3">E-Doküman Yönetimi</h1>
          <p className="text-white/80 mt-2">Proje belgelerini yükleyin, kategorize edin, erişim izinlerini yönetin.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Proje filtresi */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Chip active={activeProject === "all"} onClick={() => setActiveProject("all")} label="Tüm Projeler" />
          {projects.map((p) => (
            <Chip key={p.id} active={activeProject === p.id} onClick={() => setActiveProject(p.id)} label={p.title} />
          ))}
        </div>

        {/* Yükleme kutusu */}
        <div className="bg-white border border-line rounded-xl p-5 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs text-slate mb-1">Kategori</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inp}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate mb-1">Erişim</label>
              <select value={access} onChange={(e) => setAccess(e.target.value as DocItem["access"])} className={inp}>
                <option value="ozel">Özel (sadece ben)</option>
                <option value="ekip">Ekip</option>
                <option value="herkese-acik">Herkese Açık</option>
              </select>
            </div>
            <input ref={fileInput} type="file" onChange={onFileSelected} className="hidden" />
            <button
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="px-5 py-2 rounded-lg bg-eu text-white text-sm font-semibold disabled:opacity-60"
            >
              {uploading ? "Yükleniyor…" : "+ Dosya Yükle"}
            </button>
            {activeProject !== "all" && (
              <span className="text-xs text-mist">Yüklenecek proje: <strong>{projectName(activeProject)}</strong></span>
            )}
          </div>
          <p className="text-xs text-mist mt-3">
            Demo modunda dosya meta-verisi kaydedilir; sistem canlıya alındığında dosyalar Firebase Storage&apos;a gerçek yüklenir.
          </p>
        </div>

        {/* Doküman listesi */}
        {loading ? (
          <p className="text-slate">Yükleniyor…</p>
        ) : docs.length === 0 ? (
          <p className="text-slate text-sm py-10 text-center bg-white border border-line rounded-xl">
            Bu seçimde doküman yok. Yukarıdan dosya yükleyin.
          </p>
        ) : (
          <div className="bg-white border border-line rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f4f6fa] text-left">
                <tr>
                  {["Dosya", "Proje", "Kategori", "Erişim", "Boyut", "İndirme", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs uppercase tracking-wide text-slate font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {docs.map((d) => (
                  <tr key={d.id} className="hover:bg-[#f9fafb]">
                    <td className="px-4 py-3 font-medium text-ink">
                      {d.name}
                      {d.isLearning && <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full align-middle">E-Learning</span>}
                    </td>
                    <td className="px-4 py-3 text-slate whitespace-nowrap">{projectName(d.projectId)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-eu-pale text-eu px-2 py-1 rounded">{d.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${ACCESS[d.access].cls}`}>
                        {ACCESS[d.access].icon} {ACCESS[d.access].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate whitespace-nowrap">{formatSize(d.sizeBytes)}</td>
                    <td className="px-4 py-3 text-slate text-center">{d.downloads}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => toggleLearning(d)} className="text-purple-700 text-sm font-semibold hover:underline" title="E-Learning materyali olarak işaretle">
                        {d.isLearning ? "Eğitimden Çıkar" : "Eğitime Ekle"}
                      </button>
                      <button onClick={() => download(d)} className="text-eu text-sm font-semibold hover:underline ml-3">İndir</button>
                      <button onClick={() => remove(d.id)} className="text-tr text-sm hover:underline ml-3">Sil</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  );
}

const inp = "px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-eu/30";

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
        active ? "bg-eu text-white" : "bg-white border border-line text-slate hover:border-eu/40"
      }`}
    >
      {label}
    </button>
  );
}
