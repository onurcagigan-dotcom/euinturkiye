import Link from "next/link";
import { PageShell, PageBanner } from "@/components/PageShell";
import { plans } from "@/lib/data/demo/plans";

function formatPrice(eur: number): string {
  if (eur === 0) return "Ücretsiz";
  return new Intl.NumberFormat("tr-TR").format(eur) + " €";
}

export default function KayitPage() {
  return (
    <PageShell>
      <PageBanner
        kicker="Üyelik"
        title="Size Uygun Paketi Seçin"
        desc="Tüm paketler dijital araçların tamamını içerir. Fiyatlar yıllık ve KDV dahildir."
      />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl border p-6 flex flex-col ${
                p.highlighted
                  ? "border-eu ring-2 ring-eu/20 bg-white shadow-lg relative"
                  : "border-line bg-white"
              }`}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-eu text-white text-xs font-semibold px-3 py-1 rounded-full">
                  En Popüler
                </span>
              )}
              <h3 className="font-bold text-lg text-ink">{p.name}</h3>
              <p className="text-sm text-slate mt-1">{p.tagline}</p>

              <div className="mt-4 mb-5">
                <span className="text-3xl font-bold text-ink">{formatPrice(p.priceEur)}</span>
                {p.priceEur > 0 && <span className="text-sm text-slate"> / yıl</span>}
              </div>

              <ul className="space-y-2.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink">
                    <span className="text-eu mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/kayit/${p.id}`}
                className={`mt-6 text-center px-4 py-2.5 rounded-lg font-semibold text-sm transition ${
                  p.highlighted
                    ? "bg-eu text-white hover:bg-eu/90"
                    : "border border-eu text-eu hover:bg-eu-pale"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Aktivasyon akışı */}
        <div className="mt-16 bg-eu-pale rounded-2xl p-8">
          <h2 className="text-xl font-bold text-ink mb-6 text-center">Üyelik Nasıl Aktifleşir?</h2>
          <div className="grid sm:grid-cols-4 gap-6">
            <Step n={1} title="Paket Seçimi" desc="Size uygun paketi seçin ve kayıt formunu doldurun." />
            <Step n={2} title="Ödeme" desc="Güvenli ödeme altyapısı üzerinden ödemenizi yapın." />
            <Step n={3} title="KVKK Onayı" desc="Aydınlatma metni ve sözleşmeleri onaylayın." />
            <Step n={4} title="Onay & Aktivasyon" desc="Başvurunuz onaylandığında üyeliğiniz aktifleşir." />
          </div>
          <p className="text-xs text-slate text-center mt-6">
            Başvurunuz onaylanmazsa ödemeniz otomatik olarak iade edilir.
          </p>
        </div>
      </div>
    </PageShell>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 rounded-full bg-eu text-white font-bold flex items-center justify-center mx-auto mb-3">
        {n}
      </div>
      <h3 className="font-semibold text-ink text-sm">{title}</h3>
      <p className="text-xs text-slate mt-1 leading-relaxed">{desc}</p>
    </div>
  );
}
