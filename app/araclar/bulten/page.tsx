"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { sendBulkEmail } from "@/lib/tools/email";
import { PageShell } from "@/components/PageShell";
import type { Subscriber, Campaign } from "@/lib/types";

type Tab = "kampanyalar" | "aboneler";

export default function NewsletterToolPage() {
  const [tab, setTab] = useState<Tab>("kampanyalar");

  return (
    <PageShell>
      <div className="bg-eu-deep text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <Link href="/araclar" className="text-white/70 text-sm hover:text-white">← Araçlar</Link>
          <h1 className="text-2xl md:text-3xl font-bold mt-3">Bülten Gönderimi</h1>
          <p className="text-white/80 mt-2">Alıcı listenizi yönetin, hedefli kampanyalar oluşturun ve gönderin.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex gap-1 mb-6 bg-white border border-line rounded-lg p-1 w-fit">
          <TabBtn active={tab === "kampanyalar"} onClick={() => setTab("kampanyalar")} label="Kampanyalar" />
          <TabBtn active={tab === "aboneler"} onClick={() => setTab("aboneler")} label="Aboneler" />
        </div>

        {tab === "kampanyalar" ? <CampaignsTab /> : <SubscribersTab />}
      </div>
    </PageShell>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-semibold transition ${active ? "bg-eu text-white" : "text-slate hover:bg-line/40"}`}>
      {label}
    </button>
  );
}

const inp = "px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-eu/30";

/* ============== ABONELER ============== */
function SubscribersTab() {
  const db = getDataProvider();
  const [list, setList] = useState<Subscriber[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [tags, setTags] = useState("");

  const load = useCallback(() => { db.getSubscribers().then(setList); }, [db]);
  useEffect(() => { load(); }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const sub: Subscriber = {
      id: `sub-${Date.now()}`, email, name: name || undefined, organization: org || undefined,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      subscribed: true, addedAt: new Date().toISOString(),
    };
    await db.saveSubscriber(sub);
    setEmail(""); setName(""); setOrg(""); setTags(""); load();
  }
  async function toggleSub(s: Subscriber) {
    await db.saveSubscriber({ ...s, subscribed: !s.subscribed }); load();
  }
  async function remove(id: string) {
    if (!confirm("Abone silinsin mi?")) return;
    await db.removeSubscriber(id); load();
  }

  const active = list.filter((s) => s.subscribed).length;

  return (
    <div>
      <form onSubmit={add} className="bg-white border border-line rounded-xl p-4 mb-5 grid sm:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3">
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta" className={inp} />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad (ops.)" className={inp} />
        <input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Kurum (ops.)" className={inp} />
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Etiket (virgülle)" className={inp} />
        <button className="px-4 py-2 rounded-lg bg-eu text-white text-sm font-semibold whitespace-nowrap">+ Ekle</button>
      </form>

      {list.length === 0 ? (
        <Empty text="Henüz abone yok." />
      ) : (
        <>
          <div className="bg-white border border-line rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f4f6fa] text-left">
                <tr>{["E-posta", "Ad", "Kurum", "Etiketler", "Durum", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs uppercase tracking-wide text-slate font-semibold">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((s) => (
                  <tr key={s.id} className="hover:bg-[#f9fafb]">
                    <td className="px-4 py-3 font-medium text-ink">{s.email}</td>
                    <td className="px-4 py-3 text-slate">{s.name ?? "—"}</td>
                    <td className="px-4 py-3 text-slate">{s.organization ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.tags.map((t) => <span key={t} className="text-[10px] bg-eu-pale text-eu px-2 py-0.5 rounded-full">{t}</span>)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSub(s)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.subscribed ? "bg-green-100 text-green-700" : "bg-line text-slate"}`}>
                        {s.subscribed ? "Aktif" : "Pasif"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(s.id)} className="text-tr text-sm hover:underline">Sil</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate mt-4">{list.length} abone · <strong className="text-green-700">{active} aktif</strong></p>
        </>
      )}
    </div>
  );
}

/* ============== KAMPANYALAR ============== */
function CampaignsTab() {
  const db = getDataProvider();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [composing, setComposing] = useState(false);
  const [sending, setSending] = useState(false);

  // Form
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [targetTags, setTargetTags] = useState("");

  const load = useCallback(() => {
    Promise.all([db.getCampaigns(), db.getSubscribers()]).then(([c, s]) => {
      setCampaigns(c); setSubscribers(s);
    });
  }, [db]);
  useEffect(() => { load(); }, [load]);

  // Hedef etiketlere göre alıcı sayısı
  function recipientsFor(tags: string[]): Subscriber[] {
    const active = subscribers.filter((s) => s.subscribed);
    if (tags.length === 0) return active;
    return active.filter((s) => s.tags.some((t) => tags.includes(t)));
  }

  const parsedTags = targetTags.split(",").map((t) => t.trim()).filter(Boolean);
  const previewCount = recipientsFor(parsedTags).length;

  async function saveDraft() {
    const c: Campaign = {
      id: `camp-${Date.now()}`, subject, body, targetTags: parsedTags,
      status: "taslak", createdAt: new Date().toISOString(),
      recipientCount: 0, openCount: 0,
    };
    await db.saveCampaign(c);
    resetForm(); load();
  }

  async function sendNow() {
    const recipients = recipientsFor(parsedTags);
    if (recipients.length === 0) { alert("Hedef kitlede aktif alıcı yok."); return; }
    setSending(true);
    try {
      const res = await sendBulkEmail(recipients.map((r) => r.email), subject, body);
      const c: Campaign = {
        id: `camp-${Date.now()}`, subject, body, targetTags: parsedTags,
        status: "gonderildi", createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        recipientCount: res.delivered, openCount: 0,
      };
      await db.saveCampaign(c);
      resetForm(); load();
      alert(res.simulated
        ? `Demo: ${res.delivered} alıcıya gönderim simüle edildi. (E-posta servisi canlıda devreye girer.)`
        : `${res.delivered} alıcıya gönderildi.`);
    } finally {
      setSending(false);
    }
  }

  async function sendExisting(c: Campaign) {
    const recipients = recipientsFor(c.targetTags);
    if (recipients.length === 0) { alert("Hedef kitlede aktif alıcı yok."); return; }
    setSending(true);
    try {
      const res = await sendBulkEmail(recipients.map((r) => r.email), c.subject, c.body);
      await db.saveCampaign({ ...c, status: "gonderildi", sentAt: new Date().toISOString(), recipientCount: res.delivered });
      load();
      alert(res.simulated
        ? `Demo: ${res.delivered} alıcıya gönderim simüle edildi.`
        : `${res.delivered} alıcıya gönderildi.`);
    } finally {
      setSending(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Kampanya silinsin mi?")) return;
    await db.removeCampaign(id); load();
  }

  function resetForm() { setSubject(""); setBody(""); setTargetTags(""); setComposing(false); }

  return (
    <div>
      {!composing ? (
        <button onClick={() => setComposing(true)} className="mb-5 px-5 py-2 rounded-lg bg-eu text-white text-sm font-semibold">
          + Yeni Kampanya
        </button>
      ) : (
        <div className="bg-white border border-line rounded-xl p-5 mb-6">
          <h3 className="font-bold text-ink mb-4">Yeni Kampanya</h3>
          <div className="space-y-3">
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Konu" className={`${inp} w-full`} />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Mesaj içeriği" className={`${inp} w-full min-h-[140px]`} />
            <div className="flex flex-wrap items-center gap-3">
              <input value={targetTags} onChange={(e) => setTargetTags(e.target.value)} placeholder="Hedef etiketler (boş = herkes)" className={`${inp} flex-1 min-w-[200px]`} />
              <span className="text-sm text-slate">Hedef kitle: <strong className="text-eu">{previewCount} alıcı</strong></span>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={sendNow} disabled={sending || !subject} className="px-5 py-2 rounded-lg bg-eu text-white text-sm font-semibold disabled:opacity-50">
              {sending ? "Gönderiliyor…" : "Şimdi Gönder"}
            </button>
            <button onClick={saveDraft} disabled={!subject} className="px-5 py-2 rounded-lg border border-line text-sm font-semibold text-ink disabled:opacity-50">
              Taslak Kaydet
            </button>
            <button onClick={resetForm} className="px-5 py-2 rounded-lg text-sm text-slate">Vazgeç</button>
          </div>
        </div>
      )}

      {campaigns.length === 0 ? (
        <Empty text="Henüz kampanya yok." />
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div key={c.id} className="bg-white border border-line rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-ink">{c.subject}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.status === "gonderildi" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {c.status === "gonderildi" ? "Gönderildi" : "Taslak"}
                    </span>
                  </div>
                  <p className="text-sm text-slate mt-1 line-clamp-2">{c.body}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-mist">
                    {c.targetTags.length > 0 ? <span>Hedef: {c.targetTags.join(", ")}</span> : <span>Hedef: Tüm aktif aboneler</span>}
                    {c.status === "gonderildi" && <span>{c.recipientCount} alıcı</span>}
                    {c.status === "gonderildi" && c.sentAt && <span>{c.sentAt.slice(0, 10)}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {c.status === "taslak" && (
                    <button onClick={() => sendExisting(c)} disabled={sending} className="text-eu text-sm font-semibold hover:underline disabled:opacity-50">Gönder</button>
                  )}
                  <button onClick={() => remove(c.id)} className="text-tr text-sm hover:underline">Sil</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-slate text-sm py-8 text-center bg-white border border-line rounded-xl">{text}</p>;
}
