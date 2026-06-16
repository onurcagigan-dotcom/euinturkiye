"use client";

import { use, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { plans } from "@/lib/data/demo/plans";

function formatPrice(eur: number): string {
  if (eur === 0) return "Ücretsiz";
  return new Intl.NumberFormat("tr-TR").format(eur) + " € / yıl";
}

export default function SignupFormPage({
  params,
}: {
  params: Promise<{ plan: string }>;
}) {
  const { plan: planId } = use(params);
  const plan = plans.find((p) => p.id === planId);
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);

  if (!plan) {
    return (
      <PageShell>
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <p className="text-slate">Paket bulunamadı.</p>
          <Link href="/kayit" className="text-eu font-semibold mt-4 inline-block">← Paketlere dön</Link>
        </div>
      </PageShell>
    );
  }

  if (submitted) {
    return (
      <PageShell>
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-ink">Başvurunuz Alındı</h1>
          <p className="text-slate mt-3">
            <strong>{plan.name}</strong> paketi için başvurunuz alındı. Başvurunuz
            incelendikten sonra üyeliğiniz aktifleştirilecek ve size e-posta ile bilgi verilecektir.
          </p>
          <Link href="/" className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-eu text-white font-semibold">
            Ana sayfaya dön
          </Link>
          <p className="text-xs text-mist mt-6">
            (Demo: gerçek ödeme ve kayıt, sistem canlıya alındığında devreye girer.)
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-xl mx-auto px-6 py-12">
        <Link href="/kayit" className="text-eu text-sm hover:underline">← Paketler</Link>

        <div className="mt-6 bg-eu-pale rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate">Seçilen paket</p>
            <p className="font-bold text-ink text-lg">{plan.name}</p>
          </div>
          <p className="font-bold text-eu">{formatPrice(plan.priceEur)}</p>
        </div>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
        >
          <Field label="Kurum / Şirket Adı"><input required className={inp} /></Field>
          <Field label="Yetkili Adı Soyadı"><input required className={inp} /></Field>
          <Field label="E-posta"><input type="email" required className={inp} /></Field>
          <Field label="Telefon"><input type="tel" className={inp} /></Field>
          <Field label="Vergi No (opsiyonel)"><input className={inp} /></Field>

          <label className="flex items-start gap-2 text-sm text-slate pt-2">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" required />
            <span>
              <Link href="#" className="text-eu underline">Aydınlatma Metni</Link> ve{" "}
              <Link href="#" className="text-eu underline">Kullanım Sözleşmesi</Link>&apos;ni
              okudum, onaylıyorum.
            </span>
          </label>

          <button
            type="submit"
            disabled={!consent}
            className="w-full py-3 rounded-lg bg-eu text-white font-semibold disabled:opacity-50"
          >
            {plan.priceEur > 0 ? "Ödemeye Geç" : "Ücretsiz Başvur"}
          </button>
        </form>
      </div>
    </PageShell>
  );
}

const inp =
  "w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-eu/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>
      {children}
    </label>
  );
}
