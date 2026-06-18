"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useFirma } from "@/lib/firma/context";
import { getDataProvider } from "@/lib/data";
import type { EventItem, EventRsvp, AgendaItem, EventAttachment, AvailabilityPollOption, Project } from "@/lib/types";

type RsvpStatus = EventRsvp["status"];
const STATUS_NEXT: Record<RsvpStatus, RsvpStatus> = { bekliyor: "onaylandi", onaylandi: "iptal", iptal: "bekliyor" };
const STATUS_LABEL: Record<RsvpStatus, string> = { onaylandi: "Katılacak ✓", bekliyor: "Yanıt Bekliyor ⏳", iptal: "Katılmayacak ✕" };
const STATUS_COLOR: Record<RsvpStatus, string> = { onaylandi: "bg-green-100 text-green-700", bekliyor: "bg-yellow-100 text-yellow-700", iptal: "bg-red-100 text-red-600" };

type Tool = "musaitlik" | "gundem" | "dosyalar" | "davetiye" | "katilim";
const TOOLS: { id: Tool; label: string; icon: string }[] = [
  { id: "musaitlik", label: "Müsaitlik Anketi", icon: "🗳️" },
  { id: "gundem", label: "Gündem", icon: "📋" },
  { id: "dosyalar", label: "Dosyalar", icon: "📎" },
  { id: "davetiye", label: "Davetiye & LCV", icon: "✉️" },
  { id: "katilim", label: "Katılım Durumu", icon: "✅" },
];

function emptyEvent(organizerSubscriberId: string): EventItem {
  return {
    id: `etk-${Date.now()}`,
    title: "", date: "", location: "", isPublic: true,
    description: "", capacity: undefined,
    agenda: [], attachments: [], availabilityPoll: [],
    organizerSubscriberId,
  };
}

export default function EtkinlikAraciPage() {
  const { current: firma, loading: firmaLoading } = useFirma();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [rsvps, setRsvps] = useState<EventRsvp[]>([]);
  const [activeTool, setActiveTool] = useState<Tool>("musaitlik");
  const [creating, setCreating] = useState(false);
  const [newEvent, setNewEvent] = useState<EventItem | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!firma) { setDataLoading(false); return; }
    const db = getDataProvider();
    Promise.all([db.getEvents(), db.getProjects()]).then(([allEvents, allProjects]) => {
      const mine = allEvents.filter((e) => e.organizerSubscriberId === firma.id);
      setEvents(mine);
      setProjects(allProjects);
      if (mine.length > 0) setActiveEventId(mine[0].id);
      setDataLoading(false);
    });
  }, [firma]);

  useEffect(() => {
    if (!activeEventId) { setRsvps([]); return; }
    getDataProvider().getRsvps(activeEventId).then(setRsvps);
  }, [activeEventId]);

  const activeEvent = useMemo(() => events.find((e) => e.id === activeEventId) ?? null, [events, activeEventId]);

  const updateActiveEvent = async (patch: Partial<EventItem>) => {
    if (!activeEvent) return;
    const updated = { ...activeEvent, ...patch };
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    await getDataProvider().saveEvent(updated);
  };

  const startCreating = () => {
    if (!firma) return;
    setNewEvent(emptyEvent(firma.id));
    setCreating(true);
  };

  const saveNewEvent = async () => {
    if (!newEvent || !newEvent.title || !newEvent.date) return;
    await getDataProvider().saveEvent(newEvent);
    setEvents((prev) => [newEvent, ...prev]);
    setActiveEventId(newEvent.id);
    setCreating(false);
    setNewEvent(null);
    setActiveTool("musaitlik");
  };

  // ---- Yükleniyor / giriş gerekli durumları ----
  if (firmaLoading || dataLoading) {
    return (
      <PageShell>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center text-slate">Yükleniyor…</div>
      </PageShell>
    );
  }

  if (!firma) {
    return (
      <PageShell>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "Etkinlik Yönetimi" }]} />
          <h1 className="text-2xl font-bold text-ink mb-3">Etkinlik Yönetimi</h1>
          <div className="bg-surface rounded-2xl p-8 text-center">
            <p className="text-slate mb-4">Etkinlik oluşturmak, davetiye göndermek ve LCV toplamak için firma hesabınızla giriş yapmalısınız.</p>
            <Link href="/giris" className="inline-block px-5 py-2.5 bg-eu text-white rounded-lg text-sm font-semibold">Giriş Yap</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "Etkinlik Yönetimi" }]} />

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-ink">Etkinlik Yönetimi</h1>
          <button onClick={startCreating} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
            + Yeni Etkinlik
          </button>
        </div>

        {/* Yeni etkinlik oluşturma formu */}
        {creating && newEvent && (
          <div className="bg-eu-pale border border-eu/20 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-ink mb-3">Yeni Etkinlik</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-mist mb-1">Etkinlik Başlığı *</label>
                <input value={newEvent.title} onChange={(e) => setNewEvent((p) => p && ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist mb-1">Tarih & Saat *</label>
                <input type="datetime-local" value={newEvent.date} onChange={(e) => setNewEvent((p) => p && ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist mb-1">Lokasyon</label>
                <input value={newEvent.location} onChange={(e) => setNewEvent((p) => p && ({ ...p, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist mb-1">İlgili Proje</label>
                <select value={newEvent.projectId ?? ""} onChange={(e) => setNewEvent((p) => p && ({ ...p, projectId: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:border-eu">
                  <option value="">— Seçilmedi —</option>
                  {projects.filter((pr) => pr.ownerSubscriberId === firma.id || pr.consortiumMembers?.some((m) => m.subscriberId === firma.id)).map((pr) => (
                    <option key={pr.id} value={pr.id}>{pr.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist mb-1">Kapasite</label>
                <input type="number" value={newEvent.capacity ?? ""} onChange={(e) => setNewEvent((p) => p && ({ ...p, capacity: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-mist mb-1">Açıklama</label>
                <textarea value={newEvent.description ?? ""} onChange={(e) => setNewEvent((p) => p && ({ ...p, description: e.target.value }))}
                  rows={2} className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
              </div>
              <div className="md:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="isPublic" checked={newEvent.isPublic} onChange={(e) => setNewEvent((p) => p && ({ ...p, isPublic: e.target.checked }))} />
                <label htmlFor="isPublic" className="text-sm text-slate">Açık etkinlik (herkese görünür, RSVP ile katılım)</label>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveNewEvent} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Oluştur</button>
              <button onClick={() => { setCreating(false); setNewEvent(null); }} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
            </div>
          </div>
        )}

        {events.length === 0 && !creating ? (
          <div className="bg-surface rounded-2xl p-10 text-center">
            <p className="text-slate mb-4">Henüz bir etkinlik oluşturmadınız.</p>
            <button onClick={startCreating} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">+ İlk Etkinliğinizi Oluşturun</button>
          </div>
        ) : (
          <>
            {/* Etkinlik seçimi */}
            <div className="flex flex-wrap gap-2 mb-6">
              {events.map((e) => (
                <button key={e.id} onClick={() => setActiveEventId(e.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeEventId === e.id ? "bg-eu text-white" : "bg-surface text-slate hover:bg-line"}`}>
                  {e.title || "(Başlıksız)"}
                </button>
              ))}
            </div>

            {activeEvent && (
              <>
                {/* Araç sekmeleri */}
                <div className="flex flex-wrap gap-2 mb-6 border-b border-line pb-4">
                  {TOOLS.map((tool) => (
                    <button key={tool.id} onClick={() => setActiveTool(tool.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        activeTool === tool.id ? "bg-ink text-white" : "bg-white border border-line text-slate hover:bg-surface"
                      }`}>
                      <span>{tool.icon}</span> {tool.label}
                    </button>
                  ))}
                </div>

                {activeTool === "musaitlik" && (
                  <AvailabilityTool event={activeEvent} onUpdate={updateActiveEvent} />
                )}
                {activeTool === "gundem" && (
                  <AgendaTool event={activeEvent} onUpdate={updateActiveEvent} />
                )}
                {activeTool === "dosyalar" && (
                  <AttachmentsTool event={activeEvent} onUpdate={updateActiveEvent} />
                )}
                {activeTool === "davetiye" && (
                  <InvitationTool event={activeEvent} rsvps={rsvps} setRsvps={setRsvps} />
                )}
                {activeTool === "katilim" && (
                  <AttendanceTool event={activeEvent} rsvps={rsvps} setRsvps={setRsvps} />
                )}
              </>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}

// ============================================================
// Araç 1: Müsaitlik Anketi
// ============================================================
function AvailabilityTool({ event, onUpdate }: { event: EventItem; onUpdate: (patch: Partial<EventItem>) => void }) {
  const [newOption, setNewOption] = useState("");
  const options = event.availabilityPoll ?? [];

  const addOption = () => {
    if (!newOption.trim()) return;
    const opt: AvailabilityPollOption = { id: `poll-${Date.now()}`, label: newOption.trim(), votes: [] };
    onUpdate({ availabilityPoll: [...options, opt] });
    setNewOption("");
  };

  const removeOption = (id: string) => onUpdate({ availabilityPoll: options.filter((o) => o.id !== id) });

  // Demo: oy ekleme simülasyonu (davetli e-postası gibi)
  const simulateVote = (id: string) => {
    const fakeEmail = `katilimci${Math.floor(Math.random() * 1000)}@ornek.com`;
    onUpdate({
      availabilityPoll: options.map((o) => (o.id === id ? { ...o, votes: [...o.votes, fakeEmail] } : o)),
    });
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

      {options.length === 0 ? (
        <p className="text-sm text-mist">Henüz seçenek eklenmedi.</p>
      ) : (
        <div className="space-y-3">
          {options.map((o) => (
            <div key={o.id} className="p-3 bg-surface rounded-xl">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="font-semibold text-ink text-sm">{o.label}</span>
                <div className="flex items-center gap-2">
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
      <p className="text-xs text-mist mt-4">Not: Davetliler kendi bağlantılarından oy verdiğinde sonuçlar burada gerçek zamanlı güncellenir. &quot;Demo Oy&quot; butonu test amaçlıdır.</p>
    </div>
  );
}

// ============================================================
// Araç 2: Gündem
// ============================================================
function AgendaTool({ event, onUpdate }: { event: EventItem; onUpdate: (patch: Partial<EventItem>) => void }) {
  const [form, setForm] = useState({ time: "", title: "", presenter: "", durationMin: 30 });
  const agenda = event.agenda ?? [];

  const addItem = () => {
    if (!form.title || !form.time) return;
    const item: AgendaItem = { id: `agd-${Date.now()}`, ...form };
    onUpdate({ agenda: [...agenda, item].sort((a, b) => a.time.localeCompare(b.time)) });
    setForm({ time: "", title: "", presenter: "", durationMin: 30 });
  };

  const removeItem = (id: string) => onUpdate({ agenda: agenda.filter((a) => a.id !== id) });

  return (
    <div className="bg-white border border-line rounded-2xl p-5">
      <h3 className="font-bold text-ink mb-1">Gündem</h3>
      <p className="text-sm text-mist mb-4">Etkinlik gündemini oluşturun; davetiyeyle birlikte paylaşılır.</p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
        <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
          className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Gündem başlığı"
          className="md:col-span-2 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        <input value={form.presenter} onChange={(e) => setForm((f) => ({ ...f, presenter: e.target.value }))} placeholder="Sunucu"
          className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        <div className="flex gap-2">
          <input type="number" value={form.durationMin} onChange={(e) => setForm((f) => ({ ...f, durationMin: Number(e.target.value) }))}
            className="w-20 px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
          <button onClick={addItem} className="px-3 py-2 bg-eu text-white rounded-lg text-sm font-semibold flex-1">Ekle</button>
        </div>
      </div>

      {agenda.length === 0 ? (
        <p className="text-sm text-mist">Henüz gündem maddesi eklenmedi.</p>
      ) : (
        <div className="space-y-2">
          {agenda.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
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

// ============================================================
// Araç 3: Dosya Ekleri
// ============================================================
function AttachmentsTool({ event, onUpdate }: { event: EventItem; onUpdate: (patch: Partial<EventItem>) => void }) {
  const attachments = event.attachments ?? [];

  const addFile = (fileName: string) => {
    if (!fileName) return;
    const att: EventAttachment = { id: `att-${Date.now()}`, name: fileName, uploadedAt: new Date().toISOString() };
    onUpdate({ attachments: [...attachments, att] });
  };

  const removeFile = (id: string) => onUpdate({ attachments: attachments.filter((a) => a.id !== id) });

  return (
    <div className="bg-white border border-line rounded-2xl p-5">
      <h3 className="font-bold text-ink mb-1">Dosyalar</h3>
      <p className="text-sm text-mist mb-4">Gündem dokümanı, sunum veya destekleyici dosyaları ekleyin. Davetiyeyle birlikte paylaşılır.</p>

      <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-line rounded-xl cursor-pointer hover:border-eu hover:bg-eu-pale transition-colors mb-4">
        <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) addFile(f.name); e.target.value = ""; }} />
        <span className="text-slate text-sm">📎 Dosya seçmek için tıklayın</span>
      </label>

      {attachments.length === 0 ? (
        <p className="text-sm text-mist">Henüz dosya eklenmedi.</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 p-3 bg-surface rounded-xl">
              <div className="flex items-center gap-2">
                <span>📄</span>
                <span className="text-sm font-medium text-ink">{a.name}</span>
              </div>
              <button onClick={() => removeFile(a.id)} className="text-xs text-mist hover:text-tr">Sil</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Araç 4: Davetiye Gönderme & LCV Toplama
// ============================================================
function InvitationTool({ event, rsvps, setRsvps }: { event: EventItem; rsvps: EventRsvp[]; setRsvps: (r: EventRsvp[]) => void }) {
  const [form, setForm] = useState({ name: "", email: "", organization: "" });
  const [bulkText, setBulkText] = useState("");

  const sendInvite = async (name: string, email: string, organization?: string) => {
    if (!name || !email) return;
    const rsvp: EventRsvp = {
      id: `rsvp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      eventId: event.id, name, email, organization,
      status: "bekliyor", createdAt: new Date().toISOString(),
      invited: true, invitedAt: new Date().toISOString(),
    };
    await getDataProvider().saveRsvp(rsvp);
    setRsvps([...rsvps, rsvp]);
  };

  const sendSingle = () => {
    sendInvite(form.name, form.email, form.organization || undefined);
    setForm({ name: "", email: "", organization: "" });
  };

  const sendBulk = () => {
    const lines = bulkText.split("\n").map((l) => l.trim()).filter(Boolean);
    lines.forEach((line) => {
      const [name, email, organization] = line.split(",").map((s) => s.trim());
      if (name && email) sendInvite(name, email, organization || undefined);
    });
    setBulkText("");
  };

  const invited = rsvps.filter((r) => r.invited);
  const responded = invited.filter((r) => r.status !== "bekliyor");

  return (
    <div className="space-y-5">
      <div className="bg-white border border-line rounded-2xl p-5">
        <h3 className="font-bold text-ink mb-1">Davetiye Gönder</h3>
        <p className="text-sm text-mist mb-4">Tekli davet gönderin veya birden fazla kişiyi toplu olarak davet edin. Davet edilenler LCV (Lütfen Cevap Veriniz) bağlantısıyla yanıtlarını iletebilir.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ad Soyad *"
            className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
          <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="E-posta *" type="email"
            className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
          <input value={form.organization} onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))} placeholder="Kurum"
            className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
        </div>
        <button onClick={sendSingle} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold mb-5">Davetiye Gönder</button>

        <div className="border-t border-line pt-4">
          <label className="block text-xs font-semibold text-mist mb-1.5">Toplu Davet (her satıra: Ad Soyad, E-posta, Kurum)</label>
          <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} rows={4}
            placeholder={"Ahmet Yılmaz, ahmet@ornek.com, ABC Danışmanlık\nFatma Demir, fatma@ornek.com, XYZ Firma"}
            className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none font-mono" />
          <button onClick={sendBulk} className="mt-2 px-4 py-2 border border-eu text-eu rounded-lg text-sm font-semibold hover:bg-eu-pale">
            Toplu Gönder
          </button>
        </div>
      </div>

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

      {invited.length > 0 && (
        <div className="bg-white border border-line rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
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

// ============================================================
// Araç 5: Katılım Durumu Takibi
// ============================================================
function AttendanceTool({ event, rsvps, setRsvps }: { event: EventItem; rsvps: EventRsvp[]; setRsvps: (r: EventRsvp[]) => void }) {
  const [form, setForm] = useState({ name: "", email: "", org: "" });
  const [adding, setAdding] = useState(false);

  const counts = {
    onaylandi: rsvps.filter((r) => r.status === "onaylandi").length,
    bekliyor: rsvps.filter((r) => r.status === "bekliyor").length,
    iptal: rsvps.filter((r) => r.status === "iptal").length,
  };
  const capacityUsed = event.capacity ? Math.round((counts.onaylandi / event.capacity) * 100) : null;

  const addRsvp = async () => {
    if (!form.name || !form.email) return;
    const rsvp: EventRsvp = {
      id: `rsvp-${Date.now()}`, eventId: event.id, name: form.name, email: form.email,
      organization: form.org || undefined, status: "onaylandi", createdAt: new Date().toISOString(),
    };
    await getDataProvider().saveRsvp(rsvp);
    setRsvps([...rsvps, rsvp]);
    setForm({ name: "", email: "", org: "" });
    setAdding(false);
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
    const header = "Ad,E-posta,Kurum,Durum,Davet Edildi mi";
    const rows = rsvps.map((r) => `${r.name},${r.email},${r.organization ?? ""},${r.status},${r.invited ? "Evet" : "Hayır"}`);
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
          <h3 className="font-bold text-ink mb-3">Yeni Katılımcı</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ad Soyad *"
              className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="E-posta *" type="email"
              className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
            <input value={form.org} onChange={(e) => setForm((f) => ({ ...f, org: e.target.value }))} placeholder="Kurum"
              className="px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addRsvp} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Ekle</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
          </div>
        </div>
      )}

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
            {rsvps.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-mist">Kayıtlı katılımcı yok.</td></tr>
            ) : (
              rsvps.map((r) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-mist mt-3">Durum etiketine tıklayarak döngüsel olarak değiştirebilirsiniz.</p>
    </div>
  );
}
