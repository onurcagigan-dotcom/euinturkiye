/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DataProvider, ProjectFilters } from "../provider";
import type {
  Sector, Donor, Project, Listing, ListingType, EventItem, BlogPost,
  HomeStats, EventRsvp, ProjectDocument, Subscriber, Campaign,
  Stakeholder, TrainingVideo, OwnershipRequest, ExpertProfile, NetworkConnection,
} from "../../types";

const delay = <T>(v: T, ms = 60) => new Promise<T>((r) => setTimeout(() => r(v), ms));

// ── Sektörler ─────────────────────────────────────────────
// Onur'un belirlediği IPA sektör operasyonel programları listesi baz alınmıştır.
// İkonlar /public/sectors/ klasöründe.
const sectors: Sector[] = [
  { id: "yargi", name: "Yargı", color: "#dc2626", iconUrl: "/sectors/yargi.png" },
  { id: "icisleri", name: "İçişleri", color: "#991b1b", iconUrl: "/sectors/icisleri.png" },
  { id: "cevre", name: "Çevre ve İklim Eylemi Sektör Operasyonel Programı", color: "#0891b2", iconUrl: "/sectors/cevre.png" },
  { id: "temel-haklar", name: "Temel Haklar", color: "#4338ca", iconUrl: "/sectors/temel-haklar.png" },
  { id: "ulasim", name: "Ulaştırma Sektör Operasyonel Programı", color: "#0369a1", iconUrl: "/sectors/ulasim.png" },
  { id: "enerji", name: "Enerji", color: "#ca8a04", iconUrl: "/sectors/enerji.png" },
  { id: "istihdam", name: "İstihdam, Eğitim ve Sosyal Politikalar Sektör Operasyonel Programı", color: "#ea580c", iconUrl: "/sectors/istihdam.png" },
  { id: "tarim", name: "Tarım ve Kırsal Kalkınma", color: "#16a34a", iconUrl: "/sectors/tarim.png" },
  { id: "rekabet", name: "Rekabetçilik ve Yenilik Sektör Operasyonel Programı", color: "#9333ea", iconUrl: "/sectors/rekabet.png" },
  { id: "sivil-toplum", name: "Sivil Toplum", color: "#be185d", iconUrl: "/sectors/sivil-toplum.png" },
];

// ── Donörler ──────────────────────────────────────────────
const donors: Donor[] = [
  { id: "eu", name: "Avrupa Birliği", country: "AB" },
  { id: "wb", name: "Dünya Bankası", country: "ABD" },
  { id: "giz", name: "GIZ (Almanya)", country: "Almanya" },
  { id: "usaid", name: "USAID", country: "ABD" },
  { id: "undp", name: "UNDP", country: "BM" },
];

// ── Projeler (13 özel + 469 otomatik = 482 adet) ───────────
const projects: Project[] = [
  {
    id: "tarim-modern",
    title: "Türkiye Tarımın Modernizasyonu",
    summary: "AB finansmanlı tarım modernizasyon projesi. Çiftçilere modern teknikler ve dijital araçlar kazandırır.",
    sectorId: "tarim", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "T.C. Tarım ve Orman Bakanlığı", locations: ["Konya", "Ankara", "İzmir"],
    budget: "€12.5M", startDate: "2023-01-01", endDate: "2026-12-31",
    status: "devam", featured: true,
    objective: "Türkiye'nin tarım sektörünü AB standartlarına uyumlu hale getirerek çiftçilerin gelirini artırmak ve sürdürülebilir tarım uygulamalarını yaygınlaştırmak.",
    expectedOutputs: "500 çiftçiye eğitim verilmesi, 50 tarım kooperatifinin desteklenmesi, 10 pilot çiftlikte akıllı tarım sistemlerinin kurulması.",
    activities: "Çiftçi eğitim programları düzenlenmesi, kooperatif kapasite geliştirme atölyeleri, dijital tarım platformunun kurulması ve test edilmesi.",
    ownerSubscriberId: "sub-1", ownerSubscriberName: "ABC Danışmanlık",
    consortiumMembers: [
      { subscriberId: "sub-4", subscriberName: "Tarım Geliştirme Vakfı", role: "Saha Uygulama Ortağı", joinedAt: "2026-02-01T09:00:00Z" },
    ],
  },
  {
    id: "cevre-iklim",
    title: "Çevre Uyum ve İklim Değişikliği",
    summary: "Türkiye'nin iklim değişikliğine uyum kapasitesinin güçlendirilmesi.",
    sectorId: "cevre", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "T.C. Çevre Bakanlığı", locations: ["Ankara", "İstanbul"],
    budget: "€8.2M", startDate: "2024-03-01", endDate: "2027-03-31",
    status: "devam", featured: true,
    objective: "Ulusal iklim değişikliği uyum planının güçlendirilmesi ve yerel yönetimlerin kapasitelerinin artırılması.",
    expectedOutputs: "5 iklim eylem planı hazırlanması, 200 yerel yönetim personeline eğitim verilmesi.",
    activities: "Durum analizi yapılması, kapasite geliştirme programları, politika danışmanlığı.",
  },
  {
    id: "genc-istihdam",
    title: "Genç İstihdamın Desteklenmesi",
    summary: "15-29 yaş grubundaki gençlerin istihdama erişimini kolaylaştıran kapsamlı program.",
    sectorId: "istihdam", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "İŞKUR", locations: ["İstanbul", "Ankara", "İzmir", "Bursa", "Gaziantep"],
    budget: "€15M", startDate: "2022-06-01", endDate: "2025-12-31",
    status: "devam", featured: true,
    objective: "Genç işsizliğini azaltmak ve gençlerin iş piyasasına geçişini hızlandırmak.",
    expectedOutputs: "10.000 gencin mesleki eğitim alması, 3.000 genç için staj imkânı.",
    activities: "Mesleki eğitim kursları, kariyer danışmanlığı, işveren iş birlikleri.",
  },
  {
    id: "adli-tebligat",
    title: "Adli Tebligat Sisteminin Modernizasyonu",
    summary: "Türkiye'nin adli tebligat altyapısının dijitalleştirilmesi ve AB standartlarına uyumu.",
    sectorId: "yargi", donorId: "eu", ipaPeriod: "IPA-II",
    beneficiary: "T.C. Adalet Bakanlığı", locations: ["Ankara"],
    budget: "€5.5M", startDate: "2021-01-01", endDate: "2024-06-30",
    status: "tamamlandi", featured: false,
    objective: "Adli tebligat süreçlerinin dijitalleştirilmesi ve uluslararası standartlarla uyumunun sağlanması.",
    expectedOutputs: "Tüm adliyelerde e-tebligat sisteminin devreye alınması, ortalama tebligat süresinin %60 azaltılması, 81 ilde personel eğitimi tamamlanması.",
    activities: "Mevcut tebligat süreçlerinin analizi, e-tebligat yazılımının geliştirilmesi ve test edilmesi, UYAP entegrasyonu, adliye personeline saha eğitimleri verilmesi.",
  },
  {
    id: "kadin-girisimcilik",
    title: "Kadın Girişimciliğinin Güçlendirilmesi",
    summary: "Kadın girişimcilere iş kurma, finansmana erişim ve mentorluk desteği sağlayan program.",
    sectorId: "rekabet", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "KOSGEB", locations: ["İstanbul", "Ankara", "Gaziantep", "Diyarbakır"],
    budget: "€6.8M", startDate: "2023-09-01", endDate: "2026-08-31",
    status: "devam", featured: true,
    objective: "Kadınların ekonomiye katılımını artırmak; girişimcilik, finansmana erişim ve sürdürülebilir iş modelleri konusunda kadın girişimcilerin kapasitesini güçlendirmek.",
    expectedOutputs: "1.500 kadın girişimciye eğitim verilmesi, 300 yeni kadın girişiminin kurulmasına destek olunması, 4 ilde girişimcilik merkezi açılması.",
    activities: "İş planı geliştirme atölyeleri, mentorluk eşleştirme programı, mikro kredi danışmanlığı, dijital pazarlama eğitimleri, yerel girişimcilik fuarları düzenlenmesi.",
  },
  {
    id: "dijital-donusum",
    title: "Kamu Hizmetlerinde Dijital Dönüşüm",
    summary: "Belediyelerin dijital hizmet kapasitesinin güçlendirilmesi.",
    sectorId: "icisleri", donorId: "wb", ipaPeriod: "IPA-III",
    beneficiary: "İçişleri Bakanlığı", locations: ["İstanbul", "Ankara", "İzmir", "Bursa"],
    budget: "€9.3M", startDate: "2024-01-01", endDate: "2027-12-31",
    status: "devam", featured: false,
    objective: "Belediyelerin vatandaşa sunduğu hizmetleri dijitalleştirmek, e-belediyecilik altyapısını güçlendirmek ve hizmet erişilebilirliğini artırmak.",
    expectedOutputs: "25 belediyede e-hizmet platformunun kurulması, 500 belediye personeline dijital beceri eğitimi, vatandaş memnuniyetinde %30 artış.",
    activities: "İhtiyaç analizi ve dijital olgunluk değerlendirmesi, e-belediye yazılım altyapısının kurulması, personel eğitimleri, pilot uygulama ve yaygınlaştırma.",
  },
  {
    id: "enerji-verimlilik",
    title: "Enerji Verimliliği ve Yenilenebilir Enerji",
    summary: "Türkiye'nin enerji verimliliği kapasitesinin artırılması ve yenilenebilir enerji yatırımlarının desteklenmesi.",
    sectorId: "enerji", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "Enerji ve Tabii Kaynaklar Bakanlığı", locations: ["Ankara", "Konya", "Kayseri"],
    budget: "€11.2M", startDate: "2023-03-01", endDate: "2026-02-28",
    status: "devam", featured: false,
    objective: "Sanayi ve kamu binalarında enerji verimliliğini artırmak, yenilenebilir enerji yatırımlarını teşvik etmek ve ilgili mevzuatı AB normlarına uyumlu hale getirmek.",
    expectedOutputs: "150 kamu binasında enerji verimliliği etüdü yapılması, 20 MW kurulu güçte güneş enerjisi pilot tesisinin devreye alınması, enerji verimliliği mevzuatının güncellenmesi.",
    activities: "Enerji etütleri ve denetimleri, teknik personel eğitimleri, pilot yenilenebilir enerji tesislerinin kurulumu, farkındalık kampanyaları.",
  },
  {
    id: "saglik-reform",
    title: "Sağlık Sektörü Reform Desteği",
    summary: "Türkiye sağlık sisteminin güçlendirilmesi ve AB sağlık standartlarına uyum.",
    sectorId: "istihdam", donorId: "eu", ipaPeriod: "IPA-II",
    beneficiary: "Sağlık Bakanlığı", locations: ["Ankara", "İstanbul", "İzmir"],
    budget: "€7.5M", startDate: "2020-01-01", endDate: "2023-12-31",
    status: "tamamlandi", featured: false,
    objective: "Birinci basamak sağlık hizmetlerinin kalitesini artırmak ve sağlık sisteminin AB sağlık güvenliği standartlarıyla uyumunu sağlamak.",
    expectedOutputs: "60 sağlık kuruluşunun akreditasyon sürecine hazırlanması, 1.200 sağlık personeline hizmet içi eğitim verilmesi, ulusal kalite rehberlerinin güncellenmesi.",
    activities: "Sağlık kuruluşlarında kalite değerlendirmesi, klinik rehberlerin AB standartlarına göre güncellenmesi, personel eğitim programları, izleme ve değerlendirme sisteminin kurulması.",
  },
  {
    id: "bolgesel-kalkinma",
    title: "Doğu Anadolu Bölgesel Kalkınma",
    summary: "Doğu Anadolu illerinde ekonomik kalkınma ve altyapı iyileştirme.",
    sectorId: "ulasim", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "Kalkınma Bakanlığı", locations: ["Erzurum", "Van", "Ağrı", "Iğdır"],
    budget: "€18M", startDate: "2022-01-01", endDate: "2025-12-31",
    status: "devam", featured: false,
    objective: "Doğu Anadolu bölgesinde ekonomik kalkınmayı hızlandırmak, küçük ölçekli altyapıyı iyileştirmek ve yerel istihdam olanaklarını artırmak.",
    expectedOutputs: "40 km kırsal yol iyileştirmesi, 2.000 kişiye yönelik istihdam odaklı eğitim, 15 yerel kalkınma projesinin desteklenmesi.",
    activities: "Altyapı iyileştirme çalışmaları, yerel kalkınma ajanslarıyla iş birliği, küçük ölçekli hibe programlarının yürütülmesi, izleme ziyaretleri.",
  },
  {
    id: "egitim-kalite",
    title: "Eğitimde Kalite ve Erişim",
    summary: "Türkiye'de eğitim kalitesinin artırılması ve dezavantajlı gruplara erişimin genişletilmesi.",
    sectorId: "istihdam", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "Milli Eğitim Bakanlığı", locations: ["Türkiye geneli"],
    budget: "€22M", startDate: "2024-09-01", endDate: "2028-08-31",
    status: "devam", featured: true,
    objective: "Eğitimde fırsat eşitliğini güçlendirmek, dezavantajlı bölgelerdeki okullarda eğitim kalitesini artırmak ve okul terkini azaltmak.",
    expectedOutputs: "500 okulda öğretmen kapasite geliştirme programının uygulanması, 50.000 öğrenciye destekleyici eğitim materyali sağlanması, okul terk oranında %15 azalma.",
    activities: "Öğretmen eğitim modüllerinin geliştirilmesi, dezavantajlı bölge okullarına materyal desteği, veli farkındalık çalışmaları, izleme ve değerlendirme sisteminin kurulması.",
  },
  {
    id: "mesleki-egitim-giz",
    title: "Mesleki Eğitimde İkili Sistem Reformu",
    summary: "Almanya'nın ikili mesleki eğitim modelinin Türkiye'ye uyarlanması.",
    sectorId: "istihdam", donorId: "giz", ipaPeriod: "IPA-III",
    beneficiary: "Milli Eğitim Bakanlığı", locations: ["Bursa", "Kocaeli", "Gaziantep"],
    budget: "€8.4M", startDate: "2023-06-01", endDate: "2026-05-31",
    status: "devam", featured: true,
    objective: "Almanya'nın ikili mesleki eğitim modelini (işletme + okul) Türkiye'deki mesleki ve teknik eğitim sistemine uyarlamak, sanayinin nitelikli işgücü ihtiyacını karşılamak.",
    expectedOutputs: "30 mesleki eğitim merkezinde ikili sistem pilot uygulaması, 5.000 öğrencinin işletmelerde staj yapması, 200 işletmeyle eğitim ortaklığı protokolü imzalanması.",
    activities: "Müfredat uyarlama çalıştayları, işletme-okul eşleştirme, öğretmen ve usta öğretici eğitimleri, pilot bölgelerde uygulama ve izleme.",
  },
  {
    id: "afet-direnci-usaid",
    title: "Afetlere Dirençli Topluluklar Programı",
    summary: "Deprem riski yüksek bölgelerde toplum temelli afet hazırlık kapasitesinin güçlendirilmesi.",
    sectorId: "icisleri", donorId: "usaid", ipaPeriod: "IPA-III",
    beneficiary: "AFAD", locations: ["Hatay", "Kahramanmaraş", "Adıyaman", "Malatya"],
    budget: "€14.6M", startDate: "2024-02-01", endDate: "2027-01-31",
    status: "devam", featured: true,
    objective: "Deprem bölgesindeki toplulukların afet öncesi hazırlık, afet anı müdahale ve afet sonrası toparlanma kapasitesini güçlendirmek.",
    expectedOutputs: "120 mahallede gönüllü afet ekiplerinin kurulması, 50.000 kişiye afet bilinci eğitimi, 4 ilde erken uyarı sisteminin kurulması.",
    activities: "Toplum temelli risk haritalama, gönüllü eğitim programları, erken uyarı sistemi altyapı kurulumu, tatbikatlar ve farkındalık kampanyaları.",
  },
  {
    id: "surdurulebilir-kalkinma-undp",
    title: "Sürdürülebilir Kalkınma Hedefleri Yerelleştirme Programı",
    summary: "BM Sürdürülebilir Kalkınma Hedeflerinin yerel yönetimler düzeyinde uygulanması.",
    sectorId: "sivil-toplum", donorId: "undp", ipaPeriod: "IPA-III",
    beneficiary: "Çevre, Şehircilik ve İklim Değişikliği Bakanlığı", locations: ["İzmir", "Antalya", "Eskişehir", "Samsun"],
    budget: "€6.2M", startDate: "2023-10-01", endDate: "2026-09-30",
    status: "devam", featured: false,
    objective: "BM Sürdürülebilir Kalkınma Hedeflerini yerel yönetim politika ve uygulamalarına entegre etmek, yerel SKH izleme sistemlerini kurmak.",
    expectedOutputs: "12 belediyede yerel SKH eylem planının hazırlanması, yerel SKH gösterge setinin oluşturulması, yıllık SKH izleme raporlarının yayınlanması.",
    activities: "Belediye personeline SKH eğitimleri, katılımcı planlama çalıştayları, gösterge sistemi tasarımı, yıllık izleme ve raporlama.",
  },
];

// Kalan 469 projeyi otomatik oluştur
for (let i = 11; i <= 499; i++) {
  const sec = sectors[i % sectors.length];
  const don = donors[i % donors.length];
  const periods = ["IPA-I", "IPA-II", "IPA-III"] as const;
  const period = periods[i % 3];
  // IPA-I dönemi tamamlanmış kabul edilir; diğerleri ağırlıklı olarak devam ediyor, bir kısmı tamamlanmış.
  const status: Project["status"] = period === "IPA-I" ? "tamamlandi" : (i % 4 === 0 ? "tamamlandi" : "devam");
  projects.push({
    id: `proje-${i}`,
    title: `${sec.name} Destek Projesi ${i}`,
    summary: `${sec.name} alanında kapasite geliştirme ve kurumsal reform projesi.`,
    sectorId: sec.id, donorId: don.id, ipaPeriod: period,
    beneficiary: "İlgili Bakanlık", locations: ["Ankara"],
    budget: `€${(Math.floor(Math.random() * 15) + 1)}.${Math.floor(Math.random() * 9)}M`,
    startDate: "2023-01-01", endDate: "2025-12-31",
    status,
    featured: false,
  });
}

// ── İlanlar ───────────────────────────────────────────────
const listings: Listing[] = [
  {
    id: "ilan-1", type: "is", title: "Kıdemli Proje Koordinatörü",
    organization: "Design for Good LLC", projectId: "tarim-modern",
    location: "Ankara (Hibrit)", publishedAt: "2026-06-10", deadline: "2026-07-15", locked: false,
    subject: "Tarım modernizasyon projesinin günlük yürütülmesinden sorumlu kıdemli proje koordinatörü pozisyonu.",
    referenceNo: "DFG-2026-IK-014",
    contactEmail: "ik@designforgood.com",
    publisherSubscriberId: "sub-1",
    description: "Tarım modernizasyon projesi için deneyimli proje koordinatörü aranmaktadır. AB projesi yönetim deneyimi şarttır.\n\nGereksinimler:\n- En az 5 yıl AB projesi yönetim deneyimi\n- İyi derecede İngilizce\n- Tarım sektörü bilgisi tercih sebebi\n\nBaşvuru için CV ve motivasyon mektubunu gönderiniz.",
    documents: [
      { name: "İş Tanımı.pdf", fileSize: "0.4 MB" },
    ],
  },
  {
    id: "ilan-2", type: "satinalma",
    title: "Eğitim Materyalleri Tedariki",
    organization: "T.C. Tarım ve Orman Bakanlığı", projectId: "tarim-modern",
    location: "Türkiye geneli", publishedAt: "2026-06-05", deadline: "2026-07-30", locked: true,
    subject: "Çiftçi eğitim programları kapsamında basılı ve dijital eğitim materyallerinin tasarım, basım ve dağıtım hizmeti satınalması.",
    budget: "€85.000 (tahmini)",
    referenceNo: "TARIM-SAT-2026-031",
    contactEmail: "satinalma@tarim.gov.tr",
    description: "Türkiye Tarımın Modernizasyonu Projesi kapsamında 500 çiftçiye dağıtılacak eğitim materyallerinin (kitapçık, broşür, dijital içerik) tasarım, basım ve dağıtım hizmeti satın alınacaktır.\n\nKapsam:\n- 10 farklı konuda eğitim kitapçığı tasarımı ve basımı (toplam 5.000 adet)\n- Dijital eğitim içeriklerinin hazırlanması\n- 50 kooperatife dağıtım lojistiği\n\nTeklif verecek firmaların PRAG kurallarına uygun referans deneyimi sunması gerekmektedir.",
    documents: [
      { name: "Teknik Şartname.pdf", fileSize: "3.2 MB" },
      { name: "Teklif Formu.docx", fileSize: "0.6 MB" },
      { name: "Sözleşme Taslağı.pdf", fileSize: "1.1 MB" },
    ],
  },
  {
    id: "ilan-3", type: "ihale",
    title: "Yazılım Geliştirme ve Bakım Hizmetleri",
    organization: "İŞKUR", projectId: "genc-istihdam",
    location: "Ankara", publishedAt: "2026-06-01", deadline: "2026-08-15", locked: true,
    subject: "Genç İstihdamın Desteklenmesi Projesi kariyer danışmanlığı platformunun yazılım geliştirme ve 2 yıllık bakım-destek hizmeti ihalesi.",
    budget: "€420.000 (yaklaşık maliyet)",
    referenceNo: "ISKUR-IHL-2026-008",
    contactEmail: "ihale@iskur.gov.tr",
    publisherSubscriberId: "sub-7",
    description: "Genç İstihdamın Desteklenmesi Projesi kapsamında geliştirilen kariyer danışmanlığı platformunun yeni modüllerinin geliştirilmesi ve 2 yıl süreyle bakım-destek hizmetinin sağlanması işi ihale edilecektir.\n\nKapsam:\n- Mobil uygulama geliştirme\n- İşveren eşleştirme modülü\n- 2 yıl 7/24 teknik destek\n\nİhaleye katılım için yeterlik belgeleri ve önceki kamu ihalesi deneyimi referansları talep edilmektedir.",
    documents: [
      { name: "İhale Şartnamesi.pdf", fileSize: "5.7 MB" },
      { name: "Teknik Gereksinimler.pdf", fileSize: "2.3 MB" },
      { name: "İdari Şartname.pdf", fileSize: "1.8 MB" },
    ],
  },
  {
    id: "ilan-4", type: "is", title: "Mali Uzman",
    organization: "Çevre Bakanlığı", projectId: "cevre-iklim",
    location: "Ankara", publishedAt: "2026-06-12", deadline: "2026-07-20", locked: false,
    subject: "Çevre Uyum ve İklim Değişikliği Projesi mali yönetim ve raporlama süreçlerini yürütecek mali uzman pozisyonu.",
    referenceNo: "CEVRE-IK-2026-019",
    contactEmail: "ik@cevre.gov.tr",
    description: "İklim projesi için mali uzman aranmaktadır. EU mali yönetim deneyimi tercih sebebidir.\n\nGereksinimler:\n- En az 3 yıl AB projeleri mali yönetim deneyimi\n- PRAG kurallarına hakimiyet\n- İleri düzey Excel ve raporlama becerileri",
    documents: [
      { name: "İş Tanımı.pdf", fileSize: "0.3 MB" },
    ],
  },
  {
    id: "ilan-5", type: "is", title: "İzleme & Değerlendirme Uzmanı",
    organization: "KOSGEB", projectId: "kadin-girisimcilik",
    location: "İstanbul", publishedAt: "2026-06-08", deadline: "2026-08-01", locked: false,
    subject: "Kadın Girişimciliğinin Güçlendirilmesi Projesi gösterge takibi ve etki değerlendirmesini yürütecek İ&D uzmanı pozisyonu.",
    referenceNo: "KOSGEB-IK-2026-027",
    contactEmail: "ik@kosgeb.gov.tr",
    description: "Kadın girişimcilik programının İ&D uzmanı aranıyor. M&E metodolojileri konusunda deneyim şart.\n\nGereksinimler:\n- İzleme ve değerlendirme alanında en az 4 yıl deneyim\n- Gösterge sistemleri tasarımı deneyimi\n- Saha ziyareti yapabilecek seyahat uygunluğu",
    documents: [
      { name: "İş Tanımı.pdf", fileSize: "0.4 MB" },
    ],
  },
  {
    id: "ilan-6", type: "satinalma",
    title: "Saha Ekipmanları Tedariki",
    organization: "Enerji ve Tabii Kaynaklar Bakanlığı", projectId: "enerji-verimlilik",
    location: "Konya", publishedAt: "2026-05-28", deadline: "2026-07-10", locked: true,
    subject: "Pilot güneş enerjisi tesisi için izleme sensörleri ve saha ölçüm ekipmanlarının satın alınması.",
    budget: "€62.000 (tahmini)",
    referenceNo: "ENERJI-SAT-2026-012",
    contactEmail: "satinalma@enerji.gov.tr",
    description: "Konya'daki pilot güneş enerjisi tesisinin performans izleme sistemleri için sensör, veri kaydedici ve saha ölçüm ekipmanlarının tedariki yapılacaktır.\n\nKapsam:\n- 20 adet enerji üretim izleme sensörü\n- Veri toplama ve iletim altyapısı\n- Kurulum ve devreye alma hizmeti",
    documents: [
      { name: "Teknik Şartname.pdf", fileSize: "2.1 MB" },
      { name: "Teklif Formu.docx", fileSize: "0.5 MB" },
    ],
  },
  {
    id: "ilan-7", type: "ihale",
    title: "Kırsal Yol Yapım İşleri",
    organization: "Kalkınma Bakanlığı", projectId: "bolgesel-kalkinma",
    location: "Erzurum, Van", publishedAt: "2026-05-20", deadline: "2026-08-30", locked: true,
    subject: "Doğu Anadolu Bölgesel Kalkınma Projesi kapsamında 40 km kırsal yol yapım ve iyileştirme işleri ihalesi.",
    budget: "€1.250.000 (yaklaşık maliyet)",
    referenceNo: "KALKINMA-IHL-2026-005",
    contactEmail: "ihale@kalkinma.gov.tr",
    publisherSubscriberId: "sub-7",
    description: "Erzurum ve Van illerinde toplam 40 km kırsal yol yapım, asfaltlama ve drenaj iyileştirme işleri ihale edilecektir.\n\nKapsam:\n- 40 km yol yapımı ve asfaltlama\n- Drenaj sistemleri\n- 18 ay yapım süresi\n\nİhaleye katılım için karayolu yapım işlerinde benzer iş deneyim belgesi gereklidir.",
    documents: [
      { name: "İhale Şartnamesi.pdf", fileSize: "6.4 MB" },
      { name: "Keşif Özeti.xlsx", fileSize: "1.2 MB" },
      { name: "İdari Şartname.pdf", fileSize: "2.0 MB" },
    ],
  },
  // Firmaların kendi yayınladığı ilanlar (firma profil sayfasında listelenir)
  {
    id: "ilan-8", type: "is",
    title: "Kıdemli Tarım Uzmanı",
    organization: "ABC Danışmanlık", projectId: "tarim-modern",
    location: "Konya (Saha)", publishedAt: "2026-06-14", deadline: "2026-07-25", locked: false,
    subject: "Tarım modernizasyon projesi saha uygulamalarını yürütecek kıdemli tarım uzmanı pozisyonu.",
    referenceNo: "ABC-IK-2026-007",
    contactEmail: "ik@abcdanismanlik.com",
    publisherSubscriberId: "sub-1",
    description: "ABC Danışmanlık bünyesinde, Tarım Modernizasyon Projesi kapsamında çiftçi eğitimleri ve saha ziyaretlerini koordine edecek kıdemli tarım uzmanı aranmaktadır.\n\nGereksinimler:\n- Ziraat mühendisliği lisans/yüksek lisans derecesi\n- En az 4 yıl saha deneyimi\n- Konya bölgesinde seyahat edebilme",
    documents: [
      { name: "İş Tanımı.pdf", fileSize: "0.3 MB" },
    ],
  },
  {
    id: "ilan-9", type: "satinalma",
    title: "Saha Ölçüm Cihazları Tedariki",
    organization: "MK İnşaat", projectId: "enerji-verimlilik",
    location: "Kayseri", publishedAt: "2026-06-11", deadline: "2026-07-18", locked: false,
    subject: "Enerji verimliliği etütlerinde kullanılacak taşınabilir ölçüm cihazlarının satın alınması.",
    budget: "€18.000 (tahmini)",
    referenceNo: "MKI-SAT-2026-003",
    contactEmail: "satinalma@mkinsaat.com",
    publisherSubscriberId: "sub-3",
    description: "MK İnşaat, enerji verimliliği etütlerinde kullanılacak taşınabilir termal kamera ve enerji ölçüm cihazlarının tedarikini gerçekleştirecektir.\n\nKapsam:\n- 5 adet termal görüntüleme kamerası\n- 10 adet taşınabilir enerji ölçüm cihazı\n- Kalibrasyon ve eğitim hizmeti",
    documents: [
      { name: "Teknik Şartname.pdf", fileSize: "1.4 MB" },
    ],
  },
];

// ── Etkinlikler ───────────────────────────────────────────
const events: EventItem[] = [
  {
    id: "etk-1",
    title: "AB Proje Yönetimi Konferansı 2026",
    date: "2026-09-15T09:00:00",
    location: "Hilton Ankara, Ankara",
    isPublic: true,
    description: "Türkiye'deki AB projelerinin yöneticilerini buluşturan yıllık konferans.",
    capacity: 250,
    agenda: [
      { id: "a1", time: "09:00", title: "Açılış", presenter: "Moderatör", durationMin: 30 },
      { id: "a2", time: "09:30", title: "Keynote: AB-Türkiye İlişkileri", presenter: "AB Büyükelçisi", durationMin: 45 },
      { id: "a3", time: "10:30", title: "Panel: IPA III Deneyimleri", presenter: "Panel", durationMin: 90 },
    ],
  },
  {
    id: "etk-2",
    title: "Tarım Modernizasyon Projesi — Teknik Toplantı",
    date: "2026-07-10T10:00:00",
    location: "Tarım Bakanlığı, Ankara",
    projectId: "tarim-modern",
    isPublic: false,
    description: "Proje ekibinin aylık teknik ilerleme toplantısı.",
    capacity: 20,
    agenda: [
      { id: "a4", time: "10:00", title: "İlerleme Raporu Sunumu", presenter: "Proje Koordinatörü", durationMin: 30 },
      { id: "a5", time: "10:30", title: "Saha Bulguları Değerlendirmesi", presenter: "Teknik Ekip", durationMin: 40 },
      { id: "a6", time: "11:10", title: "Bir Sonraki Çeyrek Planlaması", presenter: "Proje Direktörü", durationMin: 30 },
    ],
  },
  {
    id: "etk-3",
    title: "Kadın Girişimciler Zirvesi",
    date: "2026-08-22T09:00:00",
    location: "İstanbul Kongre Merkezi",
    projectId: "kadin-girisimcilik",
    isPublic: true,
    description: "Kadın girişimcileri bir araya getiren networking ve bilgi paylaşım etkinliği.",
    capacity: 150,
    agenda: [
      { id: "a7", time: "09:00", title: "Kayıt ve Karşılama Kahvesi", durationMin: 30 },
      { id: "a8", time: "09:30", title: "Açılış Konuşması", presenter: "KOSGEB Program Koordinatörü", durationMin: 20 },
      { id: "a9", time: "10:00", title: "Başarı Hikayeleri Paneli", presenter: "Kadın Girişimciler", durationMin: 60 },
      { id: "a10", time: "11:10", title: "Mentorluk Eşleştirme Atölyesi", presenter: "ABC Danışmanlık", durationMin: 50 },
      { id: "a11", time: "12:00", title: "Networking Öğle Yemeği", durationMin: 60 },
    ],
  },
  {
    id: "etk-4",
    title: "IPA III Bilgilendirme Toplantısı",
    date: "2026-10-05T14:00:00",
    location: "AB Türkiye Delegasyonu, Ankara",
    isPublic: true,
    description: "IPA III döneminin yeni fırsatlarına ilişkin bilgilendirme.",
    capacity: 80,
    agenda: [
      { id: "a12", time: "14:00", title: "Açılış ve Karşılama", presenter: "AB Delegasyonu", durationMin: 15 },
      { id: "a13", time: "14:15", title: "IPA III Öncelik Alanları", presenter: "Delegasyon Uzmanı", durationMin: 45 },
      { id: "a14", time: "15:00", title: "Başvuru Süreçleri ve Teknik Destek", presenter: "Program Yöneticisi", durationMin: 40 },
      { id: "a15", time: "15:40", title: "Soru & Cevap", durationMin: 30 },
    ],
  },
  {
    id: "etk-5",
    title: "Dijital Araçlar Eğitimi",
    date: "2026-07-25T10:00:00",
    location: "Online (Zoom)",
    isPublic: false,
    description: "Proje yöneticileri için dijital araçlar kullanım eğitimi.",
    capacity: 30,
    agenda: [
      { id: "a16", time: "10:00", title: "Platforma Genel Bakış", presenter: "Eğitmen", durationMin: 20 },
      { id: "a17", time: "10:20", title: "Etkinlik ve Doküman Yönetimi Uygulaması", presenter: "Eğitmen", durationMin: 40 },
      { id: "a18", time: "11:00", title: "Raporlama Aracı Canlı Demo", presenter: "Eğitmen", durationMin: 30 },
    ],
  },
];

// ── Blog / Gündem ─────────────────────────────────────────
const blogPosts: BlogPost[] = [
  {
    id: "blog-1",
    slug: "ab-turkiye-iliskileri-2026",
    title: "AB-Türkiye İlişkilerinde Yeni Dönem: 2026 Perspektifi",
    category: "AB Politikası",
    excerpt: "Türkiye'nin AB üyelik sürecinde 2026 yılı kritik dönüm noktaları ve beklentiler.",
    content: `Türkiye ile Avrupa Birliği arasındaki ilişkiler, 2026 yılında yeni bir ivme kazanmaktadır. Özellikle IPA III döneminin aktif uygulamaya geçmesiyle birlikte, iki taraf arasındaki proje işbirliği rekor seviyelere ulaşmıştır.

Bu yıl hayata geçirilen projeler, tarımdan çevreye, eğitimden dijital dönüşüme kadar geniş bir yelpazede Türkiye'nin kalkınma gündemine katkı sunmaktadır. Delegasyon yetkilileri, 2026'da tamamlanacak projelerin etki değerlendirmesinin olumlu sonuçlanmasını beklediklerini ifade etmektedir.

Önümüzdeki süreçte katılım öncesi fonların etkin kullanımı ve kurumsal kapasitenin güçlendirilmesi öncelikli hedefler olarak öne çıkmaktadır.`,
    coverImage: "https://images.unsplash.com/photo-1473177104440-ffee2f376098?w=1200&q=80",
    publishedAt: "2026-06-01T09:00:00",
    readMinutes: 5,
    projectId: undefined,
  },
  {
    id: "blog-2",
    slug: "ipa-iii-firsatlari",
    title: "IPA III Dönemi: Türkiye için Finansman Fırsatları",
    category: "Fonlar & Finansman",
    excerpt: "IPA III kapsamında Türkiye'ye sunulan hibe ve teknik destek imkânları rehberi.",
    content: `IPA III (Katılım Öncesi Mali Yardım Aracı) 2021-2027 dönemi, Türkiye için önemli finansman olanakları sunmaktadır. Bu dönemde Türkiye, toplamda 1,4 milyar Euro'yu aşan kaynak için uygun konumdadır.

Desteklenecek öncelik alanları arasında hukukun üstünlüğü ve temel haklar, çevre ve iklim eylemi, dijital dönüşüm, tarım ve kırsal kalkınma ile bölgesel ve bölgesel kalkınma yer almaktadır.

Başvuru süreçleri, ortak finansman gereksinimleri ve teknik destek talep prosedürleri hakkında daha fazla bilgi için delegasyon web sitesi ve euinturkiye.com kaynaklarından faydalanabilirsiniz.`,
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80",
    publishedAt: "2026-05-15T10:00:00",
    readMinutes: 7,
    projectId: undefined,
  },
  {
    id: "blog-3",
    slug: "tarim-modern-ilerleme",
    title: "Tarım Modernizasyon Projesi: İlk Yıl Değerlendirmesi",
    category: "Proje Haberleri",
    excerpt: "Türkiye Tarımın Modernizasyonu Projesi'nin ilk yılına ait ilerleme raporu yayımlandı.",
    content: `Türkiye Tarımın Modernizasyonu Projesi, ilk uygulama yılını başarıyla tamamladı. Proje kapsamında 127 çiftçiye temel tarım teknolojileri eğitimi verildi, 8 kooperatif kurumsal kapasite geliştirme desteği aldı.

Pilot çiftliklerde akıllı sulama sistemleri kurulumu tamamlandı. İlk sonuçlar, su kullanımında yüzde 30'a varan tasarruf sağlandığına işaret etmektedir.

Proje koordinatörü, ikinci yılda eğitim faaliyetlerinin genişletileceğini ve dijital tarım platformunun pilot aşamasına geçileceğini açıkladı.`,
    coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
    publishedAt: "2026-04-20T11:00:00",
    readMinutes: 4,
    projectId: "tarim-modern",
  },
  {
    id: "blog-4",
    slug: "tarim-modern-sulama-sistemleri",
    title: "Pilot Çiftliklerde Akıllı Sulama Sistemleri Devreye Alındı",
    category: "Proje Haberleri",
    excerpt: "10 pilot çiftlikte kurulan akıllı sulama sistemleri ilk hasat döneminde test edildi.",
    content: `Türkiye Tarımın Modernizasyonu Projesi kapsamında Konya, Ankara ve İzmir'deki 10 pilot çiftlikte kurulan akıllı sulama sistemleri, ilk hasat dönemini başarıyla tamamladı.

Sensör tabanlı nem ölçüm sistemleri, çiftçilere gerçek zamanlı veri sunarak sulama zamanlamasının optimize edilmesini sağladı. Saha ekibi, sistemlerin su tasarrufuna ek olarak verim artışına da katkı sağladığını bildirdi.

Proje ekibi, başarılı pilot sonuçlarının ardından sistemin 2027 yılında 40 yeni çiftliğe yaygınlaştırılmasını planlıyor.`,
    coverImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80",
    publishedAt: "2026-05-28T09:00:00",
    readMinutes: 3,
    projectId: "tarim-modern",
  },
  {
    id: "blog-5",
    slug: "genc-istihdam-on-bin-genc",
    title: "Genç İstihdam Projesi 10.000 Gence Ulaştı",
    category: "Proje Haberleri",
    excerpt: "Genç İstihdamın Desteklenmesi Projesi kapsamında mesleki eğitim hedefi tamamlandı.",
    content: `Genç İstihdamın Desteklenmesi Projesi, başlangıçta belirlenen 10.000 genç için mesleki eğitim hedefine üç ay önce ulaştı. İstanbul, Ankara, İzmir, Bursa ve Gaziantep'teki eğitim merkezlerinde verilen kurslar, dijital beceriler, müşteri hizmetleri ve teknik zanaat alanlarında yoğunlaştı.

Proje kapsamında ayrıca 3.000 genç için staj imkânı sağlandı; katılımcıların yüzde 62'si staj sonrasında istihdam edildi.

İŞKUR yetkilileri, projenin ikinci fazında kariyer danışmanlığı hizmetlerinin dijitalleştirilmesinin planlandığını belirtti.`,
    coverImage: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80",
    publishedAt: "2026-06-05T10:00:00",
    readMinutes: 4,
    projectId: "genc-istihdam",
  },
  {
    id: "blog-6",
    slug: "cevre-iklim-uyum-plani",
    title: "5 İlde İklim Eylem Planı Hazırlık Süreci Başladı",
    category: "Proje Haberleri",
    excerpt: "Çevre Uyum ve İklim Değişikliği Projesi kapsamında yerel iklim eylem planları hazırlanıyor.",
    content: `Çevre Uyum ve İklim Değişikliği Projesi kapsamında Ankara ve İstanbul başta olmak üzere 5 ilde yerel iklim eylem planlarının hazırlık çalışmaları başladı.

Proje ekibi, yerel yönetim personeline yönelik kapasite geliştirme eğitimlerine paralel olarak, her ilin kendine özgü iklim risklerini değerlendiren durum analizi raporlarını tamamladı.

AB Delegasyonu temsilcisi, planların 2027 yılı ortasına kadar tamamlanmasının hedeflendiğini ve sürecin diğer büyükşehirler için model oluşturacağını ifade etti.`,
    coverImage: "https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=1200&q=80",
    publishedAt: "2026-05-08T09:00:00",
    readMinutes: 5,
    projectId: "cevre-iklim",
  },
  {
    id: "blog-7",
    slug: "adli-tebligat-projesi-tamamlandi",
    title: "Adli Tebligat Sistemi Modernizasyonu Projesi Tamamlandı",
    category: "Proje Haberleri",
    excerpt: "Dört yıl süren proje, e-tebligat sisteminin Türkiye genelinde devreye alınmasıyla sonuçlandı.",
    content: `Adli Tebligat Sisteminin Modernizasyonu Projesi, dört yıllık uygulama sürecinin ardından başarıyla tamamlandı. Proje kapsamında geliştirilen e-tebligat sistemi, UYAP altyapısıyla entegre edilerek tüm adliyelerde devreye alındı.

Final değerlendirme raporuna göre, ortalama tebligat süresi yüzde 60 oranında kısaldı. 81 ildeki adliye personeline verilen eğitimler sayesinde sistemin yaygın ve etkin kullanımı sağlandı.

Adalet Bakanlığı yetkilileri, projenin AB standartlarıyla uyumlu dijital adalet altyapısı açısından önemli bir kilometre taşı olduğunu belirtti.`,
    coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=1200&q=80",
    publishedAt: "2024-07-05T10:00:00",
    readMinutes: 4,
    projectId: "adli-tebligat",
  },
  {
    id: "blog-8",
    slug: "kadin-girisimcilik-300-yeni-girisim",
    title: "Kadın Girişimcilik Programı 300 Yeni Girişime Destek Verdi",
    category: "Proje Haberleri",
    excerpt: "Kadın Girişimciliğinin Güçlendirilmesi Projesi kapsamında dört ilde girişimcilik merkezleri faaliyete geçti.",
    content: `Kadın Girişimciliğinin Güçlendirilmesi Projesi kapsamında İstanbul, Ankara, Gaziantep ve Diyarbakır'da açılan girişimcilik merkezleri, bugüne kadar 300'den fazla yeni kadın girişiminin kurulmasına destek oldu.

Mentorluk eşleştirme programı kapsamında 1.500 kadın girişimci, alanında deneyimli iş insanlarıyla buluşturuldu. Program dahilinde düzenlenen mikro kredi danışmanlık seansları, katılımcıların finansmana erişimini kolaylaştırdı.

KOSGEB Program Koordinatörü, projenin ikinci yılında dijital pazarlama eğitimlerinin ağırlığının artırılacağını duyurdu.`,
    coverImage: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&q=80",
    publishedAt: "2026-06-10T09:00:00",
    readMinutes: 4,
    projectId: "kadin-girisimcilik",
  },
  {
    id: "blog-9",
    slug: "dijital-donusum-25-belediye",
    title: "25 Belediyede E-Hizmet Platformu Kuruluyor",
    category: "Proje Haberleri",
    excerpt: "Kamu Hizmetlerinde Dijital Dönüşüm Projesi kapsamında pilot belediyeler belirlendi.",
    content: `Kamu Hizmetlerinde Dijital Dönüşüm Projesi'nin ilk aşamasında İstanbul, Ankara, İzmir ve Bursa'daki 25 belediye, e-hizmet platformu kurulumu için pilot bölge olarak belirlendi.

Proje ekibi, belediyelerin dijital olgunluk seviyelerini değerlendiren kapsamlı bir analiz tamamladı. Bulgular, vatandaşa yönelik çevrimiçi hizmetlerde önemli iyileştirme potansiyeli olduğunu gösterdi.

İçişleri Bakanlığı yetkilileri, 500 belediye personeline yönelik dijital beceri eğitimlerinin 2026 sonbaharında başlayacağını duyurdu.`,
    coverImage: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80",
    publishedAt: "2026-05-22T11:00:00",
    readMinutes: 3,
    projectId: "dijital-donusum",
  },
  {
    id: "blog-10",
    slug: "enerji-verimliligi-gunes-tesisi",
    title: "20 MW Güneş Enerjisi Pilot Tesisi Devreye Alındı",
    category: "Proje Haberleri",
    excerpt: "Enerji Verimliliği Projesi kapsamında Konya'da kurulan pilot tesis üretime başladı.",
    content: `Enerji Verimliliği ve Yenilenebilir Enerji Projesi kapsamında Konya'da kurulan 20 MW kapasiteli güneş enerjisi pilot tesisi, planlanan takvimden önce devreye alındı.

Tesis, bölgedeki kamu binalarının elektrik ihtiyacının önemli bir kısmını karşılayacak şekilde tasarlandı. Proje ekibi, ilk verilerin beklenen verimlilik oranlarıyla örtüştüğünü açıkladı.

Enerji ve Tabii Kaynaklar Bakanlığı, başarılı pilot uygulamanın ardından benzer tesislerin Kayseri'de de kurulmasının değerlendirildiğini bildirdi.`,
    coverImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80",
    publishedAt: "2026-04-30T09:00:00",
    readMinutes: 3,
    projectId: "enerji-verimlilik",
  },
  {
    id: "blog-11",
    slug: "saglik-reform-akreditasyon",
    title: "60 Sağlık Kuruluşu Akreditasyon Sürecini Tamamladı",
    category: "Proje Haberleri",
    excerpt: "Sağlık Sektörü Reform Desteği Projesi başarıyla sonuçlandı.",
    content: `Sağlık Sektörü Reform Desteği Projesi kapsamında Ankara, İstanbul ve İzmir'deki 60 sağlık kuruluşu, AB standartlarıyla uyumlu akreditasyon sürecini tamamladı.

Proje boyunca 1.200 sağlık personeline hizmet içi eğitim verildi. Güncellenen ulusal kalite rehberleri, birinci basamak sağlık hizmetlerinde standardizasyonu artırdı.

Sağlık Bakanlığı, projenin sonuçlarının diğer illerdeki sağlık kuruluşları için referans model oluşturacağını belirtti.`,
    coverImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80",
    publishedAt: "2023-12-15T10:00:00",
    readMinutes: 4,
    projectId: "saglik-reform",
  },
  {
    id: "blog-12",
    slug: "bolgesel-kalkinma-kirsal-yol",
    title: "Doğu Anadolu'da 40 km Kırsal Yol İyileştirmesi Tamamlandı",
    category: "Proje Haberleri",
    excerpt: "Doğu Anadolu Bölgesel Kalkınma Projesi kapsamında altyapı yatırımları sürüyor.",
    content: `Doğu Anadolu Bölgesel Kalkınma Projesi kapsamında Erzurum, Van, Ağrı ve Iğdır'da toplam 40 kilometrelik kırsal yol ağı iyileştirildi.

Altyapı çalışmalarına paralel olarak, bölgede 2.000 kişiye yönelik istihdam odaklı eğitim programları sürdürülüyor. Proje ekibi ayrıca 15 yerel kalkınma projesine küçük ölçekli hibe desteği sağladı.

Kalkınma Bakanlığı Bölge Koordinatörü, projenin bölgedeki ekonomik hareketliliğe somut katkı sağladığını vurguladı.`,
    coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
    publishedAt: "2026-03-18T09:00:00",
    readMinutes: 4,
    projectId: "bolgesel-kalkinma",
  },
  {
    id: "blog-13",
    slug: "egitim-kalite-proje-hazirlik",
    title: "Eğitimde Kalite ve Erişim Projesi Hazırlık Aşamasında",
    category: "Proje Haberleri",
    excerpt: "500 okulu kapsayacak proje için hazırlık çalışmaları başladı.",
    content: `Eğitimde Kalite ve Erişim Projesi, planlama aşamasında ilerliyor. Proje kapsamında Türkiye genelinde 500 okulda öğretmen kapasite geliştirme programının uygulanması hedefleniyor.

Milli Eğitim Bakanlığı, dezavantajlı bölgelerdeki okulların önceliklendirilmesi için bir haritalama çalışması yürütüyor. Bu çalışma, hibe ve materyal desteğinin en çok ihtiyaç duyulan bölgelere yönlendirilmesini sağlayacak.

Proje 2024 yılı sonbaharında başlayacak ve dört yıl sürecek.`,
    coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80",
    publishedAt: "2026-06-12T09:00:00",
    readMinutes: 3,
    projectId: "egitim-kalite",
  },
];

// ── Araç Demo Verileri ────────────────────────────────────
const rsvps: EventRsvp[] = [
  { id: "r1", eventId: "etk-1", name: "Ahmet Yılmaz", email: "ahmet@ornek.com", organization: "Kalkınma Bakanlığı", status: "onaylandi", createdAt: "2026-06-01T10:00:00Z" },
  { id: "r2", eventId: "etk-1", name: "Fatma Demir", email: "fatma@ornek.com", organization: "KOSGEB", status: "bekliyor", createdAt: "2026-06-02T11:00:00Z" },
  { id: "r3", eventId: "etk-3", name: "Zeynep Kaya", email: "zeynep@ornek.com", organization: "İŞKUR", status: "onaylandi", createdAt: "2026-06-03T09:00:00Z" },
];

const documents: ProjectDocument[] = [
  { id: "doc-1", projectId: "tarim-modern", name: "İlerleme Raporu Q1 2026.pdf", category: "rapor", accessLevel: "ekip", fileSize: "2.4 MB", uploadedAt: "2026-04-01T09:00:00Z", downloadCount: 12 },
  { id: "doc-2", projectId: "tarim-modern", name: "Eğitim Materyalleri.pptx", category: "sunum", accessLevel: "uye", fileSize: "8.1 MB", uploadedAt: "2026-03-15T10:00:00Z", downloadCount: 45 },
  { id: "doc-3", projectId: "genc-istihdam", name: "Proje Sözleşmesi.pdf", category: "sozlesme", accessLevel: "ekip", fileSize: "1.2 MB", uploadedAt: "2022-06-01T09:00:00Z", downloadCount: 5 },
  { id: "doc-4", projectId: "genc-istihdam", name: "Yıllık İlerleme Raporu 2025.pdf", category: "rapor", accessLevel: "herkes", fileSize: "3.1 MB", uploadedAt: "2026-01-10T09:00:00Z", downloadCount: 78 },
  { id: "doc-5", projectId: "cevre-iklim", name: "İklim Eylem Planı Taslağı.pdf", category: "rapor", accessLevel: "uye", fileSize: "4.6 MB", uploadedAt: "2026-02-20T09:00:00Z", downloadCount: 31 },
  { id: "doc-6", projectId: "cevre-iklim", name: "Proje Tanıtım Sunumu.pptx", category: "sunum", accessLevel: "herkes", fileSize: "5.2 MB", uploadedAt: "2024-04-05T09:00:00Z", downloadCount: 102 },
  { id: "doc-7", projectId: "adli-tebligat", name: "Final Değerlendirme Raporu.pdf", category: "rapor", accessLevel: "herkes", fileSize: "2.8 MB", uploadedAt: "2024-07-01T09:00:00Z", downloadCount: 56 },
  { id: "doc-8", projectId: "kadin-girisimcilik", name: "Hibe Başvuru Rehberi.pdf", category: "diger", accessLevel: "herkes", fileSize: "1.5 MB", uploadedAt: "2026-01-05T09:00:00Z", downloadCount: 210 },
  { id: "doc-9", projectId: "kadin-girisimcilik", name: "Mentorluk Programı Sözleşmesi.pdf", category: "sozlesme", accessLevel: "ekip", fileSize: "0.9 MB", uploadedAt: "2026-02-10T09:00:00Z", downloadCount: 8 },
  { id: "doc-10", projectId: "dijital-donusum", name: "Dijital Olgunluk Değerlendirme Raporu.pdf", category: "rapor", accessLevel: "uye", fileSize: "3.7 MB", uploadedAt: "2026-03-01T09:00:00Z", downloadCount: 19 },
  { id: "doc-11", projectId: "enerji-verimlilik", name: "Enerji Etüt Raporu - Pilot Bölgeler.pdf", category: "rapor", accessLevel: "uye", fileSize: "6.0 MB", uploadedAt: "2026-02-15T09:00:00Z", downloadCount: 27 },
  { id: "doc-12", projectId: "saglik-reform", name: "Sağlık Kalite Rehberi (Final).pdf", category: "rapor", accessLevel: "herkes", fileSize: "4.1 MB", uploadedAt: "2024-01-10T09:00:00Z", downloadCount: 134 },
  { id: "doc-13", projectId: "bolgesel-kalkinma", name: "Bölgesel Kalkınma Stratejisi.pdf", category: "rapor", accessLevel: "uye", fileSize: "5.5 MB", uploadedAt: "2026-04-12T09:00:00Z", downloadCount: 41 },
  { id: "doc-14", projectId: "egitim-kalite", name: "Proje Hazırlık Dokümanı.docx", category: "diger", accessLevel: "ekip", fileSize: "0.7 MB", uploadedAt: "2026-05-01T09:00:00Z", downloadCount: 3 },
];

const subscribers: Subscriber[] = [
  {
    id: "sub-1", name: "Ahmet Yılmaz", email: "ahmet@danismanlik.com", organization: "ABC Danışmanlık",
    accountType: "sirket", profileType: "firma", plan: "paket1", tags: ["tedarikci", "tarim"], createdAt: "2024-12-15T09:00:00Z",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=ABC%20Danismanlik&backgroundColor=003399",
    shortBio: "Tarım ve kırsal kalkınma alanında 15 yıllık tecrübeye sahip danışmanlık firması. AB fonlu projelerde teknik destek ve proje yönetimi hizmetleri sunar.",
    contactAddress: "Çankaya, Ankara", contactPhone: "+90 312 444 0001", contactEmail: "info@abcdanismanlik.com",
    socialLinks: { website: "https://abcdanismanlik.com", linkedin: "https://linkedin.com/company/abc-danismanlik" },
    profilePublic: true,
  },
  {
    id: "sub-2", name: "Fatma Demir", email: "fatma@firma.com", organization: "XYZ Firma",
    accountType: "sirket", profileType: "firma", plan: "paket2", tags: ["yararlanici"], createdAt: "2026-02-01T09:00:00Z",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=XYZ%20Firma&backgroundColor=0891b2",
    shortBio: "Eğitim ve gençlik alanında faaliyet gösteren, AB projelerinde uygulayıcı ortak olarak yer alan firma.",
    contactAddress: "Şişli, İstanbul", contactEmail: "iletisim@xyzfirma.com",
    socialLinks: { website: "https://xyzfirma.com" },
    profilePublic: true,
  },
  {
    id: "sub-3", name: "Mehmet Kaya", email: "mehmet@insaat.com", organization: "MK İnşaat",
    accountType: "sirket", profileType: "tedarikci", plan: "tedarikci", tags: ["tedarikci", "insaat"], createdAt: "2026-03-10T09:00:00Z",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=MK%20Insaat&backgroundColor=ca8a04",
    shortBio: "Altyapı ve inşaat sektöründe tedarikçi olarak AB ve kamu projelerine malzeme ve hizmet tedariki sağlar.",
    contactAddress: "Kayseri", contactPhone: "+90 352 444 0003", contactEmail: "info@mkinsaat.com",
    socialLinks: { website: "https://mkinsaat.com", instagram: "https://instagram.com/mkinsaat" },
    profilePublic: true,
  },
  {
    id: "sub-4", name: "Zeynep Aydın", email: "zeynep@tarimstk.org", organization: "Tarım Geliştirme Vakfı",
    accountType: "stk", profileType: "stk", plan: "paket1", tags: ["stk", "tarim"], createdAt: "2026-02-20T09:00:00Z",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Tarim%20Vakfi&backgroundColor=16a34a",
    shortBio: "Kırsal kalkınma ve sürdürülebilir tarım alanında saha uygulamaları yürüten sivil toplum kuruluşu.",
    contactAddress: "Konya", contactEmail: "iletisim@tarimstk.org",
    socialLinks: { website: "https://tarimstk.org", facebook: "https://facebook.com/tarimstk" },
    profilePublic: true,
  },
  {
    id: "sub-5", name: "Can Öztürk", email: "can@danismanlik2.com", organization: "Delta Mühendislik",
    accountType: "sirket", profileType: "tedarikci", plan: "paket2", tags: ["tedarikci", "enerji"], createdAt: "2026-03-05T09:00:00Z",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Delta%20Muhendislik&backgroundColor=7c3aed",
    shortBio: "Enerji verimliliği ve yenilenebilir enerji projelerinde mühendislik ve danışmanlık hizmeti sunan tedarikçi firma.",
    contactAddress: "Çankaya, Ankara", contactPhone: "+90 312 444 0005",
    socialLinks: { website: "https://deltamuhendislik.com", linkedin: "https://linkedin.com/company/delta-muhendislik" },
    profilePublic: true,
  },
  // Demo: ihale ilanı verme yetkisine sahip profil türleri
  {
    id: "sub-6", name: "Sarah Johnson", email: "sjohnson@eu-delegation.tr", organization: "AB Türkiye Delegasyonu",
    accountType: "sirket", profileType: "delegasyon", plan: "paket2", tags: ["delegasyon"], createdAt: "2024-01-01T09:00:00Z",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=AB%20Delegasyonu&backgroundColor=003399",
    shortBio: "Avrupa Birliği'nin Türkiye'deki resmi temsilciliği. IPA fonları kapsamındaki ihale süreçlerini yürütür.",
    contactAddress: "Kavaklıdere, Ankara", contactEmail: "delegation-turkey@eeas.europa.eu",
    socialLinks: { website: "https://www.avrupa.info.tr" },
    profilePublic: true,
  },
  {
    id: "sub-7", name: "Deniz Korkmaz", email: "dkorkmaz@ipa-otorite.gov.tr", organization: "Merkezi Finans ve İhale Birimi",
    accountType: "sirket", profileType: "program_otoritesi", plan: "paket2", tags: ["program_otoritesi"], createdAt: "2024-01-01T09:00:00Z",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=MFIB&backgroundColor=dc2626",
    shortBio: "IPA fonlarının uygulanmasından sorumlu program otoritesi. İhale ve hibe süreçlerini yönetir.",
    contactAddress: "Söğütözü, Ankara", contactEmail: "info@mfib.gov.tr",
    socialLinks: { website: "https://www.mfib.gov.tr" },
    profilePublic: true,
  },
];

const campaigns: Campaign[] = [
  { id: "camp-1", subject: "Haziran Proje Bülteni", body: "Bu ay projede tamamlanan faaliyetler...", targetTags: [], status: "gonderildi", createdAt: "2026-06-01T08:00:00Z", sentAt: "2026-06-02T10:00:00Z", recipientCount: 3, openCount: 2 },
  { id: "camp-2", subject: "Yeni İhale Duyurusu", body: "Yeni satınalma ilanımız yayınlandı...", targetTags: ["tedarikci"], status: "taslak", createdAt: "2026-06-10T08:00:00Z", recipientCount: 0, openCount: 0 },
];

const stakeholders: Stakeholder[] = [
  { id: "stk-1", projectId: "tarim-modern", name: "Dr. Mehmet Çelik", email: "mcelik@tarim.gov.tr", phone: "+90 312 000 0001", organization: "Tarım Bakanlığı", role: "Proje Direktörü", type: "kamu", addedAt: "2023-01-15T09:00:00Z" },
  { id: "stk-2", projectId: "tarim-modern", name: "Sarah Johnson", email: "sjohnson@eu.int", organization: "AB Delegasyonu", role: "Proje Görevlisi", type: "kamu", addedAt: "2023-01-20T09:00:00Z" },
  { id: "stk-3", projectId: "tarim-modern", name: "Elif Korkmaz", email: "ekorkmaz@danismanlik.com", organization: "ABC Danışmanlık", role: "Takım Lideri", type: "ekip", addedAt: "2023-01-10T09:00:00Z" },
  { id: "stk-4", projectId: "genc-istihdam", name: "Av. Zeynep Arslan", email: "zarslan@hukuk.com", organization: "Arslan Hukuk", role: "Kıdemli Hukuk Uzmanı", type: "uzman", addedAt: "2026-02-01T09:00:00Z" },
  { id: "stk-5", projectId: "genc-istihdam", name: "Burak Şahin", email: "bsahin@iskur.gov.tr", organization: "İŞKUR", role: "Proje Koordinatörü", type: "kamu", addedAt: "2022-06-05T09:00:00Z" },
  { id: "stk-6", projectId: "cevre-iklim", name: "Dr. Ayşe Yıldız", email: "ayildiz@cevre.gov.tr", organization: "Çevre Bakanlığı", role: "Teknik Sorumlu", type: "kamu", addedAt: "2024-03-05T09:00:00Z" },
  { id: "stk-7", projectId: "cevre-iklim", name: "Markus Weber", email: "mweber@eu.int", organization: "AB Delegasyonu", role: "Proje Görevlisi", type: "kamu", addedAt: "2024-03-10T09:00:00Z" },
  { id: "stk-8", projectId: "adli-tebligat", name: "Hakim Cem Aydoğan", email: "caydogan@adalet.gov.tr", organization: "Adalet Bakanlığı", role: "Proje Sorumlusu", type: "kamu", addedAt: "2021-01-10T09:00:00Z" },
  { id: "stk-9", projectId: "kadin-girisimcilik", name: "Pınar Güneş", email: "pgunes@kosgeb.gov.tr", organization: "KOSGEB", role: "Program Koordinatörü", type: "kamu", addedAt: "2023-09-05T09:00:00Z" },
  { id: "stk-10", projectId: "kadin-girisimcilik", name: "Selin Acar", email: "sacar@danismanlik.com", organization: "ABC Danışmanlık", role: "Mentorluk Programı Sorumlusu", type: "ekip", addedAt: "2023-09-15T09:00:00Z" },
  { id: "stk-11", projectId: "kadin-girisimcilik", name: "Deniz Korkmaz", email: "dkorkmaz@tedarikci.com", organization: "Kapsayıcı Finans A.Ş.", role: "Finansman Danışmanı", type: "tedarikci", addedAt: "2023-10-01T09:00:00Z" },
  { id: "stk-12", projectId: "dijital-donusum", name: "Murat Aksoy", email: "maksoy@icisleri.gov.tr", organization: "İçişleri Bakanlığı", role: "Proje Sorumlusu", type: "kamu", addedAt: "2024-01-10T09:00:00Z" },
  { id: "stk-13", projectId: "enerji-verimlilik", name: "Gül Tekin", email: "gtekin@enerji.gov.tr", organization: "Enerji ve Tabii Kaynaklar Bakanlığı", role: "Teknik Koordinatör", type: "kamu", addedAt: "2023-03-05T09:00:00Z" },
  { id: "stk-14", projectId: "enerji-verimlilik", name: "Can Öztürk", email: "can@danismanlik2.com", organization: "Delta Mühendislik", role: "Saha Mühendisi", type: "tedarikci", addedAt: "2023-04-01T09:00:00Z" },
  { id: "stk-15", projectId: "saglik-reform", name: "Dr. Nazlı Erdem", email: "nerdem@saglik.gov.tr", organization: "Sağlık Bakanlığı", role: "Proje Direktörü", type: "kamu", addedAt: "2020-01-15T09:00:00Z" },
  { id: "stk-16", projectId: "bolgesel-kalkinma", name: "Hakan Yıldırım", email: "hyildirim@kalkinma.gov.tr", organization: "Kalkınma Bakanlığı", role: "Bölge Koordinatörü", type: "kamu", addedAt: "2022-01-10T09:00:00Z" },
  { id: "stk-17", projectId: "egitim-kalite", name: "Selma Çetin", email: "scetin@meb.gov.tr", organization: "Milli Eğitim Bakanlığı", role: "Proje Sorumlusu", type: "kamu", addedAt: "2026-05-05T09:00:00Z" },
];

const trainingVideos: TrainingVideo[] = [
  { id: "tv-1", title: "AB Proje Döngüsü Yönetimi", description: "Temel PCM kavramları, mantıksal çerçeve ve uygulama adımları.", kind: "video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "45:00", category: "Proje Yönetimi", keywords: ["PCM", "mantıksal çerçeve", "proje döngüsü"], order: 1 },
  { id: "tv-2", title: "Finansal Raporlama Esasları", description: "AB projelerinde mali yönetim, harcama belgeleme ve raporlama.", kind: "video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "38:00", category: "Mali Yönetim", keywords: ["mali yönetim", "raporlama", "harcama belgeleme"], order: 2 },
  { id: "tv-3", title: "İzleme ve Değerlendirme", description: "M&E metodolojisi, gösterge sistemi ve etki değerlendirmesi.", kind: "video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "52:00", category: "İ&D", keywords: ["izleme", "değerlendirme", "gösterge", "etki analizi"], order: 3 },
  { id: "tv-4", title: "Satınalma Kuralları (PRAG)", description: "AB finansmanlı projelerde satınalma prosedürleri ve PRAG rehberi.", kind: "video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "41:00", category: "Satınalma", keywords: ["PRAG", "satınalma", "ihale prosedürü"], order: 4 },
  { id: "tv-5", title: "Görünürlük ve İletişim Kuralları", description: "AB projelerinde zorunlu görünürlük kuralları ve iletişim planı.", kind: "video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "28:00", category: "İletişim", keywords: ["görünürlük", "iletişim planı", "logo kullanımı"], order: 5 },
  // Firmalar tarafından eklenmiş proje bazlı materyaller (video + doküman karışık)
  { id: "tv-6", title: "Tarım Modernizasyon Projesi: Saha Eğitimi", description: "Çiftçi eğitimlerinde kullanılan modern sulama teknikleri tanıtım videosu.", kind: "video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "22:00", category: "Proje Yönetimi", projectId: "tarim-modern", keywords: ["sulama", "çiftçi eğitimi", "saha"], uploaderSubscriberId: "sub-1", order: 6 },
  { id: "tv-7", title: "Tarım Modernizasyon Projesi: Eğitim Materyalleri", description: "Saha ekibi için hazırlanmış kapsamlı eğitim sunumu (PDF).", kind: "dokuman", documentName: "Egitim_Materyalleri_2026.pdf", documentSize: "8.1 MB", category: "Proje Yönetimi", projectId: "tarim-modern", keywords: ["eğitim", "saha ekibi", "el kitabı"], uploaderSubscriberId: "sub-1", order: 7 },
  { id: "tv-8", title: "Genç İstihdam Projesi: Kariyer Danışmanlığı Rehberi", description: "İŞKUR danışmanları için kariyer danışmanlığı yöntemleri dokümanı.", kind: "dokuman", documentName: "Kariyer_Danismanligi_Rehberi.pdf", documentSize: "3.4 MB", category: "İ&D", projectId: "genc-istihdam", keywords: ["kariyer danışmanlığı", "istihdam", "gençlik"], uploaderSubscriberId: "sub-2", order: 8 },
  { id: "tv-9", title: "Çevre ve İklim Projesi: İzleme Sistemi Tanıtımı", description: "İklim eylem planı izleme göstergeleri ve veri toplama yöntemi.", kind: "video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "18:00", category: "İ&D", projectId: "cevre-iklim", keywords: ["iklim", "izleme", "gösterge"], uploaderSubscriberId: "sub-4", order: 9 },
];

const ownershipRequests: OwnershipRequest[] = [
  // Proje yürütücüsü var (tarim-modern → sub-1) → onay yürütücüye gider
  { id: "own-1", projectId: "tarim-modern", subscriberId: "sub-5", subscriberName: "Delta Mühendislik", requestedRole: "uye", approverType: "yurutucu", approverSubscriberId: "sub-1", note: "Sulama sistemleri kurulumunda teknik ortağız.", status: "bekliyor", createdAt: "2026-05-10T09:00:00Z" },
  // Proje yürütücüsü yok (kadin-girisimcilik) → onay admin'e gider
  { id: "own-2", projectId: "kadin-girisimcilik", subscriberId: "sub-3", subscriberName: "MK İnşaat", requestedRole: "yurutucu", approverType: "admin", note: "Bu projede ana yüklenici olarak görev aldık.", status: "bekliyor", createdAt: "2026-05-12T09:00:00Z" },
];

const expertProfiles: ExpertProfile[] = [
  {
    id: "exp-1", subscriberId: "sub-1", name: "Ahmet Yılmaz", title: "Kıdemli Tarım Uzmanı",
    bio: "15 yıllık AB proje deneyimi ile tarım sektörü uzmanı. Kırsal kalkınma ve çiftçi eğitim programları konusunda derin bilgiye sahip.",
    expertise: ["Tarım", "Kırsal Kalkınma", "PCM"],
    projectHistory: [{ projectId: "tarim-modern", role: "Teknik Uzman" }],
    visible: true, updatedAt: "2026-03-01T09:00:00Z",
  },
  {
    id: "exp-2", subscriberId: "sub-2", name: "Fatma Demir", title: "Mali Yönetim Uzmanı",
    bio: "AB finansmanlı projelerde 10 yıllık mali yönetim ve raporlama deneyimi. PRAG kurallarına hakim.",
    expertise: ["Mali Yönetim", "Raporlama", "Satınalma"],
    projectHistory: [{ projectId: "genc-istihdam", role: "Mali Uzman" }, { projectId: "cevre-iklim", role: "Denetim Danışmanı" }],
    visible: true, updatedAt: "2026-02-15T09:00:00Z",
  },
  {
    id: "exp-3", subscriberId: "sub-3", name: "Mehmet Kaya", title: "İnşaat ve Altyapı Uzmanı",
    bio: "Bölgesel kalkınma ve altyapı projelerinde 12 yıllık saha deneyimi. İhale süreçleri yönetimi konusunda uzman.",
    expertise: ["İnşaat", "Altyapı", "İhale Yönetimi"],
    projectHistory: [{ projectId: "bolgesel-kalkinma", role: "Teknik Danışman" }],
    visible: true, updatedAt: "2026-04-10T09:00:00Z",
  },
  {
    id: "exp-4", subscriberId: "sub-1", name: "Zeynep Arslan", title: "İzleme ve Değerlendirme Uzmanı",
    bio: "M&E metodolojileri ve gösterge sistemleri tasarımı konusunda 8 yıllık deneyim.",
    expertise: ["İzleme & Değerlendirme", "Gösterge Tasarımı", "Etki Analizi"],
    projectHistory: [{ projectId: "genc-istihdam", role: "İ&D Uzmanı" }],
    visible: true, updatedAt: "2026-05-01T09:00:00Z",
  },
];

// Demo: ABC Danışmanlık (sub-1) ağına eklediği bir uzman ve bir tedarikçi
const networkConnections: NetworkConnection[] = [
  { id: "net-1", ownerSubscriberId: "sub-1", targetType: "uzman", targetId: "exp-1", targetName: "Dr. Mehmet Çelik", addedAt: "2026-04-10T09:00:00Z" },
  { id: "net-2", ownerSubscriberId: "sub-1", targetType: "tedarikci", targetId: "sub-3", targetName: "MK İnşaat", addedAt: "2026-05-02T09:00:00Z" },
];

// ── DemoDataProvider ──────────────────────────────────────
export class DemoDataProvider implements DataProvider {
  getSectors = () => delay([...sectors]);
  getSector = (id: string) => delay(sectors.find((s) => s.id === id) ?? null);

  getDonors = () => delay([...donors]);
  getDonor = (id: string) => delay(donors.find((d) => d.id === id) ?? null);

  getProjects = (filters?: ProjectFilters) => {
    let res = [...projects];
    if (filters?.sectorId) res = res.filter((p) => p.sectorId === filters.sectorId);
    if (filters?.donorId) res = res.filter((p) => p.donorId === filters.donorId);
    if (filters?.ipaPeriod) res = res.filter((p) => p.ipaPeriod === filters.ipaPeriod);
    if (filters?.status) res = res.filter((p) => p.status === filters.status);
    if (filters?.featured) res = res.filter((p) => p.featured);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      res = res.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.beneficiary.toLowerCase().includes(q) ||
        p.locations.some((l) => l.toLowerCase().includes(q))
      );
    }
    return delay(res);
  };
  getProject = (id: string) => delay(projects.find((p) => p.id === id) ?? null);
  saveProject = (p: Project) => { const i = projects.findIndex((x) => x.id === p.id); if (i !== -1) projects[i] = p; else projects.unshift(p); return delay(undefined); };
  removeProject = (id: string) => { const i = projects.findIndex((x) => x.id === id); if (i !== -1) projects.splice(i, 1); return delay(undefined); };

  getListings = (type?: ListingType) => delay(type ? listings.filter((l) => l.type === type) : [...listings]);
  getListing = (id: string) => delay(listings.find((l) => l.id === id) ?? null);
  saveListing = (l: Listing) => { const i = listings.findIndex((x) => x.id === l.id); if (i !== -1) listings[i] = l; else listings.unshift(l); return delay(undefined); };
  removeListing = (id: string) => { const i = listings.findIndex((x) => x.id === id); if (i !== -1) listings.splice(i, 1); return delay(undefined); };

  getEvents = () => delay([...events]);
  getEvent = (id: string) => delay(events.find((e) => e.id === id) ?? null);
  saveEvent = (e: EventItem) => { const i = events.findIndex((x) => x.id === e.id); if (i !== -1) events[i] = e; else events.unshift(e); return delay(undefined); };
  removeEvent = (id: string) => { const i = events.findIndex((x) => x.id === id); if (i !== -1) events.splice(i, 1); return delay(undefined); };

  getBlogPosts = () => delay([...blogPosts]);
  getBlogPost = (slug: string) => delay(blogPosts.find((b) => b.slug === slug) ?? null);
  saveBlogPost = (p: BlogPost) => { const i = blogPosts.findIndex((x) => x.id === p.id); if (i !== -1) blogPosts[i] = p; else blogPosts.unshift(p); return delay(undefined); };
  removeBlogPost = (id: string) => { const i = blogPosts.findIndex((x) => x.id === id); if (i !== -1) blogPosts.splice(i, 1); return delay(undefined); };

  getHomeStats = () => delay({ projects: projects.length, openListings: listings.length, upcomingEvents: events.filter((e) => new Date(e.date) > new Date()).length });

  getRsvps = (eventId: string) => delay(rsvps.filter((r) => r.eventId === eventId));
  saveRsvp = (r: EventRsvp) => { const i = rsvps.findIndex((x) => x.id === r.id); if (i !== -1) rsvps[i] = r; else rsvps.push(r); return delay(undefined); };
  removeRsvp = (id: string) => { const i = rsvps.findIndex((x) => x.id === id); if (i !== -1) rsvps.splice(i, 1); return delay(undefined); };

  getDocuments = (projectId?: string) => delay(projectId ? documents.filter((d) => d.projectId === projectId) : [...documents]);
  saveDocument = (d: ProjectDocument) => { const i = documents.findIndex((x) => x.id === d.id); if (i !== -1) documents[i] = d; else documents.unshift(d); return delay(undefined); };
  removeDocument = (id: string) => { const i = documents.findIndex((x) => x.id === id); if (i !== -1) documents.splice(i, 1); return delay(undefined); };
  incrementDownload = (docId: string) => { const doc = documents.find((d) => d.id === docId); if (doc) doc.downloadCount++; return delay(undefined); };

  getSubscribers = () => delay([...subscribers]);
  getSubscriber = (id: string) => delay(subscribers.find((x) => x.id === id) ?? null);
  saveSubscriber = (s: Subscriber) => { const i = subscribers.findIndex((x) => x.id === s.id); if (i !== -1) subscribers[i] = s; else subscribers.unshift(s); return delay(undefined); };
  removeSubscriber = (id: string) => { const i = subscribers.findIndex((x) => x.id === id); if (i !== -1) subscribers.splice(i, 1); return delay(undefined); };

  getCampaigns = () => delay([...campaigns]);
  saveCampaign = (c: Campaign) => { const i = campaigns.findIndex((x) => x.id === c.id); if (i !== -1) campaigns[i] = c; else campaigns.unshift(c); return delay(undefined); };
  removeCampaign = (id: string) => { const i = campaigns.findIndex((x) => x.id === id); if (i !== -1) campaigns.splice(i, 1); return delay(undefined); };

  getStakeholders = (projectId?: string) => delay(projectId ? stakeholders.filter((s) => s.projectId === projectId) : [...stakeholders]);
  saveStakeholder = (s: Stakeholder) => { const i = stakeholders.findIndex((x) => x.id === s.id); if (i !== -1) stakeholders[i] = s; else stakeholders.unshift(s); return delay(undefined); };
  removeStakeholder = (id: string) => { const i = stakeholders.findIndex((x) => x.id === id); if (i !== -1) stakeholders.splice(i, 1); return delay(undefined); };

  getTrainingVideos = () => delay([...trainingVideos].sort((a, b) => a.order - b.order));
  saveTrainingVideo = (v: TrainingVideo) => { const i = trainingVideos.findIndex((x) => x.id === v.id); if (i !== -1) trainingVideos[i] = v; else trainingVideos.push(v); return delay(undefined); };
  removeTrainingVideo = (id: string) => { const i = trainingVideos.findIndex((x) => x.id === id); if (i !== -1) trainingVideos.splice(i, 1); return delay(undefined); };

  getOwnershipRequests = () => delay([...ownershipRequests]);

  getOwnershipRequestsFor = (filter: { subscriberId?: string; approverSubscriberId?: string; projectId?: string }) =>
    delay(
      ownershipRequests.filter((r) =>
        (!filter.subscriberId || r.subscriberId === filter.subscriberId) &&
        (!filter.approverSubscriberId || r.approverSubscriberId === filter.approverSubscriberId) &&
        (!filter.projectId || r.projectId === filter.projectId)
      )
    );

  createOwnershipRequest = (input: { projectId: string; subscriberId: string; subscriberName: string; requestedRole: "yurutucu" | "uye"; note?: string }) => {
    const project = projects.find((p) => p.id === input.projectId);
    const hasOwner = !!project?.ownerSubscriberId;
    const request: OwnershipRequest = {
      id: `own-${Date.now()}`,
      projectId: input.projectId,
      subscriberId: input.subscriberId,
      subscriberName: input.subscriberName,
      requestedRole: input.requestedRole,
      approverType: hasOwner ? "yurutucu" : "admin",
      approverSubscriberId: hasOwner ? project!.ownerSubscriberId : undefined,
      note: input.note,
      status: "bekliyor",
      createdAt: new Date().toISOString(),
    };
    ownershipRequests.unshift(request);
    return delay(request);
  };

  resolveOwnershipRequest = (id: string, status: "onaylandi" | "reddedildi") => {
    const r = ownershipRequests.find((x) => x.id === id);
    if (!r) return delay(undefined);
    r.status = status;
    r.resolvedAt = new Date().toISOString();
    if (status === "onaylandi") {
      const project = projects.find((p) => p.id === r.projectId);
      if (project) {
        if (r.requestedRole === "yurutucu") {
          project.ownerSubscriberId = r.subscriberId;
          project.ownerSubscriberName = r.subscriberName;
        } else {
          if (!project.consortiumMembers) project.consortiumMembers = [];
          if (!project.consortiumMembers.some((m) => m.subscriberId === r.subscriberId)) {
            project.consortiumMembers.push({
              subscriberId: r.subscriberId,
              subscriberName: r.subscriberName,
              joinedAt: new Date().toISOString(),
            });
          }
        }
      }
    }
    return delay(undefined);
  };

  assignProjectOwner = (projectId: string, subscriberId: string | undefined, subscriberName?: string) => {
    const p = projects.find((x) => x.id === projectId);
    if (p) { p.ownerSubscriberId = subscriberId; p.ownerSubscriberName = subscriberId ? subscriberName : undefined; }
    return delay(undefined);
  };

  removeConsortiumMember = (projectId: string, subscriberId: string) => {
    const p = projects.find((x) => x.id === projectId);
    if (p?.consortiumMembers) p.consortiumMembers = p.consortiumMembers.filter((m) => m.subscriberId !== subscriberId);
    return delay(undefined);
  };

  getExpertProfiles = () => delay([...expertProfiles]);
  getExpertProfile = (id: string) => delay(expertProfiles.find((p) => p.id === id) ?? null);
  saveExpertProfile = (p: ExpertProfile) => { const i = expertProfiles.findIndex((x) => x.id === p.id); if (i !== -1) expertProfiles[i] = p; else expertProfiles.unshift(p); return delay(undefined); };
  removeExpertProfile = (id: string) => { const i = expertProfiles.findIndex((x) => x.id === id); if (i !== -1) expertProfiles.splice(i, 1); return delay(undefined); };
  getProjectExperts = (projectId: string) => delay(
    expertProfiles
      .flatMap((ep) => ep.projectHistory.filter((ph) => ph.projectId === projectId).map((ph) => ({ profile: ep, expertise: ep.expertise[0] ?? "", role: ph.role })))
  );

  getNetworkConnections = (ownerSubscriberId: string) => delay(networkConnections.filter((c) => c.ownerSubscriberId === ownerSubscriberId));
  addNetworkConnection = (c: Omit<NetworkConnection, "id" | "addedAt">) => {
    const exists = networkConnections.some((x) => x.ownerSubscriberId === c.ownerSubscriberId && x.targetType === c.targetType && x.targetId === c.targetId);
    if (!exists) networkConnections.unshift({ ...c, id: `net-${Date.now()}`, addedAt: new Date().toISOString() });
    return delay(undefined);
  };
  removeNetworkConnection = (id: string) => { const i = networkConnections.findIndex((x) => x.id === id); if (i !== -1) networkConnections.splice(i, 1); return delay(undefined); };
}
