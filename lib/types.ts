// ============================================================
// Merkezi Tip Tanımları — euinturkiye.com
// ============================================================

export type IpaPeriod = "IPA-I" | "IPA-II" | "IPA-III" | "IPA-IV";

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
  status: "devam" | "tamamlandi" | "planlama";
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

export interface Listing {
  id: string;
  type: ListingType;
  title: string;
  organization: string;
  projectId?: string;
  location?: string;
  deadline?: string;
  locked: boolean;
  description: string;
  documentUrl?: string;
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

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  organization?: string;
  accountType: "sirket" | "stk";
  plan: "ucretsiz" | "paket1" | "paket2" | "tedarikci";
  tags: string[];
  createdAt: string;
}

export interface Campaign {
  id: string;
  subject: string;
  body: string;
  targetTags: string[];
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

export interface TrainingVideo {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration?: string;
  category?: string;
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
