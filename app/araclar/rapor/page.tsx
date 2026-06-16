"use client";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";

const REPORTS = [
  { id: "portfolio", name: "Proje Portföy Raporu", desc: "Sektör, donör ve IPA dönemine göre proje dağılımı.", icon: "📊" },
  { id: "listing", name: "İlan Analizi", desc: "İş, satınalma ve ihale ilanlarının özeti.", icon: "📋" },
  { id: "event", name: "Etkinlik İstatistikleri", desc: "Etkinlik katılımcı ve RSVP özeti.", icon: "📅" },
  { id: "subscriber", name: "Abone Raporu", desc: "Plan bazında abone dağılımı ve büyüme.", icon: "👥" },
];

export default function RaporPage() {
  const downloadDemo = (name: string) => {
    const csv = `Rapor,${name}\nOluşturulma,${new Date().toLocaleDateString("tr")}\nDurum,Demo verisi\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${name.replace(/ /g, "_")}.csv`; a.click();
  };

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "Raporlama" }]} />

        <h1 className="text-2xl font-bold text-ink mb-2">Raporlama</h1>
        <p className="text-slate text-sm mb-8">Platform verilerini analiz edin ve CSV/Excel olarak dışa aktarın.</p>

        {/* Hızlı istatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Toplam Proje", value: "499", color: "text-eu" },
            { label: "Açık İlan", value: "5", color: "text-tr" },
            { label: "Kayıtlı Abone", value: "3", color: "text-green-600" },
            { label: "Bu Ay Etkinlik", value: "5", color: "text-purple-600" },
          ].map((s) => (
            <div key={s.label} className="bg-surface rounded-xl p-5 text-center">
              <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-mist mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Rapor kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {REPORTS.map((r) => (
            <div key={r.id} className="bg-white border border-line rounded-xl p-6">
              <div className="text-3xl mb-3">{r.icon}</div>
              <h2 className="font-bold text-ink mb-1">{r.name}</h2>
              <p className="text-slate text-sm mb-4">{r.desc}</p>
              <button onClick={() => downloadDemo(r.name)}
                className="px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors">
                CSV İndir
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs text-mist mt-6">Demo modunda örnek veri indirilir. Firebase bağlandığında gerçek veriler raporlanır.</p>
      </div>
    </PageShell>
  );
}
