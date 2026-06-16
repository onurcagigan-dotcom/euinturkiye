// ============================================================
// getDataProvider() — Veri kaynağı seçici (fabrika).
//
// Sayfalar veriye SADECE bu fonksiyon üzerinden erişir:
//
//   import { getDataProvider } from "@/lib/data";
//   const db = getDataProvider();
//   const sectors = await db.getSectors();
//
// Hangi kaynağın döndüğü NEXT_PUBLIC_DATA_SOURCE ile belirlenir.
// "demo"     -> DemoDataProvider  (JSON)
// "firebase" -> FirebaseDataProvider (Firestore)
// ============================================================

import type { DataProvider } from "./provider";
import { DemoDataProvider } from "./demo";
import { FirebaseDataProvider } from "./firebase";
import { isFirebaseConfigured } from "../firebase/init";

let instance: DataProvider | null = null;

export function getDataProvider(): DataProvider {
  if (instance) return instance;

  const source = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "demo";

  if (source === "firebase") {
    if (isFirebaseConfigured()) {
      instance = new FirebaseDataProvider();
    } else {
      console.warn("[data] Firebase config eksik, demo kullanılıyor.");
      instance = new DemoDataProvider();
    }
  } else {
    instance = new DemoDataProvider();
  }

  return instance;
}

export type { DataProvider, ProjectFilters } from "./provider";
