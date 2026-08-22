"use client";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";

export default function KayitPage() {
  const { t, locale } = useLocale();
  const isEn = locale === "en";

  const plans = [
    {
      id: "uzman",
      name: isEn ? "Expert Package" : "Uzman Paketi",
      price: 0,
      priceLabel: isEn ? "Free" : "Ücretsiz",
      period: "",
      vatNote: "",
      highlight: false,
      badge: "",
      description: isEn
        ? "For individual experts tracking EU-Turkey projects"
        : "AB-Türkiye proje ekosistemini takip eden bireysel uzmanlar için",
      features: isEn ? [
        "Full access to project catalog (499+ IPA projects)",
        "Latest news & announcements",
        "Public event calendar",
        "Basic job listings",
        "Expert profile creation",
        "Sector & donor filtering",
        "IPA period comparison",
        "Geographic project map",
      ] : [
        "Proje kataloğuna tam erişim (499+ IPA projesi)",
        "Güncel haberler ve duyurular",
        "Halka açık etkinlik takvimi",
        "Temel iş ilanları",
        "Uzman profil oluşturma",
        "Sektör ve donör filtreleme",
        "IPA dönem karşılaştırması",
        "Coğrafi proje haritası",
      ],
      cta: isEn ? "Get Started Free" : "Ücretsiz Başla",
      ctaHref: "/kayit/uzman",
    },
    {
      id: "yonetici",
      name: isEn ? "Manager Package" : "Yönetici Paketi",
      price: 2500,
      priceLabel: "€2.500",
      period: isEn ? "/ year + VAT" : "/ yıl + KDV",
      vatNote: isEn ? "Renews at €2.500/year" : "Yenileme: €2.500/yıl + KDV",
      highlight: true,
      badge: isEn ? "Most Popular" : "En Çok Tercih",
      description: isEn
        ? "For firms, NGOs, and institutions managing EU projects"
        : "AB projesi yürüten firma, STK ve kurumlar için",
      features: isEn ? [
        "All Expert features",
        "Full digital tools suite",
        "Project management (team, files, listings)",
        "Event management with RSVP & polls",
        "E-document library with access control",
        "Newsletter campaign management",
        "Stakeholder address book & messaging",
        "Consortium management",
        "Unlimited users — per-project permissions",
        "Expert CV pool access",
        "Tender listing access (admin2 approved)",
      ] : [
        "Tüm Uzman özellikleri",
        "Tüm dijital araçlar",
        "Proje yönetimi (ekip, dosya, ilanlar)",
        "Etkinlik yönetimi, RSVP ve anket",
        "Erişim kontrollü e-doküman kütüphanesi",
        "Bülten kampanya yönetimi",
        "Paydaş adres defteri ve mesajlaşma",
        "Konsorsiyum yönetimi",
        "Sınırsız kullanıcı — proje bazlı yetki",
        "Uzman CV Havuzu erişimi",
        "İhale ilanlarına erişim (admin2 onaylı)",
      ],
      cta: isEn ? "Get Manager Package" : "Yönetici Paketi Al",
      ctaHref: "/kayit/yonetici",
    },
    {
      id: "tedarikci",
      name: isEn ? "Supplier Package" : "Tedarikçi Paketi",
      price: 2500,
      priceLabel: "€2.500",
      period: isEn ? "/ year + VAT" : "/ yıl + KDV",
      vatNote: isEn ? "Fixed annual rate" : "Sabit yıllık ücret",
      highlight: false,
      badge: "",
      description: isEn
        ? "For suppliers bidding on EU-funded procurement"
        : "AB finansmanlı ihaleler için mal/hizmet sağlayıcılar",
      features: isEn ? [
        "All Expert features",
        "Tender listing details (admin2 approved)",
        "Visible in supplier directory",
        "Detailed service/product profile",
        "Procurement notifications",
        "Supplier-specific listings",
        "Networking event access",
      ] : [
        "Tüm Uzman özellikleri",
        "İhale ilanları detayları (admin2 onaylı)",
        "Tedarikçi dizininde görünürlük",
        "Detaylı hizmet/ürün profili",
        "İhale bildirim sistemi",
        "Tedarikçiye özgü ilanlar",
        "Ağ geliştirme etkinliklerine erişim",
      ],
      cta: isEn ? "Become a Supplier" : "Tedarikçi Ol",
      ctaHref: "/kayit/tedarikci",
    },
  ];

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: isEn ? "Membership Plans" : "Üyelik Paketleri" }]} />

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-ink mb-4">
            {isEn ? "Membership Plans" : "Üyelik Paketleri"}
          </h1>
          <p className="text-slate text-lg max-w-2xl mx-auto">
            {isEn
              ? "Access the EU-Turkey project ecosystem. Expert access is free — upgrade to unlock digital tools and tender details."
              : "AB-Türkiye proje ekosistemine erişin. Uzman erişimi ücretsizdir — dijital araçlar ve ihale detayları için yükseltin."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div key={plan.id}
              className={`rounded-2xl border flex flex-col relative ${
                plan.highlight ? "border-eu shadow-xl" : "border-line bg-white"
              }`}>
              {plan.badge && (
                <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                  <span className="bg-eu text-white text-xs font-bold px-4 py-1 rounded-full shadow">{plan.badge}</span>
                </div>
              )}
              {/* Header */}
              <div className={`p-6 rounded-t-2xl ${plan.highlight ? "bg-eu text-white" : "bg-white"}`}>
                <h2 className={`text-xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-ink"}`}>{plan.name}</h2>
                <p className={`text-sm mb-4 ${plan.highlight ? "text-blue-100" : "text-slate"}`}>{plan.description}</p>
                <div className="flex items-end gap-1 mb-0.5">
                  <span className={`text-4xl font-extrabold ${plan.highlight ? "text-white" : "text-ink"}`}>{plan.priceLabel}</span>
                  <span className={`text-sm mb-1 ${plan.highlight ? "text-blue-200" : "text-mist"}`}>{plan.period}</span>
                </div>
                {plan.vatNote && (
                  <p className={`text-xs ${plan.highlight ? "text-blue-200" : "text-mist"}`}>{plan.vatNote}</p>
                )}
              </div>

              {/* Features */}
              <div className={`flex-1 p-6 ${plan.highlight ? "bg-eu/5" : "bg-white"}`}>
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate">
                      <span className="mt-0.5 flex-shrink-0 text-eu font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className={`p-6 pt-0 ${plan.highlight ? "bg-eu/5" : "bg-white"} rounded-b-2xl`}>
                <Link href={plan.ctaHref}
                  className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-colors ${
                    plan.highlight
                      ? "bg-eu text-white hover:bg-blue-800"
                      : plan.price === 0
                      ? "bg-eu-pale text-eu border border-eu/30 hover:bg-eu hover:text-white"
                      : "bg-eu text-white hover:bg-blue-800"
                  }`}>
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Ek not */}
        <div className="bg-surface rounded-2xl p-6 text-center">
          <p className="text-slate text-sm">
            {isEn
              ? "All paid plans include VAT-compliant invoicing. "
              : "Ücretli paketlerde KDV dahil fatura düzenlenmektedir. "}
            <strong className="text-ink">{isEn ? "Unlimited users" : "Sınırsız kullanıcı"}</strong>
            {isEn
              ? " in Manager Package — full or project-based permissions."
              : " Yönetici Paketi'nde — tam yetki veya proje bazlı yetkilendirme."}
          </p>
          <p className="text-xs text-mist mt-2">
            {isEn
              ? "Questions? Contact us at bilgi@euinturkiye.com"
              : "Sorularınız için: bilgi@euinturkiye.com"}
          </p>
        </div>
      </div>
    </PageShell>
  );
}
