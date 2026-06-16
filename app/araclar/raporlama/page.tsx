"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import { PageShell } from "@/components/PageShell";
import { statusBreakdown } from "@/lib/project-progress";
import type {
  Sector, Project, Listing, EventItem, DocItem, Subscriber, Campaign,
} from "@/lib/types";

interface ReportData {
  sectors: Sector[];
  projects: Project[];
  listings: Listing[];
  events: EventItem[];
  docs: DocItem[];
  subscribers: Subscriber[];
  campaigns: Campaign[];
}

export default function ReportingToolPage() {
  const db = getDataProvider();
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    Promise.all([
      db.getSectors(), db.getProjects(), db.getListings(), db.getEvents(),
      db.getDocs(), db.getSubscribers(), db.getCampaigns(),
    ]).then(([sectors, projects, listings, events, docs, subscribers, campaigns]) => {
      setData({ sectors, projects, listings, events, docs, subscribers, campaigns });
    });
  }, [db]);

  if (!data) {
    return (
      <PageShell>
        <div className="max-w-6xl mx-auto px-6 py-20 text-slate">Rapor hazırlanıyor…</div>
      </PageShell>
    );
  }
  const d0 = data;

  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = data.events.filter((e) => e.date >= today).length;
  const totalDownloads = data.docs.reduce((s, d) => s + d.downloads, 0);
  const activeSubscribers = data.subscribers.filter((s) => s.subscribed).length;
  const sentCampaigns = data.campaigns.filter((c) => c.status === "gonderildi").length;
  const lockedListings = data.listings.filter((l) => l.locked).length;

  // Sektöre göre proje dağılımı (sektör verisindeki projectCount kullanılır)
  const sectorDist = data.sectors
    .map((s) => ({ label: s.name, value: s.projectCount ?? 0 }))
    .sort((a, b) => b.value - a.value);
  const totalProjectsBySector = sectorDist.reduce((s, x) => s + x.value, 0);

  // İlan türü dağılımı
  const listingTypes = [
    { label: "İş İlanı", value: data.listings.filter((l) => l.type === "is").length },
    { label: "Satınalma", value: data.listings.filter((l) => l.type === "satinalma").length },
    { label: "İhale", value: data.listings.filter((l) => l.type === "ihale").length },
  ];

  // Doküman kategorisi dağılımı
  const docCats: Record<string, number> = {};
  data.docs.forEach((d) => { docCats[d.category] = (docCats[d.category] ?? 0) + 1; });
  const docDist = Object.entries(docCats).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

  function exportReport() {
    const lines = [
      ["Rapor", "euinturkiye.com Portföy Raporu"],
      ["Tarih", today],
      [],
      ["Özet Göstergeler", ""],
      ["Toplam Proje (sektör toplamı)", String(totalProjectsBySector)],
      ["Vitrin Projesi", String(d0.projects.length)],
      ["Açık İlan", String(d0.listings.length)],
      ["  - Kilitli (abonelik)", String(lockedListings)],
      ["Yaklaşan Etkinlik", String(upcomingEvents)],
      ["Toplam Etkinlik", String(d0.events.length)],
      ["Doküman", String(d0.docs.length)],
      ["  - Toplam İndirme", String(totalDownloads)],
      ["Abone", String(d0.subscribers.length)],
      ["  - Aktif", String(activeSubscribers)],
      ["Gönderilen Kampanya", String(sentCampaigns)],
      [],
      ["Sektöre Göre Proje", ""],
      ...sectorDist.map((s) => [s.label, String(s.value)]),
    ];
    const csv = lines.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `portfoy-raporu-${today}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageShell>
      <div className="bg-eu-deep text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <Link href="/araclar" className="text-white/70 text-sm hover:text-white">← Araçlar</Link>
          <div className="flex items-start justify-between gap-4 mt-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Raporlama</h1>
              <p className="text-white/80 mt-2">Portföy, ilan, etkinlik ve iletişim istatistikleri.</p>
            </div>
            <button onClick={exportReport} className="shrink-0 px-4 py-2 rounded-lg bg-white text-eu-deep text-sm font-semibold">
              Raporu İndir (CSV)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Özet kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat value={totalProjectsBySector} label="Toplam Proje" />
          <Stat value={data.listings.length} label="Açık İlan" sub={`${lockedListings} kilitli`} />
          <Stat value={upcomingEvents} label="Yaklaşan Etkinlik" sub={`${data.events.length} toplam`} />
          <Stat value={data.docs.length} label="Doküman" sub={`${totalDownloads} indirme`} />
          <Stat value={activeSubscribers} label="Aktif Abone" sub={`${data.subscribers.length} toplam`} />
          <Stat value={sentCampaigns} label="Gönderilen Kampanya" />
          <Stat value={data.projects.length} label="Vitrin Projesi" />
          <Stat value={data.sectors.length} label="Sektör" />
        </div>

        {/* Sektöre göre proje */}
        <Panel title="Sektöre Göre Proje Dağılımı">
          <BarList items={sectorDist} max={Math.max(...sectorDist.map((s) => s.value), 1)} suffix=" proje" />
        </Panel>

        {/* Proje durumu (tamamlanma oranı) */}
        <Panel title="Proje Durumu (Tamamlanma Oranı)">
          {(() => {
            const b = statusBreakdown(data.projects);
            return (
              <div>
                <div className="flex w-full h-6 rounded-full overflow-hidden mb-4">
                  {b.tamamlandi > 0 && <div className="bg-green-500 flex items-center justify-center" style={{ width: `${b.tamamPct}%` }}>
                    {b.tamamPct >= 12 && <span className="text-[11px] font-semibold text-white">%{b.tamamPct}</span>}
                  </div>}
                  {b.devam > 0 && <div className="bg-eu flex items-center justify-center" style={{ width: `${b.devamPct}%` }}>
                    {b.devamPct >= 12 && <span className="text-[11px] font-semibold text-white">%{b.devamPct}</span>}
                  </div>}
                  {b.planlama > 0 && <div className="bg-amber-400 flex items-center justify-center" style={{ width: `${b.planlamaPct}%` }}>
                    {b.planlamaPct >= 12 && <span className="text-[11px] font-semibold text-white">%{b.planlamaPct}</span>}
                  </div>}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <Legend color="bg-green-500" label="Tamamlandı" value={b.tamamlandi} />
                  <Legend color="bg-eu" label="Devam ediyor" value={b.devam} />
                  <Legend color="bg-amber-400" label="Planlama" value={b.planlama} />
                </div>
              </div>
            );
          })()}
        </Panel>

        {/* İki kolon: ilan türü + doküman kategori */}
        <div className="grid md:grid-cols-2 gap-6">
          <Panel title="İlan Türü Dağılımı">
            <BarList items={listingTypes} max={Math.max(...listingTypes.map((s) => s.value), 1)} />
          </Panel>
          <Panel title="Doküman Kategorileri">
            {docDist.length > 0 ? (
              <BarList items={docDist} max={Math.max(...docDist.map((s) => s.value), 1)} />
            ) : (
              <p className="text-slate text-sm py-6 text-center">Doküman yok.</p>
            )}
          </Panel>
        </div>
      </div>
    </PageShell>
  );
}

function Stat({ value, label, sub }: { value: number; label: string; sub?: string }) {  return (
    <div className="bg-white border border-line rounded-xl p-5">
      <div className="text-3xl font-bold text-eu">{value}</div>
      <div className="text-sm text-ink mt-1">{label}</div>
      {sub && <div className="text-xs text-mist mt-0.5">{sub}</div>}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-line rounded-xl p-6">
      <h2 className="font-bold text-ink mb-5">{title}</h2>
      {children}
    </div>
  );
}

function BarList({ items, max, suffix = "" }: {
  items: { label: string; value: number }[]; max: number; suffix?: string;
}) {
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-3">
          <div className="w-36 text-sm text-ink shrink-0 truncate">{it.label}</div>
          <div className="flex-1 bg-eu-pale rounded-full h-6 overflow-hidden">
            <div
              className="h-full bg-eu rounded-full flex items-center justify-end px-2 transition-all"
              style={{ width: `${Math.max((it.value / max) * 100, it.value > 0 ? 8 : 0)}%` }}
            >
              {it.value > 0 && <span className="text-[11px] font-semibold text-white">{it.value}{suffix}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-sm ${color}`} />
      <span className="text-slate">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </span>
  );
}
