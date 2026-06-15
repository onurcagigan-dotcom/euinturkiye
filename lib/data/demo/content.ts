import type {
  Project, Listing, EventItem, BlogPost, NewsItem,
} from "../../types";

export const projects: Project[] = [
  {
    id: "adli-tebligat",
    title: "Adli Tebligat Sisteminin İyileştirilmesi",
    summary: "Elektronik tebligat altyapısının güçlendirilmesi ve mahkeme süreçlerinin hızlandırılması.",
    sectorId: "yargi", donorId: "eu", ipaPeriod: "ipa-3",
    beneficiary: "Adalet Bakanlığı", locations: ["Ankara", "İzmir", "Bursa"],
    budget: "4.200.000 €", startDate: "2023-01-15", endDate: "2025-12-31",
    status: "devam", featured: true,
  },
  {
    id: "aile-mahkemeleri",
    title: "Aile Mahkemelerinin Etkinliğinin Artırılması",
    summary: "Aile mahkemesi hakim ve uzmanlarına yönelik kapasite geliştirme programı.",
    sectorId: "yargi", donorId: "eu", ipaPeriod: "ipa-3",
    beneficiary: "Adalet Akademisi", locations: ["Ankara", "İstanbul", "Antalya"],
    budget: "2.800.000 €", startDate: "2023-06-01", endDate: "2025-06-01",
    status: "devam", featured: true,
  },
  {
    id: "iklim-uyum",
    title: "Yerel İklim Uyum Stratejileri",
    summary: "Belediyelerin iklim değişikliğine uyum kapasitesinin güçlendirilmesi.",
    sectorId: "cevre", donorId: "eu", ipaPeriod: "ipa-3",
    beneficiary: "Çevre, Şehircilik ve İklim Değişikliği Bakanlığı", locations: ["12 il"],
    budget: "6.500.000 €", startDate: "2022-09-01", endDate: "2025-09-01",
    status: "devam", featured: true,
  },
  {
    id: "genc-istihdam",
    title: "Genç İstihdamı için Beceri Geliştirme",
    summary: "Genç işsizliğiyle mücadele için mesleki eğitim ve beceri programları.",
    sectorId: "istihdam", donorId: "eu", ipaPeriod: "ipa-3",
    beneficiary: "Çalışma ve Sosyal Güvenlik Bakanlığı", locations: ["Türkiye geneli"],
    budget: "8.100.000 €", startDate: "2023-03-01", endDate: "2026-03-01",
    status: "devam", featured: true,
  },
  {
    id: "stk-diyalog",
    title: "Sivil Toplum Diyaloğu VII",
    summary: "AB ve Türkiye sivil toplum kuruluşları arasında işbirliğinin geliştirilmesi.",
    sectorId: "sivil-toplum", donorId: "eu", ipaPeriod: "ipa-3",
    beneficiary: "Dışişleri Bakanlığı AB Başkanlığı", locations: ["Türkiye geneli"],
    budget: "5.000.000 €", startDate: "2023-01-01", endDate: "2025-12-31",
    status: "devam", featured: false,
  },
];

export const listings: Listing[] = [
  { id: "is-1", type: "is", title: "Proje Koordinatörü", organization: "Yeşil Dönüşüm Atölyeleri", location: "Gaziantep", deadline: "2024-07-20", locked: false, description: "İklim projeleri koordinasyonu için deneyimli proje koordinatörü aranıyor." },
  { id: "is-2", type: "is", title: "İzleme ve Değerlendirme Uzmanı", organization: "Genç İstihdamı Beceri Programı", location: "Ankara", deadline: "2024-07-15", locked: false, description: "Proje çıktılarının izlenmesi ve raporlanması için M&E uzmanı." },
  { id: "satinalma-1", type: "satinalma", title: "Eğitim Hizmeti Alımı", organization: "Adalet Akademisi", location: "Ankara", deadline: "2024-07-25", locked: true, description: "Hakim ve savcılara yönelik eğitim hizmeti alımı ihalesi." },
  { id: "ihale-1", type: "ihale", title: "Bilişim Donanımı Tedariki", organization: "Adli Tebligat Projesi", location: "Ankara", deadline: "2024-08-01", locked: false, description: "Elektronik tebligat altyapısı için sunucu ve ağ donanımı tedariki." },
];

export const events: EventItem[] = [
  { id: "ev-1", title: "AB-Türkiye Koordinasyon Toplantısı", date: "2024-06-18", location: "Ankara, Dış Ticaret Kompleksi", isPublic: false, description: "Dönem değerlendirme toplantısı." },
  { id: "ev-2", title: "Başvuru Çalıştayı 2024", date: "2024-06-22", location: "İstanbul, Çırağan", isPublic: true, description: "IPA III başvuru hazırlama çalıştayı." },
  { id: "ev-3", title: "Gençlik İstihdam Fuarı", date: "2024-07-03", location: "Gaziantep, Sergi Alanı", isPublic: true, projectId: "genc-istihdam", description: "Genç işsizliğiyle mücadele fuarı." },
  { id: "ev-4", title: "Çevre Sempozyumu", date: "2024-07-15", location: "İzmir, Alsancak", isPublic: true, projectId: "iklim-uyum", description: "İklim uyum stratejileri sempozyumu." },
];

export const blogPosts: BlogPost[] = [
  { id: "b1", slug: "ipa-3-proje-hazirlama", title: "IPA III'te proje hazırlamanın incelikleri", category: "IPA III", excerpt: "IPA III döneminde başarılı proje başvurusu için bilinmesi gerekenler.", content: "IPA III dönemi, Türkiye'nin AB katılım öncesi mali yardımının üçüncü aşamasıdır...", publishedAt: "2024-06-08", readMinutes: 6 },
  { id: "b2", slug: "gorunurluk-7-hata", title: "AB projelerinde görünürlük: 7 hata", category: "Görünürlük", excerpt: "Görünürlük kurallarında en sık yapılan hatalar ve çözümleri.", content: "AB tarafından finanse edilen projelerde görünürlük kuralları zorunludur...", publishedAt: "2024-06-02", readMinutes: 5 },
  { id: "b3", slug: "hibe-sonrasi-surdurulebilirlik", title: "Hibe sonrası sürdürülebilirlik", category: "Proje Yönetimi", excerpt: "Proje bittikten sonra çıktıların sürdürülebilirliği nasıl sağlanır.", content: "Sürdürülebilirlik, projenin finansmanı bittikten sonra da devam etmesidir...", publishedAt: "2024-05-26", readMinutes: 8 },
];

export const news: NewsItem[] = [
  { id: "n1", kind: "haber", title: "Gaziantep'te ilk yeşil dönüşüm atölyesi 60 KOBİ temsilcisiyle tamamlandı", excerpt: "Dört oturumda enerji verimliliği, döngüsel ekonomi ve yeşil finansman başlıkları ele alındı.", source: "Yeşil Dönüşüm Atölyeleri", publishedAt: "2024-06-15" },
  { id: "n2", kind: "duyuru", title: "Hibe başvuru sonuçları açıklandı: 38 proje desteklenecek", excerpt: "142 başvurudan 38'i ön değerlendirme aşamasını geçti.", source: "Kırsal Kadın Girişimciliği", publishedAt: "2024-06-15" },
  { id: "n3", kind: "duyuru", title: "Eğitici eğitimi ikinci dönem kayıtları açıldı", excerpt: "Gençlik İstihdamı Beceri Programı modülü açılmıştır.", source: "Genç İstihdamı Beceri Prog.", publishedAt: "2024-06-14" },
  { id: "n4", kind: "haber", title: "Sivil toplum işbirliği çağrısı yayında", excerpt: "VII. Döneme katılmak isteyen örgütler için başvuru 20 Temmuz'a kadar açık.", source: "Sivil Toplum Diyaloğu VII", publishedAt: "2024-06-14" },
];
