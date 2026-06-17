"use client";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { useLocale } from "@/lib/i18n/context";

export default function NotFound() {
  const { t } = useLocale();
  return (
    <PageShell>
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-16 text-center">
        <div>
          <div className="text-7xl font-extrabold text-eu opacity-20 mb-4">404</div>
          <h1 className="text-2xl font-bold text-ink mb-2">{t("notfound_title")}</h1>
          <p className="text-slate mb-8">{t("notfound_sub")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/" className="px-5 py-2.5 bg-eu text-white font-semibold rounded-xl text-sm">
              {t("signup_back_home")}
            </Link>
            <Link href="/projeler" className="px-5 py-2.5 border border-line text-slate rounded-xl text-sm">
              {t("signup_browse_projects")}
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
