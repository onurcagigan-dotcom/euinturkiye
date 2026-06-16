"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import type { DocItem, TrainingVideo, Sector } from "@/lib/types";

export default function ELearningToolPage() {
  const db = getDataProvider();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSector, setActiveSector] = useState<string>("all");

  // Video formu
  const [showForm, setShowForm] = useState(false);
  const [vTitle, setVTitle] = useState("");
  const [vTopic, setVTopic] = useState("");
  const [vUrl, setVUrl] = useState("");
  const [vSector, setVSector] = useState("");
  const [vDesc, setVDesc] = useState("");

  useEffect(() => { db.getSectors().then(setSectors); }, [db]);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([db.getLearningDocs(), db.getTrainingVideos()]).then(([d, v]) => {
      setDocs(d); setVideos(v); setLoading(false);
    });
  }, [db]);
  useEffect(() => { load(); }, [load]);

  async function addVideo(e: React.FormEvent) {
    e.preventDefault();
    const v: TrainingVideo = {
      id: `vid-${Date.now()}`, title: vTitle, topic: vTopic, url: vUrl,
      sectorId: vSector || undefined, description: vDesc || undefined,
      addedAt: new Date().toISOString(),
    };
    await db.saveTrainingVideo(v);
    setVTitle(""); setVTopic(""); setVUrl(""); setVSector(""); setVDesc(""); setShowForm(false);
    load();
  }
  async function removeVideo(id: string) {
    if (!confirm("Eğitim videosu silinsin mi?")) return;
    await db.removeTrainingVideo(id); load();
  }

  const sectorName = (id?: string) => id ? sectors.find((s) => s.id === id)?.name ?? id : "Genel";

  // Sektör filtresi (hem doküman hem video)
  const fDocs = activeSector === "all" ? docs : docs.filter((d) => d.learningSectorId === activeSector);
  const fVideos = activeSector === "all" ? videos : videos.filter((v) => v.sectorId === activeSector);

  // Hangi sektörlerde içerik var
  const usedSectors = sectors.filter((s) =>
    docs.some((d) => d.learningSectorId === s.id) || videos.some((v) => v.sectorId === s.id)
  );

  return (
    <PageShell>
      <div className="bg-eu-deep text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <Link href="/araclar" className="text-white/70 text-sm hover:text-white">← Araçlar</Link>
          <h1 className="text-2xl md:text-3xl font-bold mt-3">E-Learning</h1>
          <p className="text-white/80 mt-2">Eğitim materyalleri ve video kaynakları, sektöre göre düzenlenmiş.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-eu-pale border border-eu/20 rounded-xl p-4 mb-6 text-sm text-slate">
          Eğitim materyalleri, <strong>E-Doküman Yönetimi</strong> aracında &quot;Eğitime Ekle&quot; ile
          işaretlenen belgelerden oluşur. Buraya ayrıca harici eğitim videoları da ekleyebilirsiniz.
        </div>

        {/* Sektör filtresi */}
        {usedSectors.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Chip active={activeSector === "all"} onClick={() => setActiveSector("all")} label="Tüm Sektörler" />
            {usedSectors.map((s) => (
              <Chip key={s.id} active={activeSector === s.id} onClick={() => setActiveSector(s.id)} label={s.name} />
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-slate">Yükleniyor…</p>
        ) : (
          <>
            {/* Eğitim materyalleri (dokümanlar) */}
            <section className="mb-10">
              <h2 className="text-lg font-bold text-ink mb-4">Eğitim Materyalleri</h2>
              {fDocs.length === 0 ? (
                <Empty text="Bu seçimde eğitim materyali yok. E-Doküman aracından belge işaretleyin." />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fDocs.map((d) => (
                    <div key={d.id} className="bg-white border border-line rounded-xl p-5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-2xl">📘</span>
                        <span className="text-[10px] bg-eu-pale text-eu px-2 py-0.5 rounded-full">{sectorName(d.learningSectorId)}</span>
                      </div>
                      <h3 className="font-bold text-ink mt-3 leading-snug">{d.learningTopic ?? d.name}</h3>
                      <p className="text-sm text-slate mt-1">{d.name}</p>
                      <button
                        onClick={async () => { await db.incrementDownload(d.id); if (d.url) window.open(d.url, "_blank"); else alert("Demo modunda dosya içeriği yoktur."); load(); }}
                        className="text-eu font-semibold text-sm mt-3 hover:underline"
                      >
                        Materyali Aç →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Eğitim videoları */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-ink">Eğitim Videoları</h2>
                <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-lg bg-eu text-white text-sm font-semibold">
                  + Video Ekle
                </button>
              </div>

              {showForm && (
                <form onSubmit={addVideo} className="bg-white border border-line rounded-xl p-5 mb-5">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input required value={vTitle} onChange={(e) => setVTitle(e.target.value)} placeholder="Eğitim adı" className={inp} />
                    <input required value={vTopic} onChange={(e) => setVTopic(e.target.value)} placeholder="Konu başlığı" className={inp} />
                    <input required type="url" value={vUrl} onChange={(e) => setVUrl(e.target.value)} placeholder="Video linki (https://...)" className={`${inp} sm:col-span-2`} />
                    <select value={vSector} onChange={(e) => setVSector(e.target.value)} className={inp}>
                      <option value="">Sektör (opsiyonel)</option>
                      {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <input value={vDesc} onChange={(e) => setVDesc(e.target.value)} placeholder="Açıklama (ops.)" className={inp} />
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button type="submit" className="px-5 py-2 rounded-lg bg-eu text-white text-sm font-semibold">Ekle</button>
                    <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg text-sm text-slate">Vazgeç</button>
                  </div>
                </form>
              )}

              {fVideos.length === 0 ? (
                <Empty text="Bu seçimde eğitim videosu yok. Yukarıdan ekleyebilirsiniz." />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fVideos.map((v) => (
                    <div key={v.id} className="bg-white border border-line rounded-xl p-5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-2xl">🎬</span>
                        <span className="text-[10px] bg-eu-pale text-eu px-2 py-0.5 rounded-full">{sectorName(v.sectorId)}</span>
                      </div>
                      <h3 className="font-bold text-ink mt-3 leading-snug">{v.title}</h3>
                      <p className="text-sm text-slate mt-1">{v.topic}</p>
                      {v.description && <p className="text-xs text-slate mt-2">{v.description}</p>}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
                        <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-eu font-semibold text-sm hover:underline">
                          Videoyu İzle →
                        </a>
                        <button onClick={() => removeVideo(v.id)} className="text-tr text-sm hover:underline">Sil</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </PageShell>
  );
}

const inp = "px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-eu/30";

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition ${active ? "bg-eu text-white" : "bg-white border border-line text-slate hover:border-eu/40"}`}>
      {label}
    </button>
  );
}
function Empty({ text }: { text: string }) {
  return <p className="text-slate text-sm py-8 text-center bg-white border border-line rounded-xl">{text}</p>;
}
