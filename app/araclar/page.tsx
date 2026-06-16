import Link from "next/link";
import { PageShell, PageBanner } from "@/components/PageShell";

const TOOLS = [
  { slug: "etkinlik", img: "etkinlik-yonetimi", title: "Etkinlik Yönetimi", desc: "Etkinlik oluşturun, katılımcıları yönetin, RSVP takibi yapın.", ready: true },
  { slug: "gorunurluk", img: "gorunurluk-ciktilari", title: "Görünürlük Çıktıları", desc: "AB standartlarında antetli kağıt, rapor ve sunum şablonları.", ready: false },
  { slug: "dokuman", img: "e-dokuman-yonetimi", title: "E-Doküman Yönetimi", desc: "Belgeleri kategorize edin, erişim izinlerini yönetin.", ready: true },
  { slug: "website", img: "proje-websitesi", title: "Proje Web Sitesi", desc: "Şablon seçin, verileriniz otomatik yüklensin, siteniz aktif olsun.", ready: false },
  { slug: "bulten", img: "bulten-gonderimi", title: "Bülten Gönderimi", desc: "Hedef kitle seçin, toplu e-posta gönderin, istatistik görün.", ready: true },
  { slug: "elearning", img: "e-learning", title: "E-Learning", desc: "Eğitim materyallerini ve video kaynaklarını sektöre göre yönetin.", ready: true },
  { slug: "paydas", img: "paydas-iletisimi", title: "Paydaş İletişimi", desc: "Ekip, uzman ve tedarikçileri yönetin, rol tanımlayın.", ready: true },
  { slug: "raporlama", img: "raporlama", title: "Raporlama", desc: "Portföy, ilan ve etkinlik istatistiklerini raporlayın.", ready: true },
];

export default function ToolsHome() {
  return (
    <PageShell>
      <PageBanner
        kicker="Dijital Araçlar"
        title="Projeleriniz için Hazır Çözümler"
        desc="Proje yönetiminin tüm dijital ihtiyaçları tek platformda. Aşağıdan bir araç seçin."
      />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOOLS.map((t) => {
            const card = (
              <div className={`bg-white border rounded-xl overflow-hidden h-full flex flex-col transition ${
                t.ready ? "border-line hover:shadow-lg hover:-translate-y-0.5" : "border-line opacity-75"
              }`}>
                <div
                  className="w-full h-36 bg-cover bg-center"
                  style={{ backgroundImage: `url('/images/homepage/tools/${t.img}.png')` }}
                />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[15px] text-ink">{t.title}</h3>
                    {!t.ready && <span className="text-[10px] bg-line text-slate px-2 py-0.5 rounded-full">Yakında</span>}
                  </div>
                  <p className="text-sm text-slate mt-2 leading-relaxed flex-1">{t.desc}</p>
                  {t.ready && <span className="text-eu font-semibold text-sm mt-3">Aracı Aç →</span>}
                </div>
              </div>
            );
            return t.ready ? (
              <Link key={t.slug} href={`/araclar/${t.slug}`}>{card}</Link>
            ) : (
              <div key={t.slug}>{card}</div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
