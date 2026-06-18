// ============================================================
// Merkezi Tip Tanımları — euinturkiye.com
// ============================================================

export type IpaPeriod = "IPA-I" | "IPA-II" | "IPA-III";

export interface Sector {
  id: string;
  name: string;
  iconUrl?: string;
  color?: string;
}

export interface Donor {
  id: string;
  name: string;
  logoUrl?: string;
  country?: string;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  sectorId: string;
  donorId: string;
  ipaPeriod: IpaPeriod;
  beneficiary: string;
  locations: string[];
  budget?: string;
  startDate?: string;
  endDate?: string;
  status: "devam" | "tamamlandi";
  featured: boolean;
  coverImage?: string;
  // İçerik alanları (detay sayfası)
  objective?: string;
  expectedOutputs?: string;
  activities?: string;
  // Yürütücü / konsorsiyum lideri (boşsa proje "yürütücüsüz" sayılır)
  ownerSubscriberId?: string;
  ownerSubscriberName?: string;
  // Onaylanmış konsorsiyum üyeleri (yürütücü hariç)
  consortiumMembers?: ConsortiumMember[];
}

export type ListingType = "is" | "satinalma" | "ihale";

export interface ListingDocument {
  name: string;
  url?: string;
  fileSize?: string;
}

export interface Listing {
  id: string;
  type: ListingType;
  title: string;
  organization: string;
  projectId?: string;
  location?: string;
  publishedAt?: string;
  deadline?: string;
  locked: boolean;
  description: string;
  subject?: string; // İhaleye/satınalmaya konu iş — kısa özet
  budget?: string;
  referenceNo?: string;
  contactEmail?: string;
  documentUrl?: string; // geriye dönük uyumluluk için
  documents?: ListingDocument[];
  /** İlanı yayınlayan abone (firma profili sayfasında "Firmanın İlanları" listelemek için) */
  publisherSubscriberId?: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  projectId?: string;
  isPublic: boolean;
  description?: string;
  capacity?: number;
  agenda?: AgendaItem[];
  /** Etkinliği oluşturan abone (firma paneli üzerinden oluşturulmuşsa) */
  organizerSubscriberId?: string;
  /** Etkinliğe eklenmiş dosyalar (gündem dokümanı, sunum, vb.) */
  attachments?: EventAttachment[];
  /** Tarih netleşmeden önce katılımcılardan müsaitlik toplamak için anket seçenekleri */
  availabilityPoll?: AvailabilityPollOption[];
}

export interface EventAttachment {
  id: string;
  name: string;
  fileSize?: string;
  uploadedAt: string;
}

export interface AvailabilityPollOption {
  id: string;
  label: string;
  /** Bu seçeneği uygun bulan davetlilerin e-postaları */
  votes: string[];
}

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  presenter?: string;
  durationMin: number;
}

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
  projectId?: string;
}

export interface NewsItem {
  id: string;
  kind: "haber" | "duyuru";
  title: string;
  excerpt: string;
  source: string;
  publishedAt: string;
}

export interface HomeStats {
  projects: number;
  openListings: number;
  upcomingEvents: number;
}

// --- Dijital Araçlar ---

export interface EventRsvp {
  id: string;
  eventId: string;
  name: string;
  email: string;
  organization?: string;
  status: "onaylandi" | "bekliyor" | "iptal";
  createdAt: string;
  /** Davetiyenin gönderilip gönderilmediği (organizatör tarafından davet edilmiş mi, yoksa kendiliğinden mi kayıt oldu) */
  invited?: boolean;
  invitedAt?: string;
  /** LCV yanıtının geldiği tarih (status değiştiğinde) */
  respondedAt?: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  category: "rapor" | "sunum" | "sozlesme" | "diger";
  accessLevel: "herkes" | "uye" | "ekip";
  fileUrl?: string;
  fileSize?: string;
  uploadedAt: string;
  downloadCount: number;
}

/**
 * Bir aboneliğin platformdaki rolünü belirler. Yetkiler ve görünür alanlar buna göre değişir:
 * - firma / stk: proje yürütme/konsorsiyum üyeliği, uzman CV'si, iş ilanı ve satınalma ilanı verebilir
 * - tedarikci: sadece tedarikçi paywall'lı ilanları görebilir, kendi iş ilanı/satınalma ilanı verebilir
 * - delegasyon / program_otoritesi: ihale ilanı verme yetkisine sahip tek profil türleri
 */
export type SubscriberProfileType = "firma" | "stk" | "tedarikci" | "delegasyon" | "program_otoritesi";

export interface SocialLinks {
  website?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
}

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  organization?: string;
  accountType: "sirket" | "stk";
  /** Profilin platformdaki rolü — yetkileri ve görebileceği/girebileceği alanları belirler */
  profileType: SubscriberProfileType;
  plan: "ucretsiz" | "paket1" | "paket2" | "tedarikci";
  tags: string[];
  createdAt: string;

  // --- Genel/herkese açık firma profil sayfası alanları ---
  logoUrl?: string;
  shortBio?: string;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  socialLinks?: SocialLinks;
  /** Profil sayfası herkese açık olarak yayınlanmış mı (admin onayı/firma tercihi) */
  profilePublic?: boolean;
}

/** Bir profil türünün ihale ilanı verme yetkisi olup olmadığını döner. */
export function canPostTender(profileType: SubscriberProfileType): boolean {
  return profileType === "delegasyon" || profileType === "program_otoritesi";
}

export interface Campaign {
  id: string;
  subject: string;
  body: string;
  targetTags: string[];
  /** Bültene eklenen proje haberleri/blog yazıları (id listesi) */
  includedPostIds?: string[];
  /** Doğrudan tek tek seçilmiş alıcılar (abone id) — targetTags'e ek olarak */
  explicitRecipientIds?: string[];
  status: "taslak" | "gonderildi";
  createdAt: string;
  sentAt?: string;
  recipientCount: number;
  openCount: number;
}

export interface Stakeholder {
  id: string;
  projectId: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  role: string;
  type: "ekip" | "uzman" | "tedarikci" | "kamu" | "diger";
  notes?: string;
  addedAt: string;
}

/**
 * Bir firmanın kendi ağına eklediği tedarikçi/uzman bağlantıları.
 * Basit bir kısayol/favoriler listesi gibi çalışır: firma bir uzman ya da
 * tedarikçi profilini "ağıma ekle" diyerek kaydeder, onay akışı gerekmez.
 */
export interface NetworkConnection {
  id: string;
  /** Bu bağlantıyı ekleyen firma/abone */
  ownerSubscriberId: string;
  /** Eklenen profilin türü */
  targetType: "uzman" | "tedarikci";
  /** Eklenen uzmanın expert profile id'si veya tedarikçinin subscriber id'si */
  targetId: string;
  /** Görüntüleme için ad bilgisi (denormalize edilmiş) */
  targetName: string;
  addedAt: string;
}

/**
 * Firmaların eklediği eğitim materyalleri: video veya doküman (PDF, sunum vb.).
 * Adı geçmişten kalan "TrainingVideo" ama artık video dışı materyalleri de kapsar.
 */
export interface TrainingVideo {
  id: string;
  title: string;
  description?: string;
  /** Materyal türü: video (embed link) veya doküman (PDF/sunum) */
  kind: "video" | "dokuman";
  /** kind="video" ise embed URL; kind="dokuman" ise dosya adı/yolu */
  videoUrl?: string;
  documentName?: string;
  documentSize?: string;
  duration?: string;
  category?: string;
  /** Hangi proje kapsamında üretildiği */
  projectId?: string;
  /** Arama ve filtreleme için anahtar kelimeler */
  keywords?: string[];
  /** Materyali ekleyen abone (firma paneli üzerinden eklenmişse) */
  uploaderSubscriberId?: string;
  order: number;
}

/** Konsorsiyum içindeki bir üye firma/STK */
export interface ConsortiumMember {
  subscriberId: string;
  subscriberName: string;
  role?: string; // örn: "Teknik Ortak", "Mali Ortak"
  joinedAt: string; // ISO
}

/**
 * Bir firma/STK'nın bir projeye katılma talebi.
 * - requestedRole: firmanın talep ettiği rol
 * - approverType: talebin kimin onayına gideceği (proje yürütücüsü var mı yok mu'ya göre belirlenir)
 * - approverSubscriberId: approverType "yurutucu" ise hangi firmanın onayına gittiği
 */
export interface OwnershipRequest {
  id: string;
  projectId: string;
  subscriberId: string;
  subscriberName: string;
  requestedRole: "yurutucu" | "uye";
  approverType: "admin" | "yurutucu";
  approverSubscriberId?: string;
  note?: string;
  status: "bekliyor" | "onaylandi" | "reddedildi";
  createdAt: string;
  resolvedAt?: string;
}

export interface ExpertProfile {
  id: string;
  subscriberId: string;
  name: string;
  title: string;
  bio?: string;
  expertise: string[];
  projectHistory: { projectId: string; role: string }[];
  cvDocUrl?: string;
  visible: boolean;
  updatedAt: string;
}

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  type: "portfolio" | "listing" | "event" | "subscriber";
}
