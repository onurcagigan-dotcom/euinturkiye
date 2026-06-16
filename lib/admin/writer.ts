/**
 * Firestore yazma işlemleri — sadece admin tarafından kullanılır.
 * Demo modunda import edilmez.
 */
import {
  getFirestore, doc, setDoc, deleteDoc, updateDoc,
} from "firebase/firestore";
import { getFirebaseApp } from "../firebase/init";
import type { Project, Listing, EventItem, BlogPost } from "../types";

function db() { return getFirestore(getFirebaseApp()); }

export const writeProject = (p: Project) => setDoc(doc(db(), "projects", p.id), p);
export const deleteProject = (id: string) => deleteDoc(doc(db(), "projects", id));

export const writeListing = (l: Listing) => setDoc(doc(db(), "listings", l.id), l);
export const deleteListing = (id: string) => deleteDoc(doc(db(), "listings", id));

export const writeEvent = (e: EventItem) => setDoc(doc(db(), "events", e.id), e);
export const deleteEvent = (id: string) => deleteDoc(doc(db(), "events", id));

export const writeBlogPost = (p: BlogPost) => setDoc(doc(db(), "blogPosts", p.id), p);
export const deleteBlogPost = (id: string) => deleteDoc(doc(db(), "blogPosts", id));
