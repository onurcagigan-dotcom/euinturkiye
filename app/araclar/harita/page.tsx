import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";
import Link from "next/link";

export default function HaritaPage() {
  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Dijital Araçlar", href: "/araclar" }, { label: "Proje Haritası" }]} />
        <div className="text-5xl mb-6">🗺️</div>
        <h1 className="text-2xl font-bold text-ink mb-3">Proje Haritası</h1>
        <p className="text-slate mb-2">Türkiye&apos;nin 81 iline göre proje dağılımını görselleştirin.</p>
        <p className="text-mist text-sm mb-8">Bu özellik yakında kullanıma açılacaktır.</p>
        <Link href="/araclar" className="px-6 py-2.5 border border-line text-slate rounded-xl text-sm hover:bg-surface">
          Araçlara Dön
        </Link>
      </div>
    </PageShell>
  );
}
