import type { Plan } from "../../types";

// Abonelik paketleri (KDV dahil, yıllık)
export const plans: Plan[] = [
  {
    id: "ucretsiz",
    name: "Ücretsiz",
    priceEur: 0,
    tagline: "Başlamak için ideal",
    features: [
      "Şirket profili",
      "1 kalıcı proje",
      "Tüm dijital araçlara erişim",
      "Kamuya açık ilanları görüntüleme",
    ],
    highlighted: false,
    cta: "Ücretsiz Başla",
  },
  {
    id: "paket-1",
    name: "Paket 1",
    priceEur: 2500,
    tagline: "Büyüyen kuruluşlar için",
    features: [
      "1–5 proje",
      "Tüm dijital araçlar",
      "Alt kullanıcı yönetimi",
      "Satınalma ilanı detayları",
      "Öncelikli destek",
    ],
    highlighted: true,
    cta: "Paket 1'i Seç",
  },
  {
    id: "paket-2",
    name: "Paket 2",
    priceEur: 4000,
    tagline: "Çok projeli kuruluşlar için",
    features: [
      "6+ proje",
      "Tüm dijital araçlar",
      "Gelişmiş alt kullanıcı yönetimi",
      "Satınalma ilanı detayları",
      "Öncelikli destek",
    ],
    highlighted: false,
    cta: "Paket 2'yi Seç",
  },
  {
    id: "tedarikci",
    name: "Tedarikçi",
    priceEur: 2000,
    tagline: "Tedarikçi ve sağlayıcılar için",
    features: [
      "Tedarikçi profili",
      "Satınalma ilanı detayları",
      "İlanlara erişim",
      "Profil görünürlüğü",
    ],
    highlighted: false,
    cta: "Tedarikçi Ol",
  },
];
