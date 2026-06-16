"use client";
import Link from "next/link";
import { useAdmin } from "@/lib/admin/store";

export default function AdminDashboard() {
  const { projects, listings, events, posts } = useAdmin();

  const cards = [
    { href: "/admin/projeler", label: "Projeler", count: projects.length, sub: `${projects.filter(p => p.featured).length} öne çıkan`, color: "border-eu" },
    { href: "/admin/ilanlar", label: "İlanlar", count: listings.length, sub: `${listings.filter(l => l.locked).length} kilitli`, color: "border-orange-400" },
    { href: "/admin/etkinlikler", label: "Etkinlikler", count: events.length, sub: `${events.filter(e => e.isPublic).length} açık`, color: "border-green-500" },
    { href: "/admin/blog", label: "Blog / Gündem", count: posts.length, sub: "yazı", color: "border-purple-500" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-ink mb-2">Genel Bakış</h1>
      <p className="text-slate text-sm mb-8">Demo modu — değişiklikler sayfa yenilenene kadar korunur.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map((c) => (
          <Link key={c.href} href={c.href}
            className={`bg-white border-l-4 ${c.color} rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="text-3xl font-extrabold text-ink">{c.count}</div>
            <div className="font-semibold text-slate mt-1">{c.label}</div>
            <div className="text-xs text-mist mt-0.5">{c.sub}</div>
          </Link>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-yellow-800">
        <strong>Demo Modu:</strong> Panelden yapılan değişiklikler bu tarayıcı oturumunda geçerlidir.
        Kalıcı kayıt için Firebase bağlantısını kurun (<code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_DATA_SOURCE=firebase</code>).
      </div>
    </div>
  );
}
