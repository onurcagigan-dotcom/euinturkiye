// ============================================================
// DemoDataProvider — JSON tabanlı veri sağlayıcı.
// Firebase olmadan tüm sistemi çalıştırır.
// DataProvider arayüzünü birebir uygular.
// ============================================================

import type { DataProvider, ProjectFilters } from "../provider";
import type {
  ListingType, EventRegistration, AgendaItem, Invitee, TimeOption, AvailabilityVote, DocItem,
  Subscriber, Campaign, Stakeholder, TrainingVideo, OwnershipRequest,
} from "../../types";
import { sectors, donors } from "./sectors";
import { projects, listings, events, blogPosts, news } from "./content";

// Demo'da etkinlik kayıtları oturum boyunca bu dizide yaşar
const registrations: EventRegistration[] = [
  { id: "reg-1", eventId: "ev-3", name: "Ayşe Yılmaz", email: "ayse@example.com", organization: "Genç İstihdam Derneği", status: "kayitli", createdAt: "2026-06-10T09:00:00Z" },
  { id: "reg-2", eventId: "ev-3", name: "Mehmet Demir", email: "mehmet@example.com", organization: "Beceri Vakfı", status: "katildi", createdAt: "2026-06-11T10:30:00Z" },
  { id: "reg-3", eventId: "ev-4", name: "Zeynep Kaya", email: "zeynep@example.com", status: "kayitli", createdAt: "2026-06-12T14:15:00Z" },
];

// Kapalı toplantı (ev-5) için örnek gündem / davetli / anket verileri
const agenda: AgendaItem[] = [
  { id: "ag-1", eventId: "ev-5", order: 1, title: "Açılış ve önceki toplantı kararları", durationMin: 10, presenter: "Proje Koordinatörü" },
  { id: "ag-2", eventId: "ev-5", order: 2, title: "Q3 ilerleme raporu", durationMin: 25, presenter: "İzleme Uzmanı" },
  { id: "ag-3", eventId: "ev-5", order: 3, title: "Riskler ve önlemler", durationMin: 15 },
  { id: "ag-4", eventId: "ev-5", order: 4, title: "Q4 planlama ve görev dağılımı", durationMin: 20 },
];
const invitees: Invitee[] = [
  { id: "inv-1", eventId: "ev-5", name: "Ali Vural", email: "ali@example.com", role: "Proje Koordinatörü", inviteStatus: "kabul", invitedAt: "2026-06-20T08:00:00Z" },
  { id: "inv-2", eventId: "ev-5", name: "Selin Ak", email: "selin@example.com", role: "İzleme Uzmanı", inviteStatus: "kabul", invitedAt: "2026-06-20T08:00:00Z" },
  { id: "inv-3", eventId: "ev-5", name: "Burak Şahin", email: "burak@example.com", role: "Mali Uzman", inviteStatus: "bekliyor", invitedAt: "2026-06-20T08:00:00Z" },
  { id: "inv-4", eventId: "ev-5", name: "Deniz Yıldız", email: "deniz@example.com", role: "İletişim", inviteStatus: "bekliyor", invitedAt: "2026-06-20T08:00:00Z" },
];
const timeOptions: TimeOption[] = [
  { id: "opt-1", eventId: "ev-5", start: "2026-07-08T10:00:00", label: "8 Tem 10:00" },
  { id: "opt-2", eventId: "ev-5", start: "2026-07-08T14:00:00", label: "8 Tem 14:00" },
  { id: "opt-3", eventId: "ev-5", start: "2026-07-09T11:00:00", label: "9 Tem 11:00" },
];
const votes: AvailabilityVote[] = [
  { id: "v-1", eventId: "ev-5", optionId: "opt-1", inviteeId: "inv-1", available: true },
  { id: "v-2", eventId: "ev-5", optionId: "opt-1", inviteeId: "inv-2", available: true },
  { id: "v-3", eventId: "ev-5", optionId: "opt-2", inviteeId: "inv-1", available: false },
  { id: "v-4", eventId: "ev-5", optionId: "opt-2", inviteeId: "inv-2", available: true },
  { id: "v-5", eventId: "ev-5", optionId: "opt-3", inviteeId: "inv-1", available: true },
];

// E-Doküman örnek verileri
const documents: DocItem[] = [
  { id: "doc-1", projectId: "adli-tebligat", name: "Q2 Ara Raporu.pdf", category: "Rapor", sizeBytes: 2_400_000, mimeType: "application/pdf", access: "ekip", uploadedAt: "2026-05-20T10:00:00Z", downloads: 14 },
  { id: "doc-2", projectId: "adli-tebligat", name: "Hibe Sözleşmesi.pdf", category: "Sözleşme", sizeBytes: 1_100_000, mimeType: "application/pdf", access: "ozel", uploadedAt: "2026-01-15T09:00:00Z", downloads: 3 },
  { id: "doc-3", projectId: "adli-tebligat", name: "Tanıtım Sunumu.pptx", category: "Sunum", sizeBytes: 5_800_000, mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", access: "herkese-acik", uploadedAt: "2026-04-02T13:30:00Z", downloads: 42 },
  { id: "doc-4", projectId: "genc-istihdam", name: "Görünürlük Kılavuzu.pdf", category: "Görünürlük", sizeBytes: 3_200_000, mimeType: "application/pdf", access: "herkese-acik", uploadedAt: "2026-03-10T11:00:00Z", downloads: 28 },
  { id: "doc-5", projectId: "adli-tebligat", name: "E-Tebligat Kullanım Eğitimi.pdf", category: "Eğitim", sizeBytes: 4_500_000, mimeType: "application/pdf", access: "herkese-acik", uploadedAt: "2026-05-01T09:00:00Z", downloads: 67, isLearning: true, learningSectorId: "yargi", learningTopic: "E-Tebligat Sistemi" },
  { id: "doc-6", projectId: "genc-istihdam", name: "İş Arama Becerileri Modülü.pdf", category: "Eğitim", sizeBytes: 2_800_000, mimeType: "application/pdf", access: "herkese-acik", uploadedAt: "2026-04-20T09:00:00Z", downloads: 51, isLearning: true, learningSectorId: "istihdam", learningTopic: "İstihdam Becerileri" },
];

// E-Learning: harici eğitim videoları
const trainingVideos: TrainingVideo[] = [
  { id: "vid-1", title: "AB Görünürlük Kuralları Webinarı", topic: "Görünürlük & İletişim", url: "https://www.youtube.com/watch?v=example1", sectorId: "sivil-toplum", projectId: "genc-istihdam", description: "AB destekli projelerde görünürlük yükümlülükleri.", addedAt: "2026-05-15T10:00:00Z" },
  { id: "vid-2", title: "Proje Döngüsü Yönetimi (PCM)", topic: "Proje Yönetimi", url: "https://vimeo.com/example2", sectorId: "rekabet", description: "Mantıksal çerçeve ve PCM temelleri.", addedAt: "2026-04-10T10:00:00Z" },
];

// Proje sahiplenme talepleri (örnek: bir şirket arşiv projesini istiyor)
const ownershipRequests: OwnershipRequest[] = [
  { id: "own-1", projectId: "tarim-modern", subscriberId: "sub-3", subscriberName: "ABC Danışmanlık", note: "Bu projede ana yüklenici olarak görev aldık.", status: "bekliyor", createdAt: "2026-06-14T09:00:00Z" },
];

// Bülten: örnek aboneler
const subscribers: Subscriber[] = [
  { id: "sub-1", email: "ayse@kurum.gov.tr", name: "Ayşe Yılmaz", organization: "Adalet Bakanlığı", tags: ["kamu", "ekip"], subscribed: true, addedAt: "2026-02-01T09:00:00Z" },
  { id: "sub-2", email: "mehmet@stk.org", name: "Mehmet Demir", organization: "Hak Derneği", tags: ["stk"], subscribed: true, addedAt: "2026-02-10T09:00:00Z" },
  { id: "sub-3", email: "info@tedarikci.com", name: "Zeynep Kaya", organization: "ABC Danışmanlık", tags: ["tedarikci"], subscribed: true, addedAt: "2026-03-05T09:00:00Z" },
  { id: "sub-4", email: "burak@kurum.gov.tr", organization: "İçişleri Bakanlığı", tags: ["kamu"], subscribed: false, addedAt: "2026-03-12T09:00:00Z" },
];

// Bülten: örnek kampanyalar
const campaigns: Campaign[] = [
  { id: "camp-1", subject: "Mart Ayı Proje Bülteni", body: "Bu ay projede tamamlanan faaliyetler ve yaklaşan etkinlikler...", targetTags: [], status: "gonderildi", createdAt: "2026-03-01T08:00:00Z", sentAt: "2026-03-02T10:00:00Z", recipientCount: 3, openCount: 2 },
  { id: "camp-2", subject: "Tedarikçi Duyurusu: Yeni İhale", body: "Yeni satınalma ilanımız yayınlandı...", targetTags: ["tedarikci"], status: "taslak", createdAt: "2026-06-10T08:00:00Z", recipientCount: 0, openCount: 0 },
];

// Paydaş İletişimi: örnek paydaşlar
const stakeholders: Stakeholder[] = [
  { id: "stk-1", projectId: "adli-tebligat", name: "Ali Vural", email: "ali@example.com", phone: "+90 312 000 0001", organization: "Adalet Bakanlığı", role: "Proje Koordinatörü", type: "ekip", addedAt: "2026-01-10T09:00:00Z" },
  { id: "stk-2", projectId: "adli-tebligat", name: "Selin Ak", email: "selin@example.com", organization: "Adalet Bakanlığı", role: "İzleme & Değerlendirme Uzmanı", type: "ekip", addedAt: "2026-01-10T09:00:00Z" },
  { id: "stk-3", projectId: "adli-tebligat", name: "Dr. Hakan Yıldız", email: "hakan@danismanlik.com", organization: "Hukuk Danışmanlık A.Ş.", role: "Kıdemli Hukuk Uzmanı", type: "uzman", addedAt: "2026-02-01T09:00:00Z" },
  { id: "stk-4", projectId: "adli-tebligat", name: "ABC Bilişim Ltd.", email: "info@abcbilisim.com", phone: "+90 212 000 0002", organization: "ABC Bilişim", role: "Yazılım Tedarikçisi", type: "tedarikci", addedAt: "2026-03-15T09:00:00Z" },
  { id: "stk-5", projectId: "genc-istihdam", name: "Merve Demir", email: "merve@iskur.gov.tr", organization: "İŞKUR", role: "Kurumsal İrtibat", type: "kamu", addedAt: "2026-02-20T09:00:00Z" },
];

// Demo'da küçük bir gecikme ekleyerek gerçek async davranışı taklit ediyoruz
const delay = <T>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), 0));

export class DemoDataProvider implements DataProvider {
  // --- Sektörler ---
  getSectors = () => delay([...sectors].sort((a, b) => a.order - b.order));
  getSector = (id: string) => delay(sectors.find((s) => s.id === id) ?? null);

  // --- Donörler ---
  getDonors = () => delay(donors);
  getDonor = (id: string) => delay(donors.find((d) => d.id === id) ?? null);

  // --- Projeler ---
  getProjects = (filters?: ProjectFilters) => {
    let result = [...projects];
    if (filters?.sectorId) result = result.filter((p) => p.sectorId === filters.sectorId);
    if (filters?.donorId) result = result.filter((p) => p.donorId === filters.donorId);
    if (filters?.ipaPeriod) result = result.filter((p) => p.ipaPeriod === filters.ipaPeriod);
    if (filters?.status) result = result.filter((p) => p.status === filters.status);
    if (filters?.featured !== undefined) result = result.filter((p) => p.featured === filters.featured);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)
      );
    }
    return delay(result);
  };
  getProject = (id: string) => delay(projects.find((p) => p.id === id) ?? null);
  getFeaturedProjects = (limit = 4) =>
    delay(projects.filter((p) => p.featured).slice(0, limit));

  // --- İlanlar ---
  getListings = (type?: ListingType) =>
    delay(type ? listings.filter((l) => l.type === type) : listings);
  getListing = (id: string) => delay(listings.find((l) => l.id === id) ?? null);

  // --- Etkinlikler ---
  getEvents = (onlyUpcoming = false) => {
    let result = [...events].sort((a, b) => a.date.localeCompare(b.date));
    if (onlyUpcoming) {
      const today = new Date().toISOString().slice(0, 10);
      result = result.filter((e) => e.date >= today);
    }
    return delay(result);
  };
  getEvent = (id: string) => delay(events.find((e) => e.id === id) ?? null);

  // --- Etkinlik kayıtları (RSVP) ---
  getRegistrations = (eventId: string) =>
    delay(registrations.filter((r) => r.eventId === eventId));
  addRegistration = (reg: EventRegistration) => {
    registrations.push(reg);
    return delay(undefined);
  };
  updateRegistration = (reg: EventRegistration) => {
    const i = registrations.findIndex((r) => r.id === reg.id);
    if (i !== -1) registrations[i] = reg;
    return delay(undefined);
  };
  removeRegistration = (id: string) => {
    const i = registrations.findIndex((r) => r.id === id);
    if (i !== -1) registrations.splice(i, 1);
    return delay(undefined);
  };

  // --- Kapalı toplantı: Gündem ---
  getAgenda = (eventId: string) =>
    delay(agenda.filter((a) => a.eventId === eventId).sort((a, b) => a.order - b.order));
  saveAgendaItem = (item: AgendaItem) => {
    const i = agenda.findIndex((a) => a.id === item.id);
    if (i === -1) agenda.push(item); else agenda[i] = item;
    return delay(undefined);
  };
  removeAgendaItem = (id: string) => {
    const i = agenda.findIndex((a) => a.id === id);
    if (i !== -1) agenda.splice(i, 1);
    return delay(undefined);
  };

  // --- Kapalı toplantı: Davetliler ---
  getInvitees = (eventId: string) => delay(invitees.filter((x) => x.eventId === eventId));
  saveInvitee = (inv: Invitee) => {
    const i = invitees.findIndex((x) => x.id === inv.id);
    if (i === -1) invitees.push(inv); else invitees[i] = inv;
    return delay(undefined);
  };
  removeInvitee = (id: string) => {
    const i = invitees.findIndex((x) => x.id === id);
    if (i !== -1) invitees.splice(i, 1);
    return delay(undefined);
  };

  // --- Kapalı toplantı: Müsaitlik anketi ---
  getTimeOptions = (eventId: string) =>
    delay(timeOptions.filter((o) => o.eventId === eventId).sort((a, b) => a.start.localeCompare(b.start)));
  saveTimeOption = (opt: TimeOption) => {
    const i = timeOptions.findIndex((o) => o.id === opt.id);
    if (i === -1) timeOptions.push(opt); else timeOptions[i] = opt;
    return delay(undefined);
  };
  removeTimeOption = (id: string) => {
    const i = timeOptions.findIndex((o) => o.id === id);
    if (i !== -1) timeOptions.splice(i, 1);
    // ilgili oyları da temizle
    for (let j = votes.length - 1; j >= 0; j--) if (votes[j].optionId === id) votes.splice(j, 1);
    return delay(undefined);
  };
  getVotes = (eventId: string) => delay(votes.filter((v) => v.eventId === eventId));
  setVote = (vote: AvailabilityVote) => {
    // aynı (option + invitee) için tek oy
    const i = votes.findIndex((v) => v.optionId === vote.optionId && v.inviteeId === vote.inviteeId);
    if (i === -1) votes.push(vote); else votes[i] = vote;
    return delay(undefined);
  };

  // --- E-Doküman ---
  getDocs = (projectId?: string) =>
    delay(
      (projectId ? documents.filter((d) => d.projectId === projectId) : documents)
        .slice()
        .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    );
  saveDoc = (item: DocItem) => {
    const i = documents.findIndex((d) => d.id === item.id);
    if (i === -1) documents.unshift(item); else documents[i] = item;
    return delay(undefined);
  };
  removeDoc = (id: string) => {
    const i = documents.findIndex((d) => d.id === id);
    if (i !== -1) documents.splice(i, 1);
    return delay(undefined);
  };
  incrementDownload = (id: string) => {
    const d = documents.find((x) => x.id === id);
    if (d) d.downloads += 1;
    return delay(undefined);
  };

  // --- Bülten: Aboneler ---
  getSubscribers = () => delay(subscribers.slice().sort((a, b) => b.addedAt.localeCompare(a.addedAt)));
  saveSubscriber = (sub: Subscriber) => {
    const i = subscribers.findIndex((s) => s.id === sub.id);
    if (i === -1) subscribers.unshift(sub); else subscribers[i] = sub;
    return delay(undefined);
  };
  removeSubscriber = (id: string) => {
    const i = subscribers.findIndex((s) => s.id === id);
    if (i !== -1) subscribers.splice(i, 1);
    return delay(undefined);
  };

  // --- Bülten: Kampanyalar ---
  getCampaigns = () => delay(campaigns.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  saveCampaign = (c: Campaign) => {
    const i = campaigns.findIndex((x) => x.id === c.id);
    if (i === -1) campaigns.unshift(c); else campaigns[i] = c;
    return delay(undefined);
  };
  removeCampaign = (id: string) => {
    const i = campaigns.findIndex((x) => x.id === id);
    if (i !== -1) campaigns.splice(i, 1);
    return delay(undefined);
  };

  // --- Paydaş İletişimi ---
  getStakeholders = (projectId?: string) =>
    delay(
      (projectId ? stakeholders.filter((s) => s.projectId === projectId) : stakeholders)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, "tr"))
    );
  saveStakeholder = (s: Stakeholder) => {
    const i = stakeholders.findIndex((x) => x.id === s.id);
    if (i === -1) stakeholders.unshift(s); else stakeholders[i] = s;
    return delay(undefined);
  };
  removeStakeholder = (id: string) => {
    const i = stakeholders.findIndex((x) => x.id === id);
    if (i !== -1) stakeholders.splice(i, 1);
    return delay(undefined);
  };

  // --- E-Learning ---
  getLearningDocs = () =>
    delay(documents.filter((d) => d.isLearning).slice().sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)));
  getTrainingVideos = () =>
    delay(trainingVideos.slice().sort((a, b) => b.addedAt.localeCompare(a.addedAt)));
  saveTrainingVideo = (v: TrainingVideo) => {
    const i = trainingVideos.findIndex((x) => x.id === v.id);
    if (i === -1) trainingVideos.unshift(v); else trainingVideos[i] = v;
    return delay(undefined);
  };
  removeTrainingVideo = (id: string) => {
    const i = trainingVideos.findIndex((x) => x.id === id);
    if (i !== -1) trainingVideos.splice(i, 1);
    return delay(undefined);
  };

  // --- Proje sahiplenme talepleri ---
  getOwnershipRequests = () =>
    delay(ownershipRequests.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  saveOwnershipRequest = (r: OwnershipRequest) => {
    const i = ownershipRequests.findIndex((x) => x.id === r.id);
    if (i === -1) ownershipRequests.unshift(r); else ownershipRequests[i] = r;
    return delay(undefined);
  };
  removeOwnershipRequest = (id: string) => {
    const i = ownershipRequests.findIndex((x) => x.id === id);
    if (i !== -1) ownershipRequests.splice(i, 1);
    return delay(undefined);
  };
  assignProjectOwner = (projectId: string, subscriberId: string | undefined) => {
    const p = projects.find((x) => x.id === projectId);
    if (p) { p.ownerSubscriberId = subscriberId; p.isArchive = subscriberId ? false : p.isArchive; }
    return delay(undefined);
  };

  // --- Blog ---
  getBlogPosts = (limit?: number) => {
    const sorted = [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return delay(limit ? sorted.slice(0, limit) : sorted);
  };
  getBlogPost = (slug: string) => delay(blogPosts.find((b) => b.slug === slug) ?? null);

  // --- Haberler ---
  getNews = (limit = 4) => {
    const sorted = [...news].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return delay(sorted.slice(0, limit));
  };

  // --- İstatistikler ---
  getHomeStats = () => {
    const totalProjects = sectors.reduce((sum, s) => sum + s.projectCount, 0);
    const today = new Date().toISOString().slice(0, 10);
    return delay({
      projects: totalProjects,
      openListings: listings.length,
      upcomingEvents: events.filter((e) => e.date >= today).length,
    });
  };
}
