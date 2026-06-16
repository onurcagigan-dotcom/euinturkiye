// ============================================================
// FirebaseDataProvider — Firestore tabanlı veri sağlayıcı.
// DataProvider arayüzünü birebir uygular.
// Demo ile aynı metotlar; içi Firestore sorguları.
// ============================================================

import {
  collection, doc, getDoc, getDocs, query, where, orderBy, limit as fbLimit,
  setDoc, deleteDoc, updateDoc, increment,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "../../firebase/init";
import type { DataProvider, ProjectFilters } from "../provider";
import type {
  Sector, Donor, Project, Listing, ListingType,
  EventItem, EventRegistration, AgendaItem, Invitee, TimeOption, AvailabilityVote, DocItem,
  Subscriber, Campaign, Stakeholder, TrainingVideo, OwnershipRequest,
  BlogPost, NewsItem, HomeStats,
} from "../../types";

// Firestore dökümanını tipli nesneye çevirir (id dahil)
function docData<T>(d: { id: string; data: () => Record<string, unknown> }): T {
  return { id: d.id, ...d.data() } as T;
}

async function readAll<T>(name: string, ...constraints: QueryConstraint[]): Promise<T[]> {
  const q = constraints.length
    ? query(collection(db(), name), ...constraints)
    : collection(db(), name);
  const snap = await getDocs(q);
  return snap.docs.map((d: { id: string; data: () => Record<string, unknown> }): T =>
    docData<T>(d)
  );
}

async function readOne<T>(name: string, id: string): Promise<T | null> {
  const snap = await getDoc(doc(db(), name, id));
  return snap.exists() ? docData<T>(snap) : null;
}

export class FirebaseDataProvider implements DataProvider {
  // --- Sektörler ---
  getSectors = () => readAll<Sector>("sectors", orderBy("order"));
  getSector = (id: string) => readOne<Sector>("sectors", id);

  // --- Donörler ---
  getDonors = () => readAll<Donor>("donors");
  getDonor = (id: string) => readOne<Donor>("donors", id);

  // --- Projeler ---
  async getProjects(filters?: ProjectFilters) {
    const c: QueryConstraint[] = [];
    if (filters?.sectorId) c.push(where("sectorId", "==", filters.sectorId));
    if (filters?.donorId) c.push(where("donorId", "==", filters.donorId));
    if (filters?.ipaPeriod) c.push(where("ipaPeriod", "==", filters.ipaPeriod));
    if (filters?.status) c.push(where("status", "==", filters.status));
    if (filters?.featured !== undefined) c.push(where("featured", "==", filters.featured));

    let result = await readAll<Project>("projects", ...c);

    // Metin araması Firestore'da sınırlı; bellekte filtreliyoruz
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(s) || p.summary.toLowerCase().includes(s)
      );
    }
    return result;
  }
  getProject = (id: string) => readOne<Project>("projects", id);
  getFeaturedProjects = (limit = 4) =>
    readAll<Project>("projects", where("featured", "==", true), fbLimit(limit));

  // --- İlanlar ---
  getListings = (type?: ListingType) =>
    type
      ? readAll<Listing>("listings", where("type", "==", type))
      : readAll<Listing>("listings");
  getListing = (id: string) => readOne<Listing>("listings", id);

  // --- Etkinlikler ---
  async getEvents(onlyUpcoming = false) {
    let result = await readAll<EventItem>("events", orderBy("date"));
    if (onlyUpcoming) {
      const today = new Date().toISOString().slice(0, 10);
      result = result.filter((e) => e.date >= today);
    }
    return result;
  }
  getEvent = (id: string) => readOne<EventItem>("events", id);

  // --- Etkinlik kayıtları (RSVP) ---
  getRegistrations = (eventId: string) =>
    readAll<EventRegistration>("eventRegistrations", where("eventId", "==", eventId));
  async addRegistration(reg: EventRegistration) {
    const { id, ...rest } = reg;
    await setDoc(doc(db(), "eventRegistrations", id), rest);
  }
  async updateRegistration(reg: EventRegistration) {
    const { id, ...rest } = reg;
    await setDoc(doc(db(), "eventRegistrations", id), rest, { merge: true });
  }
  async removeRegistration(id: string) {
    await deleteDoc(doc(db(), "eventRegistrations", id));
  }

  // --- Kapalı toplantı: Gündem ---
  getAgenda = (eventId: string) =>
    readAll<AgendaItem>("agendaItems", where("eventId", "==", eventId), orderBy("order"));
  async saveAgendaItem(item: AgendaItem) {
    const { id, ...rest } = item;
    await setDoc(doc(db(), "agendaItems", id), rest, { merge: true });
  }
  async removeAgendaItem(id: string) {
    await deleteDoc(doc(db(), "agendaItems", id));
  }

  // --- Kapalı toplantı: Davetliler ---
  getInvitees = (eventId: string) =>
    readAll<Invitee>("invitees", where("eventId", "==", eventId));
  async saveInvitee(inv: Invitee) {
    const { id, ...rest } = inv;
    await setDoc(doc(db(), "invitees", id), rest, { merge: true });
  }
  async removeInvitee(id: string) {
    await deleteDoc(doc(db(), "invitees", id));
  }

  // --- Kapalı toplantı: Müsaitlik anketi ---
  getTimeOptions = (eventId: string) =>
    readAll<TimeOption>("timeOptions", where("eventId", "==", eventId), orderBy("start"));
  async saveTimeOption(opt: TimeOption) {
    const { id, ...rest } = opt;
    await setDoc(doc(db(), "timeOptions", id), rest, { merge: true });
  }
  async removeTimeOption(id: string) {
    await deleteDoc(doc(db(), "timeOptions", id));
  }
  getVotes = (eventId: string) =>
    readAll<AvailabilityVote>("availabilityVotes", where("eventId", "==", eventId));
  async setVote(vote: AvailabilityVote) {
    const { id, ...rest } = vote;
    await setDoc(doc(db(), "availabilityVotes", id), rest, { merge: true });
  }

  // --- E-Doküman ---
  async getDocs(projectId?: string) {
    const c: QueryConstraint[] = projectId ? [where("projectId", "==", projectId)] : [];
    const items = await readAll<DocItem>("documents", ...c);
    return items.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }
  async saveDoc(item: DocItem) {
    const { id, ...rest } = item;
    await setDoc(doc(db(), "documents", id), rest, { merge: true });
  }
  async removeDoc(id: string) {
    await deleteDoc(doc(db(), "documents", id));
  }
  async incrementDownload(id: string) {
    await updateDoc(doc(db(), "documents", id), { downloads: increment(1) });
  }

  // --- Bülten: Aboneler ---
  async getSubscribers() {
    const items = await readAll<Subscriber>("subscribers");
    return items.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  }
  async saveSubscriber(sub: Subscriber) {
    const { id, ...rest } = sub;
    await setDoc(doc(db(), "subscribers", id), rest, { merge: true });
  }
  async removeSubscriber(id: string) {
    await deleteDoc(doc(db(), "subscribers", id));
  }

  // --- Bülten: Kampanyalar ---
  async getCampaigns() {
    const items = await readAll<Campaign>("campaigns");
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async saveCampaign(c: Campaign) {
    const { id, ...rest } = c;
    await setDoc(doc(db(), "campaigns", id), rest, { merge: true });
  }
  async removeCampaign(id: string) {
    await deleteDoc(doc(db(), "campaigns", id));
  }

  // --- Paydaş İletişimi ---
  async getStakeholders(projectId?: string) {
    const c: QueryConstraint[] = projectId ? [where("projectId", "==", projectId)] : [];
    const items = await readAll<Stakeholder>("stakeholders", ...c);
    return items.sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }
  async saveStakeholder(s: Stakeholder) {
    const { id, ...rest } = s;
    await setDoc(doc(db(), "stakeholders", id), rest, { merge: true });
  }
  async removeStakeholder(id: string) {
    await deleteDoc(doc(db(), "stakeholders", id));
  }

  // --- E-Learning ---
  async getLearningDocs() {
    const items = await readAll<DocItem>("documents", where("isLearning", "==", true));
    return items.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }
  async getTrainingVideos() {
    const items = await readAll<TrainingVideo>("trainingVideos");
    return items.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  }
  async saveTrainingVideo(v: TrainingVideo) {
    const { id, ...rest } = v;
    await setDoc(doc(db(), "trainingVideos", id), rest, { merge: true });
  }
  async removeTrainingVideo(id: string) {
    await deleteDoc(doc(db(), "trainingVideos", id));
  }

  // --- Proje sahiplenme talepleri ---
  async getOwnershipRequests() {
    const items = await readAll<OwnershipRequest>("ownershipRequests");
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async saveOwnershipRequest(r: OwnershipRequest) {
    const { id, ...rest } = r;
    await setDoc(doc(db(), "ownershipRequests", id), rest, { merge: true });
  }
  async removeOwnershipRequest(id: string) {
    await deleteDoc(doc(db(), "ownershipRequests", id));
  }
  async assignProjectOwner(projectId: string, subscriberId: string | undefined) {
    await updateDoc(doc(db(), "projects", projectId), {
      ownerSubscriberId: subscriberId ?? null,
      ...(subscriberId ? { isArchive: false } : {}),
    });
  }

  // --- Blog ---
  getBlogPosts = (limit?: number) =>
    readAll<BlogPost>(
      "blogPosts",
      orderBy("publishedAt", "desc"),
      ...(limit ? [fbLimit(limit)] : [])
    );
  async getBlogPost(slug: string) {
    const arr = await readAll<BlogPost>("blogPosts", where("slug", "==", slug), fbLimit(1));
    return arr[0] ?? null;
  }

  // --- Haberler ---
  getNews = (limit = 4) =>
    readAll<NewsItem>("news", orderBy("publishedAt", "desc"), fbLimit(limit));

  // --- İstatistikler ---
  async getHomeStats(): Promise<HomeStats> {
    const [sectors, listings, events] = await Promise.all([
      this.getSectors(),
      this.getListings(),
      this.getEvents(true),
    ]);
    return {
      projects: sectors.reduce((sum, s) => sum + (s.projectCount ?? 0), 0),
      openListings: listings.length,
      upcomingEvents: events.length,
    };
  }
}
