import type {
  Sector, Donor, Project, Listing, ListingType, EventItem, BlogPost,
  HomeStats, EventRsvp, ProjectDocument, Subscriber, Campaign,
  Stakeholder, TrainingVideo, OwnershipRequest, ExpertProfile, NetworkConnection,
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
  // Sektörler
  getSectors(): Promise<Sector[]>;
  getSector(id: string): Promise<Sector | null>;

  // Donörler
  getDonors(): Promise<Donor[]>;
  getDonor(id: string): Promise<Donor | null>;

  // Projeler
  getProjects(filters?: ProjectFilters): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  saveProject(p: Project): Promise<void>;
  removeProject(id: string): Promise<void>;

  // İlanlar
  getListings(type?: ListingType): Promise<Listing[]>;
  getListing(id: string): Promise<Listing | null>;
  saveListing(l: Listing): Promise<void>;
  removeListing(id: string): Promise<void>;

  // Etkinlikler
  getEvents(): Promise<EventItem[]>;
  getEvent(id: string): Promise<EventItem | null>;
  saveEvent(e: EventItem): Promise<void>;
  removeEvent(id: string): Promise<void>;

  // Blog / Gündem
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | null>;
  saveBlogPost(p: BlogPost): Promise<void>;
  removeBlogPost(id: string): Promise<void>;

  // Ana sayfa
  getHomeStats(): Promise<HomeStats>;

  // RSVP (Etkinlik katılım)
  getRsvps(eventId: string): Promise<EventRsvp[]>;
  saveRsvp(r: EventRsvp): Promise<void>;
  removeRsvp(id: string): Promise<void>;

  // E-Doküman
  getDocuments(projectId?: string): Promise<ProjectDocument[]>;
  saveDocument(d: ProjectDocument): Promise<void>;
  removeDocument(id: string): Promise<void>;
  incrementDownload(docId: string): Promise<void>;

  // Aboneler
  getSubscribers(): Promise<Subscriber[]>;
  getSubscriber(id: string): Promise<Subscriber | null>;
  saveSubscriber(s: Subscriber): Promise<void>;
  removeSubscriber(id: string): Promise<void>;

  // Bülten kampanyaları
  getCampaigns(): Promise<Campaign[]>;
  saveCampaign(c: Campaign): Promise<void>;
  removeCampaign(id: string): Promise<void>;

  // Paydaş İletişimi
  getStakeholders(projectId?: string): Promise<Stakeholder[]>;
  saveStakeholder(s: Stakeholder): Promise<void>;
  removeStakeholder(id: string): Promise<void>;

  // E-Learning
  getTrainingVideos(): Promise<TrainingVideo[]>;
  saveTrainingVideo(v: TrainingVideo): Promise<void>;
  removeTrainingVideo(id: string): Promise<void>;

  // Proje sahiplenme / konsorsiyum üyelik talepleri
  getOwnershipRequests(): Promise<OwnershipRequest[]>;
  getOwnershipRequestsFor(filter: { subscriberId?: string; approverSubscriberId?: string; projectId?: string }): Promise<OwnershipRequest[]>;
  /** Bir firmanın bir projeye katılma talebi oluşturur. approverType ve approverSubscriberId,
   *  projenin mevcut yürütücüsüne göre otomatik belirlenir (proje yürütücüsüzse admin'e, varsa yürütücüye gider). */
  createOwnershipRequest(input: {
    projectId: string;
    subscriberId: string;
    subscriberName: string;
    requestedRole: "yurutucu" | "uye";
    note?: string;
  }): Promise<OwnershipRequest>;
  /** Talebi onaylar/reddeder. Onaylanırsa projeye yürütücü atanır veya konsorsiyum üyesi eklenir. */
  resolveOwnershipRequest(id: string, status: "onaylandi" | "reddedildi"): Promise<void>;
  /** Admin'in doğrudan ata/çıkar işlemleri (panel kısayolu) */
  assignProjectOwner(projectId: string, subscriberId: string | undefined, subscriberName?: string): Promise<void>;
  removeConsortiumMember(projectId: string, subscriberId: string): Promise<void>;

  // Uzman profilleri
  getExpertProfiles(): Promise<ExpertProfile[]>;
  getExpertProfile(id: string): Promise<ExpertProfile | null>;
  saveExpertProfile(p: ExpertProfile): Promise<void>;
  removeExpertProfile(id: string): Promise<void>;
  getProjectExperts(projectId: string): Promise<{ profile: ExpertProfile; expertise: string; role: string }[]>;

  // Paydaş ağı (firmanın eklediği uzman/tedarikçi kısayolları)
  getNetworkConnections(ownerSubscriberId: string): Promise<NetworkConnection[]>;
  addNetworkConnection(c: Omit<NetworkConnection, "id" | "addedAt">): Promise<void>;
  removeNetworkConnection(id: string): Promise<void>;
}
