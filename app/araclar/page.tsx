"use client";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useLocale } from "@/lib/i18n/context";
import { TOOLS, ToolIcon } from "@/lib/tools-config";

export default function AraclarPage() {
  const { locale, t } = useLocale();
  const isEn = locale === "en";

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Breadcrumb items={[
          { label: t("breadcrumb_home"), href: "/" },
          { label: isEn ? "Digital Tools" : "Dijital Araçlar" },
        ]} />
        <h1 className="text-2xl font-bold text-ink mb-2">
          {isEn ? "Digital Tools" : "Dijital Araçlar"}
        </h1>
        <p className="text-slate mb-8">
          {isEn
            ? "An integrated toolset to simplify your EU project management."
            : "AB proje yönetiminizi kolaylaştıran entegre araç seti."}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {TOOLS.map((tool) => (
            <Link key={tool.id} href={tool.href}
              className="bg-white border border-line rounded-xl overflow-hidden hover:shadow-md hover:border-eu/40 transition-all group">
              <div className="h-14 flex items-center justify-center gap-2"
                style={{ background: `${tool.color}12`, borderBottom: `2px solid ${tool.color}25` }}>
                <span style={{ color: tool.color }}>
                  <ToolIcon svgPath={tool.svgPath} className="w-6 h-6" />
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-ink text-xs mb-1 leading-tight">
                  {isEn ? tool.labelEn : tool.label}
                </h3>
                <p className="text-[11px] text-slate leading-relaxed line-clamp-2">
                  {isEn ? tool.descEn : tool.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}