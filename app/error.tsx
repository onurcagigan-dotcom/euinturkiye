"use client";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { useLocale } from "@/lib/i18n/context";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLocale();
  return (
    <PageShell>
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-16 text-center">
        <div>
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-ink mb-2">{t("error_title")}</h1>
          <p className="text-slate mb-2">{t("error_sub")}</p>
          {error.digest && (
            <p className="text-xs text-mist mb-6">Error code: {error.digest}</p>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={reset}
              className="px-5 py-2.5 bg-eu text-white font-semibold rounded-xl text-sm">
              {t("error_retry")}
            </button>
            <Link href="/" className="px-5 py-2.5 border border-line text-slate rounded-xl text-sm">
              {t("signup_back_home")}
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
