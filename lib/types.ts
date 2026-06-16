// ============================================================
// euinturkiye.com — Veri Tipleri
// Firestore koleksiyonlarıyla birebir uyumlu.
// Hem demo (JSON) hem canlı (Firestore) aynı tipleri kullanır.
// ============================================================

/** IPA dönemleri */
export type IpaPeriod = "ipa-oncesi" | "ipa-1" | "ipa-2" | "ipa-3";

/** 10 AB sektörü (slug = id) */
export interface Sector {
  id: string;          // "yargi", "cevre" ...
  name: string;        // "Yargı"
  icon: string;        // görsel yolu: images/homepage/sectors/yargi.png
  projectCount: number;
  order: number;
}

/** Donör kurumlar (AB, UNDP, WB, KfW, Kalkınma Ajansları ...) */
export interface Donor {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  type: "eu" | "other";  // AB mi, diğer donör mü
  website?: string;
}

/** Projeler */
export interface Project {
  id: string;
  title: string;
  summary: string;
  sectorId: string;
  donorId: string;
  ipaPeriod: IpaPeriod;
  beneficiary: string;      // yararlanıcı kurum
  locations: string[];      // iller
  budget?: string;
  startDate?: string;
  endDate?: string;
  status: "devam" | "tamamlandi" | "planlama";
  featured: boolean;        // ana sayfa vitrininde mi
  coverImage?: string;
  ownerSubscriberId?: string; // projeyi yürüten abone (şirket/STK); boşsa "sahipsiz" arşiv
  isArchive?: boolean;        // admin'in eklediği geçmiş dönem projesi
}

/** Proje sahiplenme talebi — şirket bir arşiv projesini portföyüne ister */
export interface OwnershipRequest {
  id: string;
  projectId: string;
  subscriberId: string;       // talebi yapan abone
  subscriberName: string;     // gösterim için
  note?: string;              // şirketin açıklaması (rol/katkı)
  status: "bekliyor" | "onaylandi" | "reddedildi";
  createdAt: string;          // ISO
}

/** İlan tipleri: iş / satınalma / ihale */
export type ListingType = "is" | "satinalma" | "ihale";

export interface Listing {
  id: string;
  type: ListingType;
  title: string;
  organization: string;
  projectId?: string;
  location?: string;
  deadline?: string;
  locked: boolean;          // satınalma detayı abonelik gerektirir
  description: string;
}

/** Etkinlikler */
export interface EventItem {
  id: string;
  title: string;
  date: string;             // ISO
  location: string;
  projectId?: string;
  isPublic: boolean;        // herkese açık mı
  description?: string;
  capacity?: number;        // kontenjan (opsiyonel)
}

/** Etkinlik katılımcısı / RSVP kaydı (açık etkinlikler) */
export interface EventRegistration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  organization?: string;
  status: "kayitli" | "katildi" | "iptal";
  createdAt: string;        // ISO
}

/** Kapalı toplantı gündem maddesi */
export interface AgendaItem {
  id: string;
  eventId: string;
  order: number;
  title: string;
  durationMin?: number;     // süre (dakika)
  presenter?: string;       // sunan kişi
}

/** Kapalı toplantı davetlisi */
export interface Invitee {
  id: string;
  eventId: string;
  name: string;
  email: string;
  role?: string;            // ekipteki rolü
  inviteStatus: "bekliyor" | "kabul" | "ret";   // davet durumu
  invitedAt: string;        // ISO
}

/** Müsaitlik anketi — önerilen zaman seçeneği */
export interface TimeOption {
  id: string;
  eventId: string;
  start: string;            // ISO datetime
  label?: string;           // "1. seçenek" gibi opsiyonel etiket
}

/** Müsaitlik oyu — bir davetlinin bir zaman seçeneğine uygunluğu */
export interface AvailabilityVote {
  id: string;
  eventId: string;
  optionId: string;
  inviteeId: string;
  available: boolean;       // uygun (true) / uygun değil (false)
}

/** E-Doküman: proje belgesi */
export interface DocItem {
  id: string;
  projectId?: string;       // hangi projeye ait (opsiyonel)
  name: string;             // dosya adı
  category: string;         // "Rapor", "Sözleşme", "Sunum", "Görünürlük"...
  sizeBytes: number;
  mimeType: string;
  url?: string;             // Firebase Storage indirme linki (canlıda)
  access: "ozel" | "ekip" | "herkese-acik";  // erişim seviyesi
  uploadedAt: string;       // ISO
  downloads: number;        // indirme sayısı
  isLearning?: boolean;     // E-Learning materyali olarak işaretli mi
  learningSectorId?: string; // E-Learning'de sınıflandırma sektörü
  learningTopic?: string;   // öğrenme konu başlığı
}

/** E-Learning: harici eğitim videosu */
export interface TrainingVideo {
  id: string;
  title: string;            // eğitim adı
  topic: string;            // konu başlığı
  url: string;              // harici video linki (YouTube/Vimeo vb.)
  sectorId?: string;        // sektör sınıflandırması
  projectId?: string;
  description?: string;
  addedAt: string;          // ISO
}

/** Bülten abonesi / alıcı */
export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  organization?: string;
  tags: string[];           // hedefleme etiketleri ("tedarikci", "ekip", "kamu"...)
  subscribed: boolean;      // abonelik aktif mi
  addedAt: string;          // ISO
}

/** Bülten kampanyası */
export interface Campaign {
  id: string;
  subject: string;
  body: string;             // düz metin / basit HTML
  targetTags: string[];     // hedef etiketler (boşsa herkese)
  status: "taslak" | "gonderildi";
  createdAt: string;        // ISO
  sentAt?: string;          // ISO
  recipientCount: number;   // gönderildiği alıcı sayısı
  openCount: number;        // açılma (canlıda izlenir)
}

/** Paydaş — proje ekibi, uzman, tedarikçi, kamu muhatabı */
export interface Stakeholder {
  id: string;
  projectId?: string;       // hangi projeye ait (opsiyonel)
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  role: string;             // "Proje Koordinatörü", "Mali Uzman"...
  type: "ekip" | "uzman" | "tedarikci" | "kamu" | "diger";
  notes?: string;
  addedAt: string;          // ISO
}

/** Blog / Gündem yazıları */
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  publishedAt: string;
  readMinutes: number;
}

/** Gündem (ana sayfa haber kartları) */
export interface NewsItem {
  id: string;
  kind: "haber" | "duyuru";
  title: string;
  excerpt: string;
  source: string;
  publishedAt: string;
}

/** Ana sayfa canlı sayaçları */
export interface HomeStats {
  projects: number;
  openListings: number;
  upcomingEvents: number;
}

/** Abonelik paketleri */
export interface Plan {
  id: string;
  name: string;
  priceEur: number;        // yıllık, KDV dahil (0 = ücretsiz)
  tagline: string;
  features: string[];
  highlighted: boolean;    // öne çıkan paket
  cta: string;
}
