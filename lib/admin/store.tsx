"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import type { Project, Listing, EventItem, BlogPost, Subscriber } from "../types";

// Demo veri — admin panelinin kendi kopyası (değişiklikler burada yaşar)
const INIT_PROJECTS: Project[] = [
  { id: "tarim-modern", title: "Türkiye Tarımın Modernizasyonu", summary: "AB finansmanlı tarım modernizasyon projesi.", sectorId: "tarim", donorId: "eu", ipaPeriod: "IPA-III", beneficiary: "T.C. Tarım ve Orman Bakanlığı", locations: ["Konya", "Ankara", "İzmir"], budget: "€12.5M", startDate: "2023-01-01", endDate: "2026-12-31", status: "devam", featured: true },
  { id: "cevre-iklim", title: "Çevre Uyum ve İklim Değişikliği", summary: "Türkiye'nin iklim değişikliğine uyum kapasitesinin güçlendirilmesi.", sectorId: "cevre", donorId: "eu", ipaPeriod: "IPA-IV", beneficiary: "T.C. Çevre Bakanlığı", locations: ["Ankara", "İstanbul"], budget: "€8.2M", startDate: "2024-03-01", endDate: "2027-03-31", status: "devam", featured: true },
  { id: "genc-istihdam", title: "Genç İstihdamın Desteklenmesi", summary: "15-29 yaş grubundaki gençlerin istihdama erişimini kolaylaştıran kapsamlı program.", sectorId: "istihdam", donorId: "eu", ipaPeriod: "IPA-III", beneficiary: "İŞKUR", locations: ["İstanbul", "Ankara", "İzmir"], budget: "€15M", startDate: "2022-06-01", endDate: "2025-12-31", status: "devam", featured: true },
  { id: "kadin-girisimcilik", title: "Kadın Girişimciliğinin Güçlendirilmesi", summary: "Kadın girişimcilere destek.", sectorId: "rekabet", donorId: "eu", ipaPeriod: "IPA-III", beneficiary: "KOSGEB", locations: ["İstanbul", "Ankara"], budget: "€6.8M", startDate: "2023-09-01", endDate: "2026-08-31", status: "devam", featured: true },
];

const INIT_LISTINGS: Listing[] = [
  { id: "ilan-1", type: "is", title: "Kıdemli Proje Koordinatörü", organization: "Design for Good LLC", projectId: "tarim-modern", location: "Ankara (Hibrit)", deadline: "2026-07-15", locked: false, description: "Tarım modernizasyon projesi için deneyimli proje koordinatörü aranmaktadır." },
  { id: "ilan-2", type: "satinalma", title: "Eğitim Materyalleri Tedariki", organization: "T.C. Tarım ve Orman Bakanlığı", projectId: "tarim-modern", location: "Türkiye geneli", deadline: "2026-07-30", locked: true, description: "Satınalma detayları abonelik gerektirir." },
  { id: "ilan-3", type: "ihale", title: "Yazılım Geliştirme ve Bakım Hizmetleri", organization: "İŞKUR", projectId: "genc-istihdam", location: "Ankara", deadline: "2026-08-15", locked: true, description: "İhale detayları abonelik gerektirir." },
];

const INIT_EVENTS: EventItem[] = [
  { id: "etk-1", title: "AB Proje Yönetimi Konferansı 2026", date: "2026-09-15T09:00:00", location: "Hilton Ankara", isPublic: true, description: "Yıllık konferans.", capacity: 250 },
  { id: "etk-2", title: "Tarım Modernizasyon — Teknik Toplantı", date: "2026-07-10T10:00:00", location: "Tarım Bakanlığı, Ankara", projectId: "tarim-modern", isPublic: false },
  { id: "etk-3", title: "Kadın Girişimciler Zirvesi", date: "2026-08-22T09:00:00", location: "İstanbul Kongre Merkezi", projectId: "kadin-girisimcilik", isPublic: true, capacity: 150 },
];

const INIT_POSTS: BlogPost[] = [
  { id: "blog-1", slug: "ab-turkiye-iliskileri-2026", title: "AB-Türkiye İlişkilerinde Yeni Dönem: 2026 Perspektifi", category: "AB Politikası", excerpt: "Türkiye'nin AB üyelik sürecinde 2026 yılı kritik dönüm noktaları.", content: "Türkiye ile Avrupa Birliği arasındaki ilişkiler 2026 yılında yeni bir ivme kazanmaktadır.", publishedAt: "2026-06-01T09:00:00", readMinutes: 5 },
  { id: "blog-2", slug: "ipa-iv-firsatlari", title: "IPA IV Dönemi: Türkiye için Finansman Fırsatları", category: "Fonlar & Finansman", excerpt: "IPA IV kapsamında Türkiye'ye sunulan hibe ve teknik destek imkânları.", content: "IPA IV dönemi Türkiye için önemli finansman olanakları sunmaktadır.", publishedAt: "2026-05-15T10:00:00", readMinutes: 7 },
  { id: "blog-3", slug: "tarim-modern-ilerleme", title: "Tarım Modernizasyon Projesi: İlk Yıl Değerlendirmesi", category: "Proje Haberleri", excerpt: "Projenin ilk yılına ait ilerleme raporu yayımlandı.", content: "Proje ilk uygulama yılını başarıyla tamamladı.", publishedAt: "2026-04-20T11:00:00", readMinutes: 4, projectId: "tarim-modern" },
];

const INIT_SUBSCRIBERS: Subscriber[] = [
  { id: "sub-1", name: "Ahmet Yılmaz", email: "ahmet@danismanlik.com", organization: "ABC Danışmanlık", accountType: "sirket", plan: "paket1", tags: ["tedarikci", "tarim"], createdAt: "2024-12-15T09:00:00Z" },
  { id: "sub-2", name: "Fatma Demir", email: "fatma@firma.com", organization: "XYZ Firma", accountType: "sirket", plan: "paket2", tags: ["yararlanici"], createdAt: "2026-02-01T09:00:00Z" },
  { id: "sub-3", name: "Mehmet Kaya", email: "mehmet@insaat.com", organization: "MK İnşaat", accountType: "sirket", plan: "tedarikci", tags: ["tedarikci", "insaat"], createdAt: "2026-03-10T09:00:00Z" },
  { id: "sub-4", name: "Zeynep Aydın", email: "zeynep@tarimstk.org", organization: "Tarım Geliştirme Vakfı", accountType: "stk", plan: "paket1", tags: ["stk", "tarim"], createdAt: "2026-02-20T09:00:00Z" },
  { id: "sub-5", name: "Can Öztürk", email: "can@danismanlik2.com", organization: "Delta Mühendislik", accountType: "sirket", plan: "paket2", tags: ["tedarikci", "enerji"], createdAt: "2026-03-05T09:00:00Z" },
];

interface AdminStore {
  projects: Project[];
  listings: Listing[];
  events: EventItem[];
  posts: BlogPost[];
  subscribers: Subscriber[];
  saveProject(p: Project): void;
  removeProject(id: string): void;
  saveListing(l: Listing): void;
  removeListing(id: string): void;
  saveEvent(e: EventItem): void;
  removeEvent(id: string): void;
  savePost(p: BlogPost): void;
  removePost(id: string): void;
  saveSubscriber(s: Subscriber): void;
  removeSubscriber(id: string): void;
}

const Ctx = createContext<AdminStore | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(INIT_PROJECTS);
  const [listings, setListings] = useState<Listing[]>(INIT_LISTINGS);
  const [events, setEvents] = useState<EventItem[]>(INIT_EVENTS);
  const [posts, setPosts] = useState<BlogPost[]>(INIT_POSTS);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(INIT_SUBSCRIBERS);

  const saveProject = useCallback((p: Project) => setProjects(prev => { const i = prev.findIndex(x => x.id === p.id); return i !== -1 ? prev.map((x, j) => j === i ? p : x) : [p, ...prev]; }), []);
  const removeProject = useCallback((id: string) => setProjects(prev => prev.filter(x => x.id !== id)), []);
  const saveListing = useCallback((l: Listing) => setListings(prev => { const i = prev.findIndex(x => x.id === l.id); return i !== -1 ? prev.map((x, j) => j === i ? l : x) : [l, ...prev]; }), []);
  const removeListing = useCallback((id: string) => setListings(prev => prev.filter(x => x.id !== id)), []);
  const saveEvent = useCallback((e: EventItem) => setEvents(prev => { const i = prev.findIndex(x => x.id === e.id); return i !== -1 ? prev.map((x, j) => j === i ? e : x) : [e, ...prev]; }), []);
  const removeEvent = useCallback((id: string) => setEvents(prev => prev.filter(x => x.id !== id)), []);
  const savePost = useCallback((p: BlogPost) => setPosts(prev => { const i = prev.findIndex(x => x.id === p.id); return i !== -1 ? prev.map((x, j) => j === i ? p : x) : [p, ...prev]; }), []);
  const removePost = useCallback((id: string) => setPosts(prev => prev.filter(x => x.id !== id)), []);
  const saveSubscriber = useCallback((s: Subscriber) => setSubscribers(prev => { const i = prev.findIndex(x => x.id === s.id); return i !== -1 ? prev.map((x, j) => j === i ? s : x) : [s, ...prev]; }), []);
  const removeSubscriber = useCallback((id: string) => setSubscribers(prev => prev.filter(x => x.id !== id)), []);

  return (
    <Ctx.Provider value={{ projects, listings, events, posts, subscribers, saveProject, removeProject, saveListing, removeListing, saveEvent, removeEvent, savePost, removePost, saveSubscriber, removeSubscriber }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdmin(): AdminStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}
