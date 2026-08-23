"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import { useFirma } from "@/lib/firma/context";
import { getDataProvider } from "@/lib/data";
import type { Survey, SurveyResponse, SurveyQuestion, SurveyQuestionType } from "@/lib/types";

function qtLabel(type: SurveyQuestionType) {
  switch (type) {
    case "multiple_choice": return "Çoktan Seçmeli";
    case "open_ended": return "Açık Uçlu";
    case "rating": return "Değerlendirme (1-5)";
    case "yes_no": return "Evet / Hayır";
  }
}

// ─── Tek soru önizlemesi — gerçek doldurulan form gibi ───────
function QuestionPreview({ q, answer, onChange }: {
  q: SurveyQuestion;
  answer: string | string[] | undefined;
  onChange: (val: string) => void;
}) {
  const opts = q.options ?? (q.type === "yes_no" ? ["Evet", "Hayır"] : q.type === "rating" ? ["1","2","3","4","5"] : []);

  return (
    <div className="border border-line rounded-xl p-5 bg-white">
      <div className="flex items-start gap-2 mb-4">
        <p className="text-sm font-semibold text-ink flex-1 leading-relaxed">{q.text}</p>
        {q.required && <span className="text-red-500 text-xs flex-shrink-0">*</span>}
      </div>
      <p className="text-[10px] text-mist mb-3 uppercase tracking-wide">{qtLabel(q.type)}</p>

      {q.type === "open_ended" && (
        <textarea value={String(answer ?? "")} onChange={(e) => onChange(e.target.value)}
          rows={3} placeholder="Yanıtınızı buraya yazın…"
          className="w-full px-3 py-2.5 border border-line rounded-lg text-sm resize-none focus:outline-none focus:border-eu bg-surface" />
      )}

      {(q.type === "multiple_choice" || q.type === "yes_no") && (
        <div className="space-y-2">
          {opts.map((opt) => {
            const selected = String(answer ?? "") === opt;
            return (
              <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                <div onClick={() => onChange(opt)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    selected ? "border-eu bg-eu" : "border-line bg-white group-hover:border-eu/60"
                  }`}>
                  {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className={`text-sm transition-colors ${selected ? "text-eu font-semibold" : "text-slate group-hover:text-ink"}`}>
                  {opt}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {q.type === "rating" && (
        <div className="flex gap-2">
          {["1","2","3","4","5"].map((v) => {
            const selected = String(answer ?? "") === v;
            return (
              <button key={v} onClick={() => onChange(v)}
                className={`w-10 h-10 rounded-xl border-2 text-sm font-bold transition-all ${
                  selected ? "border-eu bg-eu text-white shadow-md scale-110" : "border-line bg-white text-slate hover:border-eu hover:text-eu"
                }`}>
                {v}
              </button>
            );
          })}
          <div className="flex items-center ml-2 gap-4 text-xs text-mist">
            <span>← Düşük</span><span>Yüksek →</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Anket Önizlemesi — doldurulan form gibi ─────────────────
function SurveyPreview({ survey, onClose }: { survey: Survey; onClose: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const setAnswer = (qId: string, val: string) => setAnswers((a) => ({ ...a, [qId]: val }));

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onClose} className="text-sm text-slate hover:text-ink">← Geri</button>
          <h2 className="text-lg font-bold text-ink">Önizleme</h2>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Taslak mod</span>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
          <div className="text-4xl mb-3">✓</div>
          <h3 className="font-bold text-green-800 mb-1">Yanıt gönderildi</h3>
          <p className="text-sm text-green-700">Bu bir önizlemedir — gerçek veri kaydedilmedi.</p>
          <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="mt-4 text-sm text-green-700 underline">Tekrar doldur</button>
        </div>
        <button onClick={onClose} className="text-sm text-eu font-semibold">← Editöre dön</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onClose} className="text-sm text-slate hover:text-ink">← Editöre dön</button>
        <h2 className="text-lg font-bold text-ink">{survey.title}</h2>
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Önizleme</span>
      </div>
      {survey.description && (
        <p className="text-sm text-slate bg-surface rounded-xl px-4 py-3">{survey.description}</p>
      )}
      {survey.questions.length === 0 ? (
        <div className="bg-surface rounded-xl p-8 text-center text-slate text-sm">Henüz soru eklenmedi.</div>
      ) : (
        <>
          <div className="space-y-4">
            {survey.questions.map((q, i) => (
              <div key={q.id}>
                <p className="text-xs text-mist mb-1.5 font-semibold">{i + 1}. soru</p>
                <QuestionPreview q={q} answer={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
              </div>
            ))}
          </div>
          <button
            onClick={() => setSubmitted(true)}
            className="w-full py-3 bg-eu text-white rounded-xl font-semibold text-sm hover:bg-blue-800">
            Gönder (Önizleme)
          </button>
        </>
      )}
    </div>
  );
}

// ─── Soru Editörü ─────────────────────────────────────────────
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
      {q.type === "multiple_choice" && (
        <div>
          <p className="text-xs text-mist mb-1">Seçenekler (her satıra bir seçenek)</p>
          <textarea value={optionsText}
            onChange={(e) => set({ options: e.target.value.split("\n").filter(Boolean) })}
            rows={3} placeholder={"Seçenek 1\nSeçenek 2\nSeçenek 3"}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white resize-none focus:outline-none focus:border-eu" />
        </div>
      )}
      {q.type === "rating" && (
        <div className="flex gap-1.5">
          {["1","2","3","4","5"].map((v) => (
            <div key={v} className="w-8 h-8 rounded-lg border border-line bg-surface flex items-center justify-center text-xs font-bold text-mist">{v}</div>
          ))}
          <span className="text-xs text-mist self-center ml-2">1 ile 5 arası puanlama</span>
        </div>
      )}
      {q.type === "yes_no" && (
        <div className="flex gap-2">
          {["Evet", "Hayır"].map((v) => (
            <div key={v} className="flex items-center gap-2 px-3 py-1.5 border border-line rounded-lg text-sm text-mist bg-surface">
              <div className="w-4 h-4 rounded-full border-2 border-line" />
              {v}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard: Sonuçlar ──────────────────────────────────────
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
              <p className="font-semibold text-ink mb-1">{q.text}</p>
              <p className="text-xs text-mist mb-4">{qtLabel(q.type)} · {answers.length} yanıt</p>
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
                  answers.forEach((a) => { const v = String(a); counts[v] = (counts[v] ?? 0) + 1; });
                  const total = answers.length || 1;
                  return (
                    <div className="space-y-2.5">
                      {opts.map((opt) => {
                        const cnt = counts[opt] ?? 0;
                        const pct = Math.round((cnt / total) * 100);
                        return (
                          <div key={opt} className="flex items-center gap-3">
                            <div className="w-28 text-sm text-slate truncate">{opt}</div>
                            <div className="flex-1 bg-surface rounded-full h-3 overflow-hidden">
                              <div className="h-full bg-eu rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="w-20 text-right text-xs text-mist">{cnt} yanıt ({pct}%)</div>
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

// ─── Ana Sayfa ────────────────────────────────────────────────
export default function AnketPage() {
  const { locale } = useLocale();
  const { current: subscriber } = useFirma();
  const db = getDataProvider();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [mode, setMode] = useState<"list" | "create" | "edit" | "dashboard" | "preview">("list");
  const [editing, setEditing] = useState<Survey | null>(null);
  const [dashSurvey, setDashSurvey] = useState<Survey | null>(null);
  const [dashResponses, setDashResponses] = useState<SurveyResponse[]>([]);
  const [previewSurvey, setPreviewSurvey] = useState<Survey | null>(null);
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

  // ── Önizleme ───────────────────────────────────────────────
  if (mode === "preview" && previewSurvey) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto px-6 py-10">
          <SurveyPreview survey={previewSurvey} onClose={() => setMode("list")} />
        </div>
      </PageShell>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────
  if (mode === "dashboard" && dashSurvey) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-10">
          <SurveyDashboard survey={dashSurvey} responses={dashResponses} onClose={() => setMode("list")} />
        </div>
      </PageShell>
    );
  }

  // ── Oluştur / Düzenle ──────────────────────────────────────
  if ((mode === "create" || mode === "edit") && editing) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => { setMode("list"); setEditing(null); }} className="text-sm text-slate hover:text-ink">← Geri</button>
            <h1 className="text-xl font-bold text-ink">{mode === "create" ? "Yeni Anket" : "Anketi Düzenle"}</h1>
          </div>
          <div className="space-y-5">
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
                  rows={2} className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white resize-none focus:outline-none focus:border-eu" />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate cursor-pointer">
                <input type="checkbox" checked={editing.allowAnonymous} onChange={(e) => setEditing({ ...editing, allowAnonymous: e.target.checked })} />
                Anonim yanıta izin ver
              </label>
            </div>

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

            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} className="px-5 py-2.5 bg-eu text-white rounded-xl text-sm font-semibold hover:bg-blue-800">
                {mode === "create" ? "Oluştur" : "Kaydet"}
              </button>
              <button onClick={() => {
                setPreviewSurvey(editing);
                setMode("preview");
              }} className="px-5 py-2.5 border border-line text-slate rounded-xl text-sm hover:bg-surface">
                👁 Önizle
              </button>
              <button onClick={() => { setMode("list"); setEditing(null); }} className="px-5 py-2.5 border border-line text-slate rounded-xl text-sm">İptal</button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  // ── Liste ──────────────────────────────────────────────────
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
          <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 bg-surface rounded-xl animate-pulse" />)}</div>
        ) : surveys.length === 0 ? (
          <div className="bg-surface rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-semibold text-ink mb-1">{isEn ? "No surveys yet" : "Henüz anket yok"}</p>
            <p className="text-sm text-slate mb-4">{isEn ? "Create your first survey." : "İlk anketinizi oluşturun."}</p>
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
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${s.status === "aktif" ? "bg-green-100 text-green-700" : s.status === "taslak" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                      {s.status === "aktif" ? "Aktif" : s.status === "taslak" ? "Taslak" : "Kapalı"}
                    </span>
                  </div>
                  <p className="text-xs text-mist">{s.questions.length} soru · {s.allowAnonymous ? "Anonim" : "Kayıtlı"}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => { setPreviewSurvey(s); setMode("preview"); }}
                    className="px-3 py-1.5 text-xs border border-line rounded-lg hover:bg-surface text-slate">👁 Önizle</button>
                  <button onClick={() => handleDashboard(s)}
                    className="px-3 py-1.5 text-xs border border-line rounded-lg hover:bg-surface text-slate">📊 Sonuçlar</button>
                  <button onClick={() => handleToggleStatus(s)}
                    className="px-3 py-1.5 text-xs border border-line rounded-lg hover:bg-surface text-slate">
                    {s.status === "aktif" ? "⏸ Kapat" : "▶ Başlat"}
                  </button>
                  <button onClick={() => { setEditing(s); setMode("edit"); }}
                    className="px-3 py-1.5 text-xs border border-line rounded-lg hover:bg-surface text-slate">✏️ Düzenle</button>
                  <button onClick={() => handleDelete(s.id)}
                    className="px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}