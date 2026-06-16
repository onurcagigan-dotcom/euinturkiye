import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function NotFound() {
  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-6xl font-bold text-eu-pale">404</p>
        <h1 className="text-2xl font-bold text-ink mt-4">Sayfa bulunamadı</h1>
        <p className="text-slate mt-2">Aradığınız içerik taşınmış veya kaldırılmış olabilir.</p>
        <Link href="/" className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-eu text-white font-semibold">
          Ana sayfaya dön
        </Link>
      </div>
    </PageShell>
  );
}
