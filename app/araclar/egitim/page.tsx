"use client";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { TrainingVideo } from "@/lib/types";

const SEED: TrainingVideo[] = [
  { id: "tv-1", title: "AB Proje Döngüsü Yönetimi", description: "Temel PCM kavramları, mantıksal çerçeve ve uygulama adımları.", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "45:00", category: "Proje Yönetimi", order: 1 },
  { id: "tv-2", title: "Finansal Raporlama Esasları", description: "AB projelerinde mali yönetim, harcama belgeleme ve raporlama.", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "38:00", category: "Mali Yönetim", order: 2 },
  { id: "tv-3", title: "İzleme ve Değerlendirme", description: "M&E metodolojisi, gösterge sistemi ve etki değerlendirmesi.", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "52:00", category: "İ&D", order: 3 },
  { id: "tv-4", title: "Satınalma Kuralları", description: "AB finansmanlı projelerde satınalma prosedürleri ve PRAG rehberi.", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "41:00", category: "Satınalma", order: 4 },
  { id: "tv-5", title: "Görünürlük ve İletişim", description: "AB projelerinde zorunlu görünürlük kuralları ve iletişim planı.", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "28:00", category: "İletişim", order: 5 },
];

export default function EgitimPage() {
  const [videos] = useState<TrainingVideo[]>(SEED);
  const [active, setActive] = useState<TrainingVideo | null>(null);
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [filterCat, setFilterCat] = useState<string>("");

  const cats = Array.from(new Set(videos.map(v => v.category ?? "Genel")));
  const filtered = filterCat ? videos.filter(v => v.category === filterCat) : videos;

  const markWatched = (id: string) => setWatched(prev => new Set([...prev, id]));

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "E-Learning" }]} />

        <h1 className="text-2xl font-bold text-ink mb-2">E-Learning</h1>
        <p className="text-slate text-sm mb-6">AB proje yönetimi eğitim videoları — {videos.length} video, {watched.size} izlendi.</p>

        {/* İlerleme */}
        <div className="bg-eu-pale rounded-xl p-4 mb-6 flex items-center gap-4">
          <div className="flex-1 bg-white/70 rounded-full h-3">
            <div className="bg-eu h-3 rounded-full transition-all" style={{ width: `${videos.length > 0 ? (watched.size / videos.length) * 100 : 0}%` }} />
          </div>
          <span className="text-sm font-bold text-eu">{Math.round((watched.size / videos.length) * 100)}%</span>
        </div>

        {/* Kategori filtresi */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setFilterCat("")} className={`px-3 py-1.5 rounded-full text-sm font-semibold ${!filterCat ? "bg-eu text-white" : "bg-surface text-slate hover:bg-line"}`}>Tümü</button>
          {cats.map(c => (
            <button key={c} onClick={() => setFilterCat(c)} className={`px-3 py-1.5 rounded-full text-sm font-semibold ${filterCat === c ? "bg-eu text-white" : "bg-surface text-slate hover:bg-line"}`}>{c}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Video listesi */}
          <div className="space-y-3">
            {filtered.map((v) => (
              <button key={v.id} onClick={() => { setActive(v); markWatched(v.id); }}
                className={`w-full text-left p-4 border rounded-xl transition-all ${active?.id === v.id ? "border-eu bg-eu-pale" : "border-line bg-white hover:border-eu/50"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${watched.has(v.id) ? "bg-green-500 text-white" : "bg-surface text-mist border border-line"}`}>
                    {watched.has(v.id) ? "✓" : v.order}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-ink text-sm">{v.title}</h3>
                    <div className="flex gap-3 mt-1 text-xs text-mist">
                      {v.category && <span className="bg-eu-pale text-eu px-2 py-0.5 rounded">{v.category}</span>}
                      {v.duration && <span>⏱ {v.duration}</span>}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Video oynatıcı */}
          <div className="sticky top-20">
            {active ? (
              <div className="bg-white border border-line rounded-xl overflow-hidden">
                <div className="aspect-video bg-gray-900">
                  <iframe src={active.videoUrl} className="w-full h-full" allowFullScreen title={active.title} />
                </div>
                <div className="p-4">
                  <h2 className="font-bold text-ink mb-1">{active.title}</h2>
                  <p className="text-sm text-slate">{active.description}</p>
                  {!watched.has(active.id) && (
                    <button onClick={() => markWatched(active.id)} className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold">
                      ✓ İzledim olarak işaretle
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-surface border border-line rounded-xl h-64 flex items-center justify-center text-mist text-sm">
                Bir video seçin
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
