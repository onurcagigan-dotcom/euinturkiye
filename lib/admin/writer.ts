// ============================================================
// Admin Writer — içerik yazma/silme katmanı.
//
// Demo modunda: hiçbir kalıcı işlem yok (sadece tarayıcı hafızası).
// Firebase modunda: Firestore'a gerçekten yazar/siler.
//
// Panel bileşenleri bu fonksiyonları çağırır; nereye yazıldığını
// bilmez. (Veri OKUMA tarafındaki DataProvider mantığının
// YAZMA tarafındaki karşılığı.)
// ============================================================

import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/init";

function firebaseActive(): boolean {
  return (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "demo") === "firebase" && isFirebaseConfigured();
}

/** Bir dökümanı kaydeder (varsa günceller, yoksa oluşturur). */
export async function writeDoc<T extends { id: string }>(
  collectionName: string,
  item: T
): Promise<void> {
  if (!firebaseActive()) return; // demo: kalıcı yazma yok
  const { id, ...rest } = item;
  await setDoc(doc(db(), collectionName, id), rest, { merge: true });
}

/** Bir dökümanı siler. */
export async function removeDoc(collectionName: string, id: string): Promise<void> {
  if (!firebaseActive()) return;
  await deleteDoc(doc(db(), collectionName, id));
}
