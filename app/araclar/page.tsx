"use client";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import { useFirma } from "@/lib/firma/context";

export default function AraclarPage() {
  const { t, locale } = useLocale();
  const { current: firma } = useFirma();
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
    { href: "/araclar/anket", title: isEn ? "Survey Builder" : "Anket Oluşturucu", desc: isEn ? "Create multi-question surveys (multiple choice, open-ended, rating), collect responses, and view results in a dashboard." : "Çoktan seçmeli ve açık uçlu anket oluşturun, yanıtları toplayın, sonuçları dashboard'da görün.", color: "#0891B2", icon: "📋" },
    { href: "/kurumlar", title: isEn ? "Directory" : "Rehber", desc: isEn ? "Firms, NGOs, suppliers and institution profiles in one searchable directory." : "Firma, STK, tedarikçi ve kurum profilleri. Aranabilir dizin.", color: "#4338CA", icon: "📖" },
    { href: "#", title: isEn ? "Visibility Outputs" : "Görünürlük Çıktıları", desc: isEn ? "EU visibility rule checklists and ready-to-use templates for project communication materials." : "AB görünürlük kuralları kontrol listeleri ve proje iletişim materyalleri için hazır şablonlar.", color: "#9D174D", icon: "🎯", comingSoon: true },
    { href: "/firma?tab=projeler", title: isEn ? "Project Website" : "Proje Web Sitesi", desc: isEn ? "Customisable landing page per project. 4 templates, 3 header versions (TR+EN), footer logo library." : "Her proje için özelleştirilebilir landing page. 4 şablon, 3 header versiyonu (TR+EN), footer logo kütüphanesi.", color: "#1E3A8A", icon: "🌐", imageUrl: "/tools/proje-websitesi.png" },
  ];

  // Araç SVG ikonları — inline path
  const ICON_PATHS: Record<string, string> = {
    "📁": "M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z",
    "🤝": "M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46",
    "🗺️": "M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z",
    "📈": "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
    "👤": "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
    "🎯": "M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z",
    "🌐": "M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418",
  };

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: t("tools_title") }]} />

        <h1 className="text-3xl font-extrabold text-ink mb-2">{t("tools_title")}</h1>
        <p className="text-slate text-sm mb-6">{isEn ? "Digital tools for EU-Turkey project ecosystem actors." : "AB-Türkiye proje ekosistemi aktörleri için dijital araçlar."}</p>

        {firma ? (
          <div className="bg-eu-pale border border-eu/20 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3">
            <p className="text-sm text-ink font-medium">
              {firma.organization ?? firma.name} olarak giriş yaptınız — araçlara doğrudan panelden de erişebilirsiniz.
            </p>
            <Link href="/firma" className="flex-shrink-0 px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
              Panelime Git →
            </Link>
          </div>
        ) : (
          <div className="bg-eu-pale border border-eu/20 rounded-2xl p-5 mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-ink mb-1">{isEn ? "Manage your own content" : "Kendi içeriklerinizi yönetin"}</p>
              <p className="text-sm text-slate">
                {isEn
                  ? "Log in to create events, upload documents, send newsletters and manage your listings."
                  : "Giriş yaparak etkinlik oluşturun, doküman yükleyin, bülten gönderin ve ilanlarınızı yönetin."}
              </p>
            </div>
            <Link href="/giris" className="flex-shrink-0 px-4 py-2 bg-eu text-white rounded-lg text-sm font-semibold">
              {isEn ? "Log In" : "Giriş Yap"}
            </Link>
          </div>
        )}
        <p className="text-slate mb-10">{t("tools_sub")}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TOOLS.map((tool) => {
            const card = (
              <>
                {tool.imageUrl ? (
                  <div className="h-24 overflow-hidden relative">

              <img src={tool.imageUrl} alt={tool.title} className={`w-full h-full object-cover ${tool.comingSoon ? "opacity-60" : ""}`} />
                  </div>
                ) : (
                  <div className={`h-24 flex items-center justify-center ${tool.comingSoon ? "opacity-60" : ""}`}
                    style={{ background: `linear-gradient(135deg, ${tool.color}ee, ${tool.color}99)` }}>
                    {ICON_PATHS[tool.icon] ? (
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[tool.icon]} />
                      </svg>
                    ) : (
                      <span className="text-4xl">{tool.icon}</span>
                    )}
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
