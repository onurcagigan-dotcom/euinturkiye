import type {
  Sector, Donor, Project, Listing, ListingType, EventItem, BlogPost,
  HomeStats, EventRsvp, ProjectDocument, Subscriber, Campaign,
  Stakeholder, TrainingVideo, OwnershipRequest, ExpertProfile,
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

  // Proje sahiplenme talepleri
  getOwnershipRequests(): Promise<OwnershipRequest[]>;
  saveOwnershipRequest(r: OwnershipRequest): Promise<void>;
  updateOwnershipStatus(id: string, status: "onaylandi" | "reddedildi"): Promise<void>;
  assignProjectOwner(projectId: string, subscriberId: string | undefined): Promise<void>;

  // Uzman profilleri
  getExpertProfiles(): Promise<ExpertProfile[]>;
  getExpertProfile(id: string): Promise<ExpertProfile | null>;
  saveExpertProfile(p: ExpertProfile): Promise<void>;
  removeExpertProfile(id: string): Promise<void>;
  getProjectExperts(projectId: string): Promise<{ profile: ExpertProfile; expertise: string; role: string }[]>;
}
