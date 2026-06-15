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
// "firebase" -> FirebaseDataProvider (Faz 3'te eklenecek)
// ============================================================

import type { DataProvider } from "./provider";
import { DemoDataProvider } from "./demo";

let instance: DataProvider | null = null;

export function getDataProvider(): DataProvider {
  if (instance) return instance;

  const source = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "demo";

  switch (source) {
    case "firebase":
      // Faz 3'te:
      //   const { FirebaseDataProvider } = await import("./firebase");
      //   instance = new FirebaseDataProvider();
      // Şimdilik demo'ya düş (Firebase henüz yok)
      console.warn("[data] firebase kaynağı henüz hazır değil, demo kullanılıyor.");
      instance = new DemoDataProvider();
      break;

    case "demo":
    default:
      instance = new DemoDataProvider();
      break;
  }

  return instance;
}

export type { DataProvider } from "./provider";
export type { ProjectFilters } from "./provider";
