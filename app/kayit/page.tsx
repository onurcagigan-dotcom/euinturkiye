"use client";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import { PLAN_PRICING, formatEuro } from "@/lib/pricing";

export default function KayitPage() {
  const { t, locale } = useLocale();
  const isEn = locale === "en";

  const plans = [
    {
      id: "ucretsiz" as const, name: isEn ? "Free" : "Ücretsiz", period: isEn ? "/ month" : "/ ay", highlight: false,
      features: isEn
        ? ["Access to project catalog", "Latest news", "Public event calendar", "Basic job listings"]
        : ["Proje kataloğuna erişim", "Güncel haberler", "Halka açık etkinlik takvimi", "Temel iş ilanları"],
      cta: isEn ? "Start Free" : "Ücretsiz Başla",
    },
    {
      id: "paket1" as const, name: isEn ? "Package 1" : "Paket 1", period: isEn ? "/ year" : "/ yıl", highlight: true,
      features: isEn
        ? ["All free features", "Procurement listing details", "E-document management", "Event management tools", "Newsletter campaigns", "Stakeholder communication", "5 users"]
        : ["Tüm ücretsiz özellikler", "Satınalma ilanları detayları", "E-Doküman yönetimi", "Etkinlik Yönetimi araçları", "Bülten gönderimi", "Paydaş İletişimi", "5 kullanıcı"],
      cta: isEn ? "Choose Package 1" : "Paket 1'i Seç",
    },
    {
      id: "paket2" as const, name: isEn ? "Package 2" : "Paket 2", period: isEn ? "/ year" : "/ yıl", highlight: false,
      features: isEn
        ? ["All Package 1 features", "Tender details", "Expert CV pool", "Reporting & analytics", "E-Learning platform", "Project ownership claims", "15 users"]
        : ["Tüm Paket 1 özellikleri", "İhale detayları", "Uzman CV Havuzu", "Raporlama ve analitik", "E-Learning platformu", "Proje sahiplenme talebi", "15 kullanıcı"],
      cta: isEn ? "Choose Package 2" : "Paket 2'yi Seç",
    },
    {
      id: "tedarikci" as const, name: isEn ? "Supplier" : "Tedarikçi", period: isEn ? "/ year" : "/ yıl", highlight: false,
      features: isEn
        ? ["Procurement listing details", "Expert profile creation", "Visibility in CV pool", "Supplier announcement tools", "Participation in networking events", "3 users"]
        : ["Satınalma ilanı detayları", "Uzman profil oluşturma", "CV havuzunda görünürlük", "Tedarikçi duyuru araçları", "İş Ağı Geliştirme Etkinliklerine Katılım", "3 kullanıcı"],
      cta: isEn ? "Become a Supplier" : "Tedarikçi Ol",
    },
  ];

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: t("nav_signup") }]} />

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-ink mb-4">{t("signup_title")}</h1>
          <p className="text-slate text-lg max-w-2xl mx-auto">
            {t("signup_sub")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const pricing = PLAN_PRICING[plan.id];
            return (
            <div key={plan.id}
              className={`rounded-2xl border p-6 flex flex-col ${
                plan.highlight ? "border-eu shadow-xl bg-eu text-white" : "border-line bg-white"
              }`}>
              {plan.highlight && (
                <div className="text-xs font-bold text-yellow-300 uppercase tracking-widest mb-3">{t("signup_popular")}</div>
              )}
              <div className="mb-6">
                <h2 className={`text-xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-ink"}`}>{plan.name}</h2>
                <div className="flex items-end gap-1">
                  <span className={`text-3xl font-extrabold ${plan.highlight ? "text-white" : "text-ink"}`}>{formatEuro(pricing.firstYearPrice)}</span>
                  <span className={`text-sm mb-1 ${plan.highlight ? "text-blue-200" : "text-mist"}`}>{plan.period}</span>
                </div>
                {pricing.hasRenewalDiscount && (
                  <p className={`text-xs mt-1.5 ${plan.highlight ? "text-blue-200" : "text-mist"}`}>
                    {t("signup_renewal_note")}: {formatEuro(pricing.renewalPrice)}{isEn ? "/year" : "/yıl"}
                  </p>
                )}
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? "text-blue-100" : "text-slate"}`}>
                    <span className={`mt-0.5 flex-shrink-0 ${plan.highlight ? "text-yellow-300" : "text-eu"}`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={`/kayit/${plan.id}`}
                className={`block w-full text-center py-2.5 rounded-xl font-bold text-sm transition-colors ${
                  plan.highlight ? "bg-yellow-400 text-ink hover:bg-yellow-300" : "bg-eu text-white hover:bg-blue-800"
                }`}>
                {plan.cta}
              </Link>
            </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
