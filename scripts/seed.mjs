// ============================================================
// Firestore Seed Script
//
// Demo verisini gerçek Firestore'a yükler. Bir kez çalıştırılır.
//
// KULLANIM:
//   1. Firebase Console > Project Settings > Service Accounts
//      > "Generate new private key" ile serviceAccount.json indir,
//      bu klasöre koy (scripts/serviceAccount.json).
//   2. npm install firebase-admin
//   3. node scripts/seed.mjs
//
// NOT: serviceAccount.json gizlidir, .gitignore'da olmalı.
// ============================================================

import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Demo veriyi TS yerine burada inline tutmak yerine, basitlik için
// JSON kopyası kullanılır. (Aşağıdaki importu kendi demo verinizle eşleyin.)
const sa = JSON.parse(readFileSync(new URL("./serviceAccount.json", import.meta.url)));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

// --- Veri (lib/data/demo içeriğinin JSON karşılığı) ---
// Pratikte demo dosyalarını JSON'a çevirip buraya koyabilir
// ya da bu script'i .ts olarak yazıp ts-node ile çalıştırabilirsiniz.
const data = JSON.parse(readFileSync(new URL("./seed-data.json", import.meta.url)));

async function seedCollection(name, items) {
  console.log(`→ ${name}: ${items.length} kayıt`);
  for (const item of items) {
    const { id, ...rest } = item;
    await db.collection(name).doc(id).set(rest, { merge: true });
  }
}

async function main() {
  await seedCollection("sectors", data.sectors);
  await seedCollection("donors", data.donors);
  await seedCollection("projects", data.projects);
  await seedCollection("listings", data.listings);
  await seedCollection("events", data.events);
  await seedCollection("blogPosts", data.blogPosts);
  await seedCollection("news", data.news);
  if (data.documents) await seedCollection("documents", data.documents);
  if (data.trainingVideos) await seedCollection("trainingVideos", data.trainingVideos);
  console.log("✓ Seed tamamlandı.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
