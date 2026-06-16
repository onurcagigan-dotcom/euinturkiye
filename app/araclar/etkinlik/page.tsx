"use client";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { EventRsvp } from "@/lib/types";

type Status = "onaylandi" | "bekliyor" | "iptal";
const STATUS_NEXT: Record<Status, Status> = { bekliyor: "onaylandi", onaylandi: "iptal", iptal: "bekliyor" };
const STATUS_LABEL: Record<Status, string> = { onaylandi: "Onaylandı ✓", bekliyor: "Bekliyor ⏳", iptal: "İptal ✕" };
const STATUS_COLOR: Record<Status, string> = { onaylandi: "bg-green-100 text-green-700", bekliyor: "bg-yellow-100 text-yellow-700", iptal: "bg-red-100 text-red-600" };

const DEMO_EVENTS = [
  { id: "etk-1", title: "AB Proje Yönetimi Konferansı 2026" },
  { id: "etk-2", title: "Tarım Modernizasyon — Teknik Toplantı" },
  { id: "etk-3", title: "Kadın Girişimciler Zirvesi" },
];

const SEED_RSVPS: EventRsvp[] = [
  { id: "r1", eventId: "etk-1", name: "Ahmet Yılmaz", email: "ahmet@bakanlik.gov.tr", organization: "Kalkınma Bakanlığı", status: "onaylandi", createdAt: new Date().toISOString() },
  { id: "r2", eventId: "etk-1", name: "Fatma Demir", email: "fatma@kosgeb.gov.tr", organization: "KOSGEB", status: "bekliyor", createdAt: new Date().toISOString() },
  { id: "r3", eventId: "etk-2", name: "Zeynep Kaya", email: "zeynep@iskur.gov.tr", organization: "İŞKUR", status: "onaylandi", createdAt: new Date().toISOString() },
];

export default function EtkinlikAraciPage() {
  const [activeEvent, setActiveEvent] = useState(DEMO_EVENTS[0].id);
  const [rsvps, setRsvps] = useState<EventRsvp[]>(SEED_RSVPS);
  const [form, setForm] = useState({ name: "", email: "", org: "" });
  const [adding, setAdding] = useState(false);

  const filtered = rsvps.filter((r) => r.eventId === activeEvent);
  const counts = { onaylandi: filtered.filter(r => r.status === "onaylandi").length, bekliyor: filtered.filter(r => r.status === "bekliyor").length, iptal: filtered.filter(r => r.status === "iptal").length };

  const addRsvp = () => {
    if (!form.name || !form.email) return;
    setRsvps((prev) => [...prev, { id: `r${Date.now()}`, eventId: activeEvent, name: form.name, email: form.email, organization: form.org, status: "bekliyor", createdAt: new Date().toISOString() }]);
    setForm({ name: "", email: "", org: "" });
    setAdding(false);
  };

  const cycleStatus = (id: string) => {
    setRsvps((prev) => prev.map((r) => r.id === id ? { ...r, status: STATUS_NEXT[r.status] } : r));
  };

  const remove = (id: string) => setRsvps((prev) => prev.filter((r) => r.id !== id));

  const exportCSV = () => {
    const header = "Ad,E-posta,Kurum,Durum";
    const rows = filtered.map((r) => `${r.name},${r.email},${r.organization ?? ""},${r.status}`);
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "katilimcilar.csv"; a.click();
  };

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "Etkinlik Yönetimi" }]} />

        <h1 className="text-2xl font-bold text-ink mb-6">Etkinlik Yönetimi</h1>

        {/* Etkinlik seçimi */}
        <div className="flex flex-wrap gap-2 mb-6">
          {DEMO_EVENTS.map((e) => (
            <button key={e.id} onClick={() => setActiveEvent(e.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeEvent === e.id ? "bg-eu text-white" : "bg-surface text-slate hover:bg-line"}`}>
              {e.title}
            </button>
          ))}
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {(["onaylandi", "bekliyor", "iptal"] as const).map((s) => (
            <div key={s} className={`rounded-xl p-4 text-center ${STATUS_COLOR[s]}`}>
              <div className="text-2xl font-bold">{counts[s]}</div>
              <div className="text-xs font-semibold">{STATUS_LABEL[s]}</div>
            </div>
          ))}
        </div>

        {/* Eylemler */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => setAdding(true)} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
            + Katılımcı Ekle
          </button>
          <button onClick={exportCSV} className="px-4 py-2 border border-line text-slate rounded-lg text-sm font-semibold hover:bg-surface">
            CSV İndir
          </button>
        </div>

        {/* Ekle formu */}
        {adding && (
          <div className="bg-eu-pale border border-eu/20 rounded-xl p-5 mb-6">
            <h3 className="font-bold text-ink mb-3">Yeni Katılımcı</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ad Soyad *" className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              <input value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="E-posta *" type="email" className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              <input value={form.org} onChange={(e) => setForm(f => ({ ...f, org: e.target.value }))}
                placeholder="Kurum" className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={addRsvp} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Ekle</button>
              <button onClick={() => setAdding(false)} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
            </div>
          </div>
        )}

        {/* Katılımcı listesi */}
        <div className="bg-white border border-line rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-line">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate">Ad Soyad</th>
                <th className="text-left px-4 py-3 font-semibold text-slate">E-posta</th>
                <th className="text-left px-4 py-3 font-semibold text-slate">Kurum</th>
                <th className="text-left px-4 py-3 font-semibold text-slate">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-mist">Kayıtlı katılımcı yok.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-t border-line hover:bg-surface/50">
                    <td className="px-4 py-3 font-medium text-ink">{r.name}</td>
                    <td className="px-4 py-3 text-slate">{r.email}</td>
                    <td className="px-4 py-3 text-slate">{r.organization ?? "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => cycleStatus(r.id)}
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full cursor-pointer ${STATUS_COLOR[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(r.id)} className="text-mist hover:text-tr text-xs">Sil</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-mist mt-3">Durum etiketine tıklayarak döngüsel olarak değiştirebilirsiniz. Değişiklikler oturum süresince korunur.</p>
      </div>
    </PageShell>
  );
}
