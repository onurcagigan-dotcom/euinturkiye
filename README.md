# EU in Türkiye — Proje Platformu

Türkiye'deki AB finansmanlı projelerin çok-donörlü portföy platformu.

## Hızlı Başlangıç

### Demo Modu (Firebase gerektirmez)
Vercel'e yükleyin, çalışır. Ortam değişkeni gerekmez.

### Firebase Modu (gerçek veri)
1. `NEXT_PUBLIC_DATA_SOURCE=firebase` ortam değişkeni ekleyin (Vercel → Settings → Environment Variables)
2. Firebase Console'da proje oluşturun, config değerlerini ekleyin:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```
3. `firestore.rules` içeriğini Firebase Console → Firestore → Rules'a yapıştırın

## Sayfalar

| URL | Açıklama |
|-----|----------|
| `/` | Ana sayfa |
| `/projeler` | Proje listesi (sektör/dönem/durum filtreli) |
| `/projeler/[id]` | Proje detayı |
| `/ilanlar` | İlanlar (iş/satınalma/ihale) |
| `/ilanlar/[id]` | İlan detayı |
| `/etkinlikler` | Etkinlikler takvimi |
| `/etkinlikler/[id]` | Etkinlik detayı + gündem |
| `/gundem` | AB-Türkiye haberleri |
| `/gundem/[slug]` | Haber detayı |
| `/kayit` | Abonelik planları |
| `/giris` | Giriş |
| `/admin` | Yönetim paneli |
| `/araclar` | Dijital araçlar |

## Dijital Araçlar

- `/araclar/etkinlik` — RSVP Yönetimi
- `/araclar/dokuman` — E-Doküman Kütüphanesi
- `/araclar/bulten` — Bülten Kampanyaları
- `/araclar/paydas` — Paydaş İletişimi
- `/araclar/rapor` — Raporlama & CSV
- `/araclar/egitim` — E-Learning

## Teknoloji

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS 3**
- **TypeScript** (strict)
- **Firebase 11** (opsiyonel)
