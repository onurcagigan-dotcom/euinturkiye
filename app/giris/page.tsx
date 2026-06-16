"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, enabled } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fa] px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-medium text-xl block text-center mb-8 text-eu-deep">
          eu<span className="font-normal">in</span>
          <span className="text-tr">turkiye</span>
          <span className="font-normal">.com</span>
        </Link>

        <form onSubmit={submit} className="bg-white border border-line rounded-2xl p-7 shadow-sm">
          <h1 className="text-xl font-bold text-ink mb-1">Giriş Yap</h1>
          <p className="text-sm text-slate mb-6">Yönetim paneline erişmek için giriş yapın.</p>

          {!enabled && (
            <div className="mb-4 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3">
              Giriş sistemi Firebase yapılandırması bekliyor. Yapılandırma tamamlanınca
              e-posta/şifre ile giriş aktif olacak.
            </div>
          )}

          <label className="block mb-3">
            <span className="block text-sm font-medium text-ink mb-1.5">E-posta</span>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-eu/30"
            />
          </label>

          <label className="block mb-5">
            <span className="block text-sm font-medium text-ink mb-1.5">Şifre</span>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-eu/30"
            />
          </label>

          {error && <p className="text-sm text-tr mb-4">{error}</p>}

          <button
            type="submit" disabled={busy}
            className="w-full py-2.5 rounded-lg bg-eu text-white font-semibold text-sm disabled:opacity-60"
          >
            {busy ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>

        <p className="text-center text-sm text-slate mt-4">
          <Link href="/" className="hover:text-ink">← Ana sayfaya dön</Link>
        </p>
      </div>
    </div>
  );
}
