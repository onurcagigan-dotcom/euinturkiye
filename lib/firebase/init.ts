// ============================================================
// Firebase başlatma (lazy init).
//
// .env.local içindeki NEXT_PUBLIC_FIREBASE_* değerleriyle bağlanır.
// Bu dosya yalnızca DATA_SOURCE=firebase olduğunda kullanılır.
// Değerler boşsa (demo modunda) hiç çağrılmaz.
// ============================================================

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!config.apiKey) {
    throw new Error(
      "Firebase yapılandırması eksik. .env.local içine NEXT_PUBLIC_FIREBASE_* değerlerini girin."
    );
  }
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(config);
  }
  return app;
}

export function db(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function auth(): Auth {
  return getAuth(getFirebaseApp());
}

export function storage(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}

/** Firebase kullanılabilir mi (config dolu mu)? */
export function isFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.projectId);
}
