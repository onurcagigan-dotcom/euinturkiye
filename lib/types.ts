// ============================================================
// Merkezi Tip Tanımları — euinturkiye.com
// ============================================================

export type IpaPeriod = "IPA-I" | "IPA-II" | "IPA-III";

export interface Sector {
  id: string;
  name: string;
  nameEn?: string;
  iconUrl?: string;
  color?: string;
}

export interface Donor {
  id: string;
  name: string;
  nameEn?: string;
  logoUrl?: string;
  country?: string;
  countryEn?: string;
}

export interface Project {
  id: string;
  title: string;
  titleEn?: string;
  summary: string;
  sectorId: string;
  donorId: string;
  ipaPeriod: IpaPeriod;
  beneficiary: string;
  beneficiaryEn?: string;
  locations: string[];
  budget?: string;          // gösterim için (ör. "€ 2.5M")
  euBudget?: number;        // AB katkısı (€, sayısal)
  totalBudget?: number;     // toplam bütçe (€, sayısal)
  priorityArea?: string;    // öncelik alanı
  priorityAreaEn?: string;
  startDate?: string;
  endDate?: string;
  status: "devam" | "tamamlandi";
  featured: boolean;
  coverImage?: string;
  // İçerik alanları (detay sayfası)
  objective?: string;
  objectiveEn?: string;
  specificObjectives?: string;
  specificObjectivesEn?: string;
  expectedOutputs?: string;
  expectedOutputsEn?: string;
  activities?: string;
  // Yürütücü / konsorsiyum lideri (boşsa proje "yürütücüsüz" sayılır)
  ownerSubscriberId?: string;
  ownerSubscriberName?: string;
  // Onaylanmış konsorsiyum üyeleri (yürütücü hariç)
  consortiumMembers?: ConsortiumMember[];
  // İletişim & sosyal medya
  contactEmail?: string;
  contactPhone?: string;
  projectWebsiteUrl?: string;      // proje kendi web sitesi (harici)
  socialTwitter?: string;          // @handle veya URL
  socialLinkedin?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialYoutube?: string;
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
  projectId?: string;              // Hangi projeye ait
  location?: string;
  publishedAt?: string;
  /** Yayından kalkma tarihi — otomatik pasifleşme için */
  expiresAt?: string;
  deadline?: string;               // Başvuru/teklif son tarihi
  locked: boolean;
  description: string;
  subject?: string;
  budget?: string;
  referenceNo?: string;
  contactEmail?: string;
  documentUrl?: string;
  documents?: ListingDocument[];
  publisherSubscriberId?: string;
  /** Aktif mi yoksa süresi dolmuş/gizlenmiş mi */
  isActive?: boolean;
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

export interface PollVote {
  email: string;
  name?: string;
  votedAt: string;
}

export interface AvailabilityPollOption {
  id: string;
  label: string;
  /** Bu seçeneği uygun bulan davetlilerin e-postaları (geriye dönük uyum) */
  votes: string[];
  /** Detaylı oy kaydı */
  voteDetails?: PollVote[];
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
export type SubscriberProfileType = "firma" | "stk" | "tedarikci" | "delegasyon" | "program_otoritesi" | "admin2";

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
  /** Profilin platformdaki rolü */
  profileType: SubscriberProfileType;
  plan: "uzman" | "yonetici" | "tedarikci";
  tags: string[];
  createdAt: string;

  // --- Herkese açık profil alanları ---
  logoUrl?: string;
  shortBio?: string;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  socialLinks?: SocialLinks;
  profilePublic?: boolean;

  // --- Firma/STK genişletilmiş profil ---
  foundedYear?: number;
  employeeCount?: string;          // "1-10" | "11-50" | "51-200" | "201+"
  services?: string[];             // Sunulan hizmetler
  sectorIds?: string[];            // Faaliyet sektörleri
  mission?: string;                // STK için misyon/vizyon

  // --- Tedarikçi profili ---
  supplierGoods?: string[];        // Sağlanan mallar (detaylı)
  supplierServices?: string[];     // Verilen hizmetler (detaylı)
  supplierCertifications?: string[]; // Sahip olunan sertifikalar
  supplierCapacity?: string;       // Kapasite/yıllık ciro bilgisi
  supplierRegions?: string[];      // Hizmet verilen bölgeler

  // --- Kurum / Admin2 tanımlı profil ---
  institutionType?: "kamu" | "ozel" | "stk" | "uluslararasi"; // Kurum türü
  institutionWebsite?: string;
  primaryContactName?: string;
  primaryContactTitle?: string;
  primaryContactPhone?: string;
  primaryContactEmail?: string;

  // --- Admin2 yetki bilgisi ---
  isAdmin2?: boolean;              // Bu hesap admin2 yetkisine sahip mi
  admin2GrantedAt?: string;        // Admin2 yetkisi ne zaman verildi
  admin2GrantedBy?: string;        // Kim verdi (admin sub ID)
}

/** Adres defteri grubu — firma kendi gruplarını oluşturur */
export interface AddressGroup {
  id: string;
  ownerSubscriberId: string;
  name: string;                    // "Tarım Projesi Ekibi", "Potansiyel Tedarikçiler"
  description?: string;
  memberIds: string[];             // subscriber id listesi
  createdAt: string;
}

/** Bir profil türünün ihale ilanı verme yetkisi olup olmadığını döner. */
/** İzlenen ilan — tedarikçi veya firma tarafından kaydedilen ilan */
export interface SavedListing {
  id: string;
  subscriberId: string;
  listingId: string;
  savedAt: string;
  notes?: string;
}

/** Admin2 tarafından yapılan içerik düzenlemelerinin logu */
export interface EditLog {
  id: string;
  editorSubscriberId: string;
  editorName: string;
  entityType: "project" | "listing" | "expert" | "subscriber";
  entityId: string;
  editedAt: string;
  summary?: string;
}

export function canPostTender(profileType: SubscriberProfileType): boolean {
  return profileType === "delegasyon" || profileType === "program_otoritesi" || profileType === "admin2";
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
  /** Bülteni oluşturan/gönderen firma/kurum */
  publisherSubscriberId?: string;
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

// ─── Anket (Survey) ──────────────────────────────────────────
export type SurveyQuestionType = "multiple_choice" | "open_ended" | "rating" | "yes_no";

export interface SurveyQuestion {
  id: string;
  type: SurveyQuestionType;
  text: string;
  options?: string[];     // multiple_choice için seçenekler
  required: boolean;
}

export interface Survey {
  id: string;
  ownerSubscriberId: string;
  ownerName: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  status: "taslak" | "aktif" | "kapali";
  createdAt: string;
  closedAt?: string;
  projectId?: string;     // isteğe bağlı proje bağlantısı
  allowAnonymous: boolean;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentSubscriberId?: string;
  respondentName?: string;
  answers: { questionId: string; value: string | string[] }[];
  submittedAt: string;
}

// ─── Program/Proje İhalesi (Tender) ─────────────────────────
// "ihale" tipi ilan zaten ListingType içinde var ("ihale").
// Burada ihale görünürlük kontrolü için yardımcı fonksiyon:
export function canViewTenderDetails(plan: "uzman" | "yonetici" | "tedarikci"): boolean {
  return plan === "yonetici" || plan === "tedarikci";
}

// ─── Kurum Profili (admin2 tarafından oluşturulan) ───────────
export interface InstitutionProfile {
  id: string;
  createdBySubscriberId: string; // admin2 olan kişi
  subscriberId?: string;         // eğer platformda kayıtlı subscriber ile eşleşiyorsa
  name: string;
  shortName?: string;
  institutionType: "kamu" | "ozel" | "stk" | "uluslararasi";
  description?: string;
  sectorIds?: string[];
  website?: string;
  contactName?: string;
  contactTitle?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
  editLog?: EditLog[];
}

// ─── Proje Web Sitesi ────────────────────────────────────────
export type WebsiteTemplateId = "minimal" | "bold" | "academic" | "impact";
export type WebsiteHeaderVersion = 1 | 2 | 3;

export interface WebsiteFooterLogo {
  id: string;
  /** "library" = hazır kütüphaneden, "custom" = kullanıcı yükledi */
  source: "library" | "custom";
  /** Kütüphane logosu için tanımlayıcı (ör. "eu", "mfib", "tcdd") */
  libraryKey?: string;
  /** Custom yükleme için base64 veya URL */
  imageUrl?: string;
  label?: string;   // isteğe bağlı alt yazı
  order: number;
}

export interface ProjectWebsite {
  id: string;
  projectId: string;
  ownerSubscriberId: string;
  /** URL kısa adı — euinturkiye.com/p/[slug] */
  slug: string;
  templateId: WebsiteTemplateId;
  headerVersion: WebsiteHeaderVersion;
  /** TR için header içeriği */
  headerTr: {
    logoUrl?: string;
    title: string;
    subtitle?: string;
    tagline?: string;
  };
  /** EN için header içeriği */
  headerEn: {
    logoUrl?: string;
    title: string;
    subtitle?: string;
    tagline?: string;
  };
  /** Hero banner */
  heroBanner?: {
    enabled: boolean;
    imageUrl?: string;          // base64 veya URL
    overlayOpacity?: number;    // 0–1 arası, varsayılan 0.45
    height?: "sm" | "md" | "lg"; // 300 / 450 / 580 px
    ctaLabel?: string;
    ctaLabelEn?: string;
    ctaUrl?: string;
  };
  /** Navigasyon menüsü */
  navMenu?: {
    enabled: boolean;
    items: { label: string; labelEn?: string; href: string }[];
  };
  footerLogos: WebsiteFooterLogo[];
  /** Yayın durumu */
  published: boolean;
  createdAt: string;
  updatedAt: string;
  /** Özel renk tercihleri */
  accentColor?: string;
  /** İçerik blokları */
  showObjective?: boolean;
  showOutputs?: boolean;
  showLocations?: boolean;
  showBudget?: boolean;
  showConsortium?: boolean;
  showTeam?: boolean;          // Ekip
  showDocuments?: boolean;     // Paylaşılan dosyalar
  showNews?: boolean;          // Haberler
  showEvents?: boolean;        // Etkinlikler
  showContact?: boolean;       // İletişim & sosyal medya
}
