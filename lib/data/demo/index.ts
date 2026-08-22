/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DataProvider, ProjectFilters } from "../provider";
import type {
  Sector, Donor, Project, Listing, ListingType, EventItem, BlogPost,
  HomeStats, EventRsvp, ProjectDocument, Subscriber, Campaign,
  Stakeholder, TrainingVideo, OwnershipRequest, ExpertProfile, NetworkConnection,
  AddressGroup, SavedListing, EditLog, Survey, SurveyResponse, InstitutionProfile,
  ProjectWebsite,
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
  { id: "undp", name: "UNDP", country: "BM" },
];

// ── Projeler (13 özel + 469 otomatik = 482 adet) ───────────
const projects: Project[] = [
  // ── YARGI ──────────────────────────────────────────────────
  {
    id: "adli-tebligat",
    title: "Adli Tebligat Sisteminin İyileştirilmesi",
    summary: "Yargılamaların ve adli süreçlerin hızlandırılması için AB ile uyumlu adli tebligat sisteminin iyileştirilmesi. 36 milyon elektronik tebligat hedefiyle dijital dönüşüm sağlandı.",
    sectorId: "yargi", donorId: "eu", ipaPeriod: "IPA-II",
    beneficiary: "Adalet Bakanlığı",
    locations: ["Ankara", "İzmir", "Gaziantep", "Trabzon", "Malatya"],
    euBudget: 1567500, totalBudget: 1650000,
    budget: "€1.57M", priorityArea: "Yargı Reformu",
    status: "tamamlandi", featured: false,
    objective: "Yargılamaların ve adli süreçlerin hızlandırılması ve yargının etkinliğinin sağlanması için AB ile uyumlu adli tebligat sisteminin iyileştirilmesi.",
    specificObjectives: "Adli süreçlerin hızlandırılması, teknolojik gelişmelerin mevcut sisteme dahil edilmesi ve adli tebligat prosedürlerinde yer alan paydaşların eğitim almasının sağlanması.",
    expectedOutputs: "36 milyon elektronik tebligat; Adalet Bakanlığı ile PTT arasında Adli Tebligat İşbirliği protokolü; 5.887 kişiye eğitim (1.622 yargı çalışanı, 2.529 PTT çalışanı, 1.736 muhtar); Elektronik tebligat sistemi güçlendirilmesi.",
  },
  {
    id: "aile-mahkemeleri",
    title: "Aile Mahkemelerinin Etkinliğinin Artırılması",
    summary: "Türkiye'de hukukun üstünlüğü ve temel hakların uluslararası standartlarla uyumlu hale getirilmesi; kadın, çocuk ve aile üyelerinin haklarının korunması.",
    sectorId: "yargi", donorId: "eu", ipaPeriod: "IPA-II",
    beneficiary: "Türkiye Adalet Akademisi",
    locations: ["Ankara", "İzmir", "Ordu", "Kars", "Hatay", "Sakarya", "Mardin"],
    euBudget: 2000000, totalBudget: 2223000,
    budget: "€2M", priorityArea: "Yargı Reformu",
    status: "tamamlandi", featured: false,
    objective: "Türkiye'de hukukun üstünlüğünün ve temel hakların uluslararası ve Avrupa standartlarıyla tam uyumlu hale getirilmesini sağlamak.",
    specificObjectives: "Kadınların, çocukların ve diğer aile üyelerinin haklarının korunması sürecinde aile mahkemelerinin etkinliğini artırmak.",
    expectedOutputs: "Aile mahkemelerinin etkinliğinin geliştirilmesi; hakim, savcı ve uzmanların kapasitelerinin artırılması; paydaşlar arasındaki işbirliği mekanizmalarının iyileştirilmesi.",
  },

  // ── TEMEL HAKLAR ───────────────────────────────────────────
  {
    id: "demokrasi-egitim",
    title: "Temel Eğitimde Demokrasi Kültürünün Güçlendirilmesi",
    summary: "Ortak değerler, temel hak ve hürriyetler ile uyumlu demokratik okul kültürünün eğitim sistemine entegre edilmesi. 110 pilot okulda Bütüncül Okul Modeli.",
    sectorId: "temel-haklar", donorId: "eu", ipaPeriod: "IPA-II",
    beneficiary: "Milli Eğitim Bakanlığı Temel Eğitim Genel Müdürlüğü",
    locations: ["Adana", "Aydın", "Burdur", "Çanakkale", "Iğdır", "Kars", "Muğla", "Sinop", "Sivas", "Yozgat"],
    euBudget: 3600000, totalBudget: 4000000,
    budget: "€3.6M", priorityArea: "Temel Haklar",
    status: "tamamlandi", featured: false,
    objective: "Ortak değerler, temel hak ve hürriyetler ile uyumlu bir demokratik okul kültürünün eğitim sistemine entegre edilmesi.",
    expectedOutputs: "110 okulda Bütüncül Okul Modeli uygulandı; 240 öğretmen eğitildi; 48.470 öğrenciye ve 90.000 veliye ulaşıldı.",
  },
  {
    id: "anayasa-mahkemesi",
    title: "Anayasa Mahkemesi Kararlarının Uygulanmasının Desteklenmesi",
    summary: "İnsan hakları alanında Anayasa Mahkemesi kararlarının etkin uygulanmasının güçlendirilmesi; mahkeme içtihatları ve bireysel başvuru mekanizması hakkında farkındalığın artırılması.",
    sectorId: "temel-haklar", donorId: "eu", ipaPeriod: "IPA-II",
    beneficiary: "Anayasa Mahkemesi",
    locations: ["Ankara"],
    euBudget: 5000000, totalBudget: 5000000,
    budget: "€5M", priorityArea: "Temel Haklar",
    status: "tamamlandi", featured: false,
    objective: "İnsan hakları alanında Anayasa Mahkemesi kararlarının etkin uygulanmasının güçlendirilmesi.",
    expectedOutputs: "AB standartlarına uygun izleme mekanizması; hakim, savcı ve avukatlara yönelik eğitimler; Türk mahkemeleri ile Avrupa kurumları işbirliğinin güçlendirilmesi.",
  },

  // ── İÇİŞLERİ (SINIR YÖNETİMİ) ─────────────────────────────
  {
    id: "sinir-gozleme-1",
    title: "Türkiye'nin Doğu ve Batı Sınırlarında Sınır Gözetleme Kapasitesinin Artırılması – Aşama I",
    summary: "Türkiye'nin doğu sınırında modern elektro-optik gözetleme sistemi kurulması; sınır personelinin eğitimi; düzensiz göç ve kaçakçılıkla mücadele.",
    sectorId: "icisleri", donorId: "eu", ipaPeriod: "IPA-II",
    beneficiary: "İçişleri Bakanlığı, İller İdaresi Genel Müdürlüğü, Kara Kuvvetleri Komutanlığı",
    locations: ["Kars", "Ardahan", "Iğdır", "Edirne"],
    euBudget: 49284849, totalBudget: 57728057,
    budget: "€49.3M", priorityArea: "Entegre Sınır Yönetimi",
    status: "tamamlandi", featured: true,
    objective: "Türkiye'nin doğu sınırlarında sınır gözetleme kapasitesinin artırılması.",
    specificObjectives: "Modern sistemlerle sınır gözetleme kapasitesinin artırılması; sınır personelinin eğitimi; düzensiz göçün, insan ticaretinin ve kaçakçılığın önlenmesi.",
    expectedOutputs: "Elektro-optik gözetleme kulelerinden oluşan modern sistem kuruldu; 800 personele eğitim verildi; 400 İçişleri Bakanlığı personeline entegre sınır yönetimi eğitimi verildi.",
  },
  {
    id: "e-pasaport",
    title: "İkinci Nesil Türkiye Cumhuriyeti E-Pasaportları",
    summary: "2010'dan beri üretilen yeni nesil e-pasaportların biyometrik verilerin depolanmasına imkan verecek şekilde AB standartlarına uyumlu güncellenmesi.",
    sectorId: "icisleri", donorId: "eu", ipaPeriod: "IPA-II",
    beneficiary: "Dışişleri Bakanlığı",
    locations: ["Ankara"],
    euBudget: 19766665, totalBudget: 19766665,
    budget: "€19.8M", priorityArea: "Entegre Sınır Yönetimi",
    status: "tamamlandi", featured: false,
    objective: "E-pasaportların AB standartlarına uyumlu biyometrik güvenlik özellikleriyle güncellenmesi.",
    expectedOutputs: "AB standartlarına uygun ikinci nesil e-pasaportlar; 4.250.000 adet pasaport basımı tamamlandı.",
  },

  // ── ULAŞTIRMA (USOP) ───────────────────────────────────────
  {
    id: "halkali-kapikule",
    title: "Halkalı-Kapıkule Hattı Çerkezköy-Kapıkule Kesiminin İnşası",
    summary: "IPA II döneminin amiral gemisi projesi. 153 km çift hat, 200 km/saat hız AB standartlarında demiryolu. Türkiye'yi doğrudan AB ülkelerine bağlıyor; Londra-Pekin Demir İpek Yolu'nun kritik halkası.",
    sectorId: "ulasim", donorId: "eu", ipaPeriod: "IPA-II",
    beneficiary: "TCDD Genel Müdürlüğü",
    locations: ["Edirne", "Tekirdağ", "Kırklareli"],
    euBudget: 275000000, totalBudget: 553200000,
    budget: "€275M", priorityArea: "Sürdürülebilir ve Emniyetli Ulaştırma",
    status: "devam", featured: true,
    objective: "Güvenilir, ekonomik, çevre dostu, yüksek kalitede demiryolu ulaşım altyapısı sağlanması.",
    specificObjectives: "Türkiye'nin AB ülkelerine doğrudan bağlanması; Demir İpek Yolu'nun AB standartlarına yükseltilmesi; Trans Avrupa Ulaştırma Ağları'nın genişletilmesi.",
    expectedOutputs: "153 km çift hat – 200 km/saat hız AB standartlarında demiryolu; altyapı, üstyapı, sinyalizasyon, telekomünikasyon, elektrifikasyon tamamlanması.",
  },
  {
    id: "smart-ankara",
    title: "SMART ANKARA",
    summary: "Ankara için AB iyi uygulamalarıyla uyumlu Sürdürülebilir Kentsel Ulaşım Planı ve Akıllı Bisiklet Paylaşım Sistemi.",
    sectorId: "ulasim", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "Ankara Büyükşehir Belediyesi",
    locations: ["Ankara"],
    euBudget: 4312000, totalBudget: 4312000,
    budget: "€4.3M", priorityArea: "Erişilebilir ve Kapsayıcı Ulaştırma",
    status: "devam", featured: false,
    objective: "Ankara için AB iyi uygulamalarıyla uyumlu Sürdürülebilir Kentsel Ulaşım Planı geliştirmek ve Akıllı Bisiklet Paylaşım Sistemi kurmak.",
    expectedOutputs: "Pilot Akıllı Bisiklet Paylaşım Sistemi; SUMP İstanbul ile uyumlu kentsel ulaşım planı; belediye kapasitesinin güçlendirilmesi.",
  },

  // ── ÇEVRE VE İKLİM EYLEMİ ─────────────────────────────────
  {
    id: "iklim-uyum",
    title: "Türkiye'de İklim Uyum Eyleminin Geliştirilmesi",
    summary: "İklim değişikliği uyumunu sektör ve kentsel düzeyde güçlendirerek toplumsal direnç oluşturma. Ulusal İklim Uyum Stratejisi ve 4 il için yerel eylem planları.",
    sectorId: "cevre", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "Çevre, Şehircilik ve İklim Değişikliği Bakanlığı",
    locations: ["Türkiye geneli"],
    euBudget: 9350000, totalBudget: 11025000,
    budget: "€9.35M", priorityArea: "Sürdürülebilir Kalkınma için Çevre Yönetimi",
    status: "devam", featured: true,
    objective: "İklim değişikliği uyumunu sektör ve kentsel düzeyde güçlendirerek toplumsal direnç ve esneklik oluşturmak.",
    specificObjectives: "Gerekli politika, teknik ve operasyonel temel çizgileri geliştirerek iklim değişikliğine uyum için uygun bir ortam oluşturmak.",
    expectedOutputs: "Ulusal İklim Değişikliğine Uyum Stratejisi güncellendi; E-adaptasyon sistemi hazırlandı; 4 ilde Yerel İklim Uyum Stratejileri oluşturuldu; Ulusal Uyum Platformu kuruldu.",
  },
  {
    id: "giresun-atiksu",
    title: "Giresun Atık Su Projesi",
    summary: "Karadeniz'in su kalitesinin artırılması ve nüfusun iyileştirilmiş atık su hizmetlerinden yararlanması. 2047'ye kadar bölgenin atık su arıtma ihtiyacını karşılar.",
    sectorId: "cevre", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "Giresun Belediyesi",
    locations: ["Giresun"],
    euBudget: 22285000, totalBudget: 22285000,
    budget: "€22.3M", priorityArea: "Su (Altyapı Faaliyetleri)",
    status: "devam", featured: false,
    objective: "Türkiye'nin çevre koruma ve AB atık su sektörü direktiflerine uyumunu sağlayarak katılım sürecine destek verilmesi.",
    expectedOutputs: "Atık su arıtma tesisi ve şebeke inşası; Karadeniz su kalitesinin artırılması; bölgenin 2047'ye kadar ihtiyacının karşılanması.",
  },

  // ── ENERJİ ─────────────────────────────────────────────────
  {
    id: "belediye-yenilenebilir",
    title: "Belediyeler için Yenilenebilir Enerji ve Enerji Verimliliği Ekipman Alımı",
    summary: "7 büyükşehir belediyesinde güneş ve hidroelektrik enerji kullanımı ile 234 enerji verimli su pompası. AB kaynak verimliliği ve iklim eylemi hedefleri.",
    sectorId: "enerji", donorId: "eu", ipaPeriod: "IPA-II",
    beneficiary: "Enerji ve Tabii Kaynaklar Bakanlığı, Malatya, Şanlıurfa, Hatay, Kahramanmaraş, Denizli, Trabzon ve Manisa Büyükşehir Belediyeleri",
    locations: ["Malatya", "Şanlıurfa", "Hatay", "Kahramanmaraş", "Denizli", "Manisa", "Trabzon"],
    euBudget: 7900000, totalBudget: 9300000,
    budget: "€7.9M", priorityArea: "Yenilenebilir Enerji ve Enerji Verimliliği",
    status: "tamamlandi", featured: false,
    objective: "AB kaynak verimliliği ve iklim eylemi hedefleri doğrultusunda yenilenebilir enerjilerin teşvik edilmesi.",
    expectedOutputs: "5 belediyede güneş enerjisi santrali kuruldu; 234 enerji verimli su pompası temin edildi; Trabzon için hidroelektrik santral kuruldu.",
  },
  {
    id: "offshore-ruzgar",
    title: "Off-shore Rüzgar Enerjisi için Enerji Bakanlığı'nın Hazırlıklarının Güçlendirilmesi",
    summary: "Türkiye'de offshore rüzgar enerjisi potansiyelinin kullanılması için ihale, sözleşme ve rekabet süreçlerinin uluslararası standartlara yükseltilmesi.",
    sectorId: "enerji", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "Enerji ve Tabii Kaynaklar Bakanlığı",
    locations: ["Ankara"],
    euBudget: 9300000, totalBudget: 9300000,
    budget: "€9.3M", priorityArea: "Yenilenebilir Enerji ve Enerji Verimliliği",
    status: "devam", featured: false,
    objective: "AB'nin kaynak etkinliği ve iklim eylem hedefleri doğrultusunda Türkiye'de offshore rüzgar enerjisi potansiyelinin kullanılması için yatırım imkânlarının iyileştirilmesi.",
  },

  // ── REKABETÇİLİK VE YENİLİK (RYSOP) ───────────────────────
  {
    id: "sanayi40-beysad",
    title: "Sanayi 4.0 Yetkinlik Merkezi Kurulması ile KOBİ'lerin Dijital Dönüşümü",
    summary: "Beyaz eşya yan sanayii üreticilerinin dijital dönüşümü. Endüstri 4.0 Merkezi; 50 KOBİ atölyeden faydalandı; 100 girişim ve start-up desteklendi.",
    sectorId: "rekabet", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "Beyaz Eşya Yan Sanayicileri Derneği (BEYSAD)",
    locations: ["İstanbul"],
    euBudget: 8100000, totalBudget: 8100000,
    budget: "€8.1M", priorityArea: "Özel Sektörün Geliştirilmesi – İmalat Sanayi",
    status: "devam", featured: true,
    objective: "Beyaz eşya yan sanayii üreticilerinin dijital dönüşümünde rehberlik, eğitim, destek sağlayarak rekabet güçlerini küresel düzeye çıkarmak.",
    expectedOutputs: "Dijital Dönüşüm Ortak Kullanım Atölyesi; 50 KOBİ desteklendi; 100 girişimci ve start-up desteklendi; 5 yeni işletme kuruldu.",
    ownerSubscriberId: "sub-2", ownerSubscriberName: "XYZ Eğitim ve Danışmanlık",
  },
  {
    id: "innofood",
    title: "Gıda Sektörü Anadolu Teknoloji Platformu (INNOFOOD)",
    summary: "Gıda ve içecek sektörü KOBİ'lerini destekleyen AR-GE altyapısı. TÜBİTAK MAM bünyesinde Gıda Yenilik Merkezi; bölgesel laboratuvarlar; Türkiye Gıda İnovasyon Platformu.",
    sectorId: "rekabet", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "TÜBİTAK Marmara Araştırma Merkezi (MAM)",
    locations: ["Kocaeli", "Giresun", "Gaziantep", "Şanlıurfa"],
    euBudget: 20450000, totalBudget: 20450000,
    budget: "€20.5M", priorityArea: "Bilim, Teknoloji, Yenilik – AR-GE",
    status: "devam", featured: true,
    objective: "Gıda ve içecek sektörü KOBİ'lerinin ürün kalitesini iyileştirmelerine ve rekabet güçlerini artırmalarına destek olmak.",
    expectedOutputs: "Gıda Yenilik Merkezi kuruldu; 4 bölgede laboratuvar ve pilot tesis; Türkiye Gıda İnovasyon Platformu oluşturuldu; 12 AR-GE projesi; 3 patent.",
  },

  // ── TARIM (kendi eklediğimiz) ───────────────────────────────
  {
    id: "tarim-modern",
    title: "Türkiye Tarımın Modernizasyonu",
    summary: "AB finansmanlı tarım modernizasyon projesi. Çiftçilere modern teknikler ve dijital araçlar kazandırır.",
    sectorId: "tarim", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "T.C. Tarım ve Orman Bakanlığı", locations: ["Konya", "Ankara", "İzmir"],
    euBudget: 12500000, totalBudget: 14000000,
    budget: "€12.5M", priorityArea: "Tarım ve Kırsal Kalkınma",
    startDate: "2023-01-01", endDate: "2026-12-31",
    status: "devam", featured: true,
    objective: "Türkiye'nin tarım sektörünü AB standartlarına uyumlu hale getirerek çiftçilerin gelirini artırmak ve sürdürülebilir tarım uygulamalarını yaygınlaştırmak.",
    expectedOutputs: "500 çiftçiye eğitim; 50 tarım kooperatifinin desteklenmesi; 10 pilot çiftlikte akıllı tarım sistemleri.",
    ownerSubscriberId: "sub-1", ownerSubscriberName: "ABC Danışmanlık",
    consortiumMembers: [
      { subscriberId: "sub-4", subscriberName: "Tarım Geliştirme Vakfı", role: "Saha Uygulama Ortağı", joinedAt: "2026-02-01T09:00:00Z" },
    ],
  },
  {
    id: "kadin-girisimcilik",
    title: "Kadın Girişimciliğinin Güçlendirilmesi",
    summary: "Kadın girişimcilere iş kurma, finansmana erişim ve mentorluk desteği sağlayan program.",
    sectorId: "rekabet", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "KOSGEB", locations: ["İstanbul", "Ankara", "Gaziantep", "Diyarbakır"],
    euBudget: 6800000, totalBudget: 7500000,
    budget: "€6.8M", priorityArea: "Girişimcilik ve KOBİ Geliştirme",
    startDate: "2023-09-01", endDate: "2026-08-31",
    status: "devam", featured: true,
    objective: "Kadınların ekonomiye katılımını artırmak; girişimcilik ve finansmana erişim konularında kapasiteyi güçlendirmek.",
    expectedOutputs: "1.500 kadın girişimciye eğitim; 300 yeni girişim; 4 ilde girişimcilik merkezi.",
    ownerSubscriberId: "sub-2", ownerSubscriberName: "XYZ Eğitim ve Danışmanlık",
  },
];

// Kalan projeleri otomatik oluştur (toplam 499'a tamamlamak için)
for (let i = projects.length; i < 499; i++) {
  const sec = sectors[i % sectors.length];
  const don = donors[i % donors.length];
  const periods = ["IPA-I", "IPA-II", "IPA-III"] as const;
  const period = periods[i % 3];
  const status: Project["status"] = period === "IPA-I" ? "tamamlandi" : (i % 4 === 0 ? "tamamlandi" : "devam");
  projects.push({
    id: `proje-${i}`,
    title: `${sec.name} Destek Projesi ${i}`,
    summary: `${sec.name} alanında kapasite geliştirme ve kurumsal reform projesi.`,
    sectorId: sec.id, donorId: don.id, ipaPeriod: period,
    beneficiary: "İlgili Bakanlık", locations: ["Ankara"],
    budget: `€${(Math.floor(i * 1.3) % 15) + 1}.${i % 9}M`,
    euBudget: ((i * 1300000) % 15000000) + 1000000,
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
    location: "Ankara (Hibrit)", publishedAt: "2026-06-10", deadline: "2026-07-15",
    expiresAt: "2026-08-12", isActive: true, locked: false,
    subject: "Tarım modernizasyon projesinin günlük yürütülmesinden sorumlu kıdemli proje koordinatörü pozisyonu.",
    referenceNo: "DFG-2026-IK-014", contactEmail: "ik@designforgood.com",
    publisherSubscriberId: "sub-1",
    description: "Tarım modernizasyon projesi için deneyimli proje koordinatörü aranmaktadır. AB projesi yönetim deneyimi şarttır.\n\nGereksinimler:\n- En az 5 yıl AB projesi yönetim deneyimi\n- İyi derecede İngilizce\n- Tarım sektörü bilgisi tercih sebebi\n\nBaşvuru için CV ve motivasyon mektubunu gönderiniz.",
    documents: [{ name: "İş Tanımı.pdf", fileSize: "0.4 MB" }],
  },
  {
    id: "ilan-2", type: "satinalma",
    title: "Eğitim Materyalleri Tedariki",
    organization: "T.C. Tarım ve Orman Bakanlığı", projectId: "tarim-modern",
    location: "Türkiye geneli", publishedAt: "2026-06-05", deadline: "2026-07-30",
    expiresAt: "2026-09-05", isActive: true, locked: true,
    subject: "Çiftçi eğitim programları kapsamında basılı ve dijital eğitim materyallerinin tasarım, basım ve dağıtım hizmeti satınalması.",
    budget: "€85.000 (tahmini)", referenceNo: "TARIM-SAT-2026-031", contactEmail: "satinalma@tarim.gov.tr",
    description: "Türkiye Tarımın Modernizasyonu Projesi kapsamında 500 çiftçiye dağıtılacak eğitim materyallerinin tasarım, basım ve dağıtım hizmeti satın alınacaktır.\n\nKapsam:\n- 10 farklı konuda eğitim kitapçığı\n- Dijital eğitim içerikleri\n- 50 kooperatife dağıtım\n\nPRAG kurallarına uygun referans deneyimi gerekmektedir.",
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
    location: "Ankara", publishedAt: "2026-06-01", deadline: "2026-08-15",
    expiresAt: "2026-09-01", isActive: true, locked: true,
    subject: "Kariyer danışmanlığı platformunun yazılım geliştirme ve 2 yıllık bakım-destek hizmeti ihalesi.",
    budget: "€420.000", referenceNo: "ISKUR-IHL-2026-008", contactEmail: "ihale@iskur.gov.tr",
    publisherSubscriberId: "sub-7",
    description: "Kariyer danışmanlığı platformunun yeni modüllerinin geliştirilmesi ve 2 yıl süreyle bakım-destek hizmeti.\n\nKapsam:\n- Mobil uygulama geliştirme\n- İşveren eşleştirme modülü\n- 2 yıl 7/24 teknik destek",
    documents: [
      { name: "İhale Şartnamesi.pdf", fileSize: "5.7 MB" },
      { name: "Teknik Gereksinimler.pdf", fileSize: "2.3 MB" },
    ],
  },
  {
    id: "ilan-4", type: "is", title: "Mali Uzman",
    organization: "Çevre Bakanlığı", projectId: "cevre-iklim",
    location: "Ankara", publishedAt: "2026-06-12", deadline: "2026-07-20",
    expiresAt: "2026-08-12", isActive: true, locked: false,
    subject: "İklim Değişikliği Projesi mali yönetim ve raporlama uzmanı pozisyonu.",
    referenceNo: "CEVRE-IK-2026-019", contactEmail: "ik@cevre.gov.tr",
    description: "İklim projesi için mali uzman aranmaktadır.\n\nGereksinimler:\n- En az 3 yıl AB projeleri mali yönetim deneyimi\n- PRAG kurallarına hakimiyet",
    documents: [{ name: "İş Tanımı.pdf", fileSize: "0.3 MB" }],
  },
  {
    id: "ilan-5", type: "is", title: "İzleme & Değerlendirme Uzmanı",
    organization: "KOSGEB", projectId: "kadin-girisimcilik",
    location: "İstanbul", publishedAt: "2026-06-08", deadline: "2026-08-01",
    expiresAt: "2026-09-08", isActive: true, locked: false,
    subject: "Kadın Girişimciliği Projesi İ&D uzmanı pozisyonu.",
    referenceNo: "KOSGEB-IK-2026-027", contactEmail: "ik@kosgeb.gov.tr",
    description: "Kadın girişimcilik programının İ&D uzmanı aranıyor.\n\nGereksinimler:\n- İzleme ve değerlendirme alanında en az 4 yıl deneyim\n- Gösterge sistemleri tasarımı deneyimi",
    documents: [{ name: "İş Tanımı.pdf", fileSize: "0.4 MB" }],
  },
  {
    id: "ilan-6", type: "satinalma",
    title: "Saha Ekipmanları Tedariki",
    organization: "Enerji Bakanlığı", projectId: "enerji-verimlilik",
    location: "Konya", publishedAt: "2026-05-28", deadline: "2026-07-10",
    expiresAt: "2026-08-28", isActive: true, locked: true,
    subject: "Pilot güneş enerjisi tesisi için izleme sensörleri ve saha ölçüm ekipmanları.",
    budget: "€62.000", referenceNo: "ENERJI-SAT-2026-012", contactEmail: "satinalma@enerji.gov.tr",
    description: "Konya'daki pilot güneş enerjisi tesisinin performans izleme sistemleri için ekipman tedariki.",
    documents: [
      { name: "Teknik Şartname.pdf", fileSize: "2.1 MB" },
      { name: "Teklif Formu.docx", fileSize: "0.5 MB" },
    ],
  },
  {
    id: "ilan-7", type: "ihale",
    title: "Kırsal Yol Yapım İşleri",
    organization: "Kalkınma Bakanlığı", projectId: "bolgesel-kalkinma",
    location: "Erzurum, Van", publishedAt: "2026-05-20", deadline: "2026-08-30",
    expiresAt: "2026-09-20", isActive: true, locked: true,
    subject: "Doğu Anadolu'da 40 km kırsal yol yapım ve iyileştirme işleri.",
    budget: "€1.250.000", referenceNo: "KALKINMA-IHL-2026-005", contactEmail: "ihale@kalkinma.gov.tr",
    publisherSubscriberId: "sub-7",
    description: "Erzurum ve Van illerinde 40 km kırsal yol yapım, asfaltlama ve drenaj iyileştirme işleri.\n\nKapsam:\n- 40 km yol yapımı\n- Drenaj sistemleri\n- 18 ay yapım süresi",
    documents: [
      { name: "İhale Şartnamesi.pdf", fileSize: "6.4 MB" },
      { name: "Keşif Özeti.xlsx", fileSize: "1.2 MB" },
    ],
  },
  {
    id: "ilan-8", type: "is",
    title: "Kıdemli Tarım Uzmanı",
    organization: "ABC Danışmanlık", projectId: "tarim-modern",
    location: "Konya (Saha)", publishedAt: "2026-06-14", deadline: "2026-07-25",
    expiresAt: "2026-09-14", isActive: true, locked: false,
    subject: "Tarım modernizasyon projesi saha uygulamalarını yürütecek kıdemli tarım uzmanı.",
    referenceNo: "ABC-IK-2026-007", contactEmail: "ik@abcdanismanlik.com",
    publisherSubscriberId: "sub-1",
    description: "ABC Danışmanlık bünyesinde tarım uzmanı aranmaktadır.\n\nGereksinimler:\n- Ziraat mühendisliği lisans/yüksek lisans\n- En az 4 yıl saha deneyimi\n- Konya bölgesinde seyahat edebilme",
    documents: [{ name: "İş Tanımı.pdf", fileSize: "0.3 MB" }],
  },
  {
    id: "ilan-9", type: "satinalma",
    title: "Saha Ölçüm Cihazları Tedariki",
    organization: "MK İnşaat", projectId: "enerji-verimlilik",
    location: "Kayseri", publishedAt: "2026-06-11", deadline: "2026-07-18",
    expiresAt: "2026-09-11", isActive: true, locked: false,
    subject: "Enerji verimliliği etütlerinde kullanılacak taşınabilir ölçüm cihazları.",
    budget: "€18.000", referenceNo: "MKI-SAT-2026-003", contactEmail: "satinalma@mkinsaat.com",
    publisherSubscriberId: "sub-3",
    description: "Enerji verimliliği etütleri için termal kamera ve ölçüm cihazları tedariki.\n\nKapsam:\n- 5 adet termal görüntüleme kamerası\n- 10 adet taşınabilir enerji ölçüm cihazı\n- Kalibrasyon ve eğitim",
    documents: [{ name: "Teknik Şartname.pdf", fileSize: "1.4 MB" }],
  },
];

// ── Etkinlikler ───────────────────────────────────────────
const events: EventItem[] = [
  {
    id: "etk-1",
    title: "AB Proje Yönetimi Konferansı 2026",
    date: "2026-07-04T09:00:00",
    location: "Hilton Ankara, Ankara",
    isPublic: true,
    organizerSubscriberId: "sub-6",
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
    date: "2026-06-24T10:00:00",
    location: "Tarım Bakanlığı, Ankara",
    projectId: "tarim-modern",
    isPublic: false,
    organizerSubscriberId: "sub-1",
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
    date: "2026-07-12T09:00:00",
    location: "İstanbul Kongre Merkezi",
    projectId: "kadin-girisimcilik",
    isPublic: true,
    organizerSubscriberId: "sub-2",
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
    date: "2026-06-29T14:00:00",
    location: "AB Türkiye Delegasyonu, Ankara",
    isPublic: true,
    organizerSubscriberId: "sub-6",
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
    date: "2026-09-15T10:00:00",
    location: "Online (Zoom)",
    isPublic: false,
    organizerSubscriberId: "sub-1",
    description: "Proje yöneticileri için dijital araçlar kullanım eğitimi.",
    capacity: 30,
    agenda: [
      { id: "a16", time: "10:00", title: "Platforma Genel Bakış", presenter: "Eğitmen", durationMin: 20 },
      { id: "a17", time: "10:20", title: "Etkinlik ve Doküman Yönetimi Uygulaması", presenter: "Eğitmen", durationMin: 40 },
      { id: "a18", time: "11:00", title: "Raporlama Aracı Canlı Demo", presenter: "Eğitmen", durationMin: 30 },
    ],
  },
  {
    id: "etk-6",
    title: "Çevre & İklim Projesi Paydaş Toplantısı",
    date: "2026-09-22T13:00:00",
    location: "Çevre Bakanlığı Konferans Salonu, Ankara",
    projectId: "cevre-iklim",
    isPublic: false,
    organizerSubscriberId: "sub-1",
    description: "Çevre uyum projesinin ara dönem paydaş toplantısı ve değerlendirme oturumu.",
    capacity: 40,
    agenda: [
      { id: "a19", time: "13:00", title: "Açılış ve Proje Durum Sunumu", presenter: "Proje Yöneticisi", durationMin: 30 },
      { id: "a20", time: "13:30", title: "İzleme ve Değerlendirme Bulguları", presenter: "İ&D Uzmanı", durationMin: 45 },
      { id: "a21", time: "14:15", title: "Bir Sonraki Dönem Planlaması", presenter: "Tüm Ekip", durationMin: 30 },
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
  // etk-1: AB Konferansı — onaylılar ve bekleyenler
  { id: "r1",  eventId: "etk-1", name: "Ayşe Kılıç",      email: "ayse@kalkinma.gov.tr",  organization: "Kalkınma Bakanlığı",   status: "onaylandi", createdAt: "2026-06-01T10:00:00Z", invited: true },
  { id: "r2",  eventId: "etk-1", name: "Fatma Demir",     email: "fatma@firma.com",        organization: "XYZ Eğitim",          status: "bekliyor",  createdAt: "2026-06-02T11:00:00Z", invited: true },
  { id: "r3",  eventId: "etk-1", name: "Murat Şahin",     email: "murat@kosgeb.gov.tr",    organization: "KOSGEB",              status: "onaylandi", createdAt: "2026-06-03T09:00:00Z", invited: true },
  { id: "r4",  eventId: "etk-1", name: "Selin Yıldız",    email: "selin@iskur.gov.tr",     organization: "İŞKUR",               status: "iptal",     createdAt: "2026-06-04T14:00:00Z", invited: true },
  { id: "r5",  eventId: "etk-1", name: "Emre Çelik",      email: "emre@tarim.gov.tr",      organization: "Tarım Bakanlığı",     status: "bekliyor",  createdAt: "2026-06-05T08:00:00Z", invited: false },

  // etk-2: Tarım Teknik Toplantı — proje ekibi
  { id: "r6",  eventId: "etk-2", name: "Zeynep Aydın",    email: "zeynep@tarimstk.org",    organization: "Tarım Geliştirme Vakfı", status: "onaylandi", createdAt: "2026-06-10T09:00:00Z", invited: true },
  { id: "r7",  eventId: "etk-2", name: "Mevlüt Demir",    email: "mevlut@tarim.gov.tr",    organization: "Tarım Bakanlığı",     status: "onaylandi", createdAt: "2026-06-10T10:00:00Z", invited: true },
  { id: "r8",  eventId: "etk-2", name: "Hasan Kaplan",    email: "hasan@tarimstk.org",     organization: "Tarım Geliştirme Vakfı", status: "bekliyor", createdAt: "2026-06-11T09:00:00Z", invited: true },

  // etk-3: Kadın Girişimciler Zirvesi
  { id: "r9",  eventId: "etk-3", name: "Zeynep Kaya",     email: "zeynep@ornek.com",       organization: "İŞKUR",               status: "onaylandi", createdAt: "2026-06-03T09:00:00Z", invited: true },
  { id: "r10", eventId: "etk-3", name: "Hafize Arslan",   email: "hafize@girisimci.com",   organization: "Bağımsız Girişimci",  status: "onaylandi", createdAt: "2026-06-05T10:00:00Z", invited: false },
  { id: "r11", eventId: "etk-3", name: "Merve Tunç",      email: "merve@kosgeb.gov.tr",    organization: "KOSGEB",              status: "bekliyor",  createdAt: "2026-06-06T11:00:00Z", invited: true },

  // etk-4: IPA III Bilgilendirme
  { id: "r12", eventId: "etk-4", name: "Ali Öztürk",      email: "ali@firma.com",          organization: "ABC Danışmanlık",     status: "onaylandi", createdAt: "2026-06-12T09:00:00Z", invited: false },
  { id: "r13", eventId: "etk-4", name: "Kemal Yılmaz",    email: "kemal@stk.org",          organization: "İklim STK",           status: "bekliyor",  createdAt: "2026-06-13T10:00:00Z", invited: false },
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
  // ── Firma: Proje yürütür, tüm dijital araçlar ──
  {
    id: "sub-1", name: "Ahmet Yılmaz", email: "ahmet@danismanlik.com", organization: "ABC Danışmanlık",
    accountType: "sirket", profileType: "firma", plan: "yonetici",
    tags: ["danismanlik", "tarim", "proje-yonetimi"], createdAt: "2024-12-15T09:00:00Z",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=ABC%20Danismanlik&backgroundColor=003399",
    shortBio: "Tarım ve kırsal kalkınma alanında 15 yıllık tecrübeye sahip danışmanlık firması. AB fonlu projelerde teknik destek ve proje yönetimi hizmetleri sunar.",
    contactAddress: "Çankaya, Ankara", contactPhone: "+90 312 444 0001", contactEmail: "info@abcdanismanlik.com",
    socialLinks: { website: "https://abcdanismanlik.com", linkedin: "https://linkedin.com/company/abc-danismanlik" },
    profilePublic: true,
    foundedYear: 2009, employeeCount: "11-50",
    services: ["Proje Yönetimi", "Teknik Destek", "İzleme & Değerlendirme", "Kapasite Geliştirme"],
    sectorIds: ["tarim", "istihdam"],
  },
  // ── Firma 2: Konsorsiyum üyesi ──
  {
    id: "sub-2", name: "Fatma Demir", email: "fatma@firma.com", organization: "XYZ Eğitim Danışmanlık",
    accountType: "sirket", profileType: "firma", plan: "yonetici",
    tags: ["egitim", "genclik"], createdAt: "2026-02-01T09:00:00Z",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=XYZ%20Egitim&backgroundColor=0891b2",
    shortBio: "Eğitim ve gençlik politikaları alanında faaliyet gösteren, AB projelerinde uygulayıcı ortak olarak yer alan danışmanlık firması.",
    contactAddress: "Şişli, İstanbul", contactPhone: "+90 212 444 0002", contactEmail: "iletisim@xyzegitim.com",
    socialLinks: { website: "https://xyzegitim.com", linkedin: "https://linkedin.com/company/xyz-egitim" },
    profilePublic: true,
    foundedYear: 2015, employeeCount: "1-10",
    services: ["Eğitim Tasarımı", "Gençlik Programları", "Sosyal Politika"],
    sectorIds: ["istihdam", "sivil-toplum"],
  },
  // ── Tedarikçi: Uzman profili, eğitim materyali görür, satınalma ilanı verir ──
  {
    id: "sub-3", name: "Mehmet Kaya", email: "mehmet@insaat.com", organization: "MK İnşaat & Teknik",
    accountType: "sirket", profileType: "tedarikci", plan: "tedarikci",
    tags: ["insaat", "altyapi", "tedarikci"], createdAt: "2026-03-10T09:00:00Z",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=MK%20Insaat&backgroundColor=ca8a04",
    shortBio: "Altyapı ve inşaat sektöründe 12 yıllık tecrübesiyle AB ve kamu projelerine malzeme, ekipman ve teknik hizmet tedariki sağlar.",
    contactAddress: "Kocasinan, Kayseri", contactPhone: "+90 352 444 0003", contactEmail: "info@mkinsaat.com",
    socialLinks: { website: "https://mkinsaat.com" },
    profilePublic: true,
    foundedYear: 2012, employeeCount: "11-50",
    services: ["İnşaat Malzemesi Tedariki", "Teknik Hizmet", "Proje Lojistiği"],
    sectorIds: ["ulasim", "cevre"],
  },
  // ── STK: Firma ile aynı panel (farklı etiket), proje yürütür ──
  {
    id: "sub-4", name: "Zeynep Aydın", email: "zeynep@tarimstk.org", organization: "Tarım Geliştirme Vakfı",
    accountType: "stk", profileType: "stk", plan: "yonetici",
    tags: ["stk", "tarim", "kirsal-kalkinma"], createdAt: "2026-02-20T09:00:00Z",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Tarim%20Vakfi&backgroundColor=16a34a",
    shortBio: "Kırsal kalkınma ve sürdürülebilir tarım alanında saha uygulamaları yürüten, 200'den fazla köyde aktif olan sivil toplum kuruluşu.",
    contactAddress: "Selçuklu, Konya", contactPhone: "+90 332 444 0004", contactEmail: "iletisim@tarimstk.org",
    socialLinks: { website: "https://tarimstk.org", facebook: "https://facebook.com/tarimstk" },
    profilePublic: true,
    foundedYear: 2011, employeeCount: "11-50",
    services: ["Çiftçi Eğitimi", "Saha Uygulamaları", "Toplum Kalkınması"],
    sectorIds: ["tarim", "sivil-toplum"],
    mission: "Kırsal alanlarda sürdürülebilir tarım ve toplum kalkınması yoluyla yaşam kalitesini artırmak.",
  },
  // ── AB Delegasyonu: İhale açar, bülten/paydaş araçları ──
  {
    id: "sub-6", name: "Sarah Johnson", email: "sjohnson@eu-delegation.tr", organization: "AB Türkiye Delegasyonu",
    accountType: "sirket", profileType: "delegasyon", plan: "yonetici",
    tags: ["delegasyon", "ihale"], createdAt: "2024-01-01T09:00:00Z",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=AB%20Delegasyonu&backgroundColor=003399",
    shortBio: "Avrupa Birliği'nin Türkiye'deki resmi temsilciliği. IPA fonları kapsamındaki projelerin ihale süreçlerini yürütür ve izler.",
    contactAddress: "Kavaklıdere, Ankara", contactPhone: "+90 312 444 0006", contactEmail: "delegation-turkey@eeas.europa.eu",
    socialLinks: { website: "https://www.avrupa.info.tr", twitter: "https://twitter.com/EUinTurkey" },
    profilePublic: true,
  },
  // ── Program Otoritesi: İhale açar, bülten/paydaş araçları ──
  {
    id: "sub-7", name: "Deniz Korkmaz", email: "dkorkmaz@mfib.gov.tr", organization: "Merkezi Finans ve İhale Birimi",
    accountType: "sirket", profileType: "program_otoritesi", plan: "yonetici",
    tags: ["program-otoritesi", "mfib", "ihale"], createdAt: "2024-01-01T09:00:00Z",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=MFIB&backgroundColor=dc2626",
    shortBio: "IPA fonlarının Türkiye'deki merkezi uygulama birimi. İhale süreçlerini yönetir, sözleşme imzalar ve ödemeleri gerçekleştirir.",
    contactAddress: "Söğütözü, Ankara", contactPhone: "+90 312 444 0007", contactEmail: "info@mfib.gov.tr",
    socialLinks: { website: "https://www.mfib.gov.tr" },
    profilePublic: true,
  },
  // ── Admin2: Platform içerik yöneticisi ──
  {
    id: "sub-8", name: "Platform Editörü", email: "editor@euinturkiye.com", organization: "EUinTürkiye Admin2",
    accountType: "sirket", profileType: "admin2", plan: "yonetici",
    tags: ["admin2"], createdAt: "2024-01-01T09:00:00Z",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Admin2&backgroundColor=374151",
    shortBio: "Platform içerik yöneticisi. Tüm projelere, ilanlara ve uzmanlara erişebilir, metin düzenleyebilir.",
    contactEmail: "editor@euinturkiye.com",
    profilePublic: false,
  },
];

const campaigns: Campaign[] = [
  {
    id: "camp-1",
    subject: "Tarım Modernizasyonu — Haziran 2026 Proje Bülteni",
    body: "Tarım Modernizasyon Projesi'nde Haziran ayında önemli gelişmeler yaşandı. Bu sayımızda saha eğitimlerinin tamamlanması, yeni kooperatif ortaklıkları ve yaklaşan etkinliklerimizi bulabilirsiniz.\n\nTarım Modernizasyon Projesi olarak, çiftçilerimize sunduğumuz dijital araç eğitimlerinin ikinci aşamasını tamamladık. 150 çiftçiye modern sulama ve gübre yönetimi konusunda kapsamlı eğitim verdik.",
    targetTags: ["tarim", "kirsal-kalkinma"],
    includedPostIds: ["blog-1", "blog-2"],
    status: "gonderildi",
    createdAt: "2026-06-01T08:00:00Z",
    sentAt: "2026-06-02T10:00:00Z",
    recipientCount: 47,
    openCount: 31,
    publisherSubscriberId: "sub-1",
  },
  {
    id: "camp-2",
    subject: "Yeni İhale Fırsatları — Ağustos 2026",
    body: "Bu ay birden fazla projeye ait ihale ve satınalma ilanı yayımlandı. Tedarikçi ve danışmanlık firmalarımızın başvuru süreçleri için aşağıdaki duyuruları incelemesini rica ederiz.",
    targetTags: ["tedarikci", "insaat"],
    includedPostIds: ["blog-4"],
    status: "taslak",
    createdAt: "2026-07-28T08:00:00Z",
    recipientCount: 0,
    openCount: 0,
    publisherSubscriberId: "sub-1",
  },
  {
    id: "camp-3",
    subject: "Genç İstihdam Projesi — Ara Dönem Değerlendirme Bülteni",
    body: "Genç İstihdamın Desteklenmesi Projesi'nde 4. yılı tamamlarken önemli kilometre taşlarına ulaştık. Bu sayıda proje çıktılarımızı ve önümüzdeki dönem planlarını paylaşıyoruz.",
    targetTags: ["genclik", "istihdam"],
    includedPostIds: ["blog-3", "blog-5"],
    status: "gonderildi",
    createdAt: "2026-05-15T08:00:00Z",
    sentAt: "2026-05-16T09:00:00Z",
    recipientCount: 89,
    openCount: 62,
    publisherSubscriberId: "sub-2",
  },
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
  { id: "own-1", projectId: "tarim-modern", subscriberId: "sub-4", subscriberName: "Tarım Geliştirme Vakfı", requestedRole: "uye", approverType: "yurutucu", approverSubscriberId: "sub-1", note: "Saha uygulamalarında teknik ortağız.", status: "bekliyor", createdAt: "2026-05-10T09:00:00Z" },
  // Proje yürütücüsü yok (kadin-girisimcilik) → onay admin'e gider
  { id: "own-2", projectId: "kadin-girisimcilik", subscriberId: "sub-3", subscriberName: "MK İnşaat & Teknik", requestedRole: "yurutucu", approverType: "admin", note: "Bu projede tedarikçi olarak görev aldık.", status: "bekliyor", createdAt: "2026-05-12T09:00:00Z" },
];

const expertProfiles: ExpertProfile[] = [
  {
    id: "exp-1", subscriberId: "sub-1", name: "Ahmet Yılmaz",
    title: "Kıdemli Proje Yöneticisi & Tarım Uzmanı",
    bio: "15 yıllık AB projesi deneyimiyle tarım ve kırsal kalkınma alanında uzman. PCM, lojik çerçeve ve AB finansal yönetimi konusunda derin bilgiye sahip. Türkiye genelinde 12 ilde saha uygulaması yürütmüştür.",
    expertise: ["Proje Yönetimi", "Tarım", "Kırsal Kalkınma", "İzleme & Değerlendirme", "PCM"],
    projectHistory: [
      { projectId: "tarim-modern", role: "Teknik Uzman & Proje Koordinatörü" },
      { projectId: "cevre-iklim", role: "Kıdemli Danışman" },
    ],
    visible: true, updatedAt: "2026-03-01T09:00:00Z",
  },
  {
    id: "exp-2", subscriberId: "sub-2", name: "Fatma Demir",
    title: "Mali Yönetim & Satınalma Uzmanı",
    bio: "AB finansmanlı projelerde 10 yıllık mali yönetim ve raporlama deneyimi. PRAG kurallarına hakim, FIDIC sözleşme yönetimi sertifikası bulunmaktadır. EDF ve IPA fonlarında geniş uygulama tecrübesi.",
    expertise: ["Mali Yönetim", "PRAG/Satınalma", "Raporlama", "Denetim", "IPA Fonları"],
    projectHistory: [
      { projectId: "genc-istihdam", role: "Mali Uzman" },
      { projectId: "cevre-iklim", role: "Denetim Danışmanı" },
      { projectId: "kadin-girisimcilik", role: "Mali Yönetim Uzmanı" },
    ],
    visible: true, updatedAt: "2026-02-15T09:00:00Z",
  },
  {
    id: "exp-3", subscriberId: "sub-3", name: "Mehmet Kaya",
    title: "İnşaat & Altyapı Uzmanı",
    bio: "Bölgesel kalkınma ve altyapı projelerinde 12 yıllık saha deneyimi. Kırsal yol yapımı, su altyapısı ve kamu binası yenileme işlerinde teknik danışmanlık. İhale süreçleri yönetimi ve teknik şartname hazırlama konusunda uzman.",
    expertise: ["İnşaat", "Altyapı Yönetimi", "İhale Hazırlama", "Teknik Denetim", "Saha Yönetimi"],
    projectHistory: [
      { projectId: "bolgesel-kalkinma", role: "Teknik Danışman" },
      { projectId: "afet-direnci", role: "Altyapı Uzmanı" },
    ],
    visible: true, updatedAt: "2026-04-10T09:00:00Z",
  },
  {
    id: "exp-4", subscriberId: "sub-4", name: "Zeynep Aydın",
    title: "İzleme, Değerlendirme & Saha Koordinatörü",
    bio: "M&E metodolojileri ve gösterge sistemleri tasarımı konusunda 8 yıllık deneyim. Çiftçi ve kadın girişimcilerle çalışma deneyimi. Saha araştırmaları, odak grup çalışmaları ve anket tasarımında uzman.",
    expertise: ["İzleme & Değerlendirme", "Gösterge Tasarımı", "Etki Analizi", "Saha Araştırması", "Kapasite Geliştirme"],
    projectHistory: [
      { projectId: "tarim-modern", role: "Saha İ&D Koordinatörü" },
      { projectId: "kadin-girisimcilik", role: "İ&D Uzmanı" },
    ],
    visible: true, updatedAt: "2026-05-01T09:00:00Z",
  },
  {
    id: "exp-5", subscriberId: "sub-2", name: "Ali Öztürk",
    title: "Gençlik & İstihdam Politikaları Uzmanı",
    bio: "Gençlik politikaları ve iş piyasasına geçiş programlarında 7 yıllık deneyim. Aktif istihdam tedbirleri, mesleki eğitim ve kariyer danışmanlığı sistemleri kurulumu konusunda uzman.",
    expertise: ["Gençlik Politikası", "İstihdam", "Kariyer Danışmanlığı", "Mesleki Eğitim"],
    projectHistory: [
      { projectId: "genc-istihdam", role: "Gençlik Politikaları Uzmanı" },
      { projectId: "egitim-kalite", role: "Danışman" },
    ],
    visible: true, updatedAt: "2026-06-01T09:00:00Z",
  },
];

const networkConnections: NetworkConnection[] = [
  { id: "net-1", ownerSubscriberId: "sub-1", targetType: "uzman", targetId: "exp-1", targetName: "Ahmet Yılmaz", addedAt: "2026-04-10T09:00:00Z" },
  { id: "net-2", ownerSubscriberId: "sub-1", targetType: "tedarikci", targetId: "sub-3", targetName: "MK İnşaat & Teknik", addedAt: "2026-05-02T09:00:00Z" },
];

const addressGroups: AddressGroup[] = [
  {
    id: "ag-1", ownerSubscriberId: "sub-1", name: "Tarım Projesi Ekibi",
    description: "Tarım Modernizasyon Projesi çekirdek ekip ve ortaklar",
    memberIds: ["sub-2", "sub-3", "sub-4"], createdAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "ag-2", ownerSubscriberId: "sub-1", name: "Potansiyel Tedarikçiler",
    description: "İleride çalışmayı değerlendirdiğimiz tedarikçiler",
    memberIds: ["sub-3"], createdAt: "2026-05-10T09:00:00Z",
  },
];

const savedListings: SavedListing[] = [
  { id: "sv-1", subscriberId: "sub-3", listingId: "ilan-2", savedAt: "2026-06-12T10:00:00Z", notes: "Eğitim materyali üretiminde deneyimimiz var." },
  { id: "sv-2", subscriberId: "sub-3", listingId: "ilan-6", savedAt: "2026-06-14T09:00:00Z" },
  { id: "sv-3", subscriberId: "sub-1", listingId: "ilan-3", savedAt: "2026-06-15T09:00:00Z", notes: "Yazılım ihalesini takip et." },
  { id: "sv-4", subscriberId: "sub-1", listingId: "ilan-7", savedAt: "2026-06-16T10:00:00Z" },
];

const editLogs: EditLog[] = [];

// ── Anketler ──────────────────────────────────────────────
const surveys: Survey[] = [
  {
    id: "survey-1",
    ownerSubscriberId: "sub-1",
    ownerName: "ABC Danışmanlık",
    title: "Proje Paydaş Memnuniyet Anketi",
    description: "Tarım modernizasyon projesindeki paydaş memnuniyetini ölçmek için hazırlanmıştır.",
    status: "aktif",
    createdAt: "2026-06-01T09:00:00Z",
    projectId: "tarim-modern",
    allowAnonymous: false,
    questions: [
      {
        id: "q1", type: "multiple_choice", required: true,
        text: "Proje sürecindeki iletişimden ne kadar memnunsunuz?",
        options: ["Çok memnunum", "Memnunum", "Kararsızım", "Memnun değilim", "Hiç memnun değilim"],
      },
      {
        id: "q2", type: "rating", required: true,
        text: "Proje çıktılarını 1-5 arasında nasıl değerlendirirsiniz?",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        id: "q3", type: "yes_no", required: true,
        text: "Projenin hedeflerine ulaşıldığını düşünüyor musunuz?",
        options: ["Evet", "Hayır"],
      },
      {
        id: "q4", type: "open_ended", required: false,
        text: "Projeyle ilgili öneri veya görüşlerinizi paylaşabilir misiniz?",
      },
    ],
  },
  {
    id: "survey-2",
    ownerSubscriberId: "sub-2",
    ownerName: "XYZ Eğitim ve Danışmanlık",
    title: "Eğitim İhtiyaç Analizi",
    description: "Ekip üyeleri için kapasite geliştirme ihtiyaçlarını belirlemek.",
    status: "taslak",
    createdAt: "2026-07-10T10:00:00Z",
    allowAnonymous: true,
    questions: [
      {
        id: "q1", type: "multiple_choice", required: true,
        text: "Hangi alanda eğitime en çok ihtiyaç duyuyorsunuz?",
        options: ["Proje yönetimi", "Finansal raporlama", "AB müktesebatı", "İletişim ve görünürlük", "Teknik uzmanlık"],
      },
      {
        id: "q2", type: "multiple_choice", required: true,
        text: "Tercih ettiğiniz eğitim formatı nedir?",
        options: ["Yüz yüze", "Online (canlı)", "Online (kayıtlı)", "Karma"],
      },
      {
        id: "q3", type: "open_ended", required: false,
        text: "Öncelikli öğrenmek istediğiniz konuyu kısaca açıklayın.",
      },
    ],
  },
];

const surveyResponses: SurveyResponse[] = [
  {
    id: "sr-1", surveyId: "survey-1", respondentSubscriberId: "sub-4", respondentName: "Tarım Geliştirme Vakfı",
    answers: [
      { questionId: "q1", value: "Memnunum" },
      { questionId: "q2", value: "4" },
      { questionId: "q3", value: "Evet" },
      { questionId: "q4", value: "Saha çalışmalarında daha fazla destek sağlanabilir." },
    ],
    submittedAt: "2026-06-15T14:00:00Z",
  },
  {
    id: "sr-2", surveyId: "survey-1", respondentSubscriberId: "sub-3", respondentName: "MK İnşaat",
    answers: [
      { questionId: "q1", value: "Çok memnunum" },
      { questionId: "q2", value: "5" },
      { questionId: "q3", value: "Evet" },
    ],
    submittedAt: "2026-06-18T10:30:00Z",
  },
];

// ── Kurum Profilleri (admin2 tarafından tanımlanan) ────────
const institutionProfiles: InstitutionProfile[] = [
  {
    id: "inst-1",
    createdBySubscriberId: "sub-8",
    subscriberId: "sub-6",
    name: "AB Türkiye Delegasyonu",
    shortName: "AB Delegasyonu",
    institutionType: "uluslararasi",
    description: "Türkiye'deki Avrupa Birliği Delegasyonu. AB-Türkiye ilişkilerini ve IPA fonlarının yönetimini koordine eder.",
    sectorIds: ["yargi", "temel-haklar", "cevre", "enerji", "ulasim"],
    website: "https://www.eeas.europa.eu/turkey",
    contactName: "Delegasyon Ofisi",
    contactEmail: "delegation-turkey@eeas.europa.eu",
    address: "Uğur Mumcu Cad. No:88, 06700 Gaziosmanpaşa, Ankara",
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "inst-2",
    createdBySubscriberId: "sub-8",
    subscriberId: "sub-7",
    name: "Merkezi Finans ve İhale Birimi (MFİB)",
    shortName: "MFİB",
    institutionType: "kamu",
    description: "Hazine ve Maliye Bakanlığı bünyesindeki MFİB, AB fonlarının Türkiye'deki ihale ve sözleşme süreçlerini yönetir.",
    sectorIds: ["yargi", "cevre", "ulasim", "enerji", "rekabet"],
    website: "https://www.mfib.gov.tr",
    contactName: "MFİB Genel Müdürlüğü",
    contactEmail: "info@mfib.gov.tr",
    address: "İnönü Bulvarı No:36, 06510 Emek, Ankara",
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "inst-3",
    createdBySubscriberId: "sub-8",
    name: "Adalet Bakanlığı",
    shortName: "Adalet Bakanlığı",
    institutionType: "kamu",
    description: "Türkiye Cumhuriyeti Adalet Bakanlığı. Yargı ve temel haklar sektöründe çok sayıda IPA projesinin faydalanıcısı.",
    sectorIds: ["yargi", "temel-haklar"],
    website: "https://www.adalet.gov.tr",
    contactName: "AB Koordinasyon Daire Başkanlığı",
    contactEmail: "abkoordinasyon@adalet.gov.tr",
    address: "Adalet Bakanlığı, Ankara",
    createdAt: "2026-01-12T09:00:00Z",
    updatedAt: "2026-01-12T09:00:00Z",
  },
  {
    id: "inst-4",
    createdBySubscriberId: "sub-8",
    name: "TCDD Genel Müdürlüğü",
    shortName: "TCDD",
    institutionType: "kamu",
    description: "Türkiye Cumhuriyeti Devlet Demiryolları. Halkalı-Kapıkule hattı başta olmak üzere ulaştırma sektörünün ana faydalanıcısı.",
    sectorIds: ["ulasim"],
    website: "https://www.tcdd.gov.tr",
    contactName: "Uluslararası İlişkiler Dairesi",
    contactPhone: "+90 312 309 05 15",
    address: "Talatpaşa Bulvarı No:3, Gar, Ankara",
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "inst-5",
    createdBySubscriberId: "sub-8",
    name: "MK İnşaat Mühendislik",
    shortName: "MK İnşaat",
    institutionType: "ozel",
    description: "Türkiye genelinde altyapı ve inşaat hizmetleri sunan tedarikçi firma. AB projelerinde mal ve hizmet sağlayıcı.",
    sectorIds: ["ulasim", "cevre"],
    website: "https://www.mkinsaat.com.tr",
    contactName: "Mehmet Kaya",
    contactTitle: "Genel Müdür",
    contactPhone: "+90 312 555 00 33",
    contactEmail: "info@mkinsaat.com.tr",
    address: "Ostim Sanayi Bölgesi, Ankara",
    createdAt: "2026-02-01T09:00:00Z",
    updatedAt: "2026-02-01T09:00:00Z",
  },
];

// ── Proje Web Siteleri ────────────────────────────────────
const projectWebsites: ProjectWebsite[] = [
  {
    id: "pw-1",
    projectId: "halkali-kapikule",
    ownerSubscriberId: "sub-1",
    slug: "halkali-kapikule-demiryolu",
    templateId: "impact",
    headerVersion: 1,
    headerTr: {
      title: "Halkalı-Kapıkule Demiryolu Projesi",
      subtitle: "Türkiye'yi Avrupa'ya bağlayan amiral gemisi altyapı projesi",
      tagline: "AB-Türkiye Ulaştırma İşbirliği",
    },
    headerEn: {
      title: "Halkalı-Kapıkule Railway Project",
      subtitle: "The flagship infrastructure project connecting Turkey to Europe",
      tagline: "EU-Turkey Transport Cooperation",
    },
    footerLogos: [
      { id: "fl-1", source: "library", libraryKey: "eu", label: "Avrupa Birliği", order: 1 },
      { id: "fl-2", source: "library", libraryKey: "tcdd", label: "TCDD", order: 2 },
      { id: "fl-3", source: "library", libraryKey: "tr-cumhurbaskanligi", label: "T.C.", order: 3 },
    ],
    published: true,
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-03-01T09:00:00Z",
    showObjective: true, showOutputs: true, showLocations: true,
    showBudget: true, showConsortium: false,
  },
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

  getAddressGroups = (ownerSubscriberId: string) => delay(addressGroups.filter((g) => g.ownerSubscriberId === ownerSubscriberId));
  saveAddressGroup = (g: AddressGroup) => { const i = addressGroups.findIndex((x) => x.id === g.id); if (i !== -1) addressGroups[i] = g; else addressGroups.unshift(g); return delay(undefined); };
  removeAddressGroup = (id: string) => { const i = addressGroups.findIndex((x) => x.id === id); if (i !== -1) addressGroups.splice(i, 1); return delay(undefined); };

  getSavedListings = (subscriberId: string) => delay(savedListings.filter((s) => s.subscriberId === subscriberId));
  saveListing_bookmark = (s: SavedListing) => { const i = savedListings.findIndex((x) => x.id === s.id); if (i !== -1) savedListings[i] = s; else savedListings.unshift(s); return delay(undefined); };
  removeSavedListing = (id: string) => { const i = savedListings.findIndex((x) => x.id === id); if (i !== -1) savedListings.splice(i, 1); return delay(undefined); };

  getEditLogs = (entityId?: string) => delay(entityId ? editLogs.filter((l) => l.entityId === entityId) : [...editLogs]);
  saveEditLog = (log: EditLog) => { editLogs.unshift(log); return delay(undefined); };

  // ── Anket metodları ───────────────────────────────────────
  getSurveys = (ownerSubscriberId?: string) =>
    delay(ownerSubscriberId ? surveys.filter((s) => s.ownerSubscriberId === ownerSubscriberId) : [...surveys]);
  getSurvey = (id: string) => delay(surveys.find((s) => s.id === id) ?? null);
  saveSurvey = (s: Survey) => { const i = surveys.findIndex((x) => x.id === s.id); if (i !== -1) surveys[i] = s; else surveys.unshift(s); return delay(undefined); };
  removeSurvey = (id: string) => { const i = surveys.findIndex((x) => x.id === id); if (i !== -1) surveys.splice(i, 1); return delay(undefined); };

  getSurveyResponses = (surveyId: string) => delay(surveyResponses.filter((r) => r.surveyId === surveyId));
  saveSurveyResponse = (r: SurveyResponse) => { const i = surveyResponses.findIndex((x) => x.id === r.id); if (i !== -1) surveyResponses[i] = r; else surveyResponses.push(r); return delay(undefined); };

  // ── Kurum profili metodları ────────────────────────────────
  getInstitutionProfiles = () => delay([...institutionProfiles]);
  getInstitutionProfile = (id: string) => delay(institutionProfiles.find((p) => p.id === id) ?? null);
  saveInstitutionProfile = (p: InstitutionProfile) => { const i = institutionProfiles.findIndex((x) => x.id === p.id); if (i !== -1) institutionProfiles[i] = p; else institutionProfiles.unshift(p); return delay(undefined); };
  removeInstitutionProfile = (id: string) => { const i = institutionProfiles.findIndex((x) => x.id === id); if (i !== -1) institutionProfiles.splice(i, 1); return delay(undefined); };

  // ── Proje website metodları ────────────────────────────────
  getProjectWebsite = (projectId: string) => delay(projectWebsites.find((w) => w.projectId === projectId) ?? null);
  getProjectWebsiteBySlug = (slug: string) => delay(projectWebsites.find((w) => w.slug === slug) ?? null);
  saveProjectWebsite = (w: ProjectWebsite) => { const i = projectWebsites.findIndex((x) => x.id === w.id); if (i !== -1) projectWebsites[i] = w; else projectWebsites.unshift(w); return delay(undefined); };
  isSlugAvailable = (slug: string, excludeProjectId?: string) =>
    delay(!projectWebsites.some((w) => w.slug === slug && w.projectId !== (excludeProjectId ?? "")));
}
