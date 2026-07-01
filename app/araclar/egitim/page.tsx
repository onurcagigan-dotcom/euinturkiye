"use client";
import { useState, useEffect, useMemo } from "react";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useFirma } from "@/lib/firma/context";
import { getDataProvider } from "@/lib/data";
import type { TrainingVideo, Project } from "@/lib/types";

function emptyMaterial(): TrainingVideo {
  return { id: `tv-${Date.now()}`, title: "", description: "", kind: "video", category: "", keywords: [], order: 999 };
}

export default function EgitimPage() {
  const { current: firma } = useFirma();
  const [materials, setMaterials] = useState<TrainingVideo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterCat, setFilterCat] = useState("");
  const [filterProjectId, setFilterProjectId] = useState("");
  const [filterKind, setFilterKind] = useState<"" | "video" | "dokuman">("");
  const [search, setSearch] = useState("");

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<TrainingVideo>(emptyMaterial());
  const [keywordsText, setKeywordsText] = useState("");
  const [activeVideo, setActiveVideo] = useState<TrainingVideo | null>(null);

  useEffect(() => {
    const db = getDataProvider();
    Promise.all([db.getTrainingVideos(), db.getProjects()]).then(([m, p]) => {
      setMaterials(m); setProjects(p); setLoading(false);
    });
  }, []);

  const projectById = useMemo(() => {
    const map: Record<string, Project> = {};
    projects.forEach((p) => { map[p.id] = p; });
    return map;
  }, [projects]);

  const myProjects = useMemo(
    () => projects.filter((p) => firma && (p.ownerSubscriberId === firma.id || p.consortiumMembers?.some((m) => m.subscriberId === firma.id))),
    [projects, firma]
  );

  const categories = Array.from(new Set(materials.map((m) => m.category).filter(Boolean))) as string[];

  const myMaterials = useMemo(
    () => materials.filter((m) => firma && m.uploaderSubscriberId === firma.id),
    [materials, firma]
  );
  const otherMaterials = useMemo(
    () => materials.filter((m) => !firma || m.uploaderSubscriberId !== firma.id),
    [materials, firma]
  );

  const applyFilters = (list: TrainingVideo[]) => list.filter((m) => {
    if (filterCat && m.category !== filterCat) return false;
    if (filterProjectId && m.projectId !== filterProjectId) return false;
    if (filterKind && m.kind !== filterKind) return false;
    if (search) {
      const q = search.toLocaleLowerCase("tr");
      const hay = [m.title, m.description, ...(m.keywords ?? [])].join(" ").toLocaleLowerCase("tr");
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const startAdding = () => {
    setForm(emptyMaterial());
    setKeywordsText("");
    setAdding(true);
  };

  const saveMaterial = async () => {
    if (!form.title) return;
    const material: TrainingVideo = {
      ...form,
      keywords: keywordsText.split(",").map((k) => k.trim()).filter(Boolean),
      uploaderSubscriberId: firma?.id,
    };
    await getDataProvider().saveTrainingVideo(material);
    setMaterials((prev) => [material, ...prev]);
    setAdding(false);
  };

  const removeMaterial = async (id: string) => {
    await getDataProvider().removeTrainingVideo(id);
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  if (loading) {
    return <PageShell><div className="max-w-5xl mx-auto px-6 py-16 text-center text-slate">Yükleniyor…</div></PageShell>;
  }

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "Eğitim Materyalleri" }]} />

        <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-ink">Eğitim Materyalleri</h1>
          {firma && (
            <button onClick={startAdding} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
              + Materyal Ekle
            </button>
          )}
        </div>
        <p className="text-slate text-sm mb-6">
          Firmaların eklediği video ve doküman eğitim materyalleri — {materials.length} materyal.
        </p>

        {!firma && (
          <p className="text-xs text-mist mb-6">Materyal eklemek için firma hesabınızla giriş yapmalısınız.</p>
        )}

        {adding && (
          <div className="bg-eu-pale border border-eu/20 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-ink mb-3">Yeni Eğitim Materyali</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-mist mb-1">Başlık *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist mb-1">Materyal Türü</label>
                <select value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as "video" | "dokuman" }))}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                  <option value="video">Video</option>
                  <option value="dokuman">Doküman (PDF/Sunum)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist mb-1">Kategori</label>
                <input value={form.category ?? ""} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Örn. Proje Yönetimi"
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              </div>

              {form.kind === "video" ? (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-mist mb-1">Video URL (embed)</label>
                  <input value={form.videoUrl ?? ""} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} placeholder="https://www.youtube.com/embed/..."
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                </div>
              ) : (
                <label className="md:col-span-2 flex items-center justify-center gap-2 px-4 py-5 border-2 border-dashed border-line rounded-xl cursor-pointer hover:border-eu hover:bg-white transition-colors">
                  <input type="file" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setForm((prev) => ({ ...prev, documentName: f.name, documentSize: `${(f.size / 1024 / 1024).toFixed(1)} MB` }));
                    e.target.value = "";
                  }} />
                  <span className="text-slate text-sm">{form.documentName ? `📄 ${form.documentName}` : "📎 Dosya seçmek için tıklayın"}</span>
                </label>
              )}

              <div>
                <label className="block text-xs font-semibold text-mist mb-1">Hangi Proje Kapsamında Üretildi</label>
                <select value={form.projectId ?? ""} onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                  <option value="">— Genel (proje bağımsız) —</option>
                  {(firma ? myProjects : projects).map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist mb-1">Süre (video için)</label>
                <input value={form.duration ?? ""} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} placeholder="Örn. 25:00"
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-mist mb-1">Kısa Açıklama</label>
                <textarea value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-mist mb-1">Anahtar Kelimeler (virgülle ayırın)</label>
                <input value={keywordsText} onChange={(e) => setKeywordsText(e.target.value)} placeholder="Örn. izleme, gösterge, raporlama"
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveMaterial} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Ekle</button>
              <button onClick={() => setAdding(false)} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          <button onClick={() => setFilterKind("")} className={`px-3 py-1.5 rounded-full text-sm font-semibold ${!filterKind ? "bg-eu text-white" : "bg-surface text-slate hover:bg-line"}`}>Tümü</button>
          <button onClick={() => setFilterKind("video")} className={`px-3 py-1.5 rounded-full text-sm font-semibold ${filterKind === "video" ? "bg-eu text-white" : "bg-surface text-slate hover:bg-line"}`}>🎬 Videolar</button>
          <button onClick={() => setFilterKind("dokuman")} className={`px-3 py-1.5 rounded-full text-sm font-semibold ${filterKind === "dokuman" ? "bg-eu text-white" : "bg-surface text-slate hover:bg-line"}`}>📄 Dokümanlar</button>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <button onClick={() => setFilterCat("")} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${!filterCat ? "bg-ink text-white" : "bg-surface text-slate hover:bg-line"}`}>Tüm Kategoriler</button>
          {categories.map((c) => (
            <button key={c} onClick={() => setFilterCat(c)} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${filterCat === c ? "bg-ink text-white" : "bg-surface text-slate hover:bg-line"}`}>{c}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mb-6">
          <select value={filterProjectId} onChange={(e) => setFilterProjectId(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-line focus:outline-none focus:border-eu">
            <option value="">Tüm Projeler</option>
            {projects.filter((p) => materials.some((m) => m.projectId === p.id)).map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ara: başlık, açıklama, anahtar kelime…"
            className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg text-sm bg-white border border-line focus:outline-none focus:border-eu" />
        </div>

        {/* Kendi materyallerim */}
        {firma && (
          <div className="mb-8">
            <h2 className="text-base font-bold text-ink mb-3">Eklediğim Materyaller</h2>
            {applyFilters(myMaterials).length === 0 ? (
              <p className="text-sm text-mist">Henüz materyal eklemediniz. Yukarıdaki &quot;+ Materyal Ekle&quot; butonunu kullanın.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {applyFilters(myMaterials).map((m) => (
                  <MaterialCard key={m.id} m={m} proj={m.projectId ? projectById[m.projectId] : undefined}
                    canRemove onRemove={() => removeMaterial(m.id)} onPlay={() => setActiveVideo(m)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Diğer materyaller */}
        <div>
          <h2 className="text-base font-bold text-ink mb-3">{firma ? "Diğer Firmalar tarafından Eklenen Materyaller" : "Tüm Materyaller"}</h2>
          {applyFilters(firma ? otherMaterials : materials).length === 0 ? (
            <p className="text-sm text-mist text-center py-12">Bu filtrelere uyan materyal bulunamadı.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applyFilters(firma ? otherMaterials : materials).map((m) => (
                <MaterialCard key={m.id} m={m} proj={m.projectId ? projectById[m.projectId] : undefined}
                  canRemove={false} onPlay={() => setActiveVideo(m)} />
              ))}
            </div>
          )}
        </div>

        {activeVideo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setActiveVideo(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="aspect-video bg-gray-900">
                <iframe src={activeVideo.videoUrl} className="w-full h-full" allowFullScreen title={activeVideo.title} />
              </div>
              <div className="p-4">
                <h2 className="font-bold text-ink mb-1">{activeVideo.title}</h2>
                <p className="text-sm text-slate">{activeVideo.description}</p>
                <button onClick={() => setActiveVideo(null)} className="mt-3 px-4 py-2 border border-line text-slate rounded-lg text-sm">Kapat</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function MaterialCard({ m, proj, canRemove, onRemove, onPlay }: {
  m: import("@/lib/types").TrainingVideo;
  proj?: import("@/lib/types").Project;
  canRemove: boolean;
  onRemove?: () => void;
  onPlay: () => void;
}) {
  return (
    <div className="bg-white border border-line rounded-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.kind === "video" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
          {m.kind === "video" ? "🎬 Video" : "📄 Doküman"}
        </span>
        {m.category && <span className="text-xs bg-surface text-mist px-2 py-0.5 rounded">{m.category}</span>}
      </div>
      <h3 className="font-semibold text-ink text-sm mb-1">{m.title}</h3>
      {m.description && <p className="text-xs text-slate mb-2 line-clamp-2">{m.description}</p>}
      {proj && <p className="text-xs text-mist mb-2">📁 <span className="font-medium">{proj.title}</span></p>}
      {m.keywords && m.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {m.keywords.map((k) => (
            <span key={k} className="text-xs bg-eu-pale text-eu px-1.5 py-0.5 rounded">#{k}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        {m.kind === "video" ? (
          <button onClick={onPlay} className="text-xs font-semibold text-eu hover:underline">
            ▶ {m.duration ? `İzle (${m.duration})` : "İzle"}
          </button>
        ) : (
          <span className="text-xs text-mist">{m.documentName}{m.documentSize && ` · ${m.documentSize}`}</span>
        )}
        {canRemove && onRemove && (
          <button onClick={onRemove} className="text-xs text-mist hover:text-tr">Sil</button>
        )}
      </div>
    </div>
  );
}
