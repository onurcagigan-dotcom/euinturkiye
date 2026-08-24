import type {
  Sector, Donor, Project, Listing, ListingType, EventItem, BlogPost,
  HomeStats, EventRsvp, ProjectDocument, Subscriber, Campaign,
  Stakeholder, TrainingVideo, OwnershipRequest, ExpertProfile, NetworkConnection,
  AddressGroup, SavedListing, EditLog, Survey, SurveyResponse, InstitutionProfile,
  ProjectWebsite,
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

  // Admin — filtresiz tam erişim (IPA + demo hepsi, demo rol gerekmez)
  getAllProjectsForAdmin(): Promise<Project[]>;
  getAllListingsForAdmin(): Promise<Listing[]>;
  getAllEventsForAdmin(): Promise<EventItem[]>;
  getAllBlogPostsForAdmin(): Promise<BlogPost[]>;
  getAllSubscribersForAdmin(): Promise<Subscriber[]>;

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
  createOwnershipRequest(input: {
    projectId: string;
    subscriberId: string;
    subscriberName: string;
    requestedRole: "yurutucu" | "uye";
    note?: string;
  }): Promise<OwnershipRequest>;
  resolveOwnershipRequest(id: string, status: "onaylandi" | "reddedildi"): Promise<void>;
  assignProjectOwner(projectId: string, subscriberId: string | undefined, subscriberName?: string): Promise<void>;
  removeConsortiumMember(projectId: string, subscriberId: string): Promise<void>;

  // Uzman profilleri
  getExpertProfiles(): Promise<ExpertProfile[]>;
  getExpertProfile(id: string): Promise<ExpertProfile | null>;
  saveExpertProfile(p: ExpertProfile): Promise<void>;
  removeExpertProfile(id: string): Promise<void>;
  getProjectExperts(projectId: string): Promise<{ profile: ExpertProfile; expertise: string; role: string }[]>;

  // Paydaş ağı
  getNetworkConnections(ownerSubscriberId: string): Promise<NetworkConnection[]>;
  addNetworkConnection(c: Omit<NetworkConnection, "id" | "addedAt">): Promise<void>;
  removeNetworkConnection(id: string): Promise<void>;

  // Adres defteri grupları
  getAddressGroups(ownerSubscriberId: string): Promise<AddressGroup[]>;
  saveAddressGroup(g: AddressGroup): Promise<void>;
  removeAddressGroup(id: string): Promise<void>;

  // İzlenen ilanlar
  getSavedListings(subscriberId: string): Promise<SavedListing[]>;
  saveListing_bookmark(s: SavedListing): Promise<void>;
  removeSavedListing(id: string): Promise<void>;

  // Admin2 düzenleme logu
  getEditLogs(entityId?: string): Promise<EditLog[]>;
  saveEditLog(log: EditLog): Promise<void>;

  // Anketler
  getSurveys(ownerSubscriberId?: string): Promise<Survey[]>;
  getSurvey(id: string): Promise<Survey | null>;
  saveSurvey(s: Survey): Promise<void>;
  removeSurvey(id: string): Promise<void>;
  getSurveyResponses(surveyId: string): Promise<SurveyResponse[]>;
  saveSurveyResponse(r: SurveyResponse): Promise<void>;

  // Kurum profilleri (admin2 tarafından yönetilen)
  getInstitutionProfiles(): Promise<InstitutionProfile[]>;
  getInstitutionProfile(id: string): Promise<InstitutionProfile | null>;
  saveInstitutionProfile(p: InstitutionProfile): Promise<void>;
  removeInstitutionProfile(id: string): Promise<void>;

  // Proje web sitesi
  getProjectWebsite(projectId: string): Promise<ProjectWebsite | null>;
  getProjectWebsiteBySlug(slug: string): Promise<ProjectWebsite | null>;
  saveProjectWebsite(w: ProjectWebsite): Promise<void>;
  isSlugAvailable(slug: string, excludeProjectId?: string): Promise<boolean>;
}
