"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import { useDemoAccess } from "@/lib/demo-access-context";
import { generateDemoCode } from "@/lib/demo-access";

export default function DemoPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { verified, markVerified } = useDemoAccess();
  const isEn = locale === "en";

  const [step, setStep] = useState<"form" | "code" | "done">(verified ? "done" : "form");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [errors, setErrors] = useState<{ email?: string; phone?: string; code?: string }>({});

  const validateForm = () => {
    const e: { email?: string; phone?: string } = {};
    if (!email.trim() || !email.includes("@")) e.email = isEn ? "Enter a valid email" : "Geçerli bir e-posta girin";
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) e.phone = isEn ? "Enter a valid phone number" : "Geçerli bir telefon numarası girin";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitForm = () => {
    if (!validateForm()) return;
    // DEMO AŞAMASI: gerçek SMS gönderimi yok. Kod ekranda gösteriliyor.
    // Gerçek SMS entegrasyonu eklendiğinde burada bir API çağrısı yapılmalı ve kod ekranda gösterilmemelidir.
    const newCode = generateDemoCode();
    setSentCode(newCode);
    setStep("code");
  };

  const submitCode = () => {
    if (code.trim() !== sentCode) {
      setErrors({ code: isEn ? "Incorrect code, please try again" : "Kod hatalı, lütfen tekrar deneyin" });
      return;
    }
    markVerified();
    setStep("done");
    setTimeout(() => {
      window.location.href = "/";
    }, 1200);
  };

  return (
    <PageShell>
      <div className="max-w-md mx-auto px-6 py-12">
        <Breadcrumb items={[{ label: t("breadcrumb_home"), href: "/" }, { label: t("demo_title") }]} />

        <h1 className="text-2xl font-extrabold text-ink mb-2">{t("demo_title")}</h1>
        <p className="text-slate text-sm mb-8">{t("demo_sub")}</p>

        {step === "form" && (
          <div className="bg-white border border-line rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">{isEn ? "Email" : "E-posta"}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              {errors.email && <p className="text-tr text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">{isEn ? "Phone Number" : "Telefon Numarası"}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+90 5XX XXX XX XX"
                className="w-full px-3 py-2.5 border border-line rounded-lg text-sm focus:outline-none focus:border-eu" />
              {errors.phone && <p className="text-tr text-xs mt-1">{errors.phone}</p>}
            </div>
            <button onClick={submitForm}
              className="w-full py-2.5 bg-eu text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors">
              {t("demo_send_code")}
            </button>
            <p className="text-xs text-mist text-center">{t("demo_privacy_note")}</p>
          </div>
        )}

        {step === "code" && (
          <div className="bg-white border border-line rounded-2xl p-6 space-y-4">
            <p className="text-sm text-slate">{t("demo_code_sent_to")} <strong>{phone}</strong></p>

            {/* DEMO MODU NOTU: gerçek SMS entegrasyonu yapılana kadar kod burada gösterilir. */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
              {t("demo_mode_code_shown")}: <strong className="text-base tracking-widest">{sentCode}</strong>
            </div>

            <div>
              <label className="block text-xs font-semibold text-mist mb-1">{t("demo_enter_code")}</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
                maxLength={6} placeholder="000000"
                className="w-full px-3 py-2.5 border border-line rounded-lg text-sm text-center tracking-widest focus:outline-none focus:border-eu" />
              {errors.code && <p className="text-tr text-xs mt-1">{errors.code}</p>}
            </div>
            <button onClick={submitCode}
              className="w-full py-2.5 bg-eu text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors">
              {t("demo_verify")}
            </button>
            <button onClick={() => setStep("form")} className="w-full text-center text-xs text-mist hover:text-eu">
              {t("demo_back")}
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="text-3xl mb-3">✅</div>
            <h2 className="font-bold text-ink mb-1">{t("demo_verified_title")}</h2>
            <p className="text-slate text-sm">{t("demo_verified_sub")}</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
