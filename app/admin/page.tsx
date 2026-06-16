"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdmin } from "@/lib/admin/store";
import { getDataProvider } from "@/lib/data";
import { PageHeader, Card } from "@/components/admin/ui";

interface ToolCounts {
  docs: number;
  subscribers: number;
  stakeholders: number;
  campaigns: number;
  videos: number;
}

export default function AdminDashboard() {
  const { projects, listings, events, blogPosts, sectors, donors } = useAdmin();
  const db = getDataProvider();
  const [tools, setTools] = useState<ToolCounts | null>(null);

  useEffect(() => {
    Promise.all([
      db.getDocs(), db.getSubscribers(), db.getStakeholders(), db.getCampaigns(), db.getTrainingVideos(),
    ]).then(([docs, subs, stk, camp, vid]) => {
      setTools({ docs: docs.length, subscribers: subs.length, stakeholders: stk.length, campaigns: camp.length, videos: vid.length });
    });
  }, [db]);

  // Son eklenen projeler / yaklaşan etkinlikler
  const recentProjects = projects.slice(0, 4);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = [...events].filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);

  const contentCards = [
    { label: "Proje", value: projects.length, href: "/admin/projeler" },
    { label: "İlan", value: listings.length, href: "/admin/ilanlar" },
    { label: "Etkinlik", value: events.length, href: "/admin/etkinlikler" },
    { label: "Blog Yazısı", value: blogPosts.length, href: "/admin/blog" },
    { label: "Sektör", value: sectors.length, href: "/admin/sektorler" },
    { label: "Donör", value: donors.length, href: "/admin/donorler" },
  ];

  const toolCards = tools ? [
    { label: "Doküman", value: tools.docs, href: "/araclar/dokuman" },
    { label: "Bülten Abonesi", value: tools.subscribers, href: "/araclar/bulten" },
    { label: "Paydaş", value: tools.stakeholders, href: "/araclar/paydas" },
    { label: "Kampanya", value: tools.campaigns, href: "/araclar/bulten" },
    { label: "Eğitim Videosu", value: tools.videos, href: "/araclar/elearning" },
  ] : [];

  return (
    <>
      <PageHeader title="Genel Bakış" />
      <p className="text-slate text-sm mb-8 -mt-2">
        İçeriklerinizi ve araç verilerinizi buradan izleyin. Değişiklikler şimdilik bu oturumda
        görünür; kalıcı kayıt Firebase bağlandığında devreye girer.
      </p>

      {/* İçerik */}
      <h2 className="text-sm font-bold text-ink uppercase tracking-wide mb-3">İçerik</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {contentCards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Card>
              <div className="text-3xl font-bold text-eu">{c.value}</div>
              <div className="text-sm text-slate mt-1">{c.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Araç verileri */}
      <h2 className="text-sm font-bold text-ink uppercase tracking-wide mb-3">Araç Verileri</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {tools ? toolCards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Card>
              <div className="text-3xl font-bold text-purple-700">{c.value}</div>
              <div className="text-sm text-slate mt-1">{c.label}</div>
            </Card>
          </Link>
        )) : (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <div className="h-9 w-12 bg-line/60 rounded animate-pulse" />
              <div className="h-4 w-20 bg-line/40 rounded mt-2 animate-pulse" />
            </Card>
          ))
        )}
      </div>

      {/* Son eklenenler */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-line rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink">Son Projeler</h3>
            <Link href="/admin/projeler" className="text-eu text-sm font-semibold">Tümü →</Link>
          </div>
          {recentProjects.length === 0 ? (
            <p className="text-slate text-sm">Proje yok.</p>
          ) : (
            <ul className="space-y-2">
              {recentProjects.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/projeler/${p.id}`} className="block py-2 border-b border-line last:border-0 hover:text-eu">
                    <span className="text-sm font-medium text-ink">{p.title}</span>
                    <span className="block text-xs text-mist">{sectors.find((s) => s.id === p.sectorId)?.name ?? p.sectorId}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-line rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink">Yaklaşan Etkinlikler</h3>
            <Link href="/admin/etkinlikler" className="text-eu text-sm font-semibold">Tümü →</Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-slate text-sm">Yaklaşan etkinlik yok.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/etkinlikler/${e.id}`} className="block py-2 border-b border-line last:border-0 hover:text-eu">
                    <span className="text-sm font-medium text-ink">{e.title}</span>
                    <span className="block text-xs text-mist">{e.date} · {e.isPublic ? "Açık" : "Kapalı"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
