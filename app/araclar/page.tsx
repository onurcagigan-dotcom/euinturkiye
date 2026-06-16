import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";

const TOOLS = [
  {
    href: "/araclar/etkinlik",
    title: "Etkinlik Yönetimi",
    desc: "Açık etkinlik RSVP takibi, kapalı toplantı gündemi, davetli yönetimi ve müsaitlik anketi.",
    color: "#0E7490",
    icon: "📅",
    badge: "Tam Çalışır",
  },
  {
    href: "/araclar/dokuman",
    title: "E-Doküman Yönetimi",
    desc: "Proje bazlı doküman kütüphanesi, erişim seviyeleri ve indirme istatistikleri.",
    color: "#1D7A5F",
    icon: "📁",
    badge: "Tam Çalışır",
  },
  {
    href: "/araclar/bulten",
    title: "Bülten Gönderimi",
    desc: "Abone segmentasyonu, toplu e-posta kampanyaları ve açılma istatistikleri.",
    color: "#7C5710",
    icon: "📧",
    badge: "Tam Çalışır",
  },
  {
    href: "/araclar/paydas",
    title: "Paydaş İletişimi",
    desc: "Proje ekibi, uzmanlar ve tedarikçi yönetimi; rol ve yetki tanımları.",
    color: "#3730A3",
    icon: "🤝",
    badge: "Tam Çalışır",
  },
  {
    href: "/araclar/rapor",
    title: "Raporlama",
    desc: "Portföy analizi, ilan istatistikleri ve Excel/CSV dışa aktarım.",
    color: "#0F766E",
    icon: "📊",
    badge: "Tam Çalışır",
  },
  {
    href: "/araclar/egitim",
    title: "E-Learning",
    desc: "Proje yönetimi eğitim videoları, kategoriler ve izleme takibi.",
    color: "#7C3AED",
    icon: "🎓",
    badge: "Tam Çalışır",
  },
  {
    href: "/araclar/harita",
    title: "Proje Haritası",
    desc: "Türkiye haritasında il bazlı proje dağılımı görselleştirme.",
    color: "#B45309",
    icon: "🗺️",
    badge: "Yakında",
  },
  {
    href: "/kayit",
    title: "Uzman CV Havuzu",
    desc: "Uzman profilleri oluşturun, proje deneyimlerinizi ekleyin, ekip kurun.",
    color: "#0369A1",
    icon: "👤",
    badge: "Yakında",
  },
];

export default function AraclarPage() {
  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar" }]} />

        <h1 className="text-3xl font-extrabold text-ink mb-2">Dijital Araçlar</h1>
        <p className="text-slate mb-10">Proje yönetiminizi kolaylaştıran entegre araç seti.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TOOLS.map((t) => (
            <Link key={t.href} href={t.href}
              className="border border-line rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
              <div className="h-24 flex items-center justify-center text-4xl" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)` }}>
                {t.icon}
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-ink text-sm">{t.title}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    t.badge === "Tam Çalışır" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {t.badge}
                  </span>
                </div>
                <p className="text-xs text-slate leading-relaxed">{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
