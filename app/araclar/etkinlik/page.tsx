"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { ClosedMeetingPanel } from "./ClosedMeetingPanel";
import type { EventItem, EventRegistration } from "@/lib/types";

const STATUS: Record<EventRegistration["status"], { label: string; cls: string }> = {
  kayitli: { label: "Kayıtlı", cls: "bg-eu-pale text-eu" },
  katildi: { label: "Katıldı", cls: "bg-green-100 text-green-700" },
  iptal: { label: "İptal", cls: "bg-red-100 text-red-600" },
};

export default function EventToolPage() {
  const db = getDataProvider();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [regs, setRegs] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");

  // Etkinlikleri yükle
  useEffect(() => {
    db.getEvents().then((evs) => {
      setEvents(evs);
      if (evs.length) setActiveId(evs[0].id);
      setLoading(false);
    });
  }, [db]);

  // Aktif etkinliğin kayıtlarını yükle
  const loadRegs = useCallback(
    (eventId: string) => {
      if (!eventId) return;
      db.getRegistrations(eventId).then(setRegs);
    },
    [db]
  );
  useEffect(() => { loadRegs(activeId); }, [activeId, loadRegs]);

  const activeEvent = events.find((e) => e.id === activeId);

  async function addReg(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId) return;
    const reg: EventRegistration = {
      id: `reg-${Date.now()}`,
      eventId: activeId,
      name, email, organization: org || undefined,
      status: "kayitli",
      createdAt: new Date().toISOString(),
    };
    await db.addRegistration(reg);
    setName(""); setEmail(""); setOrg("");
    loadRegs(activeId);
  }

  async function cycleStatus(reg: EventRegistration) {
    const order: EventRegistration["status"][] = ["kayitli", "katildi", "iptal"];
    const next = order[(order.indexOf(reg.status) + 1) % order.length];
    await db.updateRegistration({ ...reg, status: next });
    loadRegs(activeId);
  }

  async function remove(id: string) {
    if (!confirm("Bu kayıt silinsin mi?")) return;
    await db.removeRegistration(id);
    loadRegs(activeId);
  }

  function exportCsv() {
    const rows = [
      ["Ad Soyad", "E-posta", "Kurum", "Durum", "Kayıt Tarihi"],
      ...regs.map((r) => [r.name, r.email, r.organization ?? "", STATUS[r.status].label, r.createdAt.slice(0, 10)]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `katilimcilar-${activeId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const counts = {
    kayitli: regs.filter((r) => r.status === "kayitli").length,
    katildi: regs.filter((r) => r.status === "katildi").length,
    iptal: regs.filter((r) => r.status === "iptal").length,
  };

  return (
    <PageShell>
      <div className="bg-eu-deep text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <Link href="/araclar" className="text-white/70 text-sm hover:text-white">← Araçlar</Link>
          <h1 className="text-2xl md:text-3xl font-bold mt-3">Etkinlik Yönetimi</h1>
          <p className="text-white/80 mt-2">Etkinlik seçin, katılımcıları yönetin, RSVP takibi yapın.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <p className="text-slate">Yükleniyor…</p>
        ) : events.length === 0 ? (
          <p className="text-slate">Henüz etkinlik yok. Yönetim panelinden etkinlik ekleyebilirsiniz.</p>
        ) : (
          <div className="grid lg:grid-cols-[260px_1fr] gap-8">
            {/* Etkinlik seçici */}
            <aside>
              <p className="text-xs uppercase tracking-wide text-mist mb-3">Etkinlikler</p>
              <div className="space-y-2">
                {events.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setActiveId(e.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                      activeId === e.id ? "border-eu bg-eu-pale" : "border-line bg-white hover:border-eu/40"
                    }`}
                  >
                    <span className="block text-sm font-medium text-ink leading-snug">{e.title}</span>
                    <span className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate">{e.date}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        e.isPublic ? "bg-eu-pale text-eu" : "bg-amber-100 text-amber-700"
                      }`}>
                        {e.isPublic ? "Açık" : "Kapalı"}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            {/* Katılımcı yönetimi */}
            <div>
              {activeEvent && activeEvent.isPublic && (
                <>
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-ink">{activeEvent.title}</h2>
                      <p className="text-sm text-slate mt-1">{activeEvent.date} · {activeEvent.location}</p>
                    </div>
                    <button onClick={exportCsv} className="shrink-0 px-4 py-2 rounded-lg border border-line text-sm font-semibold text-ink hover:bg-line/40">
                      CSV İndir
                    </button>
                  </div>

                  {/* Sayaçlar */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <Counter label="Kayıtlı" value={counts.kayitli} />
                    <Counter label="Katıldı" value={counts.katildi} />
                    <Counter label="İptal" value={counts.iptal} />
                  </div>

                  {/* Katılımcı ekleme */}
                  <form onSubmit={addReg} className="bg-white border border-line rounded-xl p-4 mb-6 grid sm:grid-cols-4 gap-3">
                    <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad Soyad" className={inp} />
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta" className={inp} />
                    <input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Kurum (ops.)" className={inp} />
                    <button type="submit" className="px-4 py-2 rounded-lg bg-eu text-white text-sm font-semibold">+ Ekle</button>
                  </form>

                  {/* Katılımcı tablosu */}
                  {regs.length === 0 ? (
                    <p className="text-slate text-sm py-8 text-center bg-white border border-line rounded-xl">
                      Bu etkinlikte henüz katılımcı yok. Yukarıdan ekleyin.
                    </p>
                  ) : (
                    <div className="bg-white border border-line rounded-xl overflow-x-auto">
                      <table className="w-full text-sm min-w-[560px]">
                        <thead className="bg-[#f4f6fa] text-left">
                          <tr>
                            {["Ad Soyad", "E-posta", "Kurum", "Durum", ""].map((h) => (
                              <th key={h} className="px-4 py-3 text-xs uppercase tracking-wide text-slate font-semibold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {regs.map((r) => (
                            <tr key={r.id} className="hover:bg-[#f9fafb]">
                              <td className="px-4 py-3 font-medium text-ink">{r.name}</td>
                              <td className="px-4 py-3 text-slate">{r.email}</td>
                              <td className="px-4 py-3 text-slate">{r.organization ?? "—"}</td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => cycleStatus(r)}
                                  title="Durumu değiştir"
                                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS[r.status].cls}`}
                                >
                                  {STATUS[r.status].label}
                                </button>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button onClick={() => remove(r.id)} className="text-tr text-sm hover:underline">Sil</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {activeEvent && !activeEvent.isPublic && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-ink">{activeEvent.title}</h2>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">KAPALI TOPLANTI</span>
                    </div>
                    <p className="text-sm text-slate mt-1">{activeEvent.date} · {activeEvent.location}</p>
                  </div>
                  <ClosedMeetingPanel event={activeEvent} />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

const inp = "px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-eu/30";

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-line rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-eu">{value}</div>
      <div className="text-xs text-slate mt-0.5">{label}</div>
    </div>
  );
}
