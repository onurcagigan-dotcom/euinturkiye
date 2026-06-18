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
    getDataProvider().getSubscribers().then(setSubscribers);
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
              <p className="text-xs font-semibold text-eu uppercase tracking-wide mb-3">
                {locale === "tr" ? "Demo: Firma/STK Olarak Giriş Yap" : "Demo: Log In as Company/NGO"}
              </p>
              <div className="space-y-1.5">
                {subscribers.map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <button
                      onClick={() => loginAsFirma(s.id)}
                      className="flex-1 flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-line hover:border-eu transition-colors text-left"
                    >
                      <span>
                        <span className="text-sm font-semibold text-ink">{s.organization ?? s.name}</span>
                        <span className="text-xs text-mist ml-2">{t(PROFILE_TYPE_LABEL[s.profileType])}</span>
                      </span>
                      <span className="text-eu text-xs font-semibold">{locale === "tr" ? "Giriş Yap" : "Log In"} →</span>
                    </button>
                    <Link href={`/firma/${s.id}`} className="text-xs text-mist hover:text-eu px-2 py-2 flex-shrink-0">
                      {locale === "tr" ? "Profil" : "Profile"}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

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
