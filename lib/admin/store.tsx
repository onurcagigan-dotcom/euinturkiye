"use client";

// ============================================================
// AdminStore — Panel veri yönetimi (Faz 2A)
//
// Demo veriyi başlangıç durumu alır, ekle/düzenle/sil
// işlemlerini TARAYICI HAFIZASINDA tutar.
// Sayfa yenilenince demo'ya döner (henüz kalıcı değil).
//
// Faz 3'te: bu fonksiyonların içi Firestore çağrılarıyla
// değiştirilecek. Panel bileşenleri (form, liste) HİÇ değişmeyecek.
// ============================================================

import { createContext, useContext, useState, ReactNode } from "react";
import type { Project, Listing, EventItem, BlogPost, Sector, Donor } from "@/lib/types";
import { writeDoc, removeDoc } from "@/lib/admin/writer";

interface AdminData {
  projects: Project[];
  listings: Listing[];
  events: EventItem[];
  blogPosts: BlogPost[];
  sectors: Sector[];
  donors: Donor[];
}

interface AdminStore extends AdminData {
  // Projeler
  saveProject: (p: Project) => void;
  deleteProject: (id: string) => void;
  // İlanlar
  saveListing: (l: Listing) => void;
  deleteListing: (id: string) => void;
  // Etkinlikler
  saveEvent: (e: EventItem) => void;
  deleteEvent: (id: string) => void;
  // Blog
  saveBlogPost: (b: BlogPost) => void;
  deleteBlogPost: (id: string) => void;
  // Sektörler
  saveSector: (s: Sector) => void;
  deleteSector: (id: string) => void;
  // Donörler
  saveDonor: (d: Donor) => void;
  deleteDonor: (id: string) => void;
}

const Ctx = createContext<AdminStore | null>(null);

export function AdminProvider({
  initial,
  children,
}: {
  initial: AdminData;
  children: ReactNode;
}) {
  const [data, setData] = useState<AdminData>(initial);

  // Genel "upsert" yardımcısı: id varsa günceller, yoksa ekler
  function upsert<T extends { id: string }>(list: T[], item: T): T[] {
    const i = list.findIndex((x) => x.id === item.id);
    if (i === -1) return [item, ...list];
    const copy = [...list];
    copy[i] = item;
    return copy;
  }

  const store: AdminStore = {
    ...data,
    saveProject: (p) => { setData((d) => ({ ...d, projects: upsert(d.projects, p) })); void writeDoc("projects", p); },
    deleteProject: (id) => { setData((d) => ({ ...d, projects: d.projects.filter((x) => x.id !== id) })); void removeDoc("projects", id); },
    saveListing: (l) => { setData((d) => ({ ...d, listings: upsert(d.listings, l) })); void writeDoc("listings", l); },
    deleteListing: (id) => { setData((d) => ({ ...d, listings: d.listings.filter((x) => x.id !== id) })); void removeDoc("listings", id); },
    saveEvent: (e) => { setData((d) => ({ ...d, events: upsert(d.events, e) })); void writeDoc("events", e); },
    deleteEvent: (id) => { setData((d) => ({ ...d, events: d.events.filter((x) => x.id !== id) })); void removeDoc("events", id); },
    saveBlogPost: (b) => { setData((d) => ({ ...d, blogPosts: upsert(d.blogPosts, b) })); void writeDoc("blogPosts", b); },
    deleteBlogPost: (id) => { setData((d) => ({ ...d, blogPosts: d.blogPosts.filter((x) => x.id !== id) })); void removeDoc("blogPosts", id); },
    saveSector: (s) => { setData((d) => ({ ...d, sectors: upsert(d.sectors, s) })); void writeDoc("sectors", s); },
    deleteSector: (id) => { setData((d) => ({ ...d, sectors: d.sectors.filter((x) => x.id !== id) })); void removeDoc("sectors", id); },
    saveDonor: (dn) => { setData((d) => ({ ...d, donors: upsert(d.donors, dn) })); void writeDoc("donors", dn); },
    deleteDonor: (id) => { setData((d) => ({ ...d, donors: d.donors.filter((x) => x.id !== id) })); void removeDoc("donors", id); },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useAdmin(): AdminStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
