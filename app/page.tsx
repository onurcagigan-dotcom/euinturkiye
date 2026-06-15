// ============================================================
// Ana Sayfa (Faz 0 iskelet)
//
// Bu sayfa veri katmanının çalıştığını gösterir:
// getDataProvider() ile sektörleri ve istatistikleri çeker.
// Veri "demo" kaynağından gelir ama sayfa bunu bilmez.
//
// Faz 1'de bu sayfa tam tasarımlı ana sayfaya dönüşecek
// (banner carousel, vitrin, ilanlar, blog vb.)
// ============================================================

import { getDataProvider } from "@/lib/data";

export default async function HomePage() {
  const db = getDataProvider();
  const [sectors, stats] = await Promise.all([
    db.getSectors(),
    db.getHomeStats(),
  ]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-10">
        <p className="text-eu font-semibold tracking-widest text-xs uppercase">
          AB ve Türkiye Mali İşbirliği Projeleri Portalı
        </p>
        <h1 className="text-3xl font-bold mt-2 text-ink">
          euinturkiye.com — Faz 0 İskelet
        </h1>
        <p className="text-slate mt-2">
          Veri katmanı çalışıyor. Aşağıdaki veriler{" "}
          <strong>demo kaynağından</strong> (JSON) geliyor.
        </p>
      </header>

      {/* İstatistikler */}
      <section className="grid grid-cols-3 gap-4 mb-10">
        <StatBox label="Proje" value={stats.projects} />
        <StatBox label="Açık İlan" value={stats.openListings} />
        <StatBox label="Yaklaşan Etkinlik" value={stats.upcomingEvents} />
      </section>

      {/* Sektörler */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-ink">
          10 Sektörde AB Projeleri
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {sectors.map((s) => (
            <div
              key={s.id}
              className="bg-card border border-line rounded-xl p-5 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-eu-pale flex items-center justify-center mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.icon} alt={s.name} className="w-9 h-9 object-contain" />
              </div>
              <h3 className="font-semibold text-sm text-ink">{s.name}</h3>
              <p className="text-eu font-bold text-sm mt-2">{s.projectCount} proje</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-eu-pale rounded-xl p-6 text-center">
      <div className="text-3xl font-bold text-eu">{value}</div>
      <div className="text-xs text-slate uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}
