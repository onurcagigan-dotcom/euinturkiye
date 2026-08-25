"use client";
import { use, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { useLocale } from "@/lib/i18n/context";
import { PLAN_PRICING, formatEuro, type PlanId } from "@/lib/pricing";

export default function KayitFormPage({ params }: { params: Promise<{ plan: string }> }) {
  const { plan } = use(params);
  const { t, locale } = useLocale();
  const isEn = locale === "en";
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", org: "", phone: "", profileKind: "firma" as "firma" | "stk" | "uzman" | "tedarikci" });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const PLAN_LABELS: Record<string, string> = {
    uzman: isEn ? "Expert Package" : "Uzman Paketi",
    yonetici: isEn ? "Manager Package" : "Yönetici Paketi",
    tedarikci2: isEn ? "Supplier Package" : "Tedarikçi Paketi",
    tedarikci: isEn ? "Supplier Package" : "Tedarikçi Paketi",
  };

  const pricing = PLAN_PRICING[plan as PlanId];
  const planInfo = {
    name: PLAN_LABELS[plan] ?? plan,
    price: pricing ? formatEuro(pricing.firstYearPrice) : "",
  };

  const validate = () => {
    const e: { name?: string; email?: string } = {};
    if (!form.name.trim()) e.name = isEn ? "Full name is required" : "Ad soyad zorunlu";
    if (!form.email.trim() || !form.email.includes("@")) e.email = isEn ? "Enter a valid email" : "Geçerli bir e-posta girin";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) setSubmitted(true);
  };

  if (submitted) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-ink mb-2">{t("signup_success_title")}</h1>
          <p className="text-slate mb-2">
            {isEn ? <>Your application for <strong>{planInfo.name}</strong> has been received.</> : <><strong>{planInfo.name}</strong> için başvurunuz alınmıştır.</>}
          </p>
          <p className="text-mist text-sm mb-8">
            {isEn ? <>We will get back to you at <strong>{form.email}</strong> shortly.</> : <>En kısa sürede <strong>{form.email}</strong> adresine dönüş yapacağız.</>}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/projeler" className="px-5 py-2.5 bg-eu text-white font-bold rounded-xl text-sm">
              {t("signup_browse_projects")}
            </Link>
            <Link href="/" className="px-5 py-2.5 border border-line text-slate rounded-xl text-sm">
              {t("signup_back_home")}
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-md mx-auto px-6 py-12">
        <Link href="/kayit" className="inline-flex items-center gap-1 text-eu text-sm hover:underline mb-6">
          ← {t("signup_back")}
        </Link>

        <div className="bg-eu-pale border border-eu/20 rounded-xl p-4 mb-6">
          <div className="text-xs text-eu font-semibold uppercase tracking-wide">{t("signup_selected_plan")}</div>
          <div className="font-bold text-ink mt-1">{planInfo.name}</div>
          {planInfo.price && <div className="text-eu font-semibold text-sm">{planInfo.price}</div>}
        </div>

        <h1 className="text-2xl font-bold text-ink mb-6">{t("signup_register")}</h1>

        <div className="space-y-4">
          {/* Ücretsiz kayıtta profil tipi seçimi */}
          {plan === "uzman" && (
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                {isEn ? "Profile type *" : "Profil tipi *"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: "firma", icon: "🏢", tr: "Firma", en: "Firm" },
                  { id: "stk", icon: "🤝", tr: "STK / Vakıf", en: "NGO / Foundation" },
                  { id: "tedarikci", icon: "⚙️", tr: "Tedarikçi", en: "Supplier" },
                  { id: "uzman", icon: "👤", tr: "Bireysel Uzman", en: "Individual Expert" },
                ] as const).map(pk => (
                  <button key={pk.id} type="button"
                    onClick={() => setForm(f => ({ ...f, profileKind: pk.id }))}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${form.profileKind === pk.id ? "border-eu bg-eu-pale text-eu" : "border-line text-slate hover:border-eu/40"}`}>
                    <span className="text-lg">{pk.icon}</span>
                    {isEn ? pk.en : pk.tr}
                  </button>
                ))}
              </div>
              <p className="text-xs text-mist mt-2">
                {form.profileKind === "uzman"
                  ? (isEn ? "Individual experts can be assigned to project teams and listed in the expert directory." : "Bireysel uzmanlar proje ekiplerine atanabilir ve uzman rehberinde listelenir.")
                  : (isEn ? "Organizations get a profile and directory listing. Upgrade later for digital tools." : "Kurumlar profil ve rehber listelemesi alır. Dijital araçlar için sonra yükseltebilirsiniz.")}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-ink mb-1">{t("signup_name")} *</label>
            <input
              type="text" value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-eu ${errors.name ? "border-tr" : "border-line"}`}
              placeholder={t("signup_name")}
            />
            {errors.name && <p className="text-tr text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1">{t("signup_email")} *</label>
            <input
              type="email" value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-eu ${errors.email ? "border-tr" : "border-line"}`}
              placeholder="ornek@firma.com"
            />
            {errors.email && <p className="text-tr text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1">
              {plan === "uzman" && form.profileKind === "uzman"
                ? (isEn ? "Organization (optional)" : "Bağlı olduğunuz kurum (opsiyonel)")
                : t("signup_org")}
            </label>
            <input
              type="text" value={form.org}
              onChange={(e) => setForm(f => ({ ...f, org: e.target.value }))}
              className="w-full px-4 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:border-eu"
              placeholder={t("signup_org")}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1">{t("signup_phone")}</label>
            <input
              type="tel" value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full px-4 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:border-eu"
              placeholder="+90 5xx xxx xx xx"
            />
          </div>

          <div className="bg-surface rounded-xl p-4 text-xs text-mist leading-relaxed">
            {isEn
              ? <>Our team will contact you once your application is received.{plan !== "uzman" && " Payment details will be shared separately."}</>
              : <>Başvurunuz alındıktan sonra ekibimiz sizinle iletişime geçecektir.{plan !== "uzman" && " Ödeme bilgileri ayrıca iletilecektir."}</>
            }
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-eu text-white font-bold rounded-xl hover:bg-blue-800 transition-colors"
          >
            {t("signup_submit")}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
