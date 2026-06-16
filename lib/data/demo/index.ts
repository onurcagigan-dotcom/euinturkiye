/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DataProvider, ProjectFilters } from "../provider";
import type {
  Sector, Donor, Project, Listing, ListingType, EventItem, BlogPost,
  HomeStats, EventRsvp, ProjectDocument, Subscriber, Campaign,
  Stakeholder, TrainingVideo, OwnershipRequest, ExpertProfile,
} from "../../types";

const delay = <T>(v: T, ms = 60) => new Promise<T>((r) => setTimeout(() => r(v), ms));

// ── Sektörler ─────────────────────────────────────────────
const sectors: Sector[] = [
  { id: "tarim", name: "Tarım & Kırsal Kalkınma", color: "#16a34a" },
  { id: "cevre", name: "Çevre & İklim", color: "#0891b2" },
  { id: "egitim", name: "Eğitim & Gençlik", color: "#7c3aed" },
  { id: "istihdam", name: "İstihdam & Sosyal Politika", color: "#ea580c" },
  { id: "enerji", name: "Enerji & Altyapı", color: "#ca8a04" },
  { id: "adalet", name: "Adalet & İçişleri", color: "#dc2626" },
  { id: "saglik", name: "Sağlık & Sosyal Hizmetler", color: "#0284c7" },
  { id: "rekabet", name: "Rekabetçilik & KOBİ", color: "#9333ea" },
  { id: "bolgesel", name: "Bölgesel Kalkınma", color: "#0f766e" },
  { id: "dijital", name: "Dijital Dönüşüm", color: "#1d4ed8" },
];

// ── Donörler ──────────────────────────────────────────────
const donors: Donor[] = [
  { id: "eu", name: "Avrupa Birliği", country: "AB" },
  { id: "wb", name: "Dünya Bankası", country: "ABD" },
  { id: "giz", name: "GIZ (Almanya)", country: "Almanya" },
  { id: "usaid", name: "USAID", country: "ABD" },
  { id: "undp", name: "UNDP", country: "BM" },
];

// ── Projeler (30 adet) ────────────────────────────────────
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
  },
  {
    id: "cevre-iklim",
    title: "Çevre Uyum ve İklim Değişikliği",
    summary: "Türkiye'nin iklim değişikliğine uyum kapasitesinin güçlendirilmesi.",
    sectorId: "cevre", donorId: "eu", ipaPeriod: "IPA-IV",
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
    sectorId: "adalet", donorId: "eu", ipaPeriod: "IPA-II",
    beneficiary: "T.C. Adalet Bakanlığı", locations: ["Ankara"],
    budget: "€5.5M", startDate: "2021-01-01", endDate: "2024-06-30",
    status: "tamamlandi", featured: false,
    objective: "Adli tebligat süreçlerinin dijitalleştirilmesi ve uluslararası standartlarla uyumunun sağlanması.",
  },
  {
    id: "kadin-girisimcilik",
    title: "Kadın Girişimciliğinin Güçlendirilmesi",
    summary: "Kadın girişimcilere iş kurma, finansmana erişim ve mentorluk desteği sağlayan program.",
    sectorId: "rekabet", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "KOSGEB", locations: ["İstanbul", "Ankara", "Gaziantep", "Diyarbakır"],
    budget: "€6.8M", startDate: "2023-09-01", endDate: "2026-08-31",
    status: "devam", featured: true,
  },
  {
    id: "dijital-donusum",
    title: "Kamu Hizmetlerinde Dijital Dönüşüm",
    summary: "Belediyelerin dijital hizmet kapasitesinin güçlendirilmesi.",
    sectorId: "dijital", donorId: "wb", ipaPeriod: "IPA-IV",
    beneficiary: "İçişleri Bakanlığı", locations: ["İstanbul", "Ankara", "İzmir", "Bursa"],
    budget: "€9.3M", startDate: "2024-01-01", endDate: "2027-12-31",
    status: "devam", featured: false,
  },
  {
    id: "enerji-verimlilik",
    title: "Enerji Verimliliği ve Yenilenebilir Enerji",
    summary: "Türkiye'nin enerji verimliliği kapasitesinin artırılması ve yenilenebilir enerji yatırımlarının desteklenmesi.",
    sectorId: "enerji", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "Enerji ve Tabii Kaynaklar Bakanlığı", locations: ["Ankara", "Konya", "Kayseri"],
    budget: "€11.2M", startDate: "2023-03-01", endDate: "2026-02-28",
    status: "devam", featured: false,
  },
  {
    id: "saglik-reform",
    title: "Sağlık Sektörü Reform Desteği",
    summary: "Türkiye sağlık sisteminin güçlendirilmesi ve AB sağlık standartlarına uyum.",
    sectorId: "saglik", donorId: "eu", ipaPeriod: "IPA-II",
    beneficiary: "Sağlık Bakanlığı", locations: ["Ankara", "İstanbul", "İzmir"],
    budget: "€7.5M", startDate: "2020-01-01", endDate: "2023-12-31",
    status: "tamamlandi", featured: false,
  },
  {
    id: "bolgesel-kalkinma",
    title: "Doğu Anadolu Bölgesel Kalkınma",
    summary: "Doğu Anadolu illerinde ekonomik kalkınma ve altyapı iyileştirme.",
    sectorId: "bolgesel", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "Kalkınma Bakanlığı", locations: ["Erzurum", "Van", "Ağrı", "Iğdır"],
    budget: "€18M", startDate: "2022-01-01", endDate: "2025-12-31",
    status: "devam", featured: false,
  },
  {
    id: "egitim-kalite",
    title: "Eğitimde Kalite ve Erişim",
    summary: "Türkiye'de eğitim kalitesinin artırılması ve dezavantajlı gruplara erişimin genişletilmesi.",
    sectorId: "egitim", donorId: "eu", ipaPeriod: "IPA-IV",
    beneficiary: "Milli Eğitim Bakanlığı", locations: ["Türkiye geneli"],
    budget: "€22M", startDate: "2024-09-01", endDate: "2028-08-31",
    status: "planlama", featured: true,
  },
];

// Kalan 469 projeyi otomatik oluştur
for (let i = 11; i <= 499; i++) {
  const sec = sectors[i % sectors.length];
  const don = donors[i % donors.length];
  const periods = ["IPA-I", "IPA-II", "IPA-III", "IPA-IV"] as const;
  projects.push({
    id: `proje-${i}`,
    title: `${sec.name} Destek Projesi ${i}`,
    summary: `${sec.name} alanında kapasite geliştirme ve kurumsal reform projesi.`,
    sectorId: sec.id, donorId: don.id, ipaPeriod: periods[i % 4],
    beneficiary: "İlgili Bakanlık", locations: ["Ankara"],
    budget: `€${(Math.floor(Math.random() * 15) + 1)}.${Math.floor(Math.random() * 9)}M`,
    startDate: "2023-01-01", endDate: "2025-12-31",
    status: i % 3 === 0 ? "tamamlandi" : i % 5 === 0 ? "planlama" : "devam",
    featured: false,
  });
}

// ── İlanlar ───────────────────────────────────────────────
const listings: Listing[] = [
  {
    id: "ilan-1", type: "is", title: "Kıdemli Proje Koordinatörü",
    organization: "Design for Good LLC", projectId: "tarim-modern",
    location: "Ankara (Hibrit)", deadline: "2026-07-15", locked: false,
    description: "Tarım modernizasyon projesi için deneyimli proje koordinatörü aranmaktadır. AB projesi yönetim deneyimi şarttır.\n\nGereksinimler:\n- En az 5 yıl AB projesi yönetim deneyimi\n- İyi derecede İngilizce\n- Tarım sektörü bilgisi tercih sebebi\n\nBaşvuru için CV ve motivasyon mektubunu gönderiniz.",
  },
  {
    id: "ilan-2", type: "satinalma",
    title: "Eğitim Materyalleri Tedariki",
    organization: "T.C. Tarım ve Orman Bakanlığı", projectId: "tarim-modern",
    location: "Türkiye geneli", deadline: "2026-07-30", locked: true,
    description: "Satınalma detayları abonelik gerektirir.",
  },
  {
    id: "ilan-3", type: "ihale",
    title: "Yazılım Geliştirme ve Bakım Hizmetleri",
    organization: "İŞKUR", projectId: "genc-istihdam",
    location: "Ankara", deadline: "2026-08-15", locked: true,
    description: "İhale detayları abonelik gerektirir.",
  },
  {
    id: "ilan-4", type: "is", title: "Mali Uzman",
    organization: "Çevre Bakanlığı", projectId: "cevre-iklim",
    location: "Ankara", deadline: "2026-07-20", locked: false,
    description: "İklim projesi için mali uzman aranmaktadır. EU mali yönetim deneyimi tercih sebebidir.",
  },
  {
    id: "ilan-5", type: "is", title: "İzleme & Değerlendirme Uzmanı",
    organization: "KOSGEB", projectId: "kadin-girisimcilik",
    location: "İstanbul", deadline: "2026-08-01", locked: false,
    description: "Kadın girişimcilik programının İ&D uzmanı aranıyor. M&E metodolojileri konusunda deneyim şart.",
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
      { id: "a3", time: "10:30", title: "Panel: IPA IV Deneyimleri", presenter: "Panel", durationMin: 90 },
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
  },
  {
    id: "etk-4",
    title: "IPA IV Bilgilendirme Toplantısı",
    date: "2026-10-05T14:00:00",
    location: "AB Türkiye Delegasyonu, Ankara",
    isPublic: true,
    description: "IPA IV döneminin yeni fırsatlarına ilişkin bilgilendirme.",
    capacity: 80,
  },
  {
    id: "etk-5",
    title: "Dijital Araçlar Eğitimi",
    date: "2026-07-25T10:00:00",
    location: "Online (Zoom)",
    isPublic: false,
    description: "Proje yöneticileri için dijital araçlar kullanım eğitimi.",
    capacity: 30,
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
    content: `Türkiye ile Avrupa Birliği arasındaki ilişkiler, 2026 yılında yeni bir ivme kazanmaktadır. Özellikle IPA IV döneminin aktif uygulamaya geçmesiyle birlikte, iki taraf arasındaki proje işbirliği rekor seviyelere ulaşmıştır.

Bu yıl hayata geçirilen projeler, tarımdan çevreye, eğitimden dijital dönüşüme kadar geniş bir yelpazede Türkiye'nin kalkınma gündemine katkı sunmaktadır. Delegasyon yetkilileri, 2026'da tamamlanacak projelerin etki değerlendirmesinin olumlu sonuçlanmasını beklediklerini ifade etmektedir.

Önümüzdeki süreçte katılım öncesi fonların etkin kullanımı ve kurumsal kapasitenin güçlendirilmesi öncelikli hedefler olarak öne çıkmaktadır.`,
    coverImage: undefined,
    publishedAt: "2026-06-01T09:00:00",
    readMinutes: 5,
    projectId: undefined,
  },
  {
    id: "blog-2",
    slug: "ipa-iv-firsatlari",
    title: "IPA IV Dönemi: Türkiye için Finansman Fırsatları",
    category: "Fonlar & Finansman",
    excerpt: "IPA IV kapsamında Türkiye'ye sunulan hibe ve teknik destek imkânları rehberi.",
    content: `IPA IV (Katılım Öncesi Mali Yardım Aracı) 2021-2027 dönemi, Türkiye için önemli finansman olanakları sunmaktadır. Bu dönemde Türkiye, toplamda 1,4 milyar Euro'yu aşan kaynak için uygun konumdadır.

Desteklenecek öncelik alanları arasında hukukun üstünlüğü ve temel haklar, çevre ve iklim eylemi, dijital dönüşüm, tarım ve kırsal kalkınma ile bölgesel ve bölgesel kalkınma yer almaktadır.

Başvuru süreçleri, ortak finansman gereksinimleri ve teknik destek talep prosedürleri hakkında daha fazla bilgi için delegasyon web sitesi ve euinturkiye.com kaynaklarından faydalanabilirsiniz.`,
    coverImage: undefined,
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
    coverImage: undefined,
    publishedAt: "2026-04-20T11:00:00",
    readMinutes: 4,
    projectId: "tarim-modern",
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
];

const subscribers: Subscriber[] = [
  { id: "sub-1", name: "Ahmet Yılmaz", email: "ahmet@danismanlik.com", organization: "ABC Danışmanlık", plan: "paket1", tags: ["tedarikci", "tarim"], createdAt: "2026-01-15T09:00:00Z" },
  { id: "sub-2", name: "Fatma Demir", email: "fatma@firma.com", organization: "XYZ Firma", plan: "paket2", tags: ["yararlanici"], createdAt: "2026-02-01T09:00:00Z" },
  { id: "sub-3", name: "Mehmet Kaya", email: "mehmet@insaat.com", organization: "MK İnşaat", plan: "tedarikci", tags: ["tedarikci", "insaat"], createdAt: "2026-03-10T09:00:00Z" },
];

const campaigns: Campaign[] = [
  { id: "camp-1", subject: "Haziran Proje Bülteni", body: "Bu ay projede tamamlanan faaliyetler...", targetTags: [], status: "gonderildi", createdAt: "2026-06-01T08:00:00Z", sentAt: "2026-06-02T10:00:00Z", recipientCount: 3, openCount: 2 },
  { id: "camp-2", subject: "Yeni İhale Duyurusu", body: "Yeni satınalma ilanımız yayınlandı...", targetTags: ["tedarikci"], status: "taslak", createdAt: "2026-06-10T08:00:00Z", recipientCount: 0, openCount: 0 },
];

const stakeholders: Stakeholder[] = [
  { id: "stk-1", projectId: "tarim-modern", name: "Dr. Mehmet Çelik", email: "mcelik@tarim.gov.tr", phone: "+90 312 000 0001", organization: "Tarım Bakanlığı", role: "Proje Direktörü", type: "kamu", addedAt: "2023-01-15T09:00:00Z" },
  { id: "stk-2", projectId: "tarim-modern", name: "Sarah Johnson", email: "sjohnson@eu.int", organization: "AB Delegasyonu", role: "Proje Görevlisi", type: "kamu", addedAt: "2023-01-20T09:00:00Z" },
  { id: "stk-3", projectId: "genc-istihdam", name: "Av. Zeynep Arslan", email: "zarslan@hukuk.com", organization: "Arslan Hukuk", role: "Kıdemli Hukuk Uzmanı", type: "uzman", addedAt: "2026-02-01T09:00:00Z" },
];

const trainingVideos: TrainingVideo[] = [
  { id: "tv-1", title: "AB Proje Döngüsü Yönetimi", description: "Temel PCM kavramları ve uygulamaları.", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "45:00", category: "Proje Yönetimi", order: 1 },
  { id: "tv-2", title: "Finansal Raporlama Esasları", description: "AB projelerinde mali yönetim ve raporlama.", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "38:00", category: "Mali Yönetim", order: 2 },
  { id: "tv-3", title: "İzleme ve Değerlendirme", description: "M&E metodolojisi ve gösterge sistemi.", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "52:00", category: "İ&D", order: 3 },
];

const ownershipRequests: OwnershipRequest[] = [
  { id: "own-1", projectId: "tarim-modern", subscriberId: "sub-1", subscriberName: "ABC Danışmanlık", note: "Bu projede teknik uzman olarak görev aldık.", status: "bekliyor", createdAt: "2026-05-10T09:00:00Z" },
];

const expertProfiles: ExpertProfile[] = [
  {
    id: "exp-1", subscriberId: "sub-1", name: "Ahmet Yılmaz", title: "Kıdemli Tarım Uzmanı",
    bio: "15 yıllık AB proje deneyimi ile tarım sektörü uzmanı.",
    expertise: ["Tarım", "Kırsal Kalkınma", "PCM"],
    projectHistory: [{ projectId: "tarim-modern", role: "Teknik Uzman" }],
    visible: true, updatedAt: "2026-03-01T09:00:00Z",
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
    if (filters?.search) { const q = filters.search.toLowerCase(); res = res.filter((p) => p.title.toLowerCase().includes(q)); }
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
  saveOwnershipRequest = (r: OwnershipRequest) => { const i = ownershipRequests.findIndex((x) => x.id === r.id); if (i !== -1) ownershipRequests[i] = r; else ownershipRequests.unshift(r); return delay(undefined); };
  updateOwnershipStatus = (id: string, status: "onaylandi" | "reddedildi") => { const r = ownershipRequests.find((x) => x.id === id); if (r) r.status = status; return delay(undefined); };
  assignProjectOwner = (projectId: string, subscriberId: string | undefined) => { const p = projects.find((x) => x.id === projectId); if (p) p.ownerSubscriberId = subscriberId; return delay(undefined); };

  getExpertProfiles = () => delay([...expertProfiles]);
  getExpertProfile = (id: string) => delay(expertProfiles.find((p) => p.id === id) ?? null);
  saveExpertProfile = (p: ExpertProfile) => { const i = expertProfiles.findIndex((x) => x.id === p.id); if (i !== -1) expertProfiles[i] = p; else expertProfiles.unshift(p); return delay(undefined); };
  removeExpertProfile = (id: string) => { const i = expertProfiles.findIndex((x) => x.id === id); if (i !== -1) expertProfiles.splice(i, 1); return delay(undefined); };
  getProjectExperts = (projectId: string) => delay(
    expertProfiles
      .flatMap((ep) => ep.projectHistory.filter((ph) => ph.projectId === projectId).map((ph) => ({ profile: ep, expertise: ep.expertise[0] ?? "", role: ph.role })))
  );
}
