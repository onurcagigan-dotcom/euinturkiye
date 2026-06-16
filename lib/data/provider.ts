// ============================================================
// DataProvider — Veri Erişim Sözleşmesi
//
// Tüm sayfalar veriye SADECE bu arayüz üzerinden erişir.
// Verinin demo JSON'dan mı yoksa Firestore'dan mı geldiğini
// sayfa kodu BİLMEZ. Kaynak, ortam değişkeniyle seçilir.
//
// Yeni bir kaynak eklemek = bu arayüzü implemente eden
// yeni bir sınıf yazmak. Sayfa kodu hiç değişmez.
// ============================================================

import type {
  Sector,
  Donor,
  Project,
  Listing,
  ListingType,
  EventItem,
  EventRegistration,
  AgendaItem,
  Invitee,
  TimeOption,
  AvailabilityVote,
  DocItem,
  Subscriber,
  Campaign,
  Stakeholder,
  TrainingVideo,
  OwnershipRequest,
  BlogPost,
  NewsItem,
  HomeStats,
} from "../types";

export interface ProjectFilters {
  sectorId?: string;
  donorId?: string;
  ipaPeriod?: string;
  status?: string;
  featured?: boolean;
  search?: string;
}

export interface DataProvider {
  // --- Sektörler ---
  getSectors(): Promise<Sector[]>;
  getSector(id: string): Promise<Sector | null>;

  // --- Donörler ---
  getDonors(): Promise<Donor[]>;
  getDonor(id: string): Promise<Donor | null>;

  // --- Projeler ---
  getProjects(filters?: ProjectFilters): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  getFeaturedProjects(limit?: number): Promise<Project[]>;

  // --- İlanlar ---
  getListings(type?: ListingType): Promise<Listing[]>;
  getListing(id: string): Promise<Listing | null>;

  // --- Etkinlikler ---
  getEvents(onlyUpcoming?: boolean): Promise<EventItem[]>;
  getEvent(id: string): Promise<EventItem | null>;

  // --- Etkinlik kayıtları (RSVP) ---
  getRegistrations(eventId: string): Promise<EventRegistration[]>;
  addRegistration(reg: EventRegistration): Promise<void>;
  updateRegistration(reg: EventRegistration): Promise<void>;
  removeRegistration(id: string): Promise<void>;

  // --- Kapalı toplantı: Gündem ---
  getAgenda(eventId: string): Promise<AgendaItem[]>;
  saveAgendaItem(item: AgendaItem): Promise<void>;
  removeAgendaItem(id: string): Promise<void>;

  // --- Kapalı toplantı: Davetliler ---
  getInvitees(eventId: string): Promise<Invitee[]>;
  saveInvitee(inv: Invitee): Promise<void>;
  removeInvitee(id: string): Promise<void>;

  // --- Kapalı toplantı: Müsaitlik anketi ---
  getTimeOptions(eventId: string): Promise<TimeOption[]>;
  saveTimeOption(opt: TimeOption): Promise<void>;
  removeTimeOption(id: string): Promise<void>;
  getVotes(eventId: string): Promise<AvailabilityVote[]>;
  setVote(vote: AvailabilityVote): Promise<void>;

  // --- E-Doküman ---
  getDocs(projectId?: string): Promise<DocItem[]>;
  saveDoc(item: DocItem): Promise<void>;
  removeDoc(id: string): Promise<void>;
  incrementDownload(id: string): Promise<void>;

  // --- Bülten: Aboneler ---
  getSubscribers(): Promise<Subscriber[]>;
  saveSubscriber(sub: Subscriber): Promise<void>;
  removeSubscriber(id: string): Promise<void>;

  // --- Bülten: Kampanyalar ---
  getCampaigns(): Promise<Campaign[]>;
  saveCampaign(c: Campaign): Promise<void>;
  removeCampaign(id: string): Promise<void>;

  // --- Paydaş İletişimi ---
  getStakeholders(projectId?: string): Promise<Stakeholder[]>;
  saveStakeholder(s: Stakeholder): Promise<void>;
  removeStakeholder(id: string): Promise<void>;

  // --- E-Learning ---
  getLearningDocs(): Promise<DocItem[]>;       // isLearning=true olan belgeler
  getTrainingVideos(): Promise<TrainingVideo[]>;
  saveTrainingVideo(v: TrainingVideo): Promise<void>;
  removeTrainingVideo(id: string): Promise<void>;

  // --- Proje sahiplenme talepleri ---
  getOwnershipRequests(): Promise<OwnershipRequest[]>;
  saveOwnershipRequest(r: OwnershipRequest): Promise<void>;
  removeOwnershipRequest(id: string): Promise<void>;
  // Projeye sahip atar (onay sonucu) — projenin ownerSubscriberId'sini günceller
  assignProjectOwner(projectId: string, subscriberId: string | undefined): Promise<void>;

  // --- Blog / Gündem ---
  getBlogPosts(limit?: number): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | null>;

  // --- Ana sayfa haberleri ---
  getNews(limit?: number): Promise<NewsItem[]>;

  // --- İstatistikler ---
  getHomeStats(): Promise<HomeStats>;
}
