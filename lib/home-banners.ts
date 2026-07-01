import type { HeroBanner } from "@/components/HeroCarousel";

/**
 * Ana sayfa hero alanında gösterilecek bannerlar.
 *
 * Görsel eklemek için:
 * 1. Görseli `/public/banners/` klasörüne koyun (örn. `/public/banners/banner-1.jpg`)
 * 2. Aşağıdaki diziye yeni bir kayıt ekleyin: imageUrl: "/banners/banner-1.jpg"
 *
 * Dizi boşsa ana sayfa otomatik olarak eski statik (gradient) hero görünümüne döner.
 */
export const HOME_BANNERS: HeroBanner[] = [
  {
    id: "banner-1",
    imageUrl: "/banners/banner-1.png",
    title: "AB-Türkiye Proje Portföyü",
    subtitle: "Türkiye'deki AB fonlu projeleri, uzmanları ve fırsatları tek platformda keşfedin.",
    showSearch: true,
  },
  {
    id: "banner-2",
    imageUrl: "/banners/banner-2.png",
    title: "Dijital Araçlar",
    subtitle: "Etkinlik yönetimi, doküman paylaşımı, bülten gönderimi ve daha fazlası — projeniz için hazır araçlar.",
    linkHref: "/araclar",
    linkLabel: "Araçları Keşfet",
  },
];
