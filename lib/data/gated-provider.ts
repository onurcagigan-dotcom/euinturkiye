import type { DataProvider, ProjectFilters } from "./provider";
import type {
  Sector, Donor, Project, Listing, ListingType, EventItem, BlogPost,
  HomeStats, EventRsvp, ProjectDocument, Subscriber, Campaign,
  Stakeholder, TrainingVideo, OwnershipRequest, ExpertProfile, NetworkConnection,
  AddressGroup, SavedListing, EditLog, Survey, SurveyResponse, InstitutionProfile,
  ProjectWebsite,
} from "../types";
import { isDemoVerified } from "../demo-access";

const EMPTY_STATS: HomeStats = {
  projects: 0, openListings: 0, upcomingEvents: 0,
};

/**
 * Gerçek veri sağlayıcısını sarmalar: doğrulama yapılmadan (isDemoVerified() === false)
 * tüm OKUMA çağrıları boş/sıfır sonuç döndürür, böylece site "boş" görünür.
 * Yazma işlemleri (admin panelinden gelen save/remove/create/resolve/assign/increment)
 * kısıtlanmaz, çünkü admin erişimi ayrı bir konudur ve admin paneli zaten kendi ayrı
 * veri kopyasını (AdminStore) kullanır.
 */
export class GatedDataProvider implements DataProvider {
  constructor(private inner: DataProvider) {}

  private get allowed(): boolean {
    return isDemoVerified();
  }

  getSectors(): Promise<Sector[]> { return this.allowed ? this.inner.getSectors() : Promise.resolve([]); }
  getSector(id: string): Promise<Sector | null> { return this.allowed ? this.inner.getSector(id) : Promise.resolve(null); }

  getDonors(): Promise<Donor[]> { return this.allowed ? this.inner.getDonors() : Promise.resolve([]); }
  getDonor(id: string): Promise<Donor | null> { return this.allowed ? this.inner.getDonor(id) : Promise.resolve(null); }

  getProjects(filters?: ProjectFilters): Promise<Project[]> { return this.allowed ? this.inner.getProjects(filters) : Promise.resolve([]); }
  getProject(id: string): Promise<Project | null> { return this.allowed ? this.inner.getProject(id) : Promise.resolve(null); }
  saveProject(p: Project): Promise<void> { return this.inner.saveProject(p); }
  removeProject(id: string): Promise<void> { return this.inner.removeProject(id); }

  // Admin — gating'den muaf, her zaman tam veri
  getAllProjectsForAdmin(): Promise<Project[]> { return this.inner.getAllProjectsForAdmin(); }
  getAllListingsForAdmin(): Promise<Listing[]> { return this.inner.getAllListingsForAdmin(); }
  getAllEventsForAdmin(): Promise<EventItem[]> { return this.inner.getAllEventsForAdmin(); }
  getAllBlogPostsForAdmin(): Promise<BlogPost[]> { return this.inner.getAllBlogPostsForAdmin(); }
  getAllSubscribersForAdmin(): Promise<Subscriber[]> { return this.inner.getAllSubscribersForAdmin(); }

  getListings(type?: ListingType): Promise<Listing[]> { return this.allowed ? this.inner.getListings(type) : Promise.resolve([]); }
  getListing(id: string): Promise<Listing | null> { return this.allowed ? this.inner.getListing(id) : Promise.resolve(null); }
  saveListing(l: Listing): Promise<void> { return this.inner.saveListing(l); }
  removeListing(id: string): Promise<void> { return this.inner.removeListing(id); }

  getEvents(): Promise<EventItem[]> { return this.allowed ? this.inner.getEvents() : Promise.resolve([]); }
  getEvent(id: string): Promise<EventItem | null> { return this.allowed ? this.inner.getEvent(id) : Promise.resolve(null); }
  saveEvent(e: EventItem): Promise<void> { return this.inner.saveEvent(e); }
  removeEvent(id: string): Promise<void> { return this.inner.removeEvent(id); }

  getBlogPosts(): Promise<BlogPost[]> { return this.allowed ? this.inner.getBlogPosts() : Promise.resolve([]); }
  getBlogPost(slug: string): Promise<BlogPost | null> { return this.allowed ? this.inner.getBlogPost(slug) : Promise.resolve(null); }
  saveBlogPost(p: BlogPost): Promise<void> { return this.inner.saveBlogPost(p); }
  removeBlogPost(id: string): Promise<void> { return this.inner.removeBlogPost(id); }

  getHomeStats(): Promise<HomeStats> { return this.allowed ? this.inner.getHomeStats() : Promise.resolve(EMPTY_STATS); }

  getRsvps(eventId: string): Promise<EventRsvp[]> { return this.allowed ? this.inner.getRsvps(eventId) : Promise.resolve([]); }
  saveRsvp(r: EventRsvp): Promise<void> { return this.inner.saveRsvp(r); }
  removeRsvp(id: string): Promise<void> { return this.inner.removeRsvp(id); }

  getDocuments(projectId?: string): Promise<ProjectDocument[]> { return this.allowed ? this.inner.getDocuments(projectId) : Promise.resolve([]); }
  saveDocument(d: ProjectDocument): Promise<void> { return this.inner.saveDocument(d); }
  removeDocument(id: string): Promise<void> { return this.inner.removeDocument(id); }
  incrementDownload(docId: string): Promise<void> { return this.inner.incrementDownload(docId); }

  getSubscribers(): Promise<Subscriber[]> { return this.allowed ? this.inner.getSubscribers() : Promise.resolve([]); }
  getSubscriber(id: string): Promise<Subscriber | null> { return this.allowed ? this.inner.getSubscriber(id) : Promise.resolve(null); }
  saveSubscriber(s: Subscriber): Promise<void> { return this.inner.saveSubscriber(s); }
  removeSubscriber(id: string): Promise<void> { return this.inner.removeSubscriber(id); }

  getCampaigns(): Promise<Campaign[]> { return this.allowed ? this.inner.getCampaigns() : Promise.resolve([]); }
  saveCampaign(c: Campaign): Promise<void> { return this.inner.saveCampaign(c); }
  removeCampaign(id: string): Promise<void> { return this.inner.removeCampaign(id); }

  getStakeholders(projectId?: string): Promise<Stakeholder[]> { return this.allowed ? this.inner.getStakeholders(projectId) : Promise.resolve([]); }
  saveStakeholder(s: Stakeholder): Promise<void> { return this.inner.saveStakeholder(s); }
  removeStakeholder(id: string): Promise<void> { return this.inner.removeStakeholder(id); }

  getTrainingVideos(): Promise<TrainingVideo[]> { return this.allowed ? this.inner.getTrainingVideos() : Promise.resolve([]); }
  saveTrainingVideo(v: TrainingVideo): Promise<void> { return this.inner.saveTrainingVideo(v); }
  removeTrainingVideo(id: string): Promise<void> { return this.inner.removeTrainingVideo(id); }

  getOwnershipRequests(): Promise<OwnershipRequest[]> { return this.allowed ? this.inner.getOwnershipRequests() : Promise.resolve([]); }
  getOwnershipRequestsFor(filter: { subscriberId?: string; approverSubscriberId?: string; projectId?: string }): Promise<OwnershipRequest[]> {
    return this.allowed ? this.inner.getOwnershipRequestsFor(filter) : Promise.resolve([]);
  }
  createOwnershipRequest(input: {
    projectId: string; subscriberId: string; subscriberName: string;
    requestedRole: "yurutucu" | "uye"; note?: string;
  }): Promise<OwnershipRequest> { return this.inner.createOwnershipRequest(input); }
  resolveOwnershipRequest(id: string, status: "onaylandi" | "reddedildi"): Promise<void> { return this.inner.resolveOwnershipRequest(id, status); }
  assignProjectOwner(projectId: string, subscriberId: string | undefined, subscriberName?: string): Promise<void> {
    return this.inner.assignProjectOwner(projectId, subscriberId, subscriberName);
  }
  removeConsortiumMember(projectId: string, subscriberId: string): Promise<void> { return this.inner.removeConsortiumMember(projectId, subscriberId); }

  getExpertProfiles(): Promise<ExpertProfile[]> { return this.allowed ? this.inner.getExpertProfiles() : Promise.resolve([]); }
  getExpertProfile(id: string): Promise<ExpertProfile | null> { return this.allowed ? this.inner.getExpertProfile(id) : Promise.resolve(null); }
  saveExpertProfile(p: ExpertProfile): Promise<void> { return this.inner.saveExpertProfile(p); }
  removeExpertProfile(id: string): Promise<void> { return this.inner.removeExpertProfile(id); }
  getProjectExperts(projectId: string): Promise<{ profile: ExpertProfile; expertise: string; role: string }[]> {
    return this.allowed ? this.inner.getProjectExperts(projectId) : Promise.resolve([]);
  }

  getNetworkConnections(ownerSubscriberId: string): Promise<NetworkConnection[]> {
    return this.allowed ? this.inner.getNetworkConnections(ownerSubscriberId) : Promise.resolve([]);
  }
  addNetworkConnection(c: Omit<NetworkConnection, "id" | "addedAt">): Promise<void> { return this.inner.addNetworkConnection(c); }
  removeNetworkConnection(id: string): Promise<void> { return this.inner.removeNetworkConnection(id); }

  getAddressGroups(ownerSubscriberId: string): Promise<AddressGroup[]> {
    return this.allowed ? this.inner.getAddressGroups(ownerSubscriberId) : Promise.resolve([]);
  }
  saveAddressGroup(g: AddressGroup): Promise<void> { return this.inner.saveAddressGroup(g); }
  removeAddressGroup(id: string): Promise<void> { return this.inner.removeAddressGroup(id); }

  getSavedListings(subscriberId: string): Promise<SavedListing[]> {
    return this.allowed ? this.inner.getSavedListings(subscriberId) : Promise.resolve([]);
  }
  saveListing_bookmark(s: SavedListing): Promise<void> { return this.inner.saveListing_bookmark(s); }
  removeSavedListing(id: string): Promise<void> { return this.inner.removeSavedListing(id); }

  getEditLogs(entityId?: string): Promise<EditLog[]> {
    return this.allowed ? this.inner.getEditLogs(entityId) : Promise.resolve([]);
  }
  saveEditLog(log: EditLog): Promise<void> { return this.inner.saveEditLog(log); }

  // Anketler
  getSurveys(ownerSubscriberId?: string): Promise<Survey[]> {
    return this.allowed ? this.inner.getSurveys(ownerSubscriberId) : Promise.resolve([]);
  }
  getSurvey(id: string): Promise<Survey | null> {
    return this.allowed ? this.inner.getSurvey(id) : Promise.resolve(null);
  }
  saveSurvey(s: Survey): Promise<void> { return this.inner.saveSurvey(s); }
  removeSurvey(id: string): Promise<void> { return this.inner.removeSurvey(id); }
  getSurveyResponses(surveyId: string): Promise<SurveyResponse[]> {
    return this.allowed ? this.inner.getSurveyResponses(surveyId) : Promise.resolve([]);
  }
  saveSurveyResponse(r: SurveyResponse): Promise<void> { return this.inner.saveSurveyResponse(r); }

  // Kurum profilleri (herkese açık — demo doğrulama gerekmez)
  getInstitutionProfiles(): Promise<InstitutionProfile[]> { return this.inner.getInstitutionProfiles(); }
  getInstitutionProfile(id: string): Promise<InstitutionProfile | null> { return this.inner.getInstitutionProfile(id); }
  saveInstitutionProfile(p: InstitutionProfile): Promise<void> { return this.inner.saveInstitutionProfile(p); }
  removeInstitutionProfile(id: string): Promise<void> { return this.inner.removeInstitutionProfile(id); }

  // Proje web sitesi — herkese açık (yayınlanmış slug'lar)
  getProjectWebsite(projectId: string): Promise<ProjectWebsite | null> { return this.inner.getProjectWebsite(projectId); }
  getProjectWebsiteBySlug(slug: string): Promise<ProjectWebsite | null> { return this.inner.getProjectWebsiteBySlug(slug); }
  saveProjectWebsite(w: ProjectWebsite): Promise<void> { return this.inner.saveProjectWebsite(w); }
  isSlugAvailable(slug: string, excludeProjectId?: string): Promise<boolean> { return this.inner.isSlugAvailable(slug, excludeProjectId); }
}
