"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { useLocale } from "@/lib/i18n/context";
import { useFirma } from "@/lib/firma/context";
import { getDataProvider } from "@/lib/data";
import type { Subscriber, SubscriberProfileType } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/translations";

const PROFILE_TYPE_LABEL: Record<SubscriberProfileType, TranslationKey> = {
  firma: "company_profile_type_firma",
  stk: "company_profile_type_stk",
  tedarikci: "company_profile_type_tedarikci",
  delegasyon: "company_profile_type_delegasyon",
  program_otoritesi: "company_profile_type_program_otoritesi",
  admin2: "company_profile_type_delegasyon", // admin2 giriş listesinde gösterilmez
};

const PROFILE_TYPE_COLOR: Record<SubscriberProfileType, string> = {
  firma: "bg-blue-100 text-blue-700",
  stk: "bg-green-100 text-green-700",
  tedarikci: "bg-orange-100 text-orange-700",
  delegasyon: "bg-purple-100 text-purple-700",
  program_otoritesi: "bg-red-100 text-red-700",
  admin2: "bg-gray-100 text-gray-700",
};

const PROFILE_CAPABILITIES: Record<SubscriberProfileType, { tr: string; en: string }> = {
  firma: {
    tr: "Proje ekleme/düzenleme · Tüm dijital araçlar · İş & satınalma ilanı",
    en: "Add/edit projects · All digital tools · Job & procurement listings",
  },
  stk: {
    tr: "Proje ekleme/düzenleme · Tüm dijital araçlar · İş & satınalma ilanı",
    en: "Add/edit projects · All digital tools · Job & procurement listings",
  },
  tedarikci: {
    tr: "Uzman profili · Eğitim materyali görüntüle · Satınalma ilanı · İhale detaylarını görür",
    en: "Expert profile · View training materials · Procurement listings · View tender details",
  },
  delegasyon: {
    tr: "İhale ilanı (tam yetkili) · Bülten & paydaş araçları",
    en: "Tender listings (full authority) · Newsletter & stakeholder tools",
  },
  program_otoritesi: {
    tr: "İhale ilanı (tam yetkili) · Bülten & paydaş araçları",
    en: "Tender listings (full authority) · Newsletter & stakeholder tools",
  },
  admin2: {
    tr: "Tüm içeriklere erişim · Metin düzenleme · İhale & ilan yönetimi",
    en: "Full content access · Text editing · Tender & listing management",
  },
};

export default function GirisPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { login } = useFirma();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  useEffect(() => {
    // admin2 rolleri demo listesinde gösterilmez — ayrı kod ile girilir
    getDataProvider().getSubscribers().then((all) =>
      setSubscribers(all.filter((s) => s.profileType !== "admin2"))
    );
  }, []);

  const handle = () => {
    if (!email || !pass) { setError(locale === "tr" ? "Lütfen tüm alanları doldurun." : "Please fill in all fields."); return; }
    setError(locale === "tr" ? "Demo modunda giriş devre dışı. Lütfen Firebase bağlantısını kurun." : "Login is disabled in demo mode. Please set up Firebase.");
  };

  const loginAsFirma = (id: string) => {
    login(id);
    router.push("/firma");
  };

  return (
    <PageShell>
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-ink">{t("login_title")}</h1>
            <p className="text-slate text-sm mt-1">{t("login_sub")}</p>
          </div>

          <div className="bg-white border border-line rounded-2xl p-8 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">{t("login_email")}</label>
              <input
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:border-eu"
                placeholder="ornek@firma.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">{t("login_pass")}</label>
              <input
                type="password" value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full px-4 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:border-eu"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-tr text-xs">{error}</p>}

            <button
              onClick={handle}
              className="w-full py-3 bg-eu text-white font-bold rounded-xl hover:bg-blue-800 transition-colors"
            >
              {t("login_submit")}
            </button>

            <div className="text-center text-xs text-mist">
              {t("login_no_account")}{" "}
              <Link href="/kayit" className="text-eu font-semibold hover:underline">{t("login_signup_link")}</Link>
            </div>
          </div>

          {/* Demo firma girişi */}
          {subscribers.length > 0 && (
            <div className="bg-eu-pale border border-eu/20 rounded-2xl p-5 mt-4">
              <p className="text-xs font-semibold text-eu uppercase tracking-wide mb-1">
                {locale === "tr" ? "Demo: Farklı Rollerle Giriş Yap" : "Demo: Log In as Different Roles"}
              </p>
              <p className="text-xs text-slate mb-3">
                {locale === "tr" ? "Her rol farklı yetki ve alanlarla açılır." : "Each role opens with different permissions and sections."}
              </p>
              <div className="space-y-2">
                {subscribers.map((s) => (
                  <div key={s.id} className="bg-white border border-line rounded-xl overflow-hidden hover:border-eu transition-colors">
                    <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-ink">{s.organization ?? s.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${PROFILE_TYPE_COLOR[s.profileType]}`}>
                            {t(PROFILE_TYPE_LABEL[s.profileType])}
                          </span>
                        </div>
                        <p className="text-xs text-mist mt-0.5 truncate">{PROFILE_CAPABILITIES[s.profileType][locale === "tr" ? "tr" : "en"]}</p>
                      </div>
                    </div>
                    <div className="flex border-t border-line">
                      <button onClick={() => loginAsFirma(s.id)}
                        className="flex-1 py-1.5 text-xs font-semibold text-eu hover:bg-eu-pale transition-colors">
                        {locale === "tr" ? "Bu Rolle Giriş Yap →" : "Log In as This Role →"}
                      </button>
                      <div className="w-px bg-line" />
                      <Link href={`/firma/${s.id}`}
                        className="px-4 py-1.5 text-xs text-mist hover:text-eu hover:bg-surface transition-colors">
                        {locale === "tr" ? "Profil" : "Profile"}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin2 erişimi */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mt-3">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Admin2 Erişimi</p>
            <p className="text-xs text-gray-500 mb-3">Delegasyon ve program otoritesi hesapları için: e-posta kutusuna "admin2" yazıp giriş yapın.</p>
            <button onClick={() => loginAsFirma("sub-6")}
              className="w-full py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-eu hover:text-eu transition-colors">
              AB Türkiye Delegasyonu (Admin2) →
            </button>
          </div>

          <div className="text-center mt-4">
            <Link href="/admin" className="text-eu text-sm hover:underline">
              {t("login_demo_admin")}
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
