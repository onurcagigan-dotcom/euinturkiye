# euinturkiye.com

AB ve Türkiye Mali İşbirliği Projeleri Portalı — çok-donörlü proje portföyü ve dijital araçlar platformu.

## Kurulum

```bash
npm install
cp .env.example .env.local
npm run dev
```

Tarayıcıda: http://localhost:3000 — Panel: http://localhost:3000/admin

## Mimari — Veri Kaynağı Soyutlaması

Tüm veri erişimi tek bir soyutlamadan geçer. Kaynak `.env.local` içindeki
`NEXT_PUBLIC_DATA_SOURCE` ile seçilir:

- `demo`     → Sahte JSON verisi (Firebase gerekmez)
- `firebase` → Gerçek Firestore verisi + giriş sistemi

Sayfa ve panel kodu hangi kaynağın aktif olduğunu **bilmez**:

```ts
import { getDataProvider } from "@/lib/data";
const db = getDataProvider();
const sectors = await db.getSectors();
```

Demo → canlı geçiş tek config değişikliğidir.

## Canlıya Geçiş (Firebase)

1. **Firebase projesi oluştur** (console.firebase.google.com)
   - Authentication → Email/Password yöntemini aç, bir admin kullanıcı ekle
   - Firestore Database → oluştur
   - Project Settings → Web App ekle, config değerlerini al

2. **`.env.local` doldur**: `NEXT_PUBLIC_FIREBASE_*` değerleri + `NEXT_PUBLIC_DATA_SOURCE=firebase`
   (Vercel'de: Settings → Environment Variables)

3. **Güvenlik kuralları**: `firestore.rules` içeriğini Firebase Console →
   Firestore → Rules'a yapıştır, yayınla.

4. **Demo veriyi yükle (seed)**:
   - Firebase Console → Service Accounts → "Generate new private key"
     → `scripts/serviceAccount.json` olarak kaydet
   - `npm install firebase-admin`
   - `node scripts/seed.mjs`

Artık panelden eklenen içerik Firestore'a kalıcı yazılır ve public sitede görünür.

## Klasör Yapısı

```
app/
  page.tsx           Ana sayfa (public)
  giris/             Giriş sayfası
  admin/             Yönetim paneli (projeler, ilanlar, etkinlikler, blog)
components/
  sections.tsx       Ana sayfa bölümleri
  HeroCarousel.tsx   Banner
  admin/             Panel bileşenleri (formlar, tablo, UI)
lib/
  types.ts           Veri tipleri
  data/
    provider.ts      DataProvider arayüzü
    index.ts         getDataProvider() fabrikası
    demo/            Demo (JSON) sağlayıcı
    firebase/        Firestore sağlayıcı
  firebase/
    init.ts          Firebase başlatma
    auth-context.tsx Giriş/oturum yönetimi
  admin/
    store.tsx        Panel veri yönetimi
    writer.ts        Firestore yazma/silme
scripts/seed.mjs     Demo veriyi Firestore'a yükler
firestore.rules      Güvenlik kuralları
```

## Geliştirme Fazları

- [x] **Faz 0** — İskelet + veri katmanı
- [x] **Faz 1** — Demo veri + public ana sayfa
- [x] **Faz 2** — Yönetim paneli (CRUD)
- [x] **Faz 3** — Firebase + Auth (kalıcılık, giriş)
- [ ] **Faz 4** — Liste/detay sayfaları, abonelik, alt kullanıcı, araçlar
