"use client";
import { useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";

const PLAN_NAMES: Record<string, string> = {
  ucretsiz: "Ücretsiz Plan",
  paket1: "Paket 1",
  paket2: "Paket 2",
  tedarikci: "Tedarikçi Paketi",
};

export default function KayitFormPage({ params }: { params: { plan: string } }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", org: "", phone: "" });

  const planName = PLAN_NAMES[params.plan] ?? params.plan;

  if (submitted) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto px-6 py-16 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-ink mb-2">Başvurunuz Alındı</h1>
          <p className="text-slate mb-6">
            <strong>{planName}</strong> için başvurunuz alınmıştır. En kısa sürede size dönüş yapacağız.
          </p>
          <Link href="/" className="inline-block px-6 py-3 bg-eu text-white font-bold rounded-xl">
            Ana Sayfaya Dön
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-md mx-auto px-6 py-12">
        <Link href="/kayit" className="text-eu text-sm hover:underline">← Planlara Dön</Link>
        <h1 className="text-2xl font-bold text-ink mt-4 mb-1">Kayıt Ol</h1>
        <p className="text-slate mb-8">Seçilen plan: <strong>{planName}</strong></p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">Ad Soyad *</label>
            <input
              type="text" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:border-eu"
              placeholder="Ad Soyad"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">E-posta *</label>
            <input
              type="email" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-4 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:border-eu"
              placeholder="ornek@firma.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">Kurum / Şirket</label>
            <input
              type="text" value={form.org}
              onChange={(e) => setForm((f) => ({ ...f, org: e.target.value }))}
              className="w-full px-4 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:border-eu"
              placeholder="Kurum adı"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">Telefon</label>
            <input
              type="tel" value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full px-4 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:border-eu"
              placeholder="+90 5xx xxx xx xx"
            />
          </div>

          <button
            onClick={() => { if (form.name && form.email) setSubmitted(true); }}
            className="w-full py-3 bg-eu text-white font-bold rounded-xl hover:bg-blue-800 transition-colors mt-2"
          >
            Başvuruyu Gönder
          </button>
        </div>
      </div>
    </PageShell>
  );
}
