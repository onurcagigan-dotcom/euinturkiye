"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Project, Listing, EventItem, BlogPost, Subscriber } from "../types";
import { getDataProvider } from "../data";

interface AdminStore {
  projects: Project[];
  listings: Listing[];
  events: EventItem[];
  posts: BlogPost[];
  subscribers: Subscriber[];
  loading: boolean;
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  // İlk yüklemede provider'dan TÜM veriyi çek (IPA + demo, filtresiz)
  useEffect(() => {
    const db = getDataProvider();
    Promise.all([
      db.getAllProjectsForAdmin(),
      db.getAllListingsForAdmin(),
      db.getAllEventsForAdmin(),
      db.getAllBlogPostsForAdmin(),
      db.getAllSubscribersForAdmin(),
    ]).then(([p, l, e, b, s]) => {
      setProjects(p);
      setListings(l);
      setEvents(e);
      setPosts(b);
      setSubscribers(s);
      setLoading(false);
    });
  }, []);

  // Değişiklikler hem provider'a hem local state'e yazılır
  const db = getDataProvider();

  const saveProject = useCallback((p: Project) => {
    setProjects(prev => { const i = prev.findIndex(x => x.id === p.id); return i !== -1 ? prev.map((x, j) => j === i ? p : x) : [p, ...prev]; });
    db.saveProject(p);
  }, [db]);
  const removeProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(x => x.id !== id));
    db.removeProject(id);
  }, [db]);
  const saveListing = useCallback((l: Listing) => {
    setListings(prev => { const i = prev.findIndex(x => x.id === l.id); return i !== -1 ? prev.map((x, j) => j === i ? l : x) : [l, ...prev]; });
    db.saveListing(l);
  }, [db]);
  const removeListing = useCallback((id: string) => {
    setListings(prev => prev.filter(x => x.id !== id));
    db.removeListing(id);
  }, [db]);
  const saveEvent = useCallback((e: EventItem) => {
    setEvents(prev => { const i = prev.findIndex(x => x.id === e.id); return i !== -1 ? prev.map((x, j) => j === i ? e : x) : [e, ...prev]; });
    db.saveEvent(e);
  }, [db]);
  const removeEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(x => x.id !== id));
    db.removeEvent(id);
  }, [db]);
  const savePost = useCallback((p: BlogPost) => {
    setPosts(prev => { const i = prev.findIndex(x => x.id === p.id); return i !== -1 ? prev.map((x, j) => j === i ? p : x) : [p, ...prev]; });
    db.saveBlogPost(p);
  }, [db]);
  const removePost = useCallback((id: string) => {
    setPosts(prev => prev.filter(x => x.id !== id));
    db.removeBlogPost(id);
  }, [db]);
  const saveSubscriber = useCallback((s: Subscriber) => {
    setSubscribers(prev => { const i = prev.findIndex(x => x.id === s.id); return i !== -1 ? prev.map((x, j) => j === i ? s : x) : [s, ...prev]; });
    db.saveSubscriber(s);
  }, [db]);
  const removeSubscriber = useCallback((id: string) => {
    setSubscribers(prev => prev.filter(x => x.id !== id));
    db.removeSubscriber(id);
  }, [db]);

  return (
    <Ctx.Provider value={{ projects, listings, events, posts, subscribers, loading, saveProject, removeProject, saveListing, removeListing, saveEvent, removeEvent, savePost, removePost, saveSubscriber, removeSubscriber }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdmin(): AdminStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}
