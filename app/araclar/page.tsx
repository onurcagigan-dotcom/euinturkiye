"use client";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";

export default function AraclarPage() {
  const { t, locale } = useLocale();
  const isEn = locale === "en";

  const TOOLS = [
    { href: "/araclar/etkinlik", title: isEn ? "Event Management" : "Etkinlik Yönetimi", desc: isEn ? "Create events, run availability polls, build agendas, send invitations, and collect RSVPs." : "Etkinlik oluşturma, müsaitlik anketi, gündem, dosya ekleri, davetiye gönderme ve LCV takibi." , color: "#0E7490", icon: "📅", imageUrl: "/tools/etkinlik-yonetimi.png" },
    { href: "/araclar/dokuman", title: isEn ? "E-Document Management" : "E-Doküman Yönetimi", desc: isEn ? "Project-based document library, access levels, and download statistics." : "Proje bazlı doküman kütüphanesi, erişim seviyeleri ve indirme istatistikleri.", color: "#1D7A5F", icon: "📁" },
    { href: "/araclar/bulten", title: isEn ? "Newsletter Campaigns" : "Bülten Gönderimi", desc: isEn ? "Pick stories from your project news, build the email, and target specific recipients." : "Proje haberlerinizden seçim yapın, e-postayı oluşturun ve hedefli alıcılara gönderin.", color: "#7C5710", icon: "📧", imageUrl: "/tools/bulten-gonderimi.png" },
    { href: "/araclar/paydas", title: isEn ? "Stakeholder Communication" : "Paydaş İletişimi", desc: isEn ? "Manage stakeholders, send bulk messages, and build your network of experts and suppliers." : "Paydaş yönetimi, toplu mesaj gönderimi, uzman ve tedarikçi ağı oluşturma.", color: "#3730A3", icon: "🤝" },
    { href: "/araclar/egitim", title: isEn ? "Training Materials" : "Eğitim Materyalleri", desc: isEn ? "Library of training videos and documents added by companies, filterable by project and category." : "Firmaların eklediği video ve doküman eğitim materyalleri; proje ve kategoriye göre filtrelenebilir.", color: "#7C3AED", icon: "🎓", imageUrl: "/tools/e-learning.png" },
    { href: "/araclar/harita", title: isEn ? "Project Map" : "Proje Haritası", desc: isEn ? "Visualize project distribution by province on a map of Turkey." : "Türkiye haritasında il bazlı proje dağılımı görselleştirme.", color: "#B45309", icon: "🗺️" },
    { href: "/araclar/infografik", title: isEn ? "Infographics" : "İnfografikler", desc: isEn ? "Visual portfolio analysis by sector, IPA period, budget, and timeline." : "Sektör, IPA dönemi, bütçe ve zaman dağılımına göre görsel portföy analizi.", color: "#C2410C", icon: "📈" },
    { href: "/uzmanlar", title: isEn ? "Expert CV Pool" : "Uzman CV Havuzu", desc: isEn ? "Create expert profiles, add your project experience, and build a team." : "Uzman profilleri oluşturun, proje deneyimlerinizi ekleyin, ekip kurun.", color: "#0369A1", icon: "👤" },
    { href: "#", title: isEn ? "Visibility Outputs" : "Görünürlük Çıktıları", desc: isEn ? "EU visibility rule checklists and ready-to-use templates for project communication materials." : "AB görünürlük kuralları kontrol listeleri ve proje iletişim materyalleri için hazır şablonlar.", color: "#9D174D", icon: "🎯", comingSoon: true },
    { href: "#", title: isEn ? "Project Website" : "Proje Web Sitesi", desc: isEn ? "Generate a ready-made public website for your project with one click." : "Projeniz için tek tıkla hazır bir kamuya açık web sitesi oluşturun.", color: "#1E3A8A", icon: "🌐", imageUrl: "/tools/proje-websitesi.png", comingSoon: true },
  ];

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: t("tools_title") }]} />

        <h1 className="text-3xl font-extrabold text-ink mb-2">{t("tools_title")}</h1>
        <p className="text-slate mb-10">{t("tools_sub")}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TOOLS.map((tool) => {
            const card = (
              <>
                {tool.imageUrl ? (
                  <div className="h-24 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={tool.imageUrl} alt={tool.title} className={`w-full h-full object-cover ${tool.comingSoon ? "opacity-60" : ""}`} />
                  </div>
                ) : (
                  <div className={`h-24 flex items-center justify-center text-4xl ${tool.comingSoon ? "opacity-60" : ""}`} style={{ background: `linear-gradient(135deg, ${tool.color}, ${tool.color}cc)` }}>
                    {tool.icon}
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-bold text-ink text-sm">{tool.title}</h2>
                    {tool.comingSoon && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-500">
                        {t("tool_status_soon")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate leading-relaxed">{tool.desc}</p>
                </div>
              </>
            );

            return tool.comingSoon ? (
              <div key={tool.title} className="border border-line rounded-2xl overflow-hidden cursor-default opacity-90">
                {card}
              </div>
            ) : (
              <Link key={tool.href} href={tool.href}
                className="border border-line rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
                {card}
              </Link>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
