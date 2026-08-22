"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import { useFirma } from "@/lib/firma/context";
import { getDataProvider } from "@/lib/data";
import type { Survey, SurveyResponse, SurveyQuestion, SurveyQuestionType } from "@/lib/types";

// ─── Soru Tipi Etiketi ────────────────────────────────────
function qtLabel(type: SurveyQuestionType) {
  switch (type) {
    case "multiple_choice": return "Çoktan Seçmeli";
    case "open_ended": return "Açık Uçlu";
    case "rating": return "Değerlendirme (1-5)";
    case "yes_no": return "Evet / Hayır";
  }
}

// ─── Soru Formu ──────────────────────────────────────────
function QuestionEditor({ q, onChange, onRemove }: {
  q: SurveyQuestion;
  onChange: (q: SurveyQuestion) => void;
  onRemove: () => void;
}) {
  const set = (patch: Partial<SurveyQuestion>) => onChange({ ...q, ...patch });
  const optionsText = q.options?.join("\n") ?? "";

  return (
    <div className="border border-line rounded-xl p-4 bg-white space-y-3">
      <div className="flex items-center gap-2">
        <select value={q.type} onChange={(e) => set({ type: e.target.value as SurveyQuestionType, options: e.target.value === "multiple_choice" ? ["Seçenek 1", "Seçenek 2"] : e.target.value === "yes_no" ? ["Evet", "Hayır"] : e.target.value === "rating" ? ["1","2","3","4","5"] : undefined })}
          className="px-3 py-1.5 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
          <option value="multiple_choice">Çoktan Seçmeli</option>
          <option value="open_ended">Açık Uçlu</option>
          <option value="rating">Değerlendirme (1-5)</option>
          <option value="yes_no">Evet / Hayır</option>
        </select>
        <label className="flex items-center gap-1.5 text-sm text-slate ml-auto cursor-pointer">
          <input type="checkbox" checked={q.required} onChange={(e) => set({ required: e.target.checked })} className="w-3.5 h-3.5" />
          Zorunlu
        </label>
        <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-700 ml-2">✕ Kaldır</button>
      </div>
      <input value={q.text} onChange={(e) => set({ text: e.target.value })}
        placeholder="Soru metnini yazın…"
        className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
      {(q.type === "multiple_choice") && (
        <div>
          <p className="text-xs text-mist mb-1">Seçenekler (her satıra bir seçenek)</p>
          <textarea value={optionsText}
            onChange={(e) => set({ options: e.target.value.split("\n").filter(Boolean) })}
            rows={3} placeholder={"Seçenek 1\nSeçenek 2\nSeçenek 3"}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white resize-none focus:outline-none focus:border-eu" />
        </div>
      )}
      {(q.type === "rating") && (
        <p className="text-xs text-mist">1 ile 5 arasında sayısal değerlendirme — seçenekler otomatik oluşur.</p>
      )}
      {(q.type === "yes_no") && (
        <p className="text-xs text-mist">Evet / Hayır seçenekleri otomatik gösterilir.</p>
      )}
    </div>
  );
}

// ─── Dashboard: Anket Sonuçları ──────────────────────────
function SurveyDashboard({ survey, responses, onClose }: { survey: Survey; responses: SurveyResponse[]; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">{survey.title} — Sonuçlar</h2>
          <p className="text-sm text-mist">{responses.length} yanıt</p>
        </div>
        <button onClick={onClose} className="px-4 py-2 border border-line rounded-lg text-sm text-slate hover:bg-surface">← Geri</button>
      </div>

      {responses.length === 0 ? (
        <div className="bg-surface rounded-xl p-8 text-center text-slate">Henüz yanıt yok.</div>
      ) : (
        survey.questions.map((q) => {
          const answers = responses.map((r) => r.answers.find((a) => a.questionId === q.id)?.value).filter(Boolean);
          return (
            <div key={q.id} className="bg-white border border-line rounded-xl p-5">
              <p className="font-semibold text-ink mb-3">{q.text}</p>
              <p className="text-xs text-mist mb-3">{qtLabel(q.type)} · {answers.length} yanıt</p>
              {q.type === "open_ended" ? (
                <div className="space-y-2">
                  {answers.map((a, i) => (
                    <div key={i} className="bg-surface rounded-lg px-3 py-2 text-sm text-slate">{String(a)}</div>
                  ))}
                </div>
              ) : (
                (() => {
                  const opts = q.options ?? (q.type === "yes_no" ? ["Evet","Hayır"] : q.type === "rating" ? ["1","2","3","4","5"] : []);
                  const counts: Record<string, number> = {};
                  opts.forEach((o) => { counts[o] = 0; });
                  answers.forEach((a) => {
                    const val = String(a);
                    counts[val] = (counts[val] ?? 0) + 1;
                  });
                  const max = Math.max(...Object.values(counts), 1);
                  return (
                    <div className="space-y-2">
                      {opts.map((opt) => {
                        const cnt = counts[opt] ?? 0;
                        const pct = Math.round((cnt / answers.length) * 100) || 0;
                        return (
                          <div key={opt} className="flex items-center gap-3">
                            <div className="w-32 text-sm text-slate truncate">{opt}</div>
                            <div className="flex-1 bg-surface rounded-full h-2.5 overflow-hidden">
                              <div className="h-full bg-eu rounded-full transition-all" style={{ width: `${(cnt/max)*100}%` }} />
                            </div>
                            <div className="w-16 text-right text-sm text-mist">{cnt} ({pct}%)</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────
export default function AnketPage() {
  const { locale } = useLocale();
  const { current: subscriber } = useFirma();
  const db = getDataProvider();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [mode, setMode] = useState<"list" | "create" | "edit" | "dashboard">("list");
  const [editing, setEditing] = useState<Survey | null>(null);
  const [dashSurvey, setDashSurvey] = useState<Survey | null>(null);
  const [dashResponses, setDashResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const isEn = locale === "en";

  const load = useCallback(async () => {
    if (!subscriber) return;
    setLoading(true);
    const data = await db.getSurveys(subscriber.id);
    setSurveys(data);
    setLoading(false);
  }, [subscriber, db]);

  useEffect(() => { load(); }, [load]);

  if (!subscriber) {
    return (
      <PageShell>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-slate mb-4">{isEn ? "Please log in to use this tool." : "Bu aracı kullanmak için giriş yapın."}</p>
          <Link href="/giris" className="text-eu font-semibold hover:underline">{isEn ? "Log in" : "Giriş Yap"}</Link>
        </div>
      </PageShell>
    );
  }

  const newSurvey = (): Survey => ({
    id: `survey-${Date.now()}`,
    ownerSubscriberId: subscriber.id,
    ownerName: subscriber.name,
    title: "",
    description: "",
    questions: [],
    status: "taslak",
    createdAt: new Date().toISOString(),
    allowAnonymous: false,
  });

  const newQuestion = (): SurveyQuestion => ({
    id: `q-${Date.now()}`,
    type: "multiple_choice",
    text: "",
    options: ["Seçenek 1", "Seçenek 2"],
    required: true,
  });

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title.trim()) { alert("Lütfen anket başlığı girin."); return; }
    await db.saveSurvey(editing);
    await load();
    setMode("list");
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu anketi silmek istediğinizden emin misiniz?")) return;
    await db.removeSurvey(id);
    await load();
  };

  const handleDashboard = async (s: Survey) => {
    setDashSurvey(s);
    const res = await db.getSurveyResponses(s.id);
    setDashResponses(res);
    setMode("dashboard");
  };

  const handleToggleStatus = async (s: Survey) => {
    const updated = { ...s, status: s.status === "aktif" ? "kapali" as const : "aktif" as const };
    await db.saveSurvey(updated);
    await load();
  };

  // ─── Dashboard modu ───────────────────────────────────
  if (mode === "dashboard" && dashSurvey) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-10">
          <SurveyDashboard survey={dashSurvey} responses={dashResponses} onClose={() => setMode("list")} />
        </div>
      </PageShell>
    );
  }

  // ─── Oluştur / Düzenle modu ──────────────────────────
  if ((mode === "create" || mode === "edit") && editing) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => { setMode("list"); setEditing(null); }} className="text-sm text-slate hover:text-ink">← Geri</button>
            <h1 className="text-xl font-bold text-ink">{mode === "create" ? "Yeni Anket" : "Anketi Düzenle"}</h1>
          </div>

          <div className="space-y-5">
            {/* Başlık & Açıklama */}
            <div className="bg-white border border-line rounded-xl p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-mist mb-1">Anket Başlığı *</label>
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="Ör. Paydaş Memnuniyet Anketi"
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist mb-1">Açıklama</label>
                <textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={2} placeholder="Anketin amacını kısaca açıklayın…"
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white resize-none focus:outline-none focus:border-eu" />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate cursor-pointer">
                <input type="checkbox" checked={editing.allowAnonymous} onChange={(e) => setEditing({ ...editing, allowAnonymous: e.target.checked })} className="w-3.5 h-3.5" />
                Anonim yanıta izin ver
              </label>
            </div>

            {/* Sorular */}
            <div>
              <p className="text-xs font-bold text-mist uppercase tracking-wide mb-3">Sorular ({editing.questions.length})</p>
              <div className="space-y-3">
                {editing.questions.map((q, idx) => (
                  <QuestionEditor key={q.id} q={q}
                    onChange={(updated) => setEditing({ ...editing, questions: editing.questions.map((x, i) => i === idx ? updated : x) })}
                    onRemove={() => setEditing({ ...editing, questions: editing.questions.filter((_, i) => i !== idx) })} />
                ))}
              </div>
              <button onClick={() => setEditing({ ...editing, questions: [...editing.questions, newQuestion()] })}
                className="mt-3 w-full py-2.5 border-2 border-dashed border-line rounded-xl text-sm text-slate hover:border-eu hover:text-eu transition-colors">
                + Soru Ekle
              </button>
            </div>

            {/* Kaydet */}
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} className="px-5 py-2.5 bg-eu text-white rounded-xl text-sm font-semibold hover:bg-blue-800">
                {mode === "create" ? "Anketi Oluştur" : "Değişiklikleri Kaydet"}
              </button>
              <button onClick={() => { setMode("list"); setEditing(null); }} className="px-5 py-2.5 border border-line text-slate rounded-xl text-sm">İptal</button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  // ─── Liste modu ──────────────────────────────────────
  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Breadcrumb items={[
          { label: isEn ? "Home" : "Ana Sayfa", href: "/" },
          { label: isEn ? "Digital Tools" : "Dijital Araçlar", href: "/araclar" },
          { label: isEn ? "Survey Builder" : "Anket Oluşturucu" },
        ]} />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-ink">{isEn ? "Survey Builder" : "Anket Oluşturucu"}</h1>
            <p className="text-slate text-sm mt-1">{isEn ? "Create surveys, collect responses, view results." : "Anket oluşturun, yanıt toplayın, sonuçları görüntüleyin."}</p>
          </div>
          <button onClick={() => { setEditing(newSurvey()); setMode("create"); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-eu text-white rounded-xl text-sm font-semibold hover:bg-blue-800">
            + {isEn ? "New Survey" : "Yeni Anket"}
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="h-20 bg-surface rounded-xl animate-pulse" />)}
          </div>
        ) : surveys.length === 0 ? (
          <div className="bg-surface rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-semibold text-ink mb-1">{isEn ? "No surveys yet" : "Henüz anket yok"}</p>
            <p className="text-sm text-slate mb-4">{isEn ? "Create your first survey to collect feedback." : "Geri bildirim toplamak için ilk anketinizi oluşturun."}</p>
            <button onClick={() => { setEditing(newSurvey()); setMode("create"); }}
              className="px-5 py-2.5 bg-eu text-white rounded-xl text-sm font-semibold">Anket Oluştur</button>
          </div>
        ) : (
          <div className="space-y-3">
            {surveys.map((s) => (
              <div key={s.id} className="bg-white border border-line rounded-xl p-5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-ink truncate">{s.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      s.status === "aktif" ? "bg-green-100 text-green-700" :
                      s.status === "taslak" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {s.status === "aktif" ? "Aktif" : s.status === "taslak" ? "Taslak" : "Kapalı"}
                    </span>
                  </div>
                  <p className="text-xs text-mist">{s.questions.length} soru · {s.allowAnonymous ? "Anonim" : "Kayıtlı"}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleDashboard(s)}
                    className="px-3 py-1.5 text-xs border border-line rounded-lg hover:bg-surface text-slate">
                    📊 Sonuçlar
                  </button>
                  <button onClick={() => handleToggleStatus(s)}
                    className="px-3 py-1.5 text-xs border border-line rounded-lg hover:bg-surface text-slate">
                    {s.status === "aktif" ? "⏸ Kapat" : "▶ Başlat"}
                  </button>
                  <button onClick={() => { setEditing(s); setMode("edit"); }}
                    className="px-3 py-1.5 text-xs border border-line rounded-lg hover:bg-surface text-slate">
                    ✏️ Düzenle
                  </button>
                  <button onClick={() => handleDelete(s.id)}
                    className="px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
