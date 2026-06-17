"use client";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { Campaign, Subscriber } from "@/lib/types";

const SEED_SUBS: Subscriber[] = [
  { id: "sub-1", name: "Ahmet Yılmaz", email: "ahmet@danismanlik.com", organization: "ABC Danışmanlık", accountType: "sirket", plan: "paket1", tags: ["tedarikci", "tarim"], createdAt: "2026-01-15T09:00:00Z" },
  { id: "sub-2", name: "Fatma Demir", email: "fatma@firma.com", organization: "XYZ Firma", accountType: "sirket", plan: "paket2", tags: ["yararlanici"], createdAt: "2026-02-01T09:00:00Z" },
  { id: "sub-3", name: "Mehmet Kaya", email: "mehmet@insaat.com", organization: "MK İnşaat", accountType: "sirket", plan: "tedarikci", tags: ["tedarikci", "insaat"], createdAt: "2026-03-10T09:00:00Z" },
];

const SEED_CAMPS: Campaign[] = [
  { id: "camp-1", subject: "Haziran Proje Bülteni", body: "Bu ay projede tamamlanan faaliyetler ve yaklaşan etkinlikler...", targetTags: [], status: "gonderildi", createdAt: "2026-06-01T08:00:00Z", sentAt: "2026-06-02T10:00:00Z", recipientCount: 3, openCount: 2 },
  { id: "camp-2", subject: "Yeni İhale Duyurusu", body: "Yeni satınalma ilanımız yayınlandı. Detaylar için platforma giriş yapın.", targetTags: ["tedarikci"], status: "taslak", createdAt: "2026-06-10T08:00:00Z", recipientCount: 0, openCount: 0 },
];

export default function BultenPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(SEED_CAMPS);
  const [subscribers] = useState<Subscriber[]>(SEED_SUBS);
  const [form, setForm] = useState({ subject: "", body: "", targetTags: "" });
  const [creating, setCreating] = useState(false);

  const allTags = Array.from(new Set(subscribers.flatMap((s) => s.tags)));

  const targetedSubs = (tags: string[]) =>
    tags.length === 0 ? subscribers : subscribers.filter((s) => tags.some((t) => s.tags.includes(t)));

  const createCamp = () => {
    if (!form.subject || !form.body) return;
    const tags = form.targetTags.split(",").map((t) => t.trim()).filter(Boolean);
    const camp: Campaign = {
      id: `camp-${Date.now()}`, subject: form.subject, body: form.body,
      targetTags: tags, status: "taslak",
      createdAt: new Date().toISOString(), recipientCount: 0, openCount: 0,
    };
    setCampaigns((prev) => [camp, ...prev]);
    setForm({ subject: "", body: "", targetTags: "" });
    setCreating(false);
  };

  const sendCamp = (id: string) => {
    setCampaigns((prev) => prev.map((c) => {
      if (c.id !== id || c.status !== "taslak") return c;
      const recs = targetedSubs(c.targetTags);
      return { ...c, status: "gonderildi", sentAt: new Date().toISOString(), recipientCount: recs.length, openCount: 0 };
    }));
  };

  const deleteCamp = (id: string) => setCampaigns((prev) => prev.filter((c) => c.id !== id));

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "Bülten Gönderimi" }]} />

        <h1 className="text-2xl font-bold text-ink mb-2">Bülten Gönderimi</h1>
        <p className="text-slate text-sm mb-6">Abonelere hedefli e-posta kampanyaları oluşturun ve gönderin.</p>

        {/* Özet */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-surface rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-ink">{subscribers.length}</div>
            <div className="text-xs text-mist">Toplam Abone</div>
          </div>
          <div className="bg-surface rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{campaigns.filter(c => c.status === "gonderildi").length}</div>
            <div className="text-xs text-mist">Gönderilen Kampanya</div>
          </div>
          <div className="bg-surface rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{campaigns.filter(c => c.status === "taslak").length}</div>
            <div className="text-xs text-mist">Taslak</div>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <button onClick={() => setCreating(true)} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
            + Yeni Kampanya
          </button>
        </div>

        {/* Yeni kampanya formu */}
        {creating && (
          <div className="bg-eu-pale border border-eu/20 rounded-xl p-5 mb-5">
            <h3 className="font-bold text-ink mb-3">Yeni Kampanya</h3>
            <div className="space-y-3">
              <input value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="E-posta konusu *" className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              <textarea value={form.body} onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="E-posta içeriği *" rows={4} className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu resize-none" />
              <div>
                <input value={form.targetTags} onChange={(e) => setForm(f => ({ ...f, targetTags: e.target.value }))}
                  placeholder={`Hedef etiketler (virgülle ayır, boş = herkese). Mevcut: ${allTags.join(", ")}`}
                  className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
                <p className="text-xs text-mist mt-1">
                  Hedef abone sayısı: <strong>{targetedSubs(form.targetTags.split(",").map(t => t.trim()).filter(Boolean)).length}</strong>
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={createCamp} className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">Taslak Oluştur</button>
              <button onClick={() => setCreating(false)} className="px-4 py-2 border border-line text-slate rounded-lg text-sm">İptal</button>
            </div>
          </div>
        )}

        {/* Kampanya listesi */}
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div key={c.id} className="bg-white border border-line rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.status === "gonderildi" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {c.status === "gonderildi" ? "Gönderildi ✓" : "Taslak"}
                    </span>
                    {c.targetTags.length > 0 && c.targetTags.map(t => (
                      <span key={t} className="text-xs bg-surface text-mist px-2 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                  <h3 className="font-bold text-ink">{c.subject}</h3>
                  <p className="text-sm text-slate mt-1 line-clamp-2">{c.body}</p>
                  {c.status === "gonderildi" && (
                    <div className="flex gap-4 mt-2 text-xs text-mist">
                      <span>Alıcı: <strong className="text-ink">{c.recipientCount}</strong></span>
                      <span>Açılma: <strong className="text-ink">{c.openCount}</strong> ({c.recipientCount > 0 ? Math.round(c.openCount / c.recipientCount * 100) : 0}%)</span>
                      {c.sentAt && <span>{new Date(c.sentAt).toLocaleDateString("tr")}</span>}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {c.status === "taslak" && (
                    <button onClick={() => sendCamp(c.id)} className="px-3 py-1.5 bg-eu text-white rounded-lg text-xs font-semibold">
                      Gönder
                    </button>
                  )}
                  <button onClick={() => deleteCamp(c.id)} className="px-3 py-1.5 border border-line text-mist rounded-lg text-xs hover:text-tr">
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
