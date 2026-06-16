import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Breadcrumb } from "@/components/Breadcrumb";

export default function KayitPage() {
  const plans = [
    {
      id: "ucretsiz",
      name: "Ücretsiz",
      price: "€0",
      period: "/ ay",
      highlight: false,
      features: [
        "Proje kataloğuna erişim",
        "Güncel haberler",
        "Halka açık etkinlik takvimi",
        "Temel iş ilanları",
      ],
      cta: "Ücretsiz Başla",
    },
    {
      id: "paket1",
      name: "Paket 1",
      price: "€2.500",
      period: "/ yıl",
      highlight: true,
      features: [
        "Tüm ücretsiz özellikler",
        "Satınalma ilanları detayları",
        "E-Doküman yönetimi",
        "Etkinlik Yönetimi araçları",
        "Bülten gönderimi",
        "Paydaş İletişimi",
        "5 kullanıcı",
      ],
      cta: "Paket 1'i Seç",
    },
    {
      id: "paket2",
      name: "Paket 2",
      price: "€4.000",
      period: "/ yıl",
      highlight: false,
      features: [
        "Tüm Paket 1 özellikleri",
        "İhale detayları",
        "Uzman CV Havuzu",
        "Raporlama ve analitik",
        "E-Learning platformu",
        "Proje sahiplenme talebi",
        "15 kullanıcı",
      ],
      cta: "Paket 2'yi Seç",
    },
    {
      id: "tedarikci",
      name: "Tedarikçi",
      price: "€2.000",
      period: "/ yıl",
      highlight: false,
      features: [
        "Satınalma ve ihale ilanları",
        "Uzman profil oluşturma",
        "CV havuzunda görünürlük",
        "Tedarikçi duyuru araçları",
        "3 kullanıcı",
      ],
      cta: "Tedarikçi Ol",
    },
  ];

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Kayıt Ol" }]} />

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-ink mb-4">Planlara Göz Atın</h1>
          <p className="text-slate text-lg max-w-2xl mx-auto">
            Proje ihtiyaçlarınıza en uygun paketi seçin. Yıllık abonelik, tüm dijital araçlara erişim sağlar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div key={plan.id}
              className={`rounded-2xl border p-6 flex flex-col ${
                plan.highlight
                  ? "border-eu shadow-xl bg-eu text-white"
                  : "border-line bg-white"
              }`}>
              {plan.highlight && (
                <div className="text-xs font-bold text-yellow-300 uppercase tracking-widest mb-3">En Popüler</div>
              )}
              <div className="mb-6">
                <h2 className={`text-xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-ink"}`}>{plan.name}</h2>
                <div className="flex items-end gap-1">
                  <span className={`text-3xl font-extrabold ${plan.highlight ? "text-white" : "text-ink"}`}>{plan.price}</span>
                  <span className={`text-sm mb-1 ${plan.highlight ? "text-blue-200" : "text-mist"}`}>{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? "text-blue-100" : "text-slate"}`}>
                    <span className={`mt-0.5 flex-shrink-0 ${plan.highlight ? "text-yellow-300" : "text-eu"}`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={`/kayit/${plan.id}`}
                className={`block w-full text-center py-2.5 rounded-xl font-bold text-sm transition-colors ${
                  plan.highlight
                    ? "bg-yellow-400 text-ink hover:bg-yellow-300"
                    : "bg-eu text-white hover:bg-blue-800"
                }`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
