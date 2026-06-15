# euinturkiye.com

AB ve Türkiye Mali İşbirliği Projeleri Portalı — çok-donörlü proje portföyü ve dijital araçlar platformu.

## Kurulum

```bash
npm install
cp .env.example .env.local   # gerekirse düzenle
npm run dev
```

Tarayıcıda: http://localhost:3000

## Mimari — Önemli

### Veri Kaynağı Soyutlaması (Data Provider)

Tüm veri erişimi **tek bir soyutlama** üzerinden geçer. Hangi kaynağın
kullanılacağı `.env.local` içindeki `NEXT_PUBLIC_DATA_SOURCE` ile seçilir:

- `demo`     → Sahte JSON verisi (Firebase gerekmez) — **şu an aktif**
- `firebase` → Gerçek Firestore verisi (Faz 3'te eklenecek)

Sayfa kodu hangi kaynağın aktif olduğunu **bilmez**. Sadece şöyle der:

```ts
import { getDataProvider } from "@/lib/data";

const db = getDataProvider();
const sectors = await db.getSectors();
```

Bu sayede demo ve canlı sistem **birebir aynı kodu** kullanır. Canlıya geçiş
tek satır config değişikliğidir.

## Klasör Yapısı

```
app/                 Next.js sayfaları (App Router)
components/          Tekrar kullanılan UI bileşenleri
lib/
  types.ts           Veri tipleri (Firestore ile uyumlu)
  data/
    provider.ts      DataProvider arayüzü (sözleşme)
    index.ts         getDataProvider() fabrikası
    demo/            Demo (JSON) veri sağlayıcı
    firebase/        (Faz 3) Firestore sağlayıcı
public/images/       Görseller (banner, sektör, araç ikonları)
```

## Geliştirme Fazları

- [x] **Faz 0** — İskelet + veri katmanı
- [ ] **Faz 1** — Demo veri + public site (ana sayfa, listeler, detaylar)
- [ ] **Faz 2** — Yönetim paneli (admin CRUD)
- [ ] **Faz 3** — Firebase + Auth entegrasyonu
- [ ] **Faz 4** — Abonelik, alt kullanıcı, gelişmiş araçlar
