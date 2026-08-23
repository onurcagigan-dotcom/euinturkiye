"use client";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import { setDemoRole } from "@/lib/demo-role";

export default function KayitPage() {
  const { t, locale } = useLocale();
  const isEn = locale === "en";

  // ─── Plan tanımları ───────────────────────────────────────
  const plans = [
    {
      id: "uzman",
      name: isEn ? "Free Profile" : "Ücretsiz Profil",
      price: 0,
      priceLabel: isEn ? "Free" : "Ücretsiz",
      period: "",
      vatNote: isEn ? "No credit card required" : "Kredi kartı gerekmez",
      highlight: false,
      badge: "",
      description: isEn
        ? "Create your profile and get listed in the directory. No subscription needed."
        : "Profilinizi oluşturun, Rehber'de listelinin. Abonelik gerekmez.",
      // Ücretsizde açık
      freeFeatures: isEn ? [
        "Firm or supplier profile",
        "Listed in the Directory (Rehber)",
        "IPA project catalog access",
        "News, events & basic listings",
        "Expert profile",
        "Sector & IPA filtering",
        "Portfolio infographics",
      ] : [
        "Firma veya tedarikçi profili",
        "Rehber'de listelenmek",
        "IPA proje kataloğuna erişim",
        "Haberler, etkinlikler ve temel ilanlar",
        "Uzman profili oluşturma",
        "Sektör ve IPA filtreleme",
        "Portföy infografikleri",
      ],
      // Ücretli planla açılan
      lockedFeatures: isEn ? [
        "Digital tools (events, documents, surveys…)",
        "Project management",
        "Tender listings",
        "Consortium management",
      ] : [
        "Dijital araçlar (etkinlik, doküman, anket…)",
        "Proje yönetimi",
        "İhale ilanları",
        "Konsorsiyum yönetimi",
      ],
      cta: isEn ? "Create Free Profile" : "Ücretsiz Profil Oluştur",
      ctaHref: "/kayit/uzman",
      demoRole: null as null,
      demoLabel: null as null,
    },
    {
      id: "yonetici",
      name: isEn ? "Manager Package" : "Yönetici Paketi",
      price: 2500,
      priceLabel: "€2.500",
      period: isEn ? "/ year + VAT" : "/ yıl + KDV",
      vatNote: isEn ? "Renews at €2.500/year + VAT" : "Yenileme: €2.500/yıl + KDV",
      highlight: true,
      badge: isEn ? "Most Popular" : "En Çok Tercih",
      description: isEn
        ? "For firms and NGOs actively managing EU-funded projects"
        : "AB projesi yürüten firma ve STK'lar için",
      freeFeatures: [] as string[],
      lockedFeatures: [] as string[],
      features: isEn ? [
        "Everything in Free Profile",
        "All digital tools",
        "Project management (team, files, listings)",
        "Event management with RSVP & polls",
        "E-document library with access control",
        "Newsletter campaigns",
        "Stakeholder address book & messaging",
        "Consortium management",
        "Unlimited users — per-project permissions",
        "Expert CV pool",
        "Tender listing access",
        "Project website builder",
        "Survey builder & dashboard",
      ] : [
        "Ücretsiz Profil'in tüm özellikleri",
        "Tüm dijital araçlar",
        "Proje yönetimi (ekip, dosya, ilanlar)",
        "Etkinlik yönetimi, RSVP ve anket",
        "Erişim kontrollü e-doküman kütüphanesi",
        "Bülten kampanyaları",
        "Paydaş adres defteri ve mesajlaşma",
        "Konsorsiyum yönetimi",
        "Sınırsız kullanıcı — proje bazlı yetki",
        "Uzman CV Havuzu",
        "İhale ilanlarına erişim",
        "Proje web sitesi oluşturucu",
        "Anket oluşturucu ve dashboard",
      ],
      cta: isEn ? "Get Manager Package" : "Yönetici Paketi Al",
      ctaHref: "/kayit/yonetici",
      demoRole: "firma" as const,
      demoLabel: isEn ? "Try Demo" : "Demoyu Dene",
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
      freeFeatures: [] as string[],
      lockedFeatures: [] as string[],
      features: isEn ? [
        "Everything in Free Profile",
        "Tender listing access",
        "Detailed service/product profile",
        "Procurement notifications",
        "Supplier-specific listings",
        "Networking event access",
      ] : [
        "Ücretsiz Profil'in tüm özellikleri",
        "İhale ilanlarına erişim",
        "Detaylı hizmet/ürün profili",
        "İhale bildirim sistemi",
        "Tedarikçiye özgü ilanlar",
        "Ağ geliştirme etkinliklerine erişim",
      ],
      cta: isEn ? "Become a Supplier" : "Tedarikçi Ol",
      ctaHref: "/kayit/tedarikci",
      demoRole: "tedarikci" as const,
      demoLabel: isEn ? "Try Demo" : "Demoyu Dene",
    },
  ];

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: isEn ? "Get Started" : "Başlayın" }]} />

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-ink mb-4">
            {isEn ? "Get Started" : "Başlayın"}
          </h1>
          <p className="text-slate text-lg max-w-2xl mx-auto">
            {isEn
              ? "Profile creation is free. Upgrade to unlock digital tools, project management and tender listings."
              : "Profil oluşturma ücretsizdir. Dijital araçlar, proje yönetimi ve ihale ilanları için yükseltin."}
          </p>
        </div>

        {/* Freemium açıklama bandı */}
        <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 flex items-start gap-4 mb-8">
          <span className="text-2xl flex-shrink-0 mt-0.5">🎉</span>
          <div>
            <p className="font-semibold text-green-800 text-sm mb-1">
              {isEn ? "Profiles are always free" : "Profiller her zaman ücretsiz"}
            </p>
            <p className="text-green-700 text-sm">
              {isEn
                ? "Register for free, create your firm or supplier profile, and get listed in the Directory. Upgrade only when you need digital tools or tender access."
                : "Ücretsiz kayıt olun, firma veya tedarikçi profilinizi oluşturun ve Rehber'de listelinin. Dijital araçlara veya ihale erişimine ihtiyaç duyduğunuzda yükseltin."}
            </p>
          </div>
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
                <p className={`text-xs ${plan.highlight ? "text-blue-200" : "text-mist"}`}>{plan.vatNote}</p>
              </div>

              {/* Features */}
              <div className={`flex-1 p-6 ${plan.highlight ? "bg-eu/5" : "bg-white"}`}>
                {/* Ücretsiz plan: iki grup */}
                {"freeFeatures" in plan && plan.freeFeatures.length > 0 ? (
                  <>
                    <ul className="space-y-2">
                      {plan.freeFeatures.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-slate">
                          <span className="mt-0.5 flex-shrink-0 text-green-600 font-bold">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {plan.lockedFeatures.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-line">
                        <p className="text-xs font-semibold text-mist uppercase tracking-wide mb-2">
                          {isEn ? "Unlocked with paid plan" : "Ücretli planla açılır"}
                        </p>
                        <ul className="space-y-1.5">
                          {plan.lockedFeatures.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm text-mist">
                              <span className="mt-0.5 flex-shrink-0">🔒</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  /* Ücretli planlar: tek liste */
                  <ul className="space-y-2.5">
                    {"features" in plan && (plan.features ?? []).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate">
                        <span className="mt-0.5 flex-shrink-0 text-eu font-bold">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* CTA */}
              <div className={`p-6 pt-0 space-y-2 ${plan.highlight ? "bg-eu/5" : "bg-white"} rounded-b-2xl`}>
                <Link href={plan.ctaHref}
                  className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-colors ${
                    plan.highlight
                      ? "bg-eu text-white hover:bg-blue-800"
                      : plan.price === 0
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-eu text-white hover:bg-blue-800"
                  }`}>
                  {plan.cta}
                </Link>
                {plan.demoRole && (
                  <Link
                    href="/firma"
                    onClick={() => { if (plan.demoRole) setDemoRole(plan.demoRole); }}
                    className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold border border-line text-slate hover:border-eu hover:text-eu transition-colors">
                    👁 {plan.demoLabel}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Yükseltme akışı açıklaması */}
        <div className="bg-surface rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-ink mb-3 text-center">
            {isEn ? "How the upgrade works" : "Yükseltme nasıl çalışır?"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: isEn ? "Create free profile" : "Ücretsiz profil oluştur", desc: isEn ? "Register, build your firm or supplier profile, appear in the directory." : "Kayıt olun, firma veya tedarikçi profilinizi oluşturun, Rehber'de görünün." },
              { step: "2", title: isEn ? "Explore the platform" : "Platformu keşfet", desc: isEn ? "Browse the project catalog, news, events and listings with no time limit." : "Proje kataloğunu, haberleri, etkinlikleri ve ilanları süresiz inceleyin." },
              { step: "3", title: isEn ? "Upgrade when ready" : "Hazır olunca yükselt", desc: isEn ? "Unlock tools, project management or tender access by choosing a paid plan." : "Araçları, proje yönetimini veya ihale erişimini ücretli plana geçerek açın." },
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-eu text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.step}</div>
                <div>
                  <p className="font-semibold text-ink text-sm mb-1">{s.title}</p>
                  <p className="text-xs text-slate leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-mist">
          {isEn
            ? "Questions? Contact us at bilgi@euinturkiye.com"
            : "Sorularınız için: bilgi@euinturkiye.com"}
        </p>
      </div>
    </PageShell>
  );
}
