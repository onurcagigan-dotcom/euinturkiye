"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useFirma } from "@/lib/firma/context";
import { getDataProvider } from "@/lib/data";
import type { EventItem, EventRsvp, AgendaItem, EventAttachment, AvailabilityPollOption, Project, Subscriber } from "@/lib/types";

// ─── Tip sabitleri ─────────────────────────────────────────────
type RsvpStatus = EventRsvp["status"];
const STATUS_NEXT: Record<RsvpStatus, RsvpStatus> = { bekliyor: "onaylandi", onaylandi: "iptal", iptal: "bekliyor" };
const STATUS_LABEL: Record<RsvpStatus, string> = { onaylandi: "Katılacak ✓", bekliyor: "Yanıt Bekliyor ⏳", iptal: "Katılmayacak ✕" };
const STATUS_COLOR: Record<RsvpStatus, string> = { onaylandi: "bg-green-100 text-green-700", bekliyor: "bg-yellow-100 text-yellow-700", iptal: "bg-red-100 text-red-600" };

type ActiveTab = "bilgiler" | "musaitlik" | "gundem" | "dosyalar" | "davetiye" | "katilim";
const TABS: { id: ActiveTab; label: string; icon: string }[] = [
  { id: "bilgiler",  label: "Etkinlik Bilgileri", icon: "ℹ️" },
  { id: "musaitlik", label: "Müsaitlik Anketi",   icon: "🗳️" },
  { id: "gundem",    label: "Gündem",              icon: "📋" },
  { id: "dosyalar",  label: "Dosyalar",            icon: "📎" },
  { id: "davetiye",  label: "Davetiye & LCV",      icon: "✉️" },
  { id: "katilim",   label: "Katılım Durumu",      icon: "✅" },
];

function emptyEvent(orgId: string): EventItem {
  return { id: `etk-${Date.now()}`, title: "", date: "", location: "", isPublic: true,
    description: "", capacity: undefined, agenda: [], attachments: [], availabilityPoll: [],
    organizerSubscriberId: orgId };
}

// ─── Ana bileşen ───────────────────────────────────────────────
export default function EtkinlikAraciPage() {
  const { current: firma, loading: firmaLoading } = useFirma();
  const [events, setEvents]             = useState<EventItem[]>([]);
  const [projects, setProjects]         = useState<Project[]>([]);
  const [allSubscribers, setAllSubs]    = useState<Subscriber[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [rsvps, setRsvps]               = useState<EventRsvp[]>([]);
  const [activeTab, setActiveTab]       = useState<ActiveTab>("bilgiler");
  const [creating, setCreating]         = useState(false);
  const [draftEvent, setDraftEvent]     = useState<EventItem | null>(null);
  const [dataLoading, setDataLoading]   = useState(true);

  useEffect(() => {
    if (!firma) { setDataLoading(false); return; }
    const db = getDataProvider();
    Promise.all([db.getEvents(), db.getProjects(), db.getSubscribers()]).then(([evts, prjs, subs]) => {
      const mine = evts.filter((e) => e.organizerSubscriberId === firma.id);
      setEvents(mine);
      setProjects(prjs);
      setAllSubs(subs);
      if (mine.length > 0) setActiveEventId(mine[0].id);
      setDataLoading(false);
    });
  }, [firma]);

  useEffect(() => {
    if (!activeEventId) { setRsvps([]); return; }
    getDataProvider().getRsvps(activeEventId).then(setRsvps);
  }, [activeEventId]);

  const activeEvent = useMemo(() => events.find((e) => e.id === activeEventId) ?? null, [events, activeEventId]);

  const updateEvent = async (patch: Partial<EventItem>) => {
    if (!activeEvent) return;
    const updated = { ...activeEvent, ...patch };
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    await getDataProvider().saveEvent(updated);
  };

  const startCreating = () => {
    if (!firma) return;
    setDraftEvent(emptyEvent(firma.id));
    setCreating(true);
    setActiveTab("bilgiler");
  };

  const saveNewEvent = async () => {
    if (!draftEvent || !draftEvent.title || !draftEvent.date) return;
    await getDataProvider().saveEvent(draftEvent);
    setEvents((prev) => [draftEvent, ...prev]);
    setActiveEventId(draftEvent.id);
    setCreating(false);
    setDraftEvent(null);
    setActiveTab("musaitlik");
  };

  if (firmaLoading || dataLoading) {
    return <PageShell><div className="max-w-4xl mx-auto px-6 py-16 text-center text-slate">Yükleniyor…</div></PageShell>;
  }

  if (!firma) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "Etkinlik Yönetimi" }]} />
          <h1 className="text-2xl font-bold text-ink mb-3">Etkinlik Yönetimi</h1>
          <div className="bg-surface rounded-2xl p-8 text-center">
            <p className="text-slate mb-4">Etkinlik oluşturmak için firma hesabınızla giriş yapmalısınız.</p>
            <Link href="/giris" className="inline-block px-5 py-2.5 bg-eu text-white rounded-lg text-sm font-semibold">Giriş Yap</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const myProjects = projects.filter((pr) => pr.ownerSubscriberId === firma.id || pr.consortiumMembers?.some((m) => m.subscriberId === firma.id));

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "Etkinlik Yönetimi" }]} />

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-ink">Etkinlik Yönetimi</h1>
          <button onClick={startCreating} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">+ Yeni Etkinlik</button>
        </div>

        {/* Etkinlik oluşturma */}
        {creating && draftEvent && (
          <EventCreateForm
            event={draftEvent} setEvent={setDraftEvent}
            myProjects={myProjects} onSave={saveNewEvent}
            onCancel={() => { setCreating(false); setDraftEvent(null); }} />
        )}

        {events.length === 0 && !creating ? (
          <div className="bg-surface rounded-2xl p-10 text-center">
            <p className="text-slate mb-4">Henüz bir etkinlik oluşturmadınız.</p>
            <button onClick={startCreating} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">+ İlk Etkinliğinizi Oluşturun</button>
          </div>
        ) : (
          events.length > 0 && (
            <>
              {/* Etkinlik seçici */}
              <div className="flex flex-wrap gap-2 mb-5">
                {events.map((e) => (
                  <button key={e.id} onClick={() => { setActiveEventId(e.id); setActiveTab("bilgiler"); }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeEventId === e.id ? "bg-eu text-white" : "bg-surface text-slate hover:bg-line"}`}>
                    {e.title || "(Başlıksız)"}
                  </button>
                ))}
              </div>

              {activeEvent && (
                <>
                  {/* Sekme navigasyonu */}
                  <div className="flex flex-wrap gap-2 mb-6 border-b border-line pb-4">
                    {TABS.map((tab) => (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          activeTab === tab.id ? "bg-ink text-white" : "bg-white border border-line text-slate hover:bg-surface"
                        }`}>
                        <span className="text-base leading-none">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {activeTab === "bilgiler" && <EventInfoTab event={activeEvent} myProjects={myProjects} onUpdate={updateEvent} />}
                  {activeTab === "musaitlik" && <AvailabilityTab event={activeEvent} onUpdate={updateEvent} />}
                  {activeTab === "gundem"    && <AgendaTab event={activeEvent} onUpdate={updateEvent} />}
                  {activeTab === "dosyalar"  && <AttachmentsTab event={activeEvent} onUpdate={updateEvent} />}
                  {activeTab === "davetiye"  && <InvitationTab event={activeEvent} rsvps={rsvps} setRsvps={setRsvps} allSubscribers={allSubscribers} />}
                  {activeTab === "katilim"   && <AttendanceTab event={activeEvent} rsvps={rsvps} setRsvps={setRsvps} />}
                </>
              )}
            </>
          )
        )}
      </div>
    </PageShell>
  );
}

// ─── Etkinlik Oluşturma Formu ──────────────────────────────────
function EventCreateForm({ event, setEvent, myProjects, onSave, onCancel }: {
  event: EventItem;
  setEvent: (fn: (p: EventItem | null) => EventItem | null) => void;
  myProjects: Project[];
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-eu-pale border border-eu/20 rounded-2xl p-5 mb-6">
      <h3 className="font-bold text-ink mb-4">Yeni Etkinlik — Temel Bilgiler</h3>
      <p className="text-xs text-mist mb-4">Etkinliği oluşturduktan sonra gündem, müsaitlik anketi, dosyalar ve davetiye araçlarına sekmelerden ulaşabilirsiniz.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-mist mb-1">Etkinlik Başlığı *</label>
          <input value={event.title} onChange={(e) => setEvent((p) => p && ({ ...p, title: e.target.value }))}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">Tarih & Saat *</label>
          <input type="datetime-local" value={event.date} onChange={(e) => setEvent((p) => p && ({ ...p, date: e.target.value }))}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">Lokasyon</label>
          <input value={event.location} onChange={(e) => setEvent((p) => p && ({ ...p, location: e.target.value }))}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">İlgili Proje</label>
          <select value={event.projectId ?? ""} onChange={(e) => setEvent((p) => p && ({ ...p, projectId: e.target.value || undefined }))}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
            <option value="">— Seçilmedi —</option>
            {myProjects.map((pr) => <option key={pr.id} value={pr.id}>{pr.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">Kapasite</label>
          <input type="number" value={event.capacity ?? ""} onChange={(e) => setEvent((p) => p && ({ ...p, capacity: e.target.value ? Number(e.target.value) : undefined }))}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-mist mb-1">Açıklama</label>
          <textarea value={event.description ?? ""} onChange={(e) => setEvent((p) => p && ({ ...p, description: e.target.value }))}
            rows={2} className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <input type="checkbox" id="isPublicNew" checked={event.isPublic} onChange={(e) => setEvent((p) => p && ({ ...p, isPublic: e.target.checked }))} />
          <label htmlFor="isPublicNew" className="text-sm text-slate">Açık etkinlik (herkese görünür, RSVP ile katılım)</label>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Oluştur ve Devam Et</button>
        <button onClick={onCancel} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
      </div>
    </div>
  );
}

// ─── Sekme: Etkinlik Bilgileri ─────────────────────────────────
function EventInfoTab({ event, myProjects, onUpdate }: { event: EventItem; myProjects: Project[]; onUpdate: (patch: Partial<EventItem>) => void }) {
  const [form, setForm] = useState({ title: event.title, date: event.date, location: event.location,
    description: event.description ?? "", capacity: event.capacity?.toString() ?? "",
    isPublic: event.isPublic, projectId: event.projectId ?? "" });
  const [saved, setSaved] = useState(false);

  const save = () => {
    onUpdate({ title: form.title, date: form.date, location: form.location, description: form.description,
      capacity: form.capacity ? Number(form.capacity) : undefined, isPublic: form.isPublic,
      projectId: form.projectId || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white border border-line rounded-2xl p-5">
      <h3 className="font-bold text-ink mb-4">Etkinlik Bilgileri</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-mist mb-1">Etkinlik Başlığı *</label>
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">Tarih & Saat *</label>
          <input type="datetime-local" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">Lokasyon</label>
          <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">İlgili Proje</label>
          <select value={form.projectId} onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
            <option value="">— Seçilmedi —</option>
            {myProjects.map((pr) => <option key={pr.id} value={pr.id}>{pr.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-mist mb-1">Kapasite</label>
          <input type="number" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-mist mb-1">Açıklama</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3} className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <input type="checkbox" id="isPublicEdit" checked={form.isPublic} onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))} />
          <label htmlFor="isPublicEdit" className="text-sm text-slate">Açık etkinlik (herkese görünür)</label>
        </div>
      </div>
      <button onClick={save} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
        {saved ? "Kaydedildi ✓" : "Değişiklikleri Kaydet"}
      </button>
    </div>
  );
}

// ─── Sekme: Müsaitlik Anketi ───────────────────────────────────
function AvailabilityTab({ event, onUpdate }: { event: EventItem; onUpdate: (p: Partial<EventItem>) => void }) {
  const [newOption, setNewOption] = useState("");
  const options = event.availabilityPoll ?? [];

  const addOption = () => {
    if (!newOption.trim()) return;
    const opt: AvailabilityPollOption = { id: `poll-${Date.now()}`, label: newOption.trim(), votes: [] };
    onUpdate({ availabilityPoll: [...options, opt] });
    setNewOption("");
  };
  const removeOption = (id: string) => onUpdate({ availabilityPoll: options.filter((o) => o.id !== id) });
  const simulateVote = (id: string) => {
    const fake = `katilimci${Math.floor(Math.random() * 999)}@ornek.com`;
    onUpdate({ availabilityPoll: options.map((o) => o.id === id ? { ...o, votes: [...o.votes, fake] } : o) });
  };
  const maxVotes = Math.max(1, ...options.map((o) => o.votes.length));

  return (
    <div className="bg-white border border-line rounded-2xl p-5">
      <h3 className="font-bold text-ink mb-1">Müsaitlik Anketi</h3>
      <p className="text-sm text-mist mb-4">Tarih netleşmeden önce davetlilerden uygun oldukları seçenekleri toplayın.</p>
      <div className="flex gap-2 mb-4">
        <input value={newOption} onChange={(e) => setNewOption(e.target.value)}
          placeholder="Örn. 14 Temmuz Pazartesi, 10:00"
          className="flex-1 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        <button onClick={addOption} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Ekle</button>
      </div>
      {options.length === 0 ? <p className="text-sm text-mist">Henüz seçenek eklenmedi.</p> : (
        <div className="space-y-3">
          {options.map((o) => (
            <div key={o.id} className="p-3 bg-surface rounded-xl">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="font-semibold text-ink text-sm">{o.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-mist">{o.votes.length} oy</span>
                  <button onClick={() => simulateVote(o.id)} className="text-xs text-eu hover:underline">+ Demo Oy</button>
                  <button onClick={() => removeOption(o.id)} className="text-xs text-mist hover:text-tr">Sil</button>
                </div>
              </div>
              <div className="h-2 bg-line rounded-full overflow-hidden">
                <div className="h-2 bg-eu rounded-full transition-all" style={{ width: `${(o.votes.length / maxVotes) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sekme: Gündem ─────────────────────────────────────────────
function AgendaTab({ event, onUpdate }: { event: EventItem; onUpdate: (p: Partial<EventItem>) => void }) {
  const [form, setForm] = useState({ time: "", title: "", presenter: "", durationMin: 30 });
  const agenda = event.agenda ?? [];

  const addItem = () => {
    if (!form.title || !form.time) return;
    const item: AgendaItem = { id: `agd-${Date.now()}`, ...form };
    onUpdate({ agenda: [...agenda, item].sort((a, b) => a.time.localeCompare(b.time)) });
    setForm({ time: "", title: "", presenter: "", durationMin: 30 });
  };
  const removeItem = (id: string) => onUpdate({ agenda: agenda.filter((a) => a.id !== id) });
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...agenda];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    onUpdate({ agenda: arr });
  };

  return (
    <div className="bg-white border border-line rounded-2xl p-5">
      <h3 className="font-bold text-ink mb-1">Gündem</h3>
      <p className="text-sm text-mist mb-4">Etkinlik gündemini oluşturun; davetiyeyle birlikte paylaşılır.</p>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-4">
        <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
          className="md:col-span-1 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Başlık *"
          className="md:col-span-2 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        <input value={form.presenter} onChange={(e) => setForm((f) => ({ ...f, presenter: e.target.value }))} placeholder="Sunucu"
          className="md:col-span-1 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        <div className="md:col-span-1 flex items-center gap-1">
          <input type="number" value={form.durationMin} onChange={(e) => setForm((f) => ({ ...f, durationMin: Number(e.target.value) }))}
            className="w-16 px-2 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
          <span className="text-xs text-mist">dk</span>
        </div>
        <button onClick={addItem} className="md:col-span-1 px-3 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Ekle</button>
      </div>
      {agenda.length === 0 ? <p className="text-sm text-mist">Gündem maddesi eklenmedi.</p> : (
        <div className="space-y-2">
          {agenda.map((a, idx) => (
            <div key={a.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-mist hover:text-eu disabled:opacity-20 text-xs">▲</button>
              </div>
              <span className="text-sm font-bold text-eu w-14 flex-shrink-0">{a.time}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{a.title}</p>
                <p className="text-xs text-mist">{a.presenter && `${a.presenter} · `}{a.durationMin} dk</p>
              </div>
              <button onClick={() => removeItem(a.id)} className="text-xs text-mist hover:text-tr">Sil</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sekme: Dosyalar ───────────────────────────────────────────
function AttachmentsTab({ event, onUpdate }: { event: EventItem; onUpdate: (p: Partial<EventItem>) => void }) {
  const attachments = event.attachments ?? [];
  const addFile = (fileName: string) => {
    const att: EventAttachment = { id: `att-${Date.now()}`, name: fileName, uploadedAt: new Date().toISOString() };
    onUpdate({ attachments: [...attachments, att] });
  };
  const removeFile = (id: string) => onUpdate({ attachments: attachments.filter((a) => a.id !== id) });

  return (
    <div className="bg-white border border-line rounded-2xl p-5">
      <h3 className="font-bold text-ink mb-1">Dosyalar</h3>
      <p className="text-sm text-mist mb-4">Gündem dokümanı, sunum veya destekleyici dosyaları ekleyin.</p>
      <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-line rounded-xl cursor-pointer hover:border-eu hover:bg-eu-pale transition-colors mb-4">
        <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) addFile(f.name); e.target.value = ""; }} />
        <span className="text-slate text-sm">📎 Dosya seçmek için tıklayın</span>
      </label>
      {attachments.length === 0 ? <p className="text-sm text-mist">Henüz dosya eklenmedi.</p> : (
        <div className="space-y-2">
          {attachments.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 p-3 bg-surface rounded-xl">
              <span className="text-sm font-medium text-ink">📄 {a.name}</span>
              <button onClick={() => removeFile(a.id)} className="text-xs text-mist hover:text-tr">Sil</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sekme: Davetiye & LCV ─────────────────────────────────────
function InvitationTab({ event, rsvps, setRsvps, allSubscribers }: {
  event: EventItem; rsvps: EventRsvp[]; setRsvps: (r: EventRsvp[]) => void; allSubscribers: Subscriber[];
}) {
  const [bulkEmails, setBulkEmails] = useState("");
  const [subSearch, setSubSearch] = useState("");
  const [subFilterType, setSubFilterType] = useState("");

  const sendInvite = async (name: string, email: string, organization?: string) => {
    if (!name || !email) return;
    if (rsvps.some((r) => r.email === email)) return; // zaten davetli
    const rsvp: EventRsvp = {
      id: `rsvp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      eventId: event.id, name, email, organization,
      status: "bekliyor", createdAt: new Date().toISOString(),
      invited: true, invitedAt: new Date().toISOString(),
    };
    await getDataProvider().saveRsvp(rsvp);
    setRsvps([...rsvps, rsvp]);
  };

  const sendBulkEmails = async () => {
    const lines = bulkEmails.split(/[,;\n]/).map((l) => l.trim()).filter(Boolean);
    for (const emailOrEntry of lines) {
      const match = emailOrEntry.match(/^([^<]+?)\s*<([^>]+)>$/) ?? null;
      if (match) { await sendInvite(match[1].trim(), match[2].trim()); }
      else if (emailOrEntry.includes("@")) { await sendInvite(emailOrEntry, emailOrEntry); }
    }
    setBulkEmails("");
  };

  const filteredSubs = allSubscribers.filter((s) => {
    const q = subSearch.toLocaleLowerCase("tr");
    const inSearch = !q || [s.name, s.organization ?? "", s.email].join(" ").toLocaleLowerCase("tr").includes(q);
    const inType = !subFilterType || s.profileType === subFilterType;
    return inSearch && inType;
  });

  const profileTypes = Array.from(new Set(allSubscribers.map((s) => s.profileType)));
  const invited = rsvps.filter((r) => r.invited);
  const responded = invited.filter((r) => r.status !== "bekliyor");

  return (
    <div className="space-y-5">
      {/* Toplu e-posta girişi */}
      <div className="bg-white border border-line rounded-2xl p-5">
        <h3 className="font-bold text-ink mb-1">E-posta ile Davet</h3>
        <p className="text-sm text-mist mb-3">
          Her satıra bir adres veya <code className="bg-surface px-1 rounded text-xs">Ad Soyad &lt;eposta@ornek.com&gt;</code> formatında girin. Virgül veya satır başı ile ayırın.
        </p>
        <textarea value={bulkEmails} onChange={(e) => setBulkEmails(e.target.value)} rows={4}
          placeholder={"Ahmet Yılmaz <ahmet@ornek.com>\nfatma@ornek.com\nMehmet Kaya <mehmet@ornek.com>"}
          className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none font-mono mb-3" />
        <button onClick={sendBulkEmails} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Davetiye Gönder</button>
      </div>

      {/* Kayıtlı profil listesi */}
      <div className="bg-white border border-line rounded-2xl p-5">
        <h3 className="font-bold text-ink mb-3">Kayıtlı Profiller</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <input value={subSearch} onChange={(e) => setSubSearch(e.target.value)} placeholder="Ad, kurum veya e-posta ara…"
            className="flex-1 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
          <select value={subFilterType} onChange={(e) => setSubFilterType(e.target.value)}
            className="px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
            <option value="">Tüm Profil Türleri</option>
            {profileTypes.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
          </select>
        </div>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {filteredSubs.map((s) => {
            const alreadyInvited = rsvps.some((r) => r.email === s.email);
            return (
              <div key={s.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-surface">
                <div>
                  <p className="text-sm font-medium text-ink">{s.organization ?? s.name}</p>
                  <p className="text-xs text-mist">{s.email} · {s.profileType}</p>
                </div>
                {alreadyInvited ? (
                  <span className="text-xs text-green-600 font-semibold">Davetlendi ✓</span>
                ) : (
                  <button onClick={() => sendInvite(s.organization ?? s.name, s.email, s.organization)}
                    className="text-xs font-semibold text-eu hover:underline">Davet Et</button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Özet istatistikler */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-ink">{invited.length}</div>
          <div className="text-xs text-mist">Davet Gönderildi</div>
        </div>
        <div className="bg-surface rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-eu">{responded.length}</div>
          <div className="text-xs text-mist">LCV Yanıtı Geldi</div>
        </div>
      </div>

      {/* Davetli tablosu */}
      {invited.length > 0 && (
        <div className="bg-white border border-line rounded-xl overflow-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="bg-surface border-b border-line">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate">Davetli</th>
                <th className="text-left px-4 py-3 font-semibold text-slate">E-posta</th>
                <th className="text-left px-4 py-3 font-semibold text-slate">LCV Durumu</th>
              </tr>
            </thead>
            <tbody>
              {invited.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-4 py-3 font-medium text-ink">{r.name}</td>
                  <td className="px-4 py-3 text-slate">{r.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Sekme: Katılım Durumu ─────────────────────────────────────
function AttendanceTab({ event, rsvps, setRsvps }: { event: EventItem; rsvps: EventRsvp[]; setRsvps: (r: EventRsvp[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", org: "" });

  const counts = {
    onaylandi: rsvps.filter((r) => r.status === "onaylandi").length,
    bekliyor:  rsvps.filter((r) => r.status === "bekliyor").length,
    iptal:     rsvps.filter((r) => r.status === "iptal").length,
  };
  const capacityUsed = event.capacity ? Math.round((counts.onaylandi / event.capacity) * 100) : null;

  const addRsvp = async () => {
    if (!form.name || !form.email) return;
    const rsvp: EventRsvp = { id: `rsvp-${Date.now()}`, eventId: event.id, name: form.name,
      email: form.email, organization: form.org || undefined, status: "onaylandi", createdAt: new Date().toISOString() };
    await getDataProvider().saveRsvp(rsvp);
    setRsvps([...rsvps, rsvp]);
    setForm({ name: "", email: "", org: "" }); setAdding(false);
  };
  const cycleStatus = async (r: EventRsvp) => {
    const updated = { ...r, status: STATUS_NEXT[r.status], respondedAt: new Date().toISOString() };
    await getDataProvider().saveRsvp(updated);
    setRsvps(rsvps.map((x) => (x.id === r.id ? updated : x)));
  };
  const remove = async (id: string) => {
    await getDataProvider().removeRsvp(id);
    setRsvps(rsvps.filter((r) => r.id !== id));
  };
  const exportCSV = () => {
    const header = "Ad,E-posta,Kurum,Durum";
    const rows = rsvps.map((r) => `${r.name},${r.email},${r.organization ?? ""},${r.status}`);
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "katilimcilar.csv"; a.click();
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-5">
        {(["onaylandi", "bekliyor", "iptal"] as const).map((s) => (
          <div key={s} className={`rounded-xl p-4 text-center ${STATUS_COLOR[s]}`}>
            <div className="text-2xl font-bold">{counts[s]}</div>
            <div className="text-xs font-semibold">{STATUS_LABEL[s]}</div>
          </div>
        ))}
      </div>
      {capacityUsed !== null && (
        <div className="bg-surface rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between text-xs text-mist mb-1.5">
            <span>Kapasite kullanımı</span>
            <span>{counts.onaylandi} / {event.capacity}</span>
          </div>
          <div className="h-2 bg-line rounded-full overflow-hidden">
            <div className={`h-2 rounded-full transition-all ${capacityUsed >= 100 ? "bg-tr" : "bg-eu"}`} style={{ width: `${Math.min(100, capacityUsed)}%` }} />
          </div>
        </div>
      )}
      <div className="flex gap-3 mb-5">
        <button onClick={() => setAdding(true)} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">+ Katılımcı Ekle</button>
        <button onClick={exportCSV} className="px-4 py-2 border border-line text-slate rounded-lg text-sm font-semibold hover:bg-surface">CSV İndir</button>
      </div>
      {adding && (
        <div className="bg-eu-pale border border-eu/20 rounded-xl p-5 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ad Soyad *"
              className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="E-posta *"
              className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            <input value={form.org} onChange={(e) => setForm((f) => ({ ...f, org: e.target.value }))} placeholder="Kurum"
              className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
          </div>
          <div className="flex gap-2">
            <button onClick={addRsvp} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Ekle</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
          </div>
        </div>
      )}
      <div className="bg-white border border-line rounded-xl overflow-auto">
        <table className="w-full text-sm min-w-[540px]">
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
            {rsvps.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-mist">Kayıtlı katılımcı yok.</td></tr>
            ) : rsvps.map((r) => (
              <tr key={r.id} className="border-t border-line hover:bg-surface/50">
                <td className="px-4 py-3 font-medium text-ink">{r.name}</td>
                <td className="px-4 py-3 text-slate">{r.email}</td>
                <td className="px-4 py-3 text-slate">{r.organization ?? "—"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => cycleStatus(r)} className={`text-xs font-semibold px-2 py-0.5 rounded-full cursor-pointer ${STATUS_COLOR[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(r.id)} className="text-mist hover:text-tr text-xs">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-mist mt-2">Durum etiketine tıklayarak döngüsel olarak değiştirebilirsiniz.</p>
    </div>
  );
}
