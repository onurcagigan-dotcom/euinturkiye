"use client";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";

export default function AraclarPage() {
  const { t, locale } = useLocale();
  const isEn = locale === "en";

  const TOOLS = [
    { href: "/araclar/etkinlik", title: isEn ? "Event Management" : "Etkinlik Yönetimi", desc: isEn ? "Open event RSVP tracking, closed meeting agenda, invitee management, and availability polls." : "Açık etkinlik RSVP takibi, kapalı toplantı gündemi, davetli yönetimi ve müsaitlik anketi.", color: "#0E7490", icon: "📅", working: true },
    { href: "/araclar/dokuman", title: isEn ? "E-Document Management" : "E-Doküman Yönetimi", desc: isEn ? "Project-based document library, access levels, and download statistics." : "Proje bazlı doküman kütüphanesi, erişim seviyeleri ve indirme istatistikleri.", color: "#1D7A5F", icon: "📁", working: true },
    { href: "/araclar/bulten", title: isEn ? "Newsletter Campaigns" : "Bülten Gönderimi", desc: isEn ? "Subscriber segmentation, bulk email campaigns, and open-rate statistics." : "Abone segmentasyonu, toplu e-posta kampanyaları ve açılma istatistikleri.", color: "#7C5710", icon: "📧", working: true },
    { href: "/araclar/paydas", title: isEn ? "Stakeholder Communication" : "Paydaş İletişimi", desc: isEn ? "Project team, expert, and supplier management with role definitions." : "Proje ekibi, uzmanlar ve tedarikçi yönetimi; rol ve yetki tanımları.", color: "#3730A3", icon: "🤝", working: true },
    { href: "/araclar/rapor", title: isEn ? "Reporting" : "Raporlama", desc: isEn ? "Portfolio analysis, listing statistics, and Excel/CSV export." : "Portföy analizi, ilan istatistikleri ve Excel/CSV dışa aktarım.", color: "#0F766E", icon: "📊", working: true },
    { href: "/araclar/egitim", title: "E-Learning", desc: isEn ? "Project management training videos, categories, and watch tracking." : "Proje yönetimi eğitim videoları, kategoriler ve izleme takibi.", color: "#7C3AED", icon: "🎓", working: true },
    { href: "/araclar/harita", title: isEn ? "Project Map" : "Proje Haritası", desc: isEn ? "Visualize project distribution by province on a map of Turkey." : "Türkiye haritasında il bazlı proje dağılımı görselleştirme.", color: "#B45309", icon: "🗺️", working: true },
    { href: "/araclar/infografik", title: isEn ? "Infographics" : "İnfografikler", desc: isEn ? "Visual portfolio analysis by sector, IPA period, budget, and timeline." : "Sektör, IPA dönemi, bütçe ve zaman dağılımına göre görsel portföy analizi.", color: "#C2410C", icon: "📈", working: true },
    { href: "/uzmanlar", title: isEn ? "Expert CV Pool" : "Uzman CV Havuzu", desc: isEn ? "Create expert profiles, add your project experience, and build a team." : "Uzman profilleri oluşturun, proje deneyimlerinizi ekleyin, ekip kurun.", color: "#0369A1", icon: "👤", working: true },
  ];

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: t("tools_title") }]} />

        <h1 className="text-3xl font-extrabold text-ink mb-2">{t("tools_title")}</h1>
        <p className="text-slate mb-10">{t("tools_sub")}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TOOLS.map((tool) => (
            <Link key={tool.href} href={tool.href}
              className="border border-line rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
              <div className="h-24 flex items-center justify-center text-4xl" style={{ background: `linear-gradient(135deg, ${tool.color}, ${tool.color}cc)` }}>
                {tool.icon}
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-ink text-sm">{tool.title}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    tool.working ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {tool.working ? t("tool_status_working") : t("tool_status_soon")}
                  </span>
                </div>
                <p className="text-xs text-slate leading-relaxed">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
