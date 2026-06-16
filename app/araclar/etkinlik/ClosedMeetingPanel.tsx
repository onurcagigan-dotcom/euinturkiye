"use client";

import { useState, useEffect, useCallback } from "react";
import { getDataProvider } from "@/lib/data";
import { sendBulkEmail } from "@/lib/tools/email";
import type { EventItem, AgendaItem, Invitee, TimeOption, AvailabilityVote } from "@/lib/types";

type Tab = "gundem" | "davetliler" | "musaitlik";

export function ClosedMeetingPanel({ event }: { event: EventItem }) {
  const [tab, setTab] = useState<Tab>("gundem");

  return (
    <div>
      <div className="flex gap-1 mb-6 bg-white border border-line rounded-lg p-1 w-fit">
        <TabBtn active={tab === "gundem"} onClick={() => setTab("gundem")} label="Gündem" />
        <TabBtn active={tab === "davetliler"} onClick={() => setTab("davetliler")} label="Davetliler" />
        <TabBtn active={tab === "musaitlik"} onClick={() => setTab("musaitlik")} label="Müsaitlik Anketi" />
      </div>

      {tab === "gundem" && <AgendaTab eventId={event.id} />}
      {tab === "davetliler" && <InviteesTab event={event} />}
      {tab === "musaitlik" && <AvailabilityTab eventId={event.id} />}
    </div>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
        active ? "bg-eu text-white" : "text-slate hover:bg-line/40"
      }`}
    >
      {label}
    </button>
  );
}

const inp = "px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-eu/30";

/* ============== GÜNDEM ============== */
function AgendaTab({ eventId }: { eventId: string }) {
  const db = getDataProvider();
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [presenter, setPresenter] = useState("");

  const load = useCallback(() => { db.getAgenda(eventId).then(setItems); }, [db, eventId]);
  useEffect(() => { load(); }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const item: AgendaItem = {
      id: `ag-${Date.now()}`, eventId, order: items.length + 1,
      title, durationMin: duration ? Number(duration) : undefined,
      presenter: presenter || undefined,
    };
    await db.saveAgendaItem(item);
    setTitle(""); setDuration(""); setPresenter("");
    load();
  }
  async function remove(id: string) {
    if (!confirm("Madde silinsin mi?")) return;
    await db.removeAgendaItem(id); load();
  }

  const totalMin = items.reduce((s, i) => s + (i.durationMin ?? 0), 0);

  return (
    <div>
      <form onSubmit={add} className="bg-white border border-line rounded-xl p-4 mb-5 grid sm:grid-cols-[1fr_120px_160px_auto] gap-3">
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Gündem maddesi" className={inp} />
        <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Süre (dk)" type="number" className={inp} />
        <input value={presenter} onChange={(e) => setPresenter(e.target.value)} placeholder="Sunan (ops.)" className={inp} />
        <button className="px-4 py-2 rounded-lg bg-eu text-white text-sm font-semibold">+ Ekle</button>
      </form>

      {items.length === 0 ? (
        <Empty text="Henüz gündem maddesi yok." />
      ) : (
        <ol className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="bg-white border border-line rounded-lg p-4 flex items-center gap-4">
              <span className="w-7 h-7 rounded-full bg-eu-pale text-eu font-bold text-sm flex items-center justify-center shrink-0">{it.order}</span>
              <div className="flex-1">
                <p className="font-medium text-ink">{it.title}</p>
                <p className="text-xs text-slate mt-0.5">
                  {it.durationMin ? `${it.durationMin} dk` : "süre yok"}{it.presenter ? ` · ${it.presenter}` : ""}
                </p>
              </div>
              <button onClick={() => remove(it.id)} className="text-tr text-sm hover:underline shrink-0">Sil</button>
            </li>
          ))}
        </ol>
      )}
      {items.length > 0 && (
        <p className="text-sm text-slate mt-4">Toplam süre: <strong className="text-ink">{totalMin} dakika</strong></p>
      )}
    </div>
  );
}

/* ============== DAVETLİLER ============== */
const INVITE_STATUS: Record<Invitee["inviteStatus"], { label: string; cls: string }> = {
  bekliyor: { label: "Bekliyor", cls: "bg-amber-100 text-amber-700" },
  kabul: { label: "Kabul", cls: "bg-green-100 text-green-700" },
  ret: { label: "Reddetti", cls: "bg-red-100 text-red-600" },
};

function InviteesTab({ event }: { event: EventItem }) {
  const db = getDataProvider();
  const eventId = event.id;
  const [list, setList] = useState<Invitee[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(() => { db.getInvitees(eventId).then(setList); }, [db, eventId]);
  useEffect(() => { load(); }, [load]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    const inv: Invitee = {
      id: `inv-${Date.now()}`, eventId, name, email,
      role: role || undefined, inviteStatus: "bekliyor",
      invitedAt: new Date().toISOString(),
    };
    await db.saveInvitee(inv);
    setName(""); setEmail(""); setRole(""); load();
  }
  async function cycle(inv: Invitee) {
    const order: Invitee["inviteStatus"][] = ["bekliyor", "kabul", "ret"];
    const next = order[(order.indexOf(inv.inviteStatus) + 1) % order.length];
    await db.saveInvitee({ ...inv, inviteStatus: next }); load();
  }
  async function remove(id: string) {
    if (!confirm("Davetli silinsin mi?")) return;
    await db.removeInvitee(id); load();
  }

  async function sendInvites() {
    const pending = list.filter((i) => i.inviteStatus === "bekliyor");
    if (pending.length === 0) { alert("Davet bekleyen kişi yok."); return; }
    setSending(true);
    try {
      const subject = `Toplantı Daveti: ${event.title}`;
      const body = `Sayın katılımcı,\n\n"${event.title}" toplantısına davetlisiniz.\nTarih: ${event.date}\nYer: ${event.location}\n\nKatılım durumunuzu bildirmeniz rica olunur.`;
      const res = await sendBulkEmail(pending.map((i) => i.email), subject, body);
      load();
      alert(res.simulated
        ? `Demo: ${res.delivered} davetliye davet e-postası simüle edildi. (E-posta servisi canlıda devreye girer.)`
        : `${res.delivered} davetliye davet gönderildi.`);
    } finally {
      setSending(false);
    }
  }

  const accepted = list.filter((i) => i.inviteStatus === "kabul").length;
  const pending = list.filter((i) => i.inviteStatus === "bekliyor").length;

  return (
    <div>
      <form onSubmit={invite} className="bg-white border border-line rounded-xl p-4 mb-5 grid sm:grid-cols-[1fr_1fr_140px_auto] gap-3">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad Soyad" className={inp} />
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta" className={inp} />
        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Rol (ops.)" className={inp} />
        <button className="px-4 py-2 rounded-lg bg-eu text-white text-sm font-semibold whitespace-nowrap">Davet Et</button>
      </form>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <p className="text-xs text-mist">
          Demo modunda davet e-postası simüle edilir; sistem canlıya alındığında gerçek gönderilir.
        </p>
        {pending > 0 && (
          <button onClick={sendInvites} disabled={sending}
            className="px-4 py-2 rounded-lg bg-eu text-white text-sm font-semibold disabled:opacity-60">
            {sending ? "Gönderiliyor…" : `Davet Gönder (${pending} bekliyor)`}
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <Empty text="Henüz davetli yok." />
      ) : (
        <>
          <div className="bg-white border border-line rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-[#f4f6fa] text-left">
                <tr>{["Ad Soyad", "E-posta", "Rol", "Davet Durumu", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs uppercase tracking-wide text-slate font-semibold">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#f9fafb]">
                    <td className="px-4 py-3 font-medium text-ink">{inv.name}</td>
                    <td className="px-4 py-3 text-slate">{inv.email}</td>
                    <td className="px-4 py-3 text-slate">{inv.role ?? "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => cycle(inv)} title="Durumu değiştir"
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${INVITE_STATUS[inv.inviteStatus].cls}`}>
                        {INVITE_STATUS[inv.inviteStatus].label}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(inv.id)} className="text-tr text-sm hover:underline">Sil</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate mt-4">
            {list.length} davetli · <strong className="text-green-700">{accepted} kabul</strong>
          </p>
        </>
      )}
    </div>
  );
}

/* ============== MÜSAİTLİK ANKETİ ============== */
function AvailabilityTab({ eventId }: { eventId: string }) {
  const db = getDataProvider();
  const [options, setOptions] = useState<TimeOption[]>([]);
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [votes, setVotes] = useState<AvailabilityVote[]>([]);
  const [newDate, setNewDate] = useState("");

  const load = useCallback(() => {
    Promise.all([db.getTimeOptions(eventId), db.getInvitees(eventId), db.getVotes(eventId)])
      .then(([o, i, v]) => { setOptions(o); setInvitees(i); setVotes(v); });
  }, [db, eventId]);
  useEffect(() => { load(); }, [load]);

  async function addOption(e: React.FormEvent) {
    e.preventDefault();
    if (!newDate) return;
    const d = new Date(newDate);
    const label = d.toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    await db.saveTimeOption({ id: `opt-${Date.now()}`, eventId, start: newDate, label });
    setNewDate(""); load();
  }
  async function removeOption(id: string) {
    if (!confirm("Zaman seçeneği silinsin mi?")) return;
    await db.removeTimeOption(id); load();
  }
  async function toggle(optionId: string, inviteeId: string, current: boolean | undefined) {
    const existing = votes.find((v) => v.optionId === optionId && v.inviteeId === inviteeId);
    await db.setVote({
      id: existing?.id ?? `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      eventId, optionId, inviteeId, available: current === undefined ? true : !current,
    });
    load();
  }

  function voteFor(optionId: string, inviteeId: string): boolean | undefined {
    return votes.find((v) => v.optionId === optionId && v.inviteeId === inviteeId)?.available;
  }
  function availableCount(optionId: string): number {
    return votes.filter((v) => v.optionId === optionId && v.available).length;
  }

  // Kazanan: en çok "uygun" alan seçenek
  const best = options.length
    ? options.reduce((a, b) => (availableCount(b.id) > availableCount(a.id) ? b : a))
    : null;
  const bestCount = best ? availableCount(best.id) : 0;

  return (
    <div>
      <form onSubmit={addOption} className="bg-white border border-line rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-slate mb-1">Zaman seçeneği ekle</label>
          <input type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} className={inp} />
        </div>
        <button className="px-4 py-2 rounded-lg bg-eu text-white text-sm font-semibold">+ Seçenek</button>
      </form>

      {options.length === 0 ? (
        <Empty text="Henüz zaman seçeneği yok. Yukarıdan ekleyin." />
      ) : invitees.length === 0 ? (
        <Empty text="Önce 'Davetliler' sekmesinden katılımcı ekleyin." />
      ) : (
        <>
          <div className="bg-white border border-line rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f4f6fa]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate font-semibold">Davetli</th>
                  {options.map((o) => (
                    <th key={o.id} className="px-3 py-3 text-center text-xs font-semibold text-ink whitespace-nowrap">
                      <div>{o.label}</div>
                      <button onClick={() => removeOption(o.id)} className="text-tr text-[10px] hover:underline font-normal">kaldır</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {invitees.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{inv.name}</td>
                    {options.map((o) => {
                      const v = voteFor(o.id, inv.id);
                      return (
                        <td key={o.id} className="px-3 py-3 text-center">
                          <button
                            onClick={() => toggle(o.id, inv.id, v)}
                            className={`w-8 h-8 rounded-md text-sm font-bold transition ${
                              v === true ? "bg-green-100 text-green-700"
                              : v === false ? "bg-red-100 text-red-500"
                              : "bg-line/50 text-mist hover:bg-line"
                            }`}
                            title="Uygun / uygun değil arasında geçiş"
                          >
                            {v === true ? "✓" : v === false ? "✕" : "–"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Toplam satırı */}
                <tr className="bg-eu-pale/50 font-semibold">
                  <td className="px-4 py-3 text-ink">Uygun sayısı</td>
                  {options.map((o) => (
                    <td key={o.id} className={`px-3 py-3 text-center ${best?.id === o.id && bestCount > 0 ? "text-eu" : "text-slate"}`}>
                      {availableCount(o.id)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {best && bestCount > 0 && (
            <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <span className="text-sm text-green-800">
                En uygun zaman: <strong>{best.label}</strong> ({bestCount} kişi uygun)
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-slate text-sm py-8 text-center bg-white border border-line rounded-xl">{text}</p>;
}
