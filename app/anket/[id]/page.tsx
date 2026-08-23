"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import type { Survey, SurveyResponse, SurveyQuestion } from "@/lib/types";

// ─── Soru bileşeni — doldurulan form ─────────────────────────
function QuestionField({ q, answer, onChange }: {
  q: SurveyQuestion;
  answer: string | undefined;
  onChange: (val: string) => void;
}) {
  const opts = q.options ?? (q.type === "yes_no" ? ["Evet","Hayır"] : q.type === "rating" ? ["1","2","3","4","5"] : []);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start gap-2 mb-4">
        <p className="text-base font-semibold text-gray-900 flex-1 leading-relaxed">{q.text}</p>
        {q.required && <span className="text-red-500 text-sm flex-shrink-0 mt-0.5">*</span>}
      </div>

      {q.type === "open_ended" && (
        <textarea value={answer ?? ""} onChange={(e) => onChange(e.target.value)}
          rows={4} placeholder="Yanıtınızı buraya yazın…"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-gray-50 transition-colors" />
      )}

      {(q.type === "multiple_choice" || q.type === "yes_no") && (
        <div className="space-y-2.5">
          {opts.map((opt) => {
            const selected = answer === opt;
            return (
              <label key={opt} onClick={() => onChange(opt)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  selected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  selected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                }`}>
                  {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className={`text-sm font-medium transition-colors ${selected ? "text-blue-700" : "text-gray-700"}`}>
                  {opt}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {q.type === "rating" && (
        <div className="flex gap-3 items-center">
          {["1","2","3","4","5"].map((v) => {
            const selected = answer === v;
            return (
              <button key={v} onClick={() => onChange(v)}
                className={`w-12 h-12 rounded-xl text-base font-bold border-2 transition-all ${
                  selected
                    ? "border-blue-500 bg-blue-500 text-white shadow-md scale-110"
                    : "border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600"
                }`}>
                {v}
              </button>
            );
          })}
          <div className="ml-2 text-xs text-gray-400 space-y-0.5">
            <div>← Düşük</div>
            <div>Yüksek →</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────
export default function PublicSurveyPage() {
  const params = useParams<{ id: string }>();
  const db = getDataProvider();

  const [survey, setSurvey] = useState<Survey | null | undefined>(undefined);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    db.getSurvey(params.id).then(setSurvey);
  }, [params.id, db]);

  const setAnswer = (qId: string, val: string) =>
    setAnswers((a) => ({ ...a, [qId]: val }));

  const handleSubmit = async () => {
    if (!survey) return;

    // Zorunlu alan kontrolü
    const missing = survey.questions
      .filter((q) => q.required && !answers[q.id]?.trim())
      .map((q) => q.text.slice(0, 40));

    if (missing.length > 0) {
      setErrors(missing);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setErrors([]);

    const response: SurveyResponse = {
      id: `sr-${Date.now()}`,
      surveyId: survey.id,
      answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })),
      submittedAt: new Date().toISOString(),
    };

    await db.saveSurveyResponse(response);
    setSubmitting(false);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Yükleniyor
  if (survey === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">Yükleniyor…</div>
      </div>
    );
  }

  // Bulunamadı veya kapalı
  if (!survey || survey.status === "kapali") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Bu anket artık aktif değil</h1>
          <p className="text-gray-500 text-sm">Bu anket kapatılmış veya bulunamadı.</p>
        </div>
      </div>
    );
  }

  // Henüz başlamamış (taslak)
  if (survey.status === "taslak") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🕐</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Anket henüz yayınlanmadı</h1>
          <p className="text-gray-500 text-sm">Bu anket yakında aktif olacak.</p>
        </div>
      </div>
    );
  }

  // Gönderildi
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">✓</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Yanıtınız alındı!</h1>
          <p className="text-gray-500 text-sm mb-6">Katkınız için teşekkür ederiz.</p>
          <p className="text-xs text-gray-400">
            Bu anket{" "}
            <Link href="/" className="text-blue-600 hover:underline">euinturkiye.com</Link>{" "}
            platformu üzerinden yürütülmektedir.
          </p>
        </div>
      </div>
    );
  }

  // ─── Anket formu ─────────────────────────────────────────
  const answered = Object.keys(answers).filter((k) => answers[k]?.trim()).length;
  const total = survey.questions.length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">euinturkiye.com</span>
            <span className="text-xs text-gray-500 font-medium">{answered}/{total} soru</span>
          </div>
          {/* İlerleme çubuğu */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Anket başlığı */}
        <div className="mb-8">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
            {survey.ownerName}
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3">{survey.title}</h1>
          {survey.description && (
            <p className="text-gray-600 leading-relaxed">{survey.description}</p>
          )}
          {survey.allowAnonymous && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1">
              <span>🔒</span> Bu anket anonim — kimliğiniz paylaşılmaz
            </div>
          )}
        </div>

        {/* Hata mesajları */}
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm font-semibold mb-2">Lütfen zorunlu soruları yanıtlayın:</p>
            <ul className="space-y-1">
              {errors.map((e, i) => (
                <li key={i} className="text-red-600 text-sm">• {e}…</li>
              ))}
            </ul>
          </div>
        )}

        {/* Sorular */}
        <div className="space-y-5">
          {survey.questions.map((q, idx) => (
            <div key={q.id}>
              <p className="text-xs font-semibold text-gray-400 mb-2 ml-1">
                {idx + 1}. soru {!q.required && <span className="font-normal">(isteğe bağlı)</span>}
              </p>
              <QuestionField q={q} answer={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
            </div>
          ))}
        </div>

        {/* Gönder */}
        <div className="mt-8 flex flex-col gap-3">
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-base hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-sm">
            {submitting ? "Gönderiliyor…" : "Yanıtları Gönder"}
          </button>
          <p className="text-center text-xs text-gray-400">
            Bu anket{" "}
            <Link href="/" className="text-blue-500 hover:underline">euinturkiye.com</Link>{" "}
            platformu üzerinden yürütülmektedir.
          </p>
        </div>
      </div>
    </div>
  );
}
