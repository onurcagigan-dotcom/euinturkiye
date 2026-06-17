/**
 * Demo veriyi Firestore'a yükler.
 * Kullanım:
 *   1. Firebase Console → Service Accounts → Generate new private key
 *   2. Dosyayı "scripts/serviceAccount.json" olarak kaydedin
 *   3. npm install firebase-admin
 *   4. node scripts/seed.mjs
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Service account dosyasını yükle
let serviceAccount;
try {
  serviceAccount = JSON.parse(
    readFileSync(join(__dirname, "serviceAccount.json"), "utf8")
  );
} catch {
  console.error("❌ scripts/serviceAccount.json bulunamadı.");
  console.error("   Firebase Console → Service Accounts → Generate new private key");
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ── Sektörler ────────────────────────────────────────────
const sectors = [
  { id: "tarim", name: "Tarım & Kırsal Kalkınma", color: "#16a34a" },
  { id: "cevre", name: "Çevre & İklim", color: "#0891b2" },
  { id: "egitim", name: "Eğitim & Gençlik", color: "#7c3aed" },
  { id: "istihdam", name: "İstihdam & Sosyal Politika", color: "#ea580c" },
  { id: "enerji", name: "Enerji & Altyapı", color: "#ca8a04" },
  { id: "adalet", name: "Adalet & İçişleri", color: "#dc2626" },
  { id: "saglik", name: "Sağlık & Sosyal Hizmetler", color: "#0284c7" },
  { id: "rekabet", name: "Rekabetçilik & KOBİ", color: "#9333ea" },
  { id: "bolgesel", name: "Bölgesel Kalkınma", color: "#0f766e" },
  { id: "dijital", name: "Dijital Dönüşüm", color: "#1d4ed8" },
];

// ── Donörler ─────────────────────────────────────────────
const donors = [
  { id: "eu", name: "Avrupa Birliği", country: "AB" },
  { id: "wb", name: "Dünya Bankası", country: "ABD" },
  { id: "giz", name: "GIZ (Almanya)", country: "Almanya" },
  { id: "usaid", name: "USAID", country: "ABD" },
  { id: "undp", name: "UNDP", country: "BM" },
];

// ── Projeler ─────────────────────────────────────────────
const projects = [
  {
    id: "tarim-modern",
    title: "Türkiye Tarımın Modernizasyonu",
    summary: "AB finansmanlı tarım modernizasyon projesi.",
    sectorId: "tarim", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "T.C. Tarım ve Orman Bakanlığı",
    locations: ["Konya", "Ankara", "İzmir"],
    budget: "€12.5M", startDate: "2023-01-01", endDate: "2026-12-31",
    status: "devam", featured: true,
    objective: "Türkiye'nin tarım sektörünü AB standartlarına uyumlu hale getirmek.",
    expectedOutputs: "500 çiftçiye eğitim verilmesi, 50 kooperatifin desteklenmesi.",
    activities: "Çiftçi eğitim programları, kooperatif kapasite geliştirme.",
  },
  {
    id: "genc-istihdam",
    title: "Genç İstihdamın Desteklenmesi",
    summary: "15-29 yaş grubundaki gençlerin istihdama erişimini kolaylaştıran program.",
    sectorId: "istihdam", donorId: "eu", ipaPeriod: "IPA-III",
    beneficiary: "İŞKUR", locations: ["İstanbul", "Ankara", "İzmir"],
    budget: "€15M", startDate: "2022-06-01", endDate: "2025-12-31",
    status: "devam", featured: true,
  },
];

// ── Blog yazıları ─────────────────────────────────────────
const blogPosts = [
  {
    id: "blog-1",
    slug: "ab-turkiye-iliskileri-2026",
    title: "AB-Türkiye İlişkilerinde Yeni Dönem: 2026 Perspektifi",
    category: "AB Politikası",
    excerpt: "Türkiye'nin AB üyelik sürecinde 2026 yılı kritik dönüm noktaları.",
    content: "Türkiye ile Avrupa Birliği arasındaki ilişkiler 2026 yılında yeni bir ivme kazanmaktadır.",
    publishedAt: "2026-06-01T09:00:00Z", readMinutes: 5,
  },
];

async function seed() {
  console.log("🌱 Seed başlıyor...\n");

  // Sektörler
  for (const s of sectors) {
    await db.collection("sectors").doc(s.id).set(s);
    console.log(`✅ Sektör: ${s.name}`);
  }

  // Donörler
  for (const d of donors) {
    await db.collection("donors").doc(d.id).set(d);
    console.log(`✅ Donör: ${d.name}`);
  }

  // Projeler
  for (const p of projects) {
    await db.collection("projects").doc(p.id).set(p);
    console.log(`✅ Proje: ${p.title}`);
  }

  // Blog
  for (const b of blogPosts) {
    await db.collection("blogPosts").doc(b.id).set(b);
    console.log(`✅ Blog: ${b.title}`);
  }

  console.log("\n🎉 Seed tamamlandı!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed hatası:", err);
  process.exit(1);
});
