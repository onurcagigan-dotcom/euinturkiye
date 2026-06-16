// ============================================================
// Dosya yükleme — Firebase Storage entegrasyonu.
//
// Demo modunda: dosya fiilen yüklenmez, sadece meta-veri döner
//   (url olmaz; araç "demo dosya" olarak listeler).
// Firebase modunda: dosya Storage'a yüklenir, indirme URL'i döner.
//
// Araç kodu bu farkı bilmez; her iki durumda da meta-veri alır.
// ============================================================

import { isFirebaseConfigured } from "@/lib/firebase/init";

export interface UploadResult {
  url?: string;        // canlıda Storage indirme linki
  sizeBytes: number;
  mimeType: string;
}

function firebaseActive(): boolean {
  return (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "demo") === "firebase" && isFirebaseConfigured();
}

/** Bir dosyayı yükler. Demo'da meta-veri, Firebase'de gerçek Storage yüklemesi. */
export async function uploadFile(file: File, path: string): Promise<UploadResult> {
  if (!firebaseActive()) {
    // Demo: gerçek yükleme yok
    return { sizeBytes: file.size, mimeType: file.type || "application/octet-stream" };
  }

  // Firebase Storage'a yükle
  const { storage } = await import("@/lib/firebase/init");
  const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
  const storageRef = ref(storage(), path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, sizeBytes: file.size, mimeType: file.type || "application/octet-stream" };
}
