"use client";
import { useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function GirisPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handle = () => {
    if (!email || !pass) { setError("Lütfen tüm alanları doldurun."); return; }
    setError("Demo modunda giriş devre dışı. Lütfen Firebase bağlantısını kurun.");
  };

  return (
    <PageShell>
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-ink">Giriş Yap</h1>
            <p className="text-slate text-sm mt-1">euinturkiye.com yönetim paneli</p>
          </div>

          <div className="bg-white border border-line rounded-2xl p-8 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">E-posta</label>
              <input
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:border-eu"
                placeholder="ornek@firma.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1">Şifre</label>
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
              Giriş Yap
            </button>

            <div className="text-center text-xs text-mist">
              Hesabınız yok mu?{" "}
              <Link href="/kayit" className="text-eu font-semibold hover:underline">Kayıt Olun</Link>
            </div>
          </div>

          <div className="text-center mt-4">
            <Link href="/admin" className="text-eu text-sm hover:underline">
              Demo: Direkt Admin&apos;e Git →
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
